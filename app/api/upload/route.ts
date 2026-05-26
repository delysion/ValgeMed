import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getDb } from "@/lib/db";
import { uploads } from "@/lib/db/schema";
import { requireApprovedUserId } from "@/lib/db/auth";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const subjectId = formData.get("subjectId") as string | null;
    const topicId = formData.get("topicId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (ext === "pdf" || file.type === "application/pdf") {
      return NextResponse.json(
        { error: "PDF text extraction is not enabled yet. Upload .txt or .md, or paste the extracted text into AI." },
        { status: 415 },
      );
    }

    const allowedTypes = ["text/plain", "text/markdown", "application/octet-stream"];
    const isValidType = allowedTypes.includes(file.type) || ["txt", "md"].includes(ext);

    if (!isValidType) {
      return NextResponse.json(
        { error: "Only .txt and .md files are supported for text extraction" },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const extractedText = buffer.toString("utf-8").trim();

    if (!extractedText) {
      return NextResponse.json({ error: "No readable text found in this file" }, { status: 400 });
    }

    const db = getDb();
    const userId = await requireApprovedUserId();
    const uniqueName = `extracted-${randomUUID()}.${ext || "txt"}`;
    const [upload] = await db
      .insert(uploads)
      .values({
        userId,
        filename: uniqueName,
        originalName: file.name,
        mimeType: file.type || `application/${ext}`,
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
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
