import "server-only";

import { neon } from "@neondatabase/serverless";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql.query(
    "SELECT is_admin, approved FROM profiles WHERE id = $1",
    [user.id],
  );

  if (!rows[0]?.is_admin) redirect("/command");

  return { id: user.id, email: user.email ?? "unknown" };
}