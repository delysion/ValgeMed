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
  Menu,
  Network,
  Radar,
  Settings,
  Target,
  Timeline,
  UserRound,
} from "lucide-react";

import { LanguageSelector } from "@/components/language-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { logoutAction } from "@/lib/auth/actions";
import type { OwnerSession } from "@/lib/auth/session";
import { getI18n } from "@/lib/i18n/server";
import { TranslationProvider } from "@/lib/i18n/useTranslation";
import type { TranslationKey } from "@/lib/i18n/dictionaries/en";
import { getTheme } from "@/lib/theme/config";

import { NavLink } from "@/components/nav-link";
import { cn } from "@/lib/utils";

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

function Navigation({ t }: { t: (key: TranslationKey) => string }) {
  return (
    <nav className="grid gap-5 pb-6">
      {navSections.map((section) => (
        <div key={section.label}>
          <div className="mb-2 flex items-center gap-2 px-1">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-text-muted">{section.label}</span>
            <div className="h-px flex-1 bg-border-light" />
          </div>
          <div className="grid gap-0.5">
            {section.items.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                t={t}
                featured={item.featured}
              />
            ))}
          </div>
        </div>
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
  const theme = await getTheme();

  const displayName = session.email.split("@")[0];

  return (
    <TranslationProvider locale={locale} dictionary={dictionary}>
      <div className="min-h-screen bg-bg-page">
        {/* Desktop Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 overflow-y-auto border-r border-border bg-bg-surface lg:block">
          <div className="sticky top-0 z-10 border-b border-border bg-bg-page/80 backdrop-blur-xl p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-violet shadow-md shadow-primary/20">
                <Command className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">{t("app.privateConsole")}</p>
                <h1 className="truncate text-sm font-bold tracking-tight text-text-primary">{t("app.name")}</h1>
              </div>
            </div>
          </div>
          <div className="p-3 pt-3">
            <Navigation t={t} />
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="lg:pl-64">
          {/* Mobile + Desktop Header */}
          <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-border bg-bg-surface/85 px-4 py-2.5 backdrop-blur-xl sm:px-5 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl lg:hidden" aria-label="Menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="left-0 right-auto w-[min(88vw,300px)] border-r border-l-0 border-border bg-bg-surface p-0 sm:max-w-sm">
                  <div className="flex items-center gap-3 border-b border-border bg-bg-page/80 p-4">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-violet shadow-sm">
                      <Command className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-bold tracking-tight text-text-primary">{t("app.name")}</h2>
                      <p className="text-xs text-text-muted">{t("app.tagline")}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <LanguageSelector current={locale} label={t("language.label")} />
                  </div>
                  <div className="overflow-y-auto px-3 pb-6">
                    <Navigation t={t} />
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
                <LanguageSelector current={locale} label={t("language.label")} compact />
              </div>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex gap-1.5 rounded-lg">
                <a href="/api/export/json" aria-label={t("app.exportJson")}>
                  <FileDown className="h-4 w-4" />
                  {t("app.exportJson")}
                </a>
              </Button>
              <form action={logoutAction}>
                <Button type="submit" variant="outline" size="sm" className="rounded-lg gap-1.5">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("app.logout")}</span>
                </Button>
              </form>
            </div>
          </header>
          <main className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">{children}</main>
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
