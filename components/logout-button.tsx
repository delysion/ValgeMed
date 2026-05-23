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
      // Force reload to clear any cached data
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      window.location.href = "/login";
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="rounded-xl gap-1.5"
      onClick={handleLogout}
      aria-label={t("app.logout")}
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">{t("app.logout")}</span>
    </Button>
  );
}