import "server-only";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, approved")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/command");

  return { id: user.id, email: user.email ?? "unknown" };
}