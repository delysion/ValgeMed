import "server-only";

import { requireUser } from "@/lib/auth/supabase";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  try {
    const user = await requireUser();
    const sql = neon(process.env.DATABASE_URL!);

    const rows = await sql`
      SELECT approved, is_admin FROM profiles WHERE id = ${user.id}
    `;

    const profile = rows[0];

    return Response.json({
      hasProfile: !!profile,
      approved: !!profile?.approved,
      isAdmin: !!profile?.is_admin,
    });
  } catch (e) {
    console.error("check-status error:", e);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
