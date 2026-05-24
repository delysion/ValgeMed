"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getI18n, dictionaries } from "@/lib/i18n/server";
import { en } from "@/lib/i18n/dictionaries/en";
import { getTheme, themeCookie } from "@/lib/theme/config";
import type { Locale } from "@/lib/i18n/config";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Navigation } from "./navigation";
import { LanguageSelector } from "@/components/language-selector";
import { LogoutButton } from "./logout-button";
import { Command, Menu, FileDown } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { checkStatusAction } from "@/lib/actions/admin";
import { MobileNav } from "@/components/mobile-nav";
import { MobileDrawer } from "@/components/mobile-drawer";

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  const [locale, setLocale] = useState<Locale>("en");
  const [dictionary, setDictionary] = useState<any>(null);
  const [theme, setThemeState] = useState<"light" | "dark">("dark");
  const [i18n, setI18n] = useState<{ t: any; dictionary: any; locale: string } | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    getTheme().then(setThemeState);
    const i18n = getI18n();
    setI18n(i18n);
    setLocale(i18n.locale as Locale);
    setDictionary(i18n.dictionary);
  }, []);

  const { t, dictionary: currentDictionary } = useMemo(() => i18n || { t: (k: string) => k, dictionary: en, locale: "en" as Locale }, [i18n]);

  const router = useRouter();

  useEffect(() => {
    const checkApproval = async () => {
      try {
        const data = await checkStatusAction();
        if (data.hasProfile && !data.approved) {
          router.replace("/pending-approval");
        }
      } catch {}
    };
    checkApproval();
    const interval = setInterval(checkApproval, 60_000);
    return () => clearInterval(interval);
  }, [router]);

  const displayName = useMemo(() => (user.email ?? "").split("@")[0], [user.email]);

  const handleToggleTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(next);
    localStorage.setItem(themeCookie, next);
    setThemeState(next);
  }, [theme]);

  return (
    <div className="min-h-school bg-bg-page">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-xl focus:bg-gradient-to-br focus:from-primary focus:to-primary-ring focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:shadow-lg">
        Skip to main content
      </a>
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 overflow-y-auto border-r border-border bg-gradient-to-b from-bg-surface via-bg-surface to-bg-page/90 backdrop-blur-sm lg:block">
        <div className="sticky top-0 z-10 border-b border-border bg-gradient-to-r from-bg-page/80 to-bg-surface/80 backdrop-blur-xl p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary via-primary-ring to-violet shadow-md shadow-primary/25">
              <Command className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">{t("app.privateConsole")}</p>
              <h1 className="truncate text-sm font-bold tracking-tight text-text-primary">{t("app.name")}</h1>
            </div>
          </div>
        </div>
        <div className="p-3 pt-3">
          <Navigation />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 pb-16 lg:pb-0">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex h-12 items-center justify-between gap-3 border-b border-border bg-gradient-to-r from-bg-surface/95 to-bg-page/90 px-4 backdrop-blur-xl lg:hidden">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-xl hover:bg-bg-subtle active:scale-[0.97]"
              aria-label={t("app.openMenu")}
            >
              <Menu className="h-5 w-5 text-text-primary" />
            </button>
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-violet">
              <Command className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-text-primary leading-tight">{t("app.name")}</p>
              <p className="truncate text-[10px] text-text-muted leading-tight">{displayName}</p>
            </div>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="sticky top-0 z-30 hidden min-h-16 items-center justify-between gap-3 border-b border-border bg-gradient-to-r from-bg-surface/90 via-bg-surface/95 to-bg-subtle/30 px-6 py-2.5 backdrop-blur-xl lg:flex">
          <div className="flex min-w-0 items-center gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-text-muted">{t("app.owner")}</p>
              <p className="truncate text-sm font-semibold text-text-primary">{displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle theme={theme} onToggle={handleToggleTheme} />
            <LanguageSelector label={t("language.label")} compact />
            <Button asChild variant="ghost" size="sm" className="gap-1.5 rounded-xl">
              <a href="/api/export/json" aria-label={t("app.exportJson")}>
                <FileDown className="h-4 w-4" />
                {t("app.exportJson")}
              </a>
            </Button>
            <LogoutButton />
          </div>
        </header>
        <main id="main-content" className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>

      <MobileNav onOpenDrawer={() => setDrawerOpen(true)} />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="motion-premium mb-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">{eyebrow}</p>
          ) : null}
          <h2 className="text-balance text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">{title}</h2>
          {description ? <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-text-secondary">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2.5 shrink-0">{actions}</div> : null}
      </div>
    </div>
  );
}

export default AppShell;