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
  const rows = await sql`SELECT is_admin FROM profiles WHERE id = ${user.id}`;

  const profile = rows[0];

  if (isOwner && !profile?.is_admin) {
    await sql`
      INSERT INTO profiles (id, email, approved, is_admin)
      VALUES (${user.id}, ${user.email}, true, true)
      ON CONFLICT (id) DO UPDATE SET email = ${user.email}, approved = true, is_admin = true
    `;
    return { id: user.id, email: user.email ?? "" };
  }

  if (!profile?.is_admin) redirect("/command");

  return { id: user.id, email: user.email ?? "unknown" };
}