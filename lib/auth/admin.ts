import "server-only";

import { neon } from "@neondatabase/serverless";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const isOwner = process.env.OWNER_EMAIL === user.email;

  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql.query(
    "SELECT is_admin, approved FROM profiles WHERE id = $1",
    [user.id],
  );

  const profile = rows[0];

  if (isOwner && !profile?.is_admin) {
    // ensure owner is always admin in DB
    await sql.query(
      `INSERT INTO profiles (id, email, approved, is_admin)
       VALUES ($1, $2, true, true)
       ON CONFLICT (id) DO UPDATE SET email = $2, approved = true, is_admin = true`,
      [user.id, user.email],
    );
    return { id: user.id, email: user.email };
  }

  if (!profile?.is_admin) redirect("/command");

  return { id: user.id, email: user.email ?? "unknown" };
}