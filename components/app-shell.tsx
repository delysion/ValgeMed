import Link from "next/link";
import {
  Activity,
  BarChart3,
  Bot,
  Brain,
  CalendarDays,
  CircleAlert,
  ClipboardList,
  Clock,
  Command,
  Compass,
  FileDown,
  FolderOpen,
  GraduationCap,
  Handshake,
  HeartPulse,
  Languages,
  LayoutDashboard,
  LogOut,
  MapPin,
  Network,
  Radar,
  Settings,
  Target,
  Timeline,
  UserRound,
} from "lucide-react";

import { LanguageSelector } from "@/components/language-selector";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { logoutAction } from "@/lib/auth/actions";
import type { OwnerSession } from "@/lib/auth/session";
import { getI18n } from "@/lib/i18n/server";
import { TranslationProvider } from "@/lib/i18n/useTranslation";
import type { TranslationKey } from "@/lib/i18n/dictionaries/en";

const navItems: Array<{ href: string; label: TranslationKey; icon: typeof Command; featured?: boolean }> = [
  { href: "/command", label: "nav.command", icon: Command, featured: true },
  { href: "/dashboard", label: "nav.dashboard", icon: LayoutDashboard },
  { href: "/timeline", label: "nav.timeline", icon: Timeline },
  { href: "/elite-index", label: "nav.eliteIndex", icon: BarChart3 },
  { href: "/subjects", label: "nav.subjects", icon: ClipboardList },
  { href: "/exams", label: "nav.exams", icon: GraduationCap },
  { href: "/topics", label: "nav.topics", icon: Brain },
  { href: "/study", label: "nav.study", icon: Activity },
  { href: "/reviews", label: "nav.reviews", icon: CalendarDays },
  { href: "/errors", label: "nav.errors", icon: CircleAlert },
  { href: "/goals", label: "nav.goals", icon: Target },
  { href: "/memory", label: "nav.memory", icon: FolderOpen },
  { href: "/identity", label: "nav.identity", icon: UserRound },
  { href: "/tartu", label: "nav.tartu", icon: MapPin },
  { href: "/time", label: "nav.time", icon: Clock },
  { href: "/health", label: "nav.health", icon: HeartPulse },
  { href: "/language", label: "nav.language", icon: Languages },
  { href: "/opportunities", label: "nav.opportunities", icon: Radar },
  { href: "/reputation", label: "nav.reputation", icon: Handshake },
  { href: "/network", label: "nav.network", icon: Network },
  { href: "/life-admin", label: "nav.lifeAdmin", icon: Compass },
  { href: "/strategic-review", label: "nav.strategicReview", icon: BarChart3 },
  { href: "/portfolio", label: "nav.portfolio", icon: FolderOpen },
  { href: "/ai", label: "nav.ai", icon: Bot },
  { href: "/settings", label: "nav.settings", icon: Settings },
];

const navSections: Array<{ label: string; items: typeof navItems }> = [
  { label: "Core", items: navItems.slice(0, 4) },
  { label: "Study", items: navItems.slice(4, 10) },
  { label: "Life", items: navItems.slice(10, 17) },
  { label: "Strategy", items: navItems.slice(17) },
];

function Navigation({ t, compact = false }: { t: (key: TranslationKey) => string; compact?: boolean }) {
  if (compact) {
    return (
      <nav className="grid gap-5 pb-8">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="mb-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-muted-2">{section.label}</p>
            <div className="grid gap-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      item.featured
                        ? "group flex items-center gap-3 rounded-lg border border-cyan/15 bg-cyan/8 px-3 py-2.5 text-sm font-medium text-cyan shadow-[0_0_20px_rgba(124,175,214,0.06)] transition hover:bg-cyan/12"
                        : "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-white/[0.04] hover:text-white"
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0 transition group-hover:scale-105" />
                    <span className="truncate">{t(item.label)}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    );
  }

  return (
    <nav className="grid gap-1 pb-8">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              item.featured
                ? "group flex items-center gap-3 rounded-lg border border-cyan/15 bg-cyan/8 px-3 py-2 text-sm font-medium text-cyan shadow-[0_0_20px_rgba(124,175,214,0.06)] transition hover:bg-cyan/12"
                : "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-white/[0.04] hover:text-white"
            }
          >
            <Icon className="h-4 w-4 shrink-0 transition group-hover:scale-105" />
            <span className="truncate">{t(item.label)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export async function AppShell({
  children,
  session,
}: {
  children: React.ReactNode;
  session: OwnerSession;
}) {
  const { locale, dictionary, t } = await getI18n();

  return (
    <TranslationProvider locale={locale} dictionary={dictionary}>
      <div className="min-h-screen">
        <aside className="fixed inset-y-0 left-0 hidden w-64 overflow-y-auto border-r border-white/[0.06] bg-white/[0.015] p-4 backdrop-blur-2xl lg:block">
          <div className="mb-6 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 shadow-[var(--ring-soft)]">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted">{t("app.privateConsole")}</p>
            <h1 className="mt-1.5 text-lg font-semibold text-white">{t("app.name")}</h1>
            <p className="mt-0.5 text-xs text-muted">{t("app.tagline")}</p>
          </div>
          <Navigation t={t} />
        </aside>

        <div className="lg:pl-64">
          <header className="sticky top-0 z-30 flex min-h-14 items-center justify-between gap-3 border-b border-white/[0.06] bg-background/80 px-3 py-2 backdrop-blur-2xl sm:px-4 lg:px-6">
            <div className="flex min-w-0 items-center gap-2.5">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="lg:hidden h-9 w-9" aria-label="Menu">
                    <ClipboardList className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="left-0 right-auto w-[min(90vw,300px)] border-l-0 border-r bg-[#0B1F33]/95">
                  <div className="mb-4 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted">{t("app.privateConsole")}</p>
                    <h2 className="mt-1.5 text-lg font-semibold text-white">{t("app.name")}</h2>
                    <div className="mt-3">
                      <LanguageSelector current={locale} label={t("language.label")} />
                    </div>
                  </div>
                  <Navigation t={t} compact />
                </SheetContent>
              </Sheet>
              <div className="min-w-0">
                <p className="text-[10px] text-muted">{t("app.owner")}</p>
                <p className="truncate text-sm font-medium text-white">{session.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:block">
                <LanguageSelector current={locale} label={t("language.label")} compact />
              </div>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <a href="/api/export/json" aria-label={t("app.exportJson")}>
                  <FileDown className="h-4 w-4" />
                  {t("app.exportJson")}
                </a>
              </Button>
              <form action={logoutAction}>
                <Button type="submit" variant="outline" size="sm">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("app.logout")}</span>
                </Button>
              </form>
            </div>
          </header>
          <main className="mx-auto w-full max-w-[1440px] px-3 py-4 sm:px-5 sm:py-5 lg:px-6">{children}</main>
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
    <div className="motion-premium mb-4 flex flex-col gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 shadow-[var(--ring-soft)] backdrop-blur-xl sm:mb-5 sm:p-5 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-cyan sm:text-[10px]">{eyebrow}</p> : null}
        <h2 className="text-balance text-xl font-semibold tracking-tight text-white sm:text-2xl md:text-3xl">{title}</h2>
        {description ? <p className="mt-1 max-w-3xl text-xs leading-5 text-muted sm:text-sm sm:leading-6 md:text-base">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
