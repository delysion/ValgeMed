import "server-only";

import { requireUser } from "@/lib/auth/supabase";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  const user = await requireUser();
  const sql = neon(process.env.DATABASE_URL!);

  const rows = await sql.query(
    "SELECT approved, is_admin FROM profiles WHERE id = $1",
    [user.id],
  );

  const profile = rows[0];

  return Response.json({
    hasProfile: !!profile,
    approved: !!profile?.approved,
    isAdmin: !!profile?.is_admin,
  });
}
