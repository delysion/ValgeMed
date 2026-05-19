import Link from "next/link";
import {
  Activity,
  BarChart3,
  BookOpen,
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
  Moon,
  Network,
  Radar,
  Settings,
  Target,
  UserRound,
} from "lucide-react";

import { logoutAction } from "@/lib/auth/actions";
import type { OwnerSession } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { href: "/command", label: "Command", icon: Command },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/elite-index", label: "Elite Index", icon: BarChart3 },
  { href: "/subjects", label: "Subjects", icon: BookOpen },
  { href: "/exams", label: "Exams", icon: GraduationCap },
  { href: "/topics", label: "Topics", icon: Brain },
  { href: "/study-sessions", label: "Sessions", icon: Activity },
  { href: "/reviews", label: "Reviews", icon: CalendarDays },
  { href: "/errors", label: "Errors", icon: CircleAlert },
  { href: "/daily-log", label: "Daily log", icon: Moon },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/identity", label: "Identity", icon: UserRound },
  { href: "/tartu", label: "Tartu", icon: MapPin },
  { href: "/time", label: "Time", icon: Clock },
  { href: "/health", label: "Health", icon: HeartPulse },
  { href: "/language", label: "Language", icon: Languages },
  { href: "/reputation", label: "Reputation", icon: Handshake },
  { href: "/opportunities", label: "Opportunities", icon: Radar },
  { href: "/network", label: "Network", icon: Network },
  { href: "/life-admin", label: "Life admin", icon: Compass },
  { href: "/portfolio", label: "Portfolio", icon: FolderOpen },
  { href: "/ai", label: "AI rules", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
];

function Navigation() {
  return (
    <nav className="grid gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted transition hover:bg-white/[0.06] hover:text-white"
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({
  children,
  session,
}: {
  children: React.ReactNode;
  session: OwnerSession;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(168,216,255,0.08),transparent_32rem),var(--background)]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 overflow-y-auto border-r border-white/10 bg-black/20 p-4 lg:block">
        <div className="mb-8 space-y-1">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Private console</p>
          <h1 className="text-lg font-semibold text-white">Tartu Med/Dent OS</h1>
        </div>
        <Navigation />
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/10 bg-background/85 px-4 backdrop-blur lg:px-6">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                  <ClipboardList className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="left-0 right-auto border-l-0 border-r">
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">
                    Private console
                  </p>
                  <h2 className="text-lg font-semibold text-white">Tartu Med/Dent OS</h2>
                </div>
                <Navigation />
              </SheetContent>
            </Sheet>
            <div>
              <p className="text-xs text-muted">Owner</p>
              <p className="text-sm text-white">{session.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <a href="/api/export/json">
                <FileDown className="h-4 w-4" />
                JSON
              </a>
            </Button>
            <form action={logoutAction}>
              <Button type="submit" variant="outline" size="sm">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </form>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1480px] px-4 py-5 lg:px-6">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="text-2xl font-semibold tracking-normal text-white">{title}</h2>
        {description ? <p className="mt-1 max-w-3xl text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
