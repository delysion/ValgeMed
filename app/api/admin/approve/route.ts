import { createClient } from "@/lib/supabase/server";
import { neon } from "@neondatabase/serverless";
import { db } from "@/lib/db/admin";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql.query(
    "SELECT is_admin FROM profiles WHERE id = $1",
    [user.id],
  );

  if (!rows[0]?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId, approved } = await request.json();
  if (!userId || typeof approved !== "boolean") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  await db
    .update(profiles)
    .set({ approved, notifiedAt: null })
    .where(eq(profiles.id, userId));

  return NextResponse.json({ success: true });
}