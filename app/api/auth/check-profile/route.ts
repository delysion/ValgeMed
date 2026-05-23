import "server-only";

import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");
    const name = searchParams.get("name") ?? email;

    if (!userId || !email) {
      return Response.json({ error: "Missing userId or email" }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    await sql`
      INSERT INTO profiles (id, email, display_name, approved)
      VALUES (${userId}, ${email}, ${name}, false)
      ON CONFLICT (id) DO UPDATE SET email = ${email}, display_name = ${name}
    `;

    const rows = await sql`
      SELECT approved, notified_at FROM profiles WHERE id = ${userId}
    `;

    const profile = rows[0];

    return Response.json({
      approved: !!profile?.approved,
      notified: !!profile?.notified_at,
    });
  } catch (e) {
    console.error("check-profile error:", e);
    return Response.json({
      error: "Internal error",
      detail: e instanceof Error ? `${e.name}: ${e.message}` : String(e),
    }, { status: 500 });
  }
}
