import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { randomUUID } from "crypto";
import { getDb } from "@/lib/db";
import { uploads } from "@/lib/db/schema";
import { MAX_TEXT_UPLOAD_BYTES } from "@/lib/constants/upload";
import { requireApprovedUserId, ApprovalRequiredError } from "@/lib/db/auth";
import { assertOwnedRelations, FORBIDDEN_RELATION_MESSAGE } from "@/lib/db/ownership";

const MAX_MULTIPART_BYTES = 4_500_000;

async function parseUpload(request: NextRequest) {
  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks: ArrayBuffer[] = [];
  let bytes = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_MULTIPART_BYTES) {
        await reader.cancel();
        return new Response(null, { status: 413 });
      }
      chunks.push(Uint8Array.from(value).buffer);
    }
    return await new Response(new Blob(chunks), { headers: request.headers }).formData();
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireApprovedUserId();
    if (Number(request.headers.get("content-length")) > MAX_MULTIPART_BYTES) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }
    const sql = neon(process.env.DATABASE_URL!);
    const day = new Date().toISOString().slice(0, 10);
    const [attempt] = await sql`
      INSERT INTO upload_daily_limits (user_id, day, attempts) VALUES (${userId}, ${day}, 1)
      ON CONFLICT (user_id) DO UPDATE
        SET day = EXCLUDED.day,
            attempts = CASE WHEN upload_daily_limits.day = EXCLUDED.day
                            THEN upload_daily_limits.attempts + 1 ELSE 1 END
        WHERE upload_daily_limits.day < EXCLUDED.day
          OR (upload_daily_limits.day = EXCLUDED.day AND upload_daily_limits.attempts < 20)
      RETURNING attempts
    `;
    if (!attempt) return NextResponse.json({ error: "Daily upload limit reached" }, { status: 429 });

    const formData = await parseUpload(request);
    if (formData instanceof Response) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }
    if (!formData) return NextResponse.json({ error: "Invalid multipart request" }, { status: 400 });
    const file = formData.get("file");
    const subjectId = formData.get("subjectId");
    const topicId = formData.get("topicId");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if ((subjectId !== null && typeof subjectId !== "string") || (topicId !== null && typeof topicId !== "string")) {
      return NextResponse.json({ error: "Invalid relation" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (ext === "pdf" || file.type === "application/pdf") {
      return NextResponse.json(
        { error: "PDF text extraction is not enabled yet. Upload .txt or .md, or paste the extracted text into AI." },
        { status: 415 },
      );
    }

    if (!["txt", "md"].includes(ext)) {
      return NextResponse.json({ error: "Only .txt and .md files are supported" }, { status: 415 });
    }
    if (file.size > MAX_TEXT_UPLOAD_BYTES) {
      return NextResponse.json({ error: "File too large (max 4 MB)" }, { status: 413 });
    }
    let extractedText: string;
    try {
      extractedText = new TextDecoder("utf-8", { fatal: true }).decode(await file.arrayBuffer()).trim();
    } catch {
      return NextResponse.json({ error: "File must contain valid UTF-8 text" }, { status: 415 });
    }
    // Allow tabs, line endings and printable Unicode.
    if (!extractedText || /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(extractedText)) {
      return NextResponse.json({ error: "No readable text found in this file" }, { status: 415 });
    }

    const db = getDb();
    await assertOwnedRelations(db, userId, { subjectId, topicId });
    const uniqueName = `extracted-${randomUUID()}.${ext || "txt"}`;
    const [upload] = await db
      .insert(uploads)
      .values({
        userId,
        filename: uniqueName,
        originalName: file.name,
        mimeType: ext === "md" ? "text/markdown" : "text/plain",
        sizeBytes: file.size,
        extractedText,
        subjectId: subjectId || undefined,
        topicId: topicId || undefined,
        processed: true,
      })
      .returning();

    return NextResponse.json({
      success: true,
      upload: {
        id: upload.id,
        filename: upload.filename,
        originalName: upload.originalName,
        sizeBytes: upload.sizeBytes,
        extractedText: upload.extractedText,
      },
    });
  } catch (error) {
    if (error instanceof ApprovalRequiredError) {
      return NextResponse.json({ error: "Approval required" }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message.startsWith(FORBIDDEN_RELATION_MESSAGE)) {
      return NextResponse.json({ error: FORBIDDEN_RELATION_MESSAGE }, { status: 403 });
    }
    console.error("Upload failed");
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
