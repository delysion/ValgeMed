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
  { href: "/elite-index", label: "nav.eliteIndex", icon: BarChart3 },
  { href: "/subjects", label: "nav.subjects", icon: ClipboardList },
  { href: "/exams", label: "nav.exams", icon: GraduationCap },
  { href: "/topics", label: "nav.topics", icon: Brain },
  { href: "/study", label: "nav.study", icon: Activity },
  { href: "/reviews", label: "nav.reviews", icon: CalendarDays },
  { href: "/errors", label: "nav.errors", icon: CircleAlert },
  { href: "/goals", label: "nav.goals", icon: Target },
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

function Navigation({ t }: { t: (key: TranslationKey) => string }) {
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
                ? "group flex items-center gap-3 rounded-2xl border border-cyan/20 bg-cyan/10 px-3 py-2.5 text-sm font-semibold text-cyan shadow-[0_0_34px_rgba(121,231,255,0.08)] transition hover:bg-cyan/15"
                : "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-white/[0.06] hover:text-white"
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
        <aside className="fixed inset-y-0 left-0 hidden w-72 overflow-y-auto border-r border-white/10 bg-black/20 p-4 backdrop-blur-2xl lg:block">
          <div className="mb-7 rounded-3xl border border-white/10 bg-white/[0.045] p-4 shadow-[var(--ring-soft)]">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">{t("app.privateConsole")}</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">{t("app.name")}</h1>
            <p className="mt-1 text-sm text-muted">{t("app.tagline")}</p>
          </div>
          <Navigation t={t} />
        </aside>

        <div className="lg:pl-72">
          <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-white/10 bg-background/72 px-4 py-3 backdrop-blur-2xl lg:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="lg:hidden" aria-label={t("nav.command")}>
                    <ClipboardList className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="left-0 right-auto border-l-0 border-r">
                  <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.045] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">{t("app.privateConsole")}</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">{t("app.name")}</h2>
                    <div className="mt-4">
                      <LanguageSelector current={locale} label={t("language.label")} />
                    </div>
                  </div>
                  <Navigation t={t} />
                </SheetContent>
              </Sheet>
              <div className="min-w-0">
                <p className="text-xs text-muted">{t("app.owner")}</p>
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
          <main className="mx-auto w-full max-w-[1540px] px-4 py-5 sm:px-5 lg:px-7">{children}</main>
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
    <div className="motion-premium mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-[var(--ring-soft)] backdrop-blur-xl md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan">{eyebrow}</p> : null}
        <h2 className="text-balance text-3xl font-semibold tracking-normal text-white md:text-4xl">{title}</h2>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-muted md:text-base">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
