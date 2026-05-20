import {
  Command,
  FileDown,
  LogOut,
  Menu,
} from "lucide-react";

import { LanguageSelector } from "@/components/language-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { logoutAction } from "@/lib/auth/actions";
import type { User } from "@supabase/supabase-js";
import { getI18n, dictionaries } from "@/lib/i18n/server";
import { TranslationProvider } from "@/lib/i18n/useTranslation";
import { getTheme } from "@/lib/theme/config";

import { Navigation } from "./navigation";

export async function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  const { locale, dictionary, t } = await getI18n();
  const theme = await getTheme();

  const displayName = (user.email ?? "").split("@")[0];

  return (
    <TranslationProvider locale={locale} dictionary={dictionary} dictionaries={dictionaries}>
      <div className="min-h-screen bg-bg-page">
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
        <div className="lg:pl-64">
          {/* Mobile + Desktop Header */}
          <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-border bg-gradient-to-r from-bg-surface/90 via-bg-surface/95 to-bg-subtle/30 px-4 py-2.5 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <Sheet>
                <SheetTrigger className="h-10 w-10 rounded-xl border border-border bg-gradient-to-br from-bg-elevated to-bg-subtle/30 p-0 hover:bg-bg-subtle active:scale-[0.97] lg:hidden" aria-label="Open navigation menu">
                  <Menu className="h-5 w-5" />
                </SheetTrigger>
                <SheetContent className="left-0 right-auto w-[min(88vw,300px)] border-r border-l-0 border-border bg-gradient-to-b from-bg-surface to-bg-page p-0 sm:max-w-sm">
                  <div className="flex items-center gap-3 border-b border-border bg-gradient-to-r from-bg-page/80 to-bg-surface/80 p-4">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary via-primary-ring to-violet shadow-sm">
                      <Command className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-bold tracking-tight text-text-primary">{t("app.name")}</h2>
                      <p className="text-xs text-text-muted">{t("app.tagline")}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <LanguageSelector label={t("language.label")} />
                  </div>
                  <div className="overflow-y-auto px-3 pb-6">
                  <Navigation />
                </div>
                </SheetContent>
              </Sheet>
              <div className="min-w-0">
                <p className="text-xs font-medium text-text-muted">{t("app.owner")}</p>
                <p className="truncate text-sm font-semibold text-text-primary">{displayName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle theme={theme} />
              <div className="hidden sm:block">
                <LanguageSelector label={t("language.label")} compact />
              </div>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex gap-1.5 rounded-xl">
                <a href="/api/export/json" aria-label={t("app.exportJson")}>
                  <FileDown className="h-4 w-4" />
                  {t("app.exportJson")}
                </a>
              </Button>
              <form action={logoutAction}>
                <Button type="submit" variant="outline" size="sm" className="rounded-xl gap-1.5">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("app.logout")}</span>
                </Button>
              </form>
            </div>
          </header>
          <main id="main-content" className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </TranslationProvider>
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
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary">{eyebrow}</p>
          ) : null}
          <h2 className="text-balance text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">{title}</h2>
          {description ? <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-text-secondary">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2.5 shrink-0">{actions}</div> : null}
      </div>
    </div>
  );
}
