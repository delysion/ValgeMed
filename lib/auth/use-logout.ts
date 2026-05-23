"use client";

import { useRouter } from "next/navigation";
import { getClient } from "@/lib/supabase/client";

export function useLogout() {
  const router = useRouter();

  const logout = async () => {
    const supabase = getClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return logout;
}