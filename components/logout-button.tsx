"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { getClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function LogoutButton() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleLogout = async () => {
    try {
      const supabase = getClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      router.push("/login");
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="rounded-xl gap-1.5"
      onClick={handleLogout}
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">{t("app.logout")}</span>
    </Button>
  );
}