import { requireUser } from "@/lib/auth/supabase";
import { getDb } from "@/lib/db";
import { schema } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import JSZip from "jszip";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();
  const db = getDb();

  const zip = new JSZip();

  // Export all tables — filter at DB level
  for (const [tableName, table] of Object.entries(schema)) {
    try {
      const t = table as any;
      const hasUserId = t.userId !== undefined;
      const data = hasUserId
        ? await db.select().from(table as any).where(eq(t.userId, user.id))
        : await db.select().from(table as any);
      if (data.length > 0) {
        zip.file(`${tableName}.json`, JSON.stringify(data, null, 2));
      }
    } catch {
      // Skip tables that can't be exported
    }
  }

  // Add metadata
  const metadata = {
    exportedAt: new Date().toISOString(),
    userId: user.id,
    version: "1.0",
  };
  zip.file("metadata.json", JSON.stringify(metadata, null, 2));

  const content = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });

  return new NextResponse(content, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="valgemed-backup-${new Date().toISOString().slice(0, 10)}.zip"`,
    },
  });
}