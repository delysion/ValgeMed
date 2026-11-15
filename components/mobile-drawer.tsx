"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { Bot, Command, LogOut, Settings, X } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { getClient } from "@/lib/supabase/client";
import { AdminPendingBadge } from "./admin-pending-badge";
import { InstallMenuItem } from "./install-app-button";
import { LanguageSelector } from "./language-selector";
import { NavLink } from "./nav-link";
import { NavigationSections } from "./navigation";
import { ThemeToggle } from "./theme-toggle";

export function MobileDrawer({
  open,
  onOpenChange,
  triggerRef,
  displayName,
  theme,
  onToggleTheme,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  displayName: string;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const close = () => onOpenChange(false);

  useEffect(() => {
    if (!open) return;
    const desktop = window.matchMedia("(min-width: 64rem)");
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) onOpenChange(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, [open, onOpenChange]);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      const supabase = getClient();
      await supabase.auth.signOut();
    } catch {} finally {
      router.push("/login");
    }
  }, [router]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay lg:hidden" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 left-0 z-50 w-[min(85vw,340px)] overflow-y-auto overscroll-contain border-r border-border bg-bg-surface shadow-dialog lg:hidden"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            closeRef.current?.focus();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            triggerRef.current?.focus();
          }}
        >
          <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-bg-surface px-4 py-3">
            <Command aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-base font-semibold text-text-primary">{t("nav.main")}</Dialog.Title>
              {displayName && <p className="truncate text-sm text-text-muted">{displayName}</p>}
            </div>
            <Dialog.Close ref={closeRef} aria-label={t("nav.closeMenu")} className="grid size-11 place-items-center rounded-lg text-text-secondary hover:bg-bg-subtle">
              <X aria-hidden="true" className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <nav className="space-y-3 px-3 py-3" aria-label={t("nav.main")}>
            <NavigationSections onNavigate={close} />
            <div className="space-y-1 border-t border-border pt-3">
              <NavLink href="/ai" label="nav.ai" icon={Bot} t={t} onNavigate={close} />
              <NavLink href="/settings" label="nav.settings" icon={Settings} t={t} onNavigate={close} />
              <AdminPendingBadge />
            </div>
            <div className="space-y-3 border-t border-border px-2 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">{t("language.label")}</span>
                <LanguageSelector label="" compact />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">{t("theme.label")}</span>
                <ThemeToggle theme={theme} onToggle={onToggleTheme} />
              </div>
              <InstallMenuItem />
              <button type="button" onClick={handleLogout} disabled={loggingOut} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-text-secondary hover:bg-destructive/10 hover:text-destructive">
                <LogOut aria-hidden="true" className="h-5 w-5" />
                {t("nav.logout")}
              </button>
            </div>
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
