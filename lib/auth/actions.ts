"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function logoutAction() {
  const supabase = await createClient();
  
  // Sign out from Supabase
  const { error } = await supabase.auth.signOut();
  
  // Log any errors
  if (error) {
    console.error("Supabase logout error:", error);
  }
  
  // Always redirect to login, even if signOut failed
  redirect("/login");
}
