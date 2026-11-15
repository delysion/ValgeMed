import { isOwnerUser } from "@/lib/auth/owner";
import "server-only";

import { neon } from "@neondatabase/serverless";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (isOwnerUser(user.id)) return { id: user.id, email: user.email ?? "" };

  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT is_admin FROM profiles WHERE id = ${user.id}`;

  const profile = rows[0];

  if (!profile?.is_admin) redirect("/command");

  return { id: user.id, email: user.email ?? "unknown" };
}