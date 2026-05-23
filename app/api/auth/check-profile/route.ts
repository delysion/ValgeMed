import "server-only";

import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const email = searchParams.get("email");

  if (!userId || !email) {
    return Response.json({ error: "Missing params" }, { status: 400 });
  }

  const sql = neon(process.env.DATABASE_URL!);

  await sql.query(
    `INSERT INTO profiles (id, email, approved)
     VALUES ($1, $2, false)
     ON CONFLICT (id) DO UPDATE SET email = $2`,
    [userId, email],
  );

  const rows = await sql.query(
    "SELECT approved, notified_at FROM profiles WHERE id = $1",
    [userId],
  );

  const profile = rows[0];

  return Response.json({
    approved: !!profile?.approved,
    notified: !!profile?.notified_at,
  });
}
