import { createClient } from "@/lib/supabase/server";
import { isOwnerUser } from "@/lib/auth/owner";
import { setUserApproval } from "@/lib/auth/approval";
import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT is_admin FROM profiles WHERE id = ${user.id}`;

  if (!isOwnerUser(user.id) && !rows[0]?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = z.object({ userId: z.uuid(), approved: z.boolean() }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  await setUserApproval(user.id, parsed.data.userId, parsed.data.approved);

  return NextResponse.json({ success: true });
}