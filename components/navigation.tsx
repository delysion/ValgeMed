"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Beaker,
  BookMarked,
  BookOpen,
  Bot,
  Brain,
  Briefcase,
  CalendarCheck,
  ChevronDown,
  ClipboardList,
  Clock,
  Command,
  FileText,
  FlaskConical,
  GraduationCap,
  Heart,
  Languages,
  LayoutDashboard,
  Lightbulb,
  MapPin,
  NotebookPen,
  Radar,
  Settings,
  Star,
  Target,
  Timer,
  Trophy,
  User,
  Users,
} from "lucide-react";
import type { TranslationKey } from "@/lib/i18n/dictionaries/en";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { cn } from "@/lib/utils";
import { NavLink } from "./nav-link";

const COOKIE_NAME = "valgemed_nav";
const COOKIE_DAYS = 365;

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function setCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  const d = new Date();
  d.setTime(d.getTime() + COOKIE_DAYS * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
}

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
      { href: "/reviews", label: "nav.reviews", icon: Brain },
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
  {
    labelKey: "nav.sectionAiSettings",
    items: [
      { href: "/ai", label: "nav.ai", icon: Bot },
      { href: "/settings", label: "nav.settings", icon: Settings },
    ],
  },
];

function getInitialSection(): string | null {
  if (typeof window === "undefined") return null;
  const saved = getCookie(COOKIE_NAME);
  return saved || "command";
}

export function Navigation() {
  const { t } = useTranslation();
  const [openSection, setOpenSection] = useState<string | null>(() => getInitialSection());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mounting flag is intentional
    setMounted(true);
  }, []);

  const toggleSection = (labelKey: string) => {
    setOpenSection((prev) => {
      const next = prev === labelKey ? null : labelKey;
      setCookie(COOKIE_NAME, next ?? "");
      return next;
    });
  };

  if (!mounted) return null;

  return (
    <nav className="grid gap-1 pb-6" aria-label="Main navigation">
      {sections.map((section) => {
        const isOpen = openSection === section.labelKey;
        return (
          <div key={section.labelKey}>
            <button
              type="button"
              onClick={() => toggleSection(section.labelKey)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-text-muted hover:text-text-primary transition-colors duration-150 rounded-lg hover:bg-bg-subtle/50"
            >
              <span className="flex-1 text-left">{t(section.labelKey)}</span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
                  isOpen && "rotate-180",
                )}
              />
            </button>
            {isOpen && (
              <div className="grid gap-0.5 px-1 mt-0.5 mb-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    t={t}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
