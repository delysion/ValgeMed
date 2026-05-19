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

function NavLink({
  item,
  t,
  compact,
}: {
  item: (typeof navItems)[number];
  t: (key: TranslationKey) => string;
  compact?: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={
        item.featured
          ? "group flex items-center gap-3 rounded-lg border border-primary/20 bg-primary-soft px-3 py-2 text-sm font-medium text-primary shadow-sm transition-all duration-200 hover:bg-primary-soft/80"
          : "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-bg-subtle hover:text-text-primary"
      }
    >
      <Icon className={cn(
        "h-4 w-4 shrink-0 transition-all duration-200 group-hover:scale-110",
        item.featured ? "text-primary" : "text-text-muted group-hover:text-text-primary",
      )} />
      <span className="truncate">{t(item.label)}</span>
    </Link>
  );
}

import { cn } from "@/lib/utils";

function Navigation({ t, compact = false }: { t: (key: TranslationKey) => string; compact?: boolean }) {
  if (compact) {
    return (
      <nav className="grid gap-5 pb-8">
        {navSections.map((section) => (
          <div key={section.label}>
            <div className="mb-2 flex items-center gap-2 px-1">
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-text-muted">{section.label}</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid gap-0.5">
              {section.items.map((item) => (
                <NavLink key={item.href} item={item} t={t} compact />
              ))}
            </div>
          </div>
        ))}
      </nav>
    );
  }

  return (
    <nav className="grid gap-1 pb-8">
      {navItems.map((item) => (
        <NavLink key={item.href} item={item} t={t} />
      ))}
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
      <div className="min-h-screen bg-bg-page">
        <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 overflow-y-auto border-r border-border bg-white lg:block">
          <div className="sticky top-0 z-10 border-b border-border bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-violet shadow-sm">
                <Command className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-[0.18em] text-text-muted">{t("app.privateConsole")}</p>
                <h1 className="truncate text-base font-semibold tracking-tight text-text-primary">{t("app.name")}</h1>
              </div>
            </div>
          </div>
          <div className="p-3 pt-3">
            <Navigation t={t} />
          </div>
        </aside>

        <div className="lg:pl-64">
          <header className="sticky top-0 z-30 flex min-h-14 items-center justify-between gap-3 border-b border-border bg-white/95 px-3 py-2 backdrop-blur-md sm:px-4 lg:px-6">
            <div className="flex min-w-0 items-center gap-2.5">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9 lg:hidden" aria-label="Menu">
                    <ClipboardList className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="left-0 right-auto w-[min(90vw,300px)] border-l-0 border-r border-border">
                  <div className="mb-4">
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-white p-3 shadow-sm">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-violet">
                        <Command className="h-4 w-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-base font-semibold text-text-primary">{t("app.name")}</h2>
                        <p className="text-[10px] text-text-muted">{t("app.tagline")}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <LanguageSelector current={locale} label={t("language.label")} />
                    </div>
                  </div>
                  <Navigation t={t} compact />
                </SheetContent>
              </Sheet>
              <div className="min-w-0">
                <p className="text-[10px] text-text-muted">{t("app.owner")}</p>
                <p className="truncate text-sm font-medium text-text-primary">{session.email}</p>
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
    <div className="motion-premium mb-5 flex flex-col gap-2.5 rounded-2xl border border-border bg-white p-4 shadow-[var(--shadow-card)] sm:p-6 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-primary sm:text-[10px]">{eyebrow}</p>
        ) : null}
        <h2 className="text-balance text-xl font-semibold tracking-tight text-text-primary sm:text-2xl md:text-3xl">{title}</h2>
        {description ? <p className="mt-1.5 max-w-3xl text-xs leading-6 text-text-secondary sm:text-sm sm:leading-7 md:text-base">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
