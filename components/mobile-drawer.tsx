"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  AlertTriangle, Beaker, BookMarked, BookOpen, Bot, Brain, Briefcase,
  CalendarCheck, ChevronRight, ClipboardList, Clock, Command, FileText,
  FlaskConical, GraduationCap, Heart, Languages, LayoutDashboard, Lightbulb,
  LogOut, MapPin, NotebookPen, Radar, Settings, Star, Target, Timer, Trophy, User, Users, X, Layers,
} from "lucide-react";
import type { TranslationKey } from "@/lib/i18n/dictionaries/en";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { cn } from "@/lib/utils";
import { AdminPendingBadge } from "./admin-pending-badge";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSelector } from "./language-selector";
import { InstallMenuItem } from "./install-app-button";
import { getClient } from "@/lib/supabase/client";
import { getTheme, themeCookie } from "@/lib/theme/config";

interface NavSection {
  labelKey: TranslationKey;
  items: Array<{ href: string; label: TranslationKey; icon: React.ComponentType<{ className?: string }> }>;
}

const sections: NavSection[] = [
  {
    labelKey: "nav.sectionCommand",
    items: [
      { href: "/command", label: "nav.command", icon: Command },
      { href: "/dashboard", label: "nav.dashboard", icon: LayoutDashboard },
      { href: "/elite-index", label: "nav.eliteIndex", icon: Trophy },
      { href: "/strategic-review", label: "nav.strategicReview", icon: CalendarCheck },
    ],
  },
  {
    labelKey: "nav.sectionStudy",
    items: [
      { href: "/subjects", label: "nav.subjects", icon: BookOpen },
      { href: "/exams", label: "nav.exams", icon: GraduationCap },
      { href: "/topics", label: "nav.topics", icon: Lightbulb },
      { href: "/study", label: "nav.study", icon: Clock },
      { href: "/daily-log", label: "nav.dailyLog", icon: FileText },
      { href: "/reviews", label: "nav.reviews", icon: Brain },
      { href: "/flashcards", label: "nav.flashcards", icon: Layers },
      { href: "/errors", label: "nav.errors", icon: AlertTriangle },
    ],
  },
  {
    labelKey: "nav.sectionResearch",
    items: [
      { href: "/research", label: "nav.researchCommand", icon: FlaskConical },
      { href: "/research/literature", label: "nav.literatureMap", icon: BookMarked },
      { href: "/research/hypotheses", label: "nav.hypothesisEngine", icon: Beaker },
      { href: "/research/manuscripts", label: "nav.manuscriptPipeline", icon: FileText },
    ],
  },
  {
    labelKey: "nav.sectionLife",
    items: [
      { href: "/goals", label: "nav.goals", icon: Target },
      { href: "/memory", label: "nav.memory", icon: NotebookPen },
      { href: "/identity", label: "nav.identity", icon: User },
      { href: "/tartu", label: "nav.tartu", icon: MapPin },
      { href: "/time", label: "nav.time", icon: Timer },
      { href: "/health", label: "nav.health", icon: Heart },
      { href: "/language", label: "nav.language", icon: Languages },
    ],
  },
  {
    labelKey: "nav.sectionStrategy",
    items: [
      { href: "/opportunities", label: "nav.opportunities", icon: Radar },
      { href: "/reputation", label: "nav.reputation", icon: Star },
      { href: "/network", label: "nav.network", icon: Users },
      { href: "/life-admin", label: "nav.lifeAdmin", icon: ClipboardList },
      { href: "/portfolio", label: "nav.portfolio", icon: Briefcase },
    ],
  },
];

export function MobileDrawer({
  open,
  onClose,
  displayName = "",
}: {
  open: boolean;
  onClose: () => void;
  displayName?: string;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setThemeState] = useState<"light" | "dark">("dark");
  const [loggingOut, setLoggingOut] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getTheme().then(setThemeState);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleNav = useCallback((href: string) => {
    onClose();
    router.push(href);
  }, [onClose, router]);

  const handleToggleTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(next);
    localStorage.setItem(themeCookie, next);
    document.cookie = `${themeCookie}=${next};path=/;max-age=31536000;SameSite=Lax`;
    setThemeState(next);
  }, [theme]);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      const supabase = getClient();
      await supabase.auth.signOut();
    } catch {} finally {
      router.push("/login");
    }
  }, [router]);

  const isActive = (href: string) =>
    pathname === href || (href !== "/command" && pathname?.startsWith(href + "/"));

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 lg:hidden",
        "transition-[visibility] duration-300",
        open ? "visible" : "invisible",
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-sm",
          "transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className={cn(
          "absolute inset-y-0 left-0 w-[85vw] max-w-[300px] bg-bg-page border-r border-border/60 shadow-2xl overflow-y-auto",
          "transition-transform duration-300 ease-out will-change-transform",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/50 bg-bg-surface/90 backdrop-blur-2xl px-4 py-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary via-primary-ring to-violet shadow-sm">
              <Command className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-text-primary truncate">{t("app.name")}</h2>
              {displayName && <p className="text-xs text-text-muted truncate">{displayName}</p>}
            </div>
          </div>
          <button type="button" onClick={onClose} className="grid h-8 w-8 shrink-0 place-items-center rounded-xl hover:bg-bg-subtle active:scale-[0.92] transition-all duration-150">
            <X className="h-4 w-4 text-text-secondary" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-2 py-3" aria-label="Mobile navigation">
          {sections.map((section) => (
            <div key={section.labelKey}>
              <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-text-muted/70">
                {t(section.labelKey)}
              </p>
              <div className="grid gap-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => handleNav(item.href)}
                      className={cn(
                        "flex items-center gap-3 min-h-[44px] w-full rounded-xl py-2.5 px-3 text-sm font-medium border-l-[3px] transition-all duration-150 active:scale-[0.98]",
                        active
                          ? "bg-gradient-to-r from-primary-soft/50 to-transparent text-primary border-l-primary"
                          : "border-l-transparent text-text-secondary hover:bg-bg-subtle/50 hover:text-text-primary",
                      )}
                    >
                      <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-primary")} />
                      <span className="truncate">{t(item.label)}</span>
                      <ChevronRight className={cn("h-3.5 w-3.5 ml-auto opacity-0 -translate-x-1 transition-all duration-150", active && "opacity-100 translate-x-0")} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="border-t border-border/50 pt-3 mt-3 space-y-1 px-1">
            {[
              { href: "/ai", icon: Bot, label: "nav.ai" },
              { href: "/settings", icon: Settings, label: "nav.settings" },
            ].map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => handleNav(item.href)}
                  className={cn(
                    "flex items-center gap-3 min-h-[44px] w-full rounded-xl py-2.5 px-3 text-sm font-medium border-l-[3px] transition-all duration-150 active:scale-[0.98]",
                    active
                      ? "bg-gradient-to-r from-primary-soft/50 to-transparent text-primary border-l-primary"
                      : "border-l-transparent text-text-secondary hover:bg-bg-subtle/50 hover:text-text-primary",
                  )}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  <span>{t(item.label as TranslationKey)}</span>
                </button>
              );
            })}
            <AdminPendingBadge />
          </div>

          <div className="border-t border-border/50 pt-3 mt-3 space-y-3 px-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted">{t("language.label")}</span>
              <LanguageSelector label="" compact />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted">Theme</span>
              <ThemeToggle theme={theme} onToggle={handleToggleTheme} />
            </div>
            <InstallMenuItem />
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-3 min-h-[44px] rounded-xl py-2.5 px-3 text-sm font-medium text-text-secondary hover:bg-destructive/10 hover:text-destructive transition-all duration-150 active:scale-[0.98]"
            >
              <LogOut className="h-[18px] w-[18px] shrink-0" />
              <span className="truncate">{t("nav.logout")}</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
