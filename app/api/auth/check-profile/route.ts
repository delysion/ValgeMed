import "server-only";

import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const name = user.user_metadata?.full_name ?? user.email ?? "";
    const sql = neon(process.env.DATABASE_URL!);

    await sql`
      INSERT INTO profiles (id, email, display_name, approved)
      VALUES (${user.id}, ${user.email ?? ""}, ${name}, false)
      ON CONFLICT (id) DO UPDATE SET email = ${user.email ?? ""}, display_name = ${name}
    `;

    const rows = await sql`
      SELECT approved, notified_at FROM profiles WHERE id = ${user.id}
    `;

    const profile = rows[0];

    return NextResponse.json({
      approved: !!profile?.approved,
      notified: !!profile?.notified_at,
    });
  } catch (e) {
    console.error("check-profile error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
