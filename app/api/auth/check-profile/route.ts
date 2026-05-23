import "server-only";

import { createClient } from "@/lib/supabase/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ authenticated: false });
  }

  const sql = neon(process.env.DATABASE_URL!);

  // upsert profile if missing
  await sql.query(
    `INSERT INTO profiles (id, email, approved)
     VALUES ($1, $2, false)
     ON CONFLICT (id) DO UPDATE SET email = $2`,
    [user.id, user.email],
  );

  const rows = await sql.query(
    "SELECT approved, notified_at FROM profiles WHERE id = $1",
    [user.id],
  );

  const profile = rows[0];

  return Response.json({
    authenticated: true,
    approved: !!profile?.approved,
    notified: !!profile?.notified_at,
  });
}
