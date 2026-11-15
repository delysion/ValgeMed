"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getI18n } from "@/lib/i18n/server";
import { getTheme, themeCookie } from "@/lib/theme/config";
import type { TranslationKey } from "@/lib/i18n/dictionaries/en";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Navigation } from "./navigation";
import { LanguageSelector } from "@/components/language-selector";
import { LogoutButton } from "./logout-button";
import { ArrowLeft, Command, Menu, FileDown } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { MobileNav } from "@/components/mobile-nav";
import { MobileDrawer } from "@/components/mobile-drawer";
import { InstallMenuItem } from "@/components/install-app-button";

type CheckStatusResponse = {
  hasProfile: boolean;
  approved: boolean;
  isAdmin: boolean;
};

type ClientI18n = ReturnType<typeof getI18n>;

async function fetchCheckStatus(signal?: AbortSignal): Promise<CheckStatusResponse> {
  const response = await fetch("/api/admin/check-status", {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error("Unable to check profile status");
  }

  return response.json();
}

const pageTitleKeys: Record<string, TranslationKey> = {
  "/command": "nav.command",
  "/dashboard": "nav.dashboard",
  "/elite-index": "nav.eliteIndex",
  "/strategic-review": "nav.strategicReview",
  "/subjects": "nav.subjects",
  "/exams": "nav.exams",
  "/topics": "nav.topics",
  "/study": "nav.study",
  "/daily-log": "nav.dailyLog",
  "/reviews": "nav.reviews",
  "/flashcards": "nav.flashcards",
  "/errors": "nav.errors",
  "/goals": "nav.goals",
  "/memory": "nav.memory",
  "/identity": "nav.identity",
  "/tartu": "nav.tartu",
  "/time": "nav.time",
  "/health": "nav.health",
  "/language": "nav.language",
  "/research": "nav.researchCommand",
  "/research/literature": "nav.literatureMap",
  "/research/hypotheses": "nav.hypothesisEngine",
  "/research/manuscripts": "nav.manuscriptPipeline",
  "/opportunities": "nav.opportunities",
  "/reputation": "nav.reputation",
  "/network": "nav.network",
  "/life-admin": "nav.lifeAdmin",
  "/portfolio": "nav.portfolio",
  "/settings": "nav.settings",
  "/ai": "nav.ai",
};

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  const [theme, setThemeState] = useState<"light" | "dark">("dark");
  const [i18n, setI18n] = useState<ClientI18n | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerTrigger = useRef<HTMLButtonElement | null>(null);

  function openDrawer(event: React.MouseEvent<HTMLButtonElement>) {
    drawerTrigger.current = event.currentTarget;
    setDrawerOpen(true);
  }

  useEffect(() => {
    getTheme().then(setThemeState);
    queueMicrotask(() => setI18n(getI18n()));
  }, []);

  const t = useMemo(
    () => i18n?.t ?? ((key: TranslationKey) => key),
    [i18n],
  );

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const controller = new AbortController();

    const checkApproval = async () => {
      try {
        const data = await fetchCheckStatus(controller.signal);
        if (data.hasProfile && !data.approved) {
          router.replace("/pending-approval");
        }
      } catch {
        // Status checks are best effort; protected pages still validate on the server.
      }
    };

    checkApproval();
    const interval = setInterval(checkApproval, 300_000);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [router]);

  const displayName = useMemo(() => (user.email ?? "").split("@")[0], [user.email]);

  const pageTitle: string = useMemo(() => {
    if (!pathname) return t("app.name");
    const exact = pageTitleKeys[pathname];
    if (exact) return t(exact);
    for (const [p, key] of Object.entries(pageTitleKeys)) {
      if (pathname.startsWith(p + "/")) return t(key as TranslationKey);
    }
    return t("app.name");
  }, [pathname, t]);

  const handleToggleTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(next);
    localStorage.setItem(themeCookie, next);
    document.cookie = `${themeCookie}=${next};path=/;max-age=31536000;SameSite=Lax`;
    setThemeState(next);
  }, [theme]);

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    if (pathname && pathname !== "/command") {
      router.push("/command");
    }
  }, [pathname, router]);

  return (
    <div className="min-h-dvh bg-bg-page">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-control focus:bg-action focus:px-4 focus:py-2 focus:text-action-foreground">
        {t("app.skipToContent")}
      </a>
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 overflow-y-auto border-r border-border bg-bg-surface lg:block">
        <div className="sticky top-0 z-10 border-b border-border bg-bg-surface px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-control border border-primary/25 bg-primary-soft text-primary">
              <Command aria-hidden="true" className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-ui-label font-medium text-text-muted">{t("app.privateConsole")}</p>
              <h1 className="truncate text-base font-semibold tracking-tight text-text-primary">{t("app.name")}</h1>
            </div>
          </div>
        </div>
        <div className="p-3 pt-3">
          <Navigation />
          <div className="mt-2">
            <InstallMenuItem />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="min-w-0 pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0 lg:pl-60">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border bg-bg-surface px-3 lg:hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={handleBack}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-control text-text-secondary transition-colors hover:bg-bg-subtle hover:text-text-primary"
              aria-label={t("common.back")}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-haspopup="dialog"
              aria-expanded={drawerOpen}
              onClick={openDrawer}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-control transition-colors hover:bg-bg-subtle"
              aria-label={t("app.openMenu")}
            >
              <Menu className="h-5 w-5 text-text-primary" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text-primary leading-tight">{pageTitle}</p>
              <p className="truncate text-ui-label text-text-muted leading-tight">{displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle theme={theme} onToggle={handleToggleTheme} />
            <LanguageSelector label="" compact />
            <LogoutButton />
          </div>
        </header>

        {/* Desktop Header */}
        <header className="sticky top-0 z-30 hidden min-h-16 items-center justify-between gap-3 border-b border-border bg-bg-surface px-6 py-2.5 lg:flex">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-9 w-9 shrink-0 rounded-xl text-text-secondary"
              aria-label={t("common.back")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
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
        <main id="main-content" className="mx-auto w-full max-w-[84rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8 xl:py-7 overflow-visible">
          {children}
        </main>
      </div>

      <MobileNav drawerOpen={drawerOpen} onOpenDrawer={openDrawer} />
      <MobileDrawer open={drawerOpen} onOpenChange={setDrawerOpen} triggerRef={drawerTrigger} displayName={displayName} theme={theme} onToggleTheme={handleToggleTheme} />
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
    <div className="mb-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="mb-1.5 text-ui-label font-medium text-text-secondary">{eyebrow}</p>
          ) : null}
          <h2 className="text-balance text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">{title}</h2>
          {description ? <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-text-secondary">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2.5 shrink-0">{actions}</div> : null}
      </div>
    </div>
  );
}

export default AppShell;
