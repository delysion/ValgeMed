"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bot, ChevronDown, LogOut, Settings } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { getClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { AdminPendingBadge } from "./admin-pending-badge";
import { NavLink } from "./nav-link";
import { navigationSectionForPath, navigationSections } from "./navigation-config";

const COOKIE_NAME = "valgemed_nav";
const COOKIE_DAYS = 365;

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  try {
    return match ? decodeURIComponent(match[1]) : undefined;
  } catch {
    return undefined;
  }
}

function setCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  const d = new Date();
  d.setTime(d.getTime() + COOKIE_DAYS * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
}

type Preference = { pathname: string; section: string | null };

export function NavigationSections({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const routeSection = navigationSectionForPath(pathname);
  const [preference, setPreference] = useState<Preference>();

  useEffect(() => {
    const saved = getCookie(COOKIE_NAME);
    if (!routeSection && saved && navigationSections.some(({ labelKey }) => labelKey === saved)) {
      queueMicrotask(() => setPreference((current) => current ?? { pathname, section: saved }));
    }
  }, [pathname, routeSection]);

  const openSection = preference?.pathname === pathname ? preference.section : routeSection ?? "nav.sectionCommand";

  return (
    <div className="flex-1 space-y-1">
      {navigationSections.map((section) => {
        const isOpen = openSection === section.labelKey;
        return (
          <div key={section.labelKey}>
            <button
              type="button"
              onClick={() => {
                const next = isOpen ? null : section.labelKey;
                setPreference({ pathname, section: next });
                setCookie(COOKIE_NAME, next ?? "");
              }}
              aria-expanded={isOpen}
              className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-text-secondary hover:bg-bg-subtle hover:text-text-primary"
            >
              <span className="flex-1 text-left">{t(section.labelKey)}</span>
              <ChevronDown aria-hidden="true" className={cn("h-4 w-4 shrink-0 transition-transform motion-reduce:transition-none", isOpen && "rotate-180")} />
            </button>
            {isOpen && (
              <div className="mt-0.5 mb-1 grid gap-0.5 px-1">
                {section.items.map((item) => (
                  <NavLink key={item.href} {...item} t={t} onNavigate={onNavigate} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function Navigation() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

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
    <nav className="flex flex-col gap-1 pb-6 h-full" aria-label={t("nav.main")}>
      <NavigationSections />

      <div className="border-t border-border/60 pt-3 mt-3 space-y-1">
        <NavLink href="/ai" label="nav.ai" icon={Bot} t={t} />
        <NavLink href="/settings" label="nav.settings" icon={Settings} t={t} />
        <AdminPendingBadge />
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-xl py-2.5 pl-[9px] pr-3 text-sm font-medium text-text-secondary hover:bg-destructive/10 hover:text-destructive transition-all duration-200 active:scale-[0.98]"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          <span className="truncate">{t("nav.logout")}</span>
        </button>
      </div>
    </nav>
  );
}
