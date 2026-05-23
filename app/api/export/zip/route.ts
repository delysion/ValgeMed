import { requireUser } from "@/lib/auth/supabase";
import { getDb } from "@/lib/db";
import { schema } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import JSZip from "jszip";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();
  const db = getDb();

  const zip = new JSZip();

  // Export all tables
  for (const [tableName, table] of Object.entries(schema)) {
    try {
      const data = await db.select().from(table);
      const userData = data.filter((row: any) => row.userId === user.id);
      
      if (userData.length > 0) {
        zip.file(`${tableName}.json`, JSON.stringify(userData, null, 2));
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