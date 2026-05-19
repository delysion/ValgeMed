"use client";

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
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { TranslationKey } from "@/lib/i18n/dictionaries/en";
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

export function Navigation({ t }: { t: (key: TranslationKey) => string }) {
  const pathname = usePathname();

  return (
    <nav className="grid gap-5 pb-6">
      {navSections.map((section) => (
        <div key={section.label}>
          <div className="mb-2 flex items-center gap-2 px-1">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-text-muted">{section.label}</span>
            <div className="h-px flex-1 bg-border-light" />
          </div>
          <div className="grid gap-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/command" && pathname?.startsWith(item.href + "/"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-white shadow-sm shadow-primary/20"
                      : item.featured
                        ? "border border-primary/20 bg-primary-soft text-primary shadow-sm hover:bg-primary-soft/70 hover:shadow-md"
                        : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary",
                    "active:scale-[0.98]",
                  )}
                >
                  <Icon className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110",
                    isActive
                      ? "text-white"
                      : item.featured
                        ? "text-primary"
                        : "text-text-muted group-hover:text-text-primary",
                  )} />
                  <span className="truncate">{t(item.label)}</span>
                  {item.featured && !isActive && (
                    <span className="ml-auto flex h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
