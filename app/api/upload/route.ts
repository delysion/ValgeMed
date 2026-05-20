import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { getDb } from "@/lib/db";
import { uploads } from "@/lib/db/schema";
import { requireAuthUserId } from "@/lib/db/auth";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const subjectId = formData.get("subjectId") as string | null;
    const topicId = formData.get("topicId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = [
      "text/plain",
      "application/pdf",
      "text/markdown",
      "application/octet-stream",
    ];
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const isValidType = allowedTypes.includes(file.type) || ["txt", "pdf", "md"].includes(ext);

    if (!isValidType) {
      return NextResponse.json(
        { error: "Only .txt, .pdf, and .md files are supported" },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const uniqueName = `${randomUUID()}.${ext}`;
    const filePath = join(uploadDir, uniqueName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    let extractedText = "";
    if (ext === "txt" || ext === "md") {
      extractedText = buffer.toString("utf-8");
    } else if (ext === "pdf") {
      extractedText = `[PDF uploaded: ${file.name}] — Text extraction requires pdf-parse library. For now, copy-paste the text content for AI processing.`;
    }

    const db = getDb();
    const userId = await requireAuthUserId();
    const [upload] = await db
      .insert(uploads)
      .values({
        userId,
        filename: uniqueName,
        originalName: file.name,
        mimeType: file.type || `application/${ext}`,
        sizeBytes: file.size,
        extractedText: extractedText || null,
        subjectId: subjectId || undefined,
        topicId: topicId || undefined,
        processed: false,
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
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
