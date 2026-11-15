import {
  AlertTriangle,
  Beaker,
  BookMarked,
  BookOpen,
  Brain,
  Briefcase,
  CalendarCheck,
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
  Star,
  Target,
  Timer,
  Trophy,
  User,
  Users,
  Layers,
} from "lucide-react";
import type { TranslationKey } from "@/lib/i18n/dictionaries/en";

interface NavSection {
  labelKey: TranslationKey;
  items: Array<{ href: string; label: TranslationKey; icon: React.ComponentType<{ className?: string }> }>;
}

export const navigationSections: NavSection[] = [
  {
    labelKey: "nav.sectionCommand",
    items: [
      { href: "/command", label: "nav.command", icon: Command },
      { href: "/performance-blockers", label: "nav.performanceBlockers", icon: AlertTriangle },
      { href: "/daily-log", label: "nav.dailyLog", icon: CalendarCheck },
      { href: "/timeline", label: "nav.timeline", icon: Clock },
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
      { href: "/flashcards", label: "nav.flashcards", icon: Layers },
    ],
  },
  {
    labelKey: "nav.sectionPerformance",
    items: [
      { href: "/dashboard", label: "nav.dashboard", icon: LayoutDashboard },
      { href: "/errors", label: "nav.errors", icon: AlertTriangle },
      { href: "/elite-index", label: "nav.eliteIndex", icon: Trophy },
      { href: "/strategic-review", label: "nav.strategicReview", icon: CalendarCheck },
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
      { href: "/opportunities", label: "nav.opportunities", icon: Radar },
      { href: "/reputation", label: "nav.reputation", icon: Star },
      { href: "/network", label: "nav.network", icon: Users },
      { href: "/life-admin", label: "nav.lifeAdmin", icon: ClipboardList },
      { href: "/portfolio", label: "nav.portfolio", icon: Briefcase },
    ],
  },
];

export function navigationSectionForPath(pathname: string): TranslationKey | undefined {
  if (pathname === "/study-sessions") return "nav.sectionStudy";
  return navigationSections.find(({ items }) =>
    items.some(({ href }) => pathname === href || pathname.startsWith(href + "/")),
  )?.labelKey;
}
