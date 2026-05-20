# ValgeMed — Studio-Level Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform ELISE OS into ValgeMed — a dark Nordic clinical cockpit with rebranded identity, collapsible navigation, gamification layer, research command module, improved forms, premium login, and full accessibility sweep.

**Architecture:** Next.js App Router with server components. CSS custom properties (design tokens) via Tailwind v4 `@theme inline`. shadcn/ui primitives + premium components. Cookie-based theme/language/nav persistence. Drizzle ORM with Neon Postgres. Vitest for tests. Recharts for charts.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui (radix), Drizzle ORM, Zod, date-fns, recharts, lucide-react, jose, bcryptjs, pnpm

---

## Phase 1: Rebrand + Identity

### Task 1.1: Update app title and metadata

**Files:**
- Modify: `app/layout.tsx:17-20`

- [ ] **Step 1: Update metadata**

Replace lines 17-20 in `app/layout.tsx`:

```tsx
export const metadata: Metadata = {
  title: "ValgeMed",
  description: "A quiet command system for serious medical students.",
};
```

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: exit 0, title tag shows "ValgeMed" in generated HTML

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: rebrand title and description to ValgeMed"
```

---

### Task 1.2: Update README heading and tagline

**Files:**
- Modify: `README.md:1`

- [ ] **Step 1: Update README**

Replace line 1 of `README.md`:

```markdown
# ValgeMed

A quiet command system for serious medical students.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: rebrand README to ValgeMed"
```

---

### Task 1.3: Rename theme cookie to valgemed_theme

**Files:**
- Modify: `lib/theme/config.ts`

- [ ] **Step 1: Update cookie name**

In `lib/theme/config.ts`, change:

```ts
const THEME_COOKIE = "valgemed_theme";
```

- [ ] **Step 2: Verify no other hardcoded references to old cookie name**

Run: `rg "elise_theme" lib/ components/ app/`
Expected: no results (all references should use the constant)

- [ ] **Step 3: Commit**

```bash
git add lib/theme/config.ts
git commit -m "feat: rename theme cookie to valgemed_theme"
```

---

### Task 1.4: Rename language cookie to valgemed_language

**Files:**
- Modify: `lib/i18n/config.ts`

- [ ] **Step 1: Update cookie name**

In `lib/i18n/config.ts`, change:

```ts
const LANGUAGE_COOKIE = "valgemed_language";
```

- [ ] **Step 2: Verify**

Run: `rg "elise_language" lib/ components/ app/`
Expected: no results

- [ ] **Step 3: Commit**

```bash
git add lib/i18n/config.ts
git commit -m "feat: rename language cookie to valgemed_language"
```

---

### Task 1.5: Update i18n dictionaries — brand name

**Files:**
- Modify: `lib/i18n/dictionaries/en.ts`
- Modify: `lib/i18n/dictionaries/et.ts`

- [ ] **Step 1: Update English dictionary**

In `lib/i18n/dictionaries/en.ts`, update all occurrences:
- `"ELISE OS"` → `"ValgeMed"`
- `"Enter ELISE OS"` → `"Enter ValgeMed"`
- `"Elise Elite Index"` → `"Elite Index"` (keep "Elise" only where it refers to the scoring engine)

- [ ] **Step 2: Update Estonian dictionary**

In `lib/i18n/dictionaries/et.ts`, update all occurrences:
- `"ELISE OS"` → `"ValgeMed"`
- `"Sisene ELISE OS-i"` → `"Sisene ValgeMedi"`

- [ ] **Step 3: Commit**

```bash
git add lib/i18n/dictionaries/en.ts lib/i18n/dictionaries/et.ts
git commit -m "feat: update i18n dictionaries with ValgeMed brand"
```

---

### Task 1.6: Update AppShell brand name and labels

**Files:**
- Modify: `components/app-shell.tsx:43-44`

- [ ] **Step 1: Update sidebar header text**

In `components/app-shell.tsx`, lines 43-44, update the app name references. The actual text comes from `t("app.privateConsole")` and `t("app.name")` — these keys need updating in the dictionaries.

In `lib/i18n/dictionaries/en.ts`:
```ts
app: {
  name: "ValgeMed",
  privateConsole: "Private Command",
  tagline: "A quiet command system for serious medical students.",
  owner: "Owner",
  exportJson: "Export JSON",
  logout: "Logout",
}
```

In `lib/i18n/dictionaries/et.ts`:
```ts
app: {
  name: "ValgeMed",
  privateConsole: "Privaatkäsklus",
  tagline: "Vaikne käsusüsteem tõsistele arstitudengitele.",
  owner: "Omanik",
  exportJson: "Ekspordi JSON",
  logout: "Logi välja",
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/i18n/dictionaries/en.ts lib/i18n/dictionaries/et.ts
git commit -m "feat: update app dictionary entries for ValgeMed branding"
```

---

## Phase 2: Design System Foundation

### Task 2.1: Add skeleton animation and toast keyframes to globals.css

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Add skeleton-shimmer keyframe**

After the existing `skeleton-pulse` keyframe (around line 278), add:

```css
@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

- [ ] **Step 2: Add toast animation keyframes**

Add after skeleton keyframes:

```css
@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-8px);
  }
}
```

- [ ] **Step 3: Add skeleton utility class**

After existing utility classes (around line 374):

```css
@utility skeleton-shimmer {
  background: linear-gradient(
    90deg,
    var(--bg-subtle) 25%,
    var(--bg-elevated) 50%,
    var(--bg-subtle) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 2s ease-in-out infinite;
}
```

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "feat: add skeleton-shimmer and toast animations to globals.css"
```

---

### Task 2.2: Create Skeleton component

**Files:**
- Create: `components/ui/skeleton.tsx`

- [ ] **Step 1: Write skeleton component**

```tsx
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
}

export function Skeleton({ className, variant = "rectangular", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "skeleton-shimmer rounded-md",
        variant === "circular" && "rounded-full",
        variant === "text" && "h-4 w-full rounded",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/skeleton.tsx
git commit -m "feat: add Skeleton component with text/circular/rectangular variants"
```

---

### Task 2.3: Polish Button component — focus and transitions

**Files:**
- Modify: `components/ui/button.tsx`

- [ ] **Step 1: Update button variant styles**

Read the current `components/ui/button.tsx`. Ensure all variant classes include `transition-all duration-150` and proper `focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page`.

If the file already has CVA variants, add to each `classNames`:

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 active:scale-[0.97]",
  // ...variants unchanged
);
```

Add `touch-action: manipulation` via className to prevent 300ms delay on mobile.

- [ ] **Step 2: Verify button renders correctly**

Run: `pnpm build`
Expected: exit 0

- [ ] **Step 3: Commit**

```bash
git add components/ui/button.tsx
git commit -m "feat: polish button focus states and transitions"
```

---

### Task 2.4: Standardize Badge sizing

**Files:**
- Modify: `components/ui/badge.tsx`

- [ ] **Step 1: Update badge CVA to standardize sizing**

Ensure all badge variants use `text-xs px-2 py-0.5 font-medium`. Remove any `text-[10px]` or custom padding in individual variants. Add `outline` variant:

```tsx
outline: "border border-border bg-transparent text-text-secondary hover:bg-bg-subtle",
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/badge.tsx
git commit -m "fix: standardize badge sizing, add outline variant"
```

---

### Task 2.5: Standardize Card padding

**Files:**
- Modify: `components/ui/card.tsx`

- [ ] **Step 1: Update Card subcomponents**

Ensure `CardContent` has default padding:

```tsx
function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 sm:p-6", className)} {...props} />;
}
```

Ensure `CardFooter` has `pt-0`:

```tsx
function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center p-5 sm:px-6 pt-0", className)} {...props} />;
}
```

Add `premium` variant to card wrapper:

```tsx
premium: "border-border/50 shadow-card",
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/card.tsx
git commit -m "fix: standardize card padding, add premium variant"
```

---

### Task 2.6: Polish Input — focus and autocomplete

**Files:**
- Modify: `components/ui/input.tsx`

- [ ] **Step 1: Update input styles**

Ensure input has:
- `focus-visible:ring-2 focus-visible:ring-primary/25`
- `placeholder:text-text-muted-2`
- `data-[invalid]:border-danger` for `aria-invalid` state
- Default rounded-lg

```tsx
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-lg border border-border bg-bg-surface px-3 py-2 text-sm text-text-primary shadow-inner file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-muted-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger",
        className
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/input.tsx
git commit -m "fix: polish input focus, placeholder, and error states"
```

---

## Phase 3: Navigation — Collapsible Sections

### Task 3.1: Refactor navigation with collapsible sections

**Files:**
- Modify: `components/navigation.tsx`
- Modify: `components/nav-link.tsx`

- [ ] **Step 1: Read current navigation files**

Read `components/navigation.tsx` and `components/nav-link.tsx` to understand current structure.

- [ ] **Step 2: Rewrite navigation with 5 collapsible sections**

Replace `components/navigation.tsx` content. The new structure uses `Collapsible` (from Radix or custom `details`/`summary` approach) with 5 sections:

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CommandIcon,
  LayoutDashboard,
  Trophy,
  CalendarCheck,
  BookOpen,
  GraduationCap,
  Lightbulb,
  Clock,
  Brain,
  AlertTriangle,
  FlaskConical,
  BookMarked,
  Beaker,
  FileText,
  Target,
  NotebookPen,
  User,
  MapPin,
  Timer,
  Heart,
  Languages,
  Radar,
  Star,
  Users,
  ClipboardList,
  Briefcase,
  Bot,
  Settings,
  ChevronDown,
} from "lucide-react";
import { NavLink } from "./nav-link";
import { useTranslation } from "@/lib/i18n/useTranslation";

const SECTIONS = [
  {
    id: "command",
    labelKey: "nav.sectionCommand",
    items: [
      { href: "/command", icon: CommandIcon, labelKey: "nav.command" },
      { href: "/dashboard", icon: LayoutDashboard, labelKey: "nav.dashboard" },
      { href: "/elite-index", icon: Trophy, labelKey: "nav.eliteIndex" },
      { href: "/strategic-review", icon: CalendarCheck, labelKey: "nav.strategicReview" },
    ],
  },
  {
    id: "study",
    labelKey: "nav.sectionStudy",
    items: [
      { href: "/subjects", icon: BookOpen, labelKey: "nav.subjects" },
      { href: "/exams", icon: GraduationCap, labelKey: "nav.exams" },
      { href: "/topics", icon: Lightbulb, labelKey: "nav.topics" },
      { href: "/study", icon: Clock, labelKey: "nav.study" },
      { href: "/reviews", icon: Brain, labelKey: "nav.reviews" },
      { href: "/errors", icon: AlertTriangle, labelKey: "nav.errors" },
    ],
  },
  {
    id: "research",
    labelKey: "nav.sectionResearch",
    items: [
      { href: "/research", icon: FlaskConical, labelKey: "nav.researchCommand" },
      { href: "/research/literature", icon: BookMarked, labelKey: "nav.literatureMap" },
      { href: "/research/hypotheses", icon: Beaker, labelKey: "nav.hypothesisEngine" },
      { href: "/research/manuscripts", icon: FileText, labelKey: "nav.manuscriptPipeline" },
    ],
  },
  {
    id: "life",
    labelKey: "nav.sectionLife",
    items: [
      { href: "/goals", icon: Target, labelKey: "nav.goals" },
      { href: "/memory", icon: NotebookPen, labelKey: "nav.memory" },
      { href: "/identity", icon: User, labelKey: "nav.identity" },
      { href: "/tartu", icon: MapPin, labelKey: "nav.tartu" },
      { href: "/time", icon: Timer, labelKey: "nav.time" },
      { href: "/health", icon: Heart, labelKey: "nav.health" },
      { href: "/language", icon: Languages, labelKey: "nav.language" },
    ],
  },
  {
    id: "strategy",
    labelKey: "nav.sectionStrategy",
    items: [
      { href: "/opportunities", icon: Radar, labelKey: "nav.opportunities" },
      { href: "/reputation", icon: Star, labelKey: "nav.reputation" },
      { href: "/network", icon: Users, labelKey: "nav.network" },
      { href: "/life-admin", icon: ClipboardList, labelKey: "nav.lifeAdmin" },
      { href: "/portfolio", icon: Briefcase, labelKey: "nav.portfolio" },
      { href: "/ai", icon: Bot, labelKey: "nav.ai" },
      { href: "/settings", icon: Settings, labelKey: "nav.settings" },
    ],
  },
];

const COOKIE_NAME = "valgemed_nav";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
}

export function Navigation() {
  const { t } = useTranslation();
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = getCookie(COOKIE_NAME);
    setOpenSection(saved || "command");
  }, []);

  const toggleSection = useCallback((sectionId: string) => {
    setOpenSection((prev) => {
      const next = prev === sectionId ? null : sectionId;
      if (next) setCookie(COOKIE_NAME, next);
      return next;
    });
  }, []);

  if (!mounted) {
    return (
      <nav className="flex flex-col gap-1" aria-label="Navigation">
        {SECTIONS.map((section) => (
          <div key={section.id}>
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
              {t(section.labelKey)}
            </div>
          </div>
        ))}
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-1" aria-label="Navigation">
      {SECTIONS.map((section) => (
        <div key={section.id}>
          <button
            type="button"
            onClick={() => toggleSection(section.id)}
            className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-text-muted hover:text-text-secondary transition-colors"
            aria-expanded={openSection === section.id}
          >
            {t(section.labelKey)}
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                openSection === section.id ? "rotate-180" : ""
              }`}
            />
          </button>
          {openSection === section.id && (
            <div className="flex flex-col gap-0.5 px-1.5 pb-1">
              {section.items.map((item) => (
                <NavLink key={item.href} href={item.href} icon={item.icon}>
                  {t(item.labelKey)}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
```

- [ ] **Step 3: Update NavLink component**

Ensure `components/nav-link.tsx` has active state with left accent bar:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function NavLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary-soft/50 text-primary border-l-[3px] border-l-primary pl-[9px]"
          : "border-l-[3px] border-l-transparent text-text-secondary hover:bg-bg-subtle hover:text-text-primary"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{children}</span>
    </Link>
  );
}
```

- [ ] **Step 4: Add navigation dictionary keys**

Add to `lib/i18n/dictionaries/en.ts`:
```ts
nav: {
  sectionCommand: "Command",
  sectionStudy: "Study",
  sectionResearch: "Research",
  sectionLife: "Life",
  sectionStrategy: "Strategy",
  command: "Command",
  dashboard: "Dashboard",
  eliteIndex: "Elite Index",
  strategicReview: "Strategic Review",
  subjects: "Subjects",
  exams: "Exams",
  topics: "Topics",
  study: "Study",
  reviews: "Reviews",
  errors: "Errors",
  researchCommand: "Research Command",
  literatureMap: "Literature Map",
  hypothesisEngine: "Hypothesis Engine",
  manuscriptPipeline: "Manuscript Pipeline",
  goals: "Goals",
  memory: "Memory",
  identity: "Identity",
  tartu: "Tartu",
  time: "Time",
  health: "Health",
  language: "Language",
  opportunities: "Opportunities",
  reputation: "Reputation",
  network: "Network",
  lifeAdmin: "Life Admin",
  portfolio: "Portfolio",
  ai: "AI",
  settings: "Settings",
},
```

Add corresponding Estonian keys in `lib/i18n/dictionaries/et.ts`.

- [ ] **Step 5: Verify build**

Run: `pnpm build`
Expected: exit 0

- [ ] **Step 6: Commit**

```bash
git add components/navigation.tsx components/nav-link.tsx lib/i18n/dictionaries/en.ts lib/i18n/dictionaries/et.ts
git commit -m "feat: collapsible 5-section navigation with cookie persistence"
```

---

### Task 3.2: Update AppShell — skip link and mobile hamburger

**Files:**
- Modify: `components/app-shell.tsx`

- [ ] **Step 1: Add skip link**

Add immediately after the opening `<div>` of the main layout:

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white focus:outline-none"
>
  Skip to main content
</a>
```

- [ ] **Step 2: Add id to main content area**

On the `<main>` tag, add `id="main-content"`:

```tsx
<main id="main-content" className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
  {children}
</main>
```

- [ ] **Step 3: Ensure mobile hamburger uses Menu icon**

Verify the mobile trigger in the header uses `<Menu>` icon (already present in current code). Ensure `aria-label="Open navigation"`.

- [ ] **Step 4: Commit**

```bash
git add components/app-shell.tsx
git commit -m "feat: add skip link and main-content anchor to AppShell"
```

---

## Phase 4: Premium Components

### Task 4.1: Update GlassCard — default padding and tone system

**Files:**
- Modify: `components/premium/glass-card.tsx`

- [ ] **Step 1: Read current file**

Read `components/premium/glass-card.tsx` to understand current API.

- [ ] **Step 2: Refactor with tone system**

Update to include `tone` prop and default padding:

```tsx
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: "primary" | "neutral";
}

export function GlassCard({ className, tone = "neutral", children, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-6 transition-all duration-250 card-hover",
        tone === "primary" && "border-l-[3px] border-l-primary",
        tone === "neutral" && "border-border/50",
        "bg-bg-surface/70 backdrop-blur-sm shadow-card",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/premium/glass-card.tsx
git commit -m "feat: add default padding and tone system to GlassCard"
```

---

### Task 4.2: Update MetricCard — mobile horizontal layout and trend

**Files:**
- Modify: `components/premium/metric-card.tsx`

- [ ] **Step 1: Read current file**

Read `components/premium/metric-card.tsx`.

- [ ] **Step 2: Refactor with mobile horizontal layout and trend prop**

```tsx
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  label: string;
  value: string | number;
  iconClassName?: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  className,
  iconClassName,
  trend,
  trendValue,
  ...props
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border border-border/50 bg-bg-surface p-4 sm:flex-col sm:items-start sm:gap-2 sm:p-5 card-hover",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft",
          iconClassName
        )}
      >
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="min-w-0 sm:mt-1">
        <p className="text-xs font-medium text-text-muted uppercase tracking-[0.08em]">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <p className="text-xl font-bold tabular-nums text-text-primary sm:text-2xl">{value}</p>
          {trend && (
            <span
              className={cn(
                "flex items-center gap-0.5 text-xs font-medium",
                trend === "up" && "text-emerald",
                trend === "down" && "text-danger",
                trend === "stable" && "text-text-muted"
              )}
            >
              {trend === "up" && <TrendingUp className="h-3 w-3" />}
              {trend === "down" && <TrendingDown className="h-3 w-3" />}
              {trend === "stable" && <Minus className="h-3 w-3" />}
              {trendValue}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/premium/metric-card.tsx
git commit -m "feat: mobile horizontal layout + trend prop for MetricCard"
```

---

### Task 4.3: Update EmptyState — pulse animation and variants

**Files:**
- Modify: `components/premium/empty-state.tsx`

- [ ] **Step 1: Read current file**

Read `components/premium/empty-state.tsx`.

- [ ] **Step 2: Refactor with pulse animation and variants**

```tsx
import { cn } from "@/lib/utils";
import { PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; href: string };
  variant?: "no-data" | "no-results" | "first-time";
}

export function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  action,
  variant = "no-data",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-bg-subtle px-6 py-12 text-center">
      <div className={cn("ping-dot")}>
        <Icon className="mx-auto h-12 w-12 text-text-muted-2" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-text-secondary">{description}</p>
      {action && (
        <Button asChild className="mt-5" size="sm">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/premium/empty-state.tsx
git commit -m "feat: pulse animation and action CTA for EmptyState"
```

---

### Task 4.4: Update LoadingState — skeleton wrapper

**Files:**
- Modify: `components/premium/loading-state.tsx`

- [ ] **Step 1: Read current file**

Read `components/premium/loading-state.tsx`.

- [ ] **Step 2: Refactor with Skeleton**

```tsx
import { Skeleton } from "@/components/ui/skeleton";
import type { ReactNode } from "react";

interface LoadingStateProps {
  skeleton?: ReactNode;
  message?: string;
}

export function LoadingState({ skeleton, message }: LoadingStateProps) {
  if (skeleton) return <>{skeleton}</>;

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-bg-subtle px-6 py-12 text-center">
      <div className="flex flex-col gap-3 w-full max-w-md">
        <Skeleton variant="circular" className="mx-auto size-12" />
        <Skeleton variant="text" className="mx-auto w-32" />
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-3/4" />
      </div>
      {message && <p className="mt-6 text-sm text-text-muted">{message}</p>}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/premium/loading-state.tsx
git commit -m "feat: skeleton-based LoadingState"
```

---

### Task 4.5: Polish SectionHeader typography

**Files:**
- Modify: `components/premium/section-header.tsx`

- [ ] **Step 1: Read current file**

Read `components/premium/section-header.tsx`.

- [ ] **Step 2: Update with standard typography**

Ensure heading uses `text-xl sm:text-2xl font-semibold tracking-tight`. Ensure icon uses `text-primary` (not `text-muted-2`).

- [ ] **Step 3: Commit**

```bash
git add components/premium/section-header.tsx
git commit -m "fix: standardize SectionHeader typography and icon visibility"
```

---

### Task 4.6: Update CommandGreeting — dark tone microcopy

**Files:**
- Modify: `components/premium/command-greeting.tsx`

- [ ] **Step 1: Read current file**

Read `components/premium/command-greeting.tsx`.

- [ ] **Step 2: Update with new tone**

Update greeting messages to use cold, precise tone:
- "Good morning. Here is your command." (instead of cheerful greeting)
- "Good evening. Review the day." (evening variant)

- [ ] **Step 3: Commit**

```bash
git add components/premium/command-greeting.tsx
git commit -m "feat: cold precise CommandGreeting microcopy"
```

---

### Task 4.7: Build Gamification component

**Files:**
- Modify: `components/premium/gamification.tsx`

- [ ] **Step 1: Read current file**

Read `components/premium/gamification.tsx` to understand current structure.

- [ ] **Step 2: Implement full gamification display**

```tsx
import { cn } from "@/lib/utils";
import {
  Flame,
  Trophy,
  Zap,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  unlocked: boolean;
}

interface Mission {
  id: string;
  name: string;
  current: number;
  target: number;
}

interface GamificationProps {
  eliteIndex: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  badges: Badge[];
  missions: Mission[];
}

export function Gamification({
  eliteIndex,
  level,
  xp,
  xpToNextLevel,
  streak,
  badges,
  missions,
}: GamificationProps) {
  const xpPercent = Math.min(Math.round((xp / xpToNextLevel) * 100), 100);

  return (
    <div className="flex flex-col gap-6">
      {/* Level + XP */}
      <div className="rounded-2xl border border-border/50 bg-bg-surface p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-muted">Level</p>
            <p className="text-3xl font-bold tabular-nums text-text-primary">{level}</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
            <Flame className="h-4 w-4 text-warning" />
            <span>{streak} day streak</span>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>{xp} / {xpToNextLevel} XP</span>
            <span>{xpPercent}%</span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-bg-subtle">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-cyan transition-all duration-700 progress-fill"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badges */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">Achievement Badges</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-colors",
                badge.unlocked
                  ? "border-primary-soft bg-primary-soft/30"
                  : "border-border bg-bg-subtle"
              )}
              title={badge.description}
            >
              <badge.icon
                className={cn(
                  "h-6 w-6",
                  badge.unlocked ? "text-primary" : "text-text-muted-2"
                )}
              />
              <span
                className={cn(
                  "text-[11px] font-medium leading-tight",
                  badge.unlocked ? "text-text-primary" : "text-text-muted"
                )}
              >
                {badge.name}
              </span>
              {!badge.unlocked && <Lock className="h-3 w-3 text-text-muted-2" />}
            </div>
          ))}
        </div>
      </div>

      {/* Missions */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">Active Missions</p>
        <div className="flex flex-col gap-2">
          {missions.map((mission) => {
            const pct = Math.min(Math.round((mission.current / mission.target) * 100), 100);
            return (
              <div key={mission.id} className="rounded-xl border border-border/50 bg-bg-surface p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-text-primary">{mission.name}</span>
                  <span className="text-xs tabular-nums text-text-muted">
                    {mission.current}/{mission.target}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-bg-subtle">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/premium/gamification.tsx
git commit -m "feat: full gamification display with level, XP, badges, missions"
```

---

### Task 4.8: Polish ScoreRing — dark mode glow

**Files:**
- Modify: `components/premium/score-ring.tsx`

- [ ] **Step 1: Read current file**

Read `components/premium/score-ring.tsx`.

- [ ] **Step 2: Update with progress-fill animation and dark mode glow**

Ensure the ring uses `progress-fill` animation class and `shadow-hero` for glow effect. Colors should use CSS variables for dark mode compatibility.

- [ ] **Step 3: Commit**

```bash
git add components/premium/score-ring.tsx
git commit -m "feat: progress-fill animation and dark mode glow for ScoreRing"
```

---

## Phase 5: Command + Dashboard + Research

### Task 5.1: Redesign Command page

**Files:**
- Modify: `app/command/page.tsx`

- [ ] **Step 1: Read current file**

Read `app/command/page.tsx` to understand current data fetching and structure.

- [ ] **Step 2: Refactor with reduced noise and gamification**

The page should:
- Import `Skeleton` from `@/components/ui/skeleton`
- Import `Gamification` from `@/components/premium/gamification`
- Show `<LoadingState skeleton={...} />` while data loads
- Group content with clear focal point: Next Best Action first, then supporting cards
- Show Elite Index Score Ring at top
- Show Level/XP/Streak via Gamification component
- Use cold precise microcopy for section labels

```tsx
// Skeleton for command page loading:
const CommandSkeleton = () => (
  <div className="flex flex-col gap-6">
    <div className="flex items-center gap-4">
      <Skeleton variant="circular" className="size-20" />
      <div className="flex flex-col gap-2">
        <Skeleton variant="text" className="w-48" />
        <Skeleton variant="text" className="w-32" />
      </div>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/50 bg-bg-surface p-5 flex flex-col gap-3">
          <Skeleton variant="text" className="w-24" />
          <Skeleton variant="text" className="w-full" />
          <Skeleton variant="text" className="w-3/4" />
        </div>
      ))}
    </div>
  </div>
);
```

The actual page layout should prioritize:
1. Greeting + ScoreRing (top, prominent)
2. Today's Command card (primary tone)
3. Next Best Action card (primary tone, most prominent)
4. Signal grid (3-col on desktop): Exam risk, Energy, Time leverage
5. Mission progress (from gamification data)
6. Strategic Rule of the Day

- [ ] **Step 3: Verify build**

Run: `pnpm build`
Expected: exit 0

- [ ] **Step 4: Commit**

```bash
git add app/command/page.tsx
git commit -m "feat: redesigned Command page with reduced noise, gamification, skeleton"
```

---

### Task 5.2: Redesign Dashboard page

**Files:**
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: Read current file**

Read `app/dashboard/page.tsx`.

- [ ] **Step 2: Refactor with gamification hero and mobile grid**

```tsx
// Dashboard skeleton:
const DashboardSkeleton = () => (
  <div className="flex flex-col gap-6">
    {/* Hero skeleton */}
    <div className="rounded-2xl border border-border/50 bg-bg-surface p-6 flex flex-col gap-4">
      <Skeleton variant="text" className="w-40" />
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" className="size-24" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton variant="text" className="w-32" />
          <Skeleton variant="text" className="w-full" />
          <Skeleton variant="text" className="w-48" />
        </div>
      </div>
    </div>
    {/* Metric cards skeleton */}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/50 bg-bg-surface p-5 flex flex-col gap-3">
          <Skeleton variant="circular" className="size-10" />
          <Skeleton variant="text" className="w-20" />
          <Skeleton variant="text" className="w-16" />
        </div>
      ))}
    </div>
    {/* Chart skeletons */}
    <div className="grid gap-6 lg:grid-cols-2">
      <Skeleton className="h-64 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  </div>
);
```

Dashboard sections:
1. Hero card: ScoreRing + Level/XP/Streak
2. "Today" metric row: Study minutes, Reviews due, Errors, Energy
3. Gamification row: Badges + Missions
4. Charts row: Weekly momentum + Active/Passive ratio
5. Weak Topics + Upcoming Exams

- [ ] **Step 3: Verify build**

Run: `pnpm build`
Expected: exit 0

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "feat: redesigned Dashboard with gamification hero and skeleton"
```

---

### Task 5.3: Create Research Command page

**Files:**
- Create: `app/research/page.tsx`
- Create: `app/research/layout.tsx`

- [ ] **Step 1: Create research layout**

`app/research/layout.tsx`:
```tsx
import { PageHeader } from "@/components/app-shell";

export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <PageHeader
        eyebrow="Research"
        title="Research Command"
        description="From scattered curiosity to publishable research."
      />
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Create Research Command page**

`app/research/page.tsx`:
```tsx
import { getI18n } from "@/lib/i18n/server";
import { GlassCard } from "@/components/premium/glass-card";
import { AlertTriangle, BookOpen, Beaker, FileText, Shield } from "lucide-react";
import Link from "next/link";

export default async function ResearchCommandPage() {
  const { t } = await getI18n();

  return (
    <div className="flex flex-col gap-6">
      {/* Priority alerts */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <GlassCard tone="primary">
          <h3 className="text-sm font-semibold text-text-primary">Highest-Return Move</h3>
          <p className="mt-2 text-sm text-text-secondary">
            [Dynamic: calculated from hypothesis scores and deadlines]
          </p>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h3 className="text-sm font-semibold text-text-primary">At Risk</h3>
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            [Dynamic: projects with stalled progress or approaching ethics deadlines]
          </p>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-text-primary">Ethics/GDPR</h3>
          </div>
          <p className="mt-2 text-xs text-text-muted">
            Research workflow support only. No diagnosis. No treatment advice. No clinical decision support.
          </p>
        </GlassCard>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/research/literature" className="group rounded-2xl border border-border/50 bg-bg-surface p-5 card-hover">
          <BookOpen className="h-6 w-6 text-primary" />
          <h3 className="mt-3 text-sm font-semibold text-text-primary">Literature Map</h3>
          <p className="mt-1 text-xs text-text-secondary">Gap inventory and paper assessment</p>
        </Link>
        <Link href="/research/hypotheses" className="group rounded-2xl border border-border/50 bg-bg-surface p-5 card-hover">
          <Beaker className="h-6 w-6 text-cyan" />
          <h3 className="mt-3 text-sm font-semibold text-text-primary">Hypothesis Engine</h3>
          <p className="mt-1 text-xs text-text-secondary">Score, rank, and refine research questions</p>
        </Link>
        <Link href="/research/manuscripts" className="group rounded-2xl border border-border/50 bg-bg-surface p-5 card-hover">
          <FileText className="h-6 w-6 text-violet" />
          <h3 className="mt-3 text-sm font-semibold text-text-primary">Manuscript Pipeline</h3>
          <p className="mt-1 text-xs text-text-secondary">Idea to publication tracking</p>
        </Link>
      </div>

      {/* Risk signals */}
      <GlassCard>
        <h3 className="text-sm font-semibold text-text-primary">Methodology Risks</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 text-xs text-text-secondary">
          <p>Selection bias: No flagged</p>
          <p>Confounding risk: No flagged</p>
          <p>Underpowered sample: No flagged</p>
          <p>Data leakage: No flagged</p>
        </div>
      </GlassCard>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/research/
git commit -m "feat: Research Command page with priority alerts and quick actions"
```

---

### Task 5.4: Create Literature Map page

**Files:**
- Create: `app/research/literature/page.tsx`

- [ ] **Step 1: Create Literature Map page**

`app/research/literature/page.tsx`:
```tsx
import { getI18n } from "@/lib/i18n/server";
import { GlassCard } from "@/components/premium/glass-card";
import { EmptyState } from "@/components/premium/empty-state";

export default async function LiteratureMapPage() {
  const { t } = await getI18n();

  return (
    <div className="flex flex-col gap-6">
      <GlassCard tone="primary">
        <h3 className="text-sm font-semibold text-text-primary">Research Area Map</h3>
        <p className="mt-2 text-sm text-text-secondary">
          Map what is known, unknown, controversial, and methodologically weak in your research area.
        </p>
      </GlassCard>

      <EmptyState
        icon={BookOpen}
        title="No gaps mapped yet"
        description="Start by identifying a research area and mapping what the literature says — and what it doesn't."
        variant="first-time"
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/research/literature/
git commit -m "feat: Literature Map page with gap inventory structure"
```

---

### Task 5.5: Create Hypothesis Engine page

**Files:**
- Create: `app/research/hypotheses/page.tsx`

- [ ] **Step 1: Create Hypothesis Engine page**

`app/research/hypotheses/page.tsx`:
```tsx
import { getI18n } from "@/lib/i18n/server";
import { GlassCard } from "@/components/premium/glass-card";
import { EmptyState } from "@/components/premium/empty-state";
import { Beaker } from "lucide-react";

export default async function HypothesisEnginePage() {
  const { t } = await getI18n();

  const scoringDimensions = [
    "Novelty",
    "Clinical relevance",
    "Feasibility",
    "Data availability",
    "Ethics complexity",
    "Supervisor fit",
    "Publication probability",
    "Time-to-output",
    "Strategic value",
  ];

  return (
    <div className="flex flex-col gap-6">
      <GlassCard>
        <h3 className="text-sm font-semibold text-text-primary">Research Question Scoring</h3>
        <p className="mt-2 text-sm text-text-secondary">
          Score each research question across 9 dimensions (0-10). Output: Kill / Park / Refine / Execute / Publish.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {scoringDimensions.map((dim) => (
            <div key={dim} className="rounded-lg border border-border/50 bg-bg-subtle px-3 py-2 text-xs text-text-secondary">
              {dim}
            </div>
          ))}
        </div>
      </GlassCard>

      <EmptyState
        icon={Beaker}
        title="No hypotheses scored yet"
        description="Create your first research question and score it against the 9 dimensions."
        variant="first-time"
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/research/hypotheses/
git commit -m "feat: Hypothesis Engine page with scoring dimensions"
```

---

### Task 5.6: Create Manuscript Pipeline page

**Files:**
- Create: `app/research/manuscripts/page.tsx`

- [ ] **Step 1: Create Manuscript Pipeline page**

`app/research/manuscripts/page.tsx`:
```tsx
import { getI18n } from "@/lib/i18n/server";
import { GlassCard } from "@/components/premium/glass-card";
import { EmptyState } from "@/components/premium/empty-state";
import { FileText } from "lucide-react";

const PIPELINE_STAGES = [
  "Idea",
  "Research Question",
  "Protocol",
  "Ethics",
  "Data Collection",
  "Analysis",
  "Draft",
  "Co-author Review",
  "Journal Selection",
  "Submission",
  "Revision",
  "Publication",
];

export default async function ManuscriptPipelinePage() {
  const { t } = await getI18n();

  return (
    <div className="flex flex-col gap-6">
      <GlassCard>
        <h3 className="text-sm font-semibold text-text-primary">Manuscript Pipeline</h3>
        <p className="mt-2 text-sm text-text-secondary">
          Track each manuscript through 12 stages from idea to publication.
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {PIPELINE_STAGES.map((stage, i) => (
            <div
              key={stage}
              className="rounded-full border border-border/50 bg-bg-subtle px-3 py-1 text-xs text-text-muted"
            >
              {i + 1}. {stage}
            </div>
          ))}
        </div>
      </GlassCard>

      <EmptyState
        icon={FileText}
        title="No manuscripts in pipeline"
        description="Start tracking your first manuscript from idea to publication."
        variant="first-time"
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/research/manuscripts/
git commit -m "feat: Manuscript Pipeline page with 12-stage tracking"
```

---

### Task 5.7: Extend DB schema with research tables

**Files:**
- Modify: `lib/db/schema.ts`

- [ ] **Step 1: Read current schema**

Read `lib/db/schema.ts` to understand existing table patterns.

- [ ] **Step 2: Add research tables**

Add after existing tables in `lib/db/schema.ts`:

```ts
// Research tables
export const researchAreas = pgTable("research_areas", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  whatIsKnown: text("what_is_known"),
  whatIsUnknown: text("what_is_unknown"),
  isControversial: text("is_controversial"),
  methodologicallyWeak: text("methodologically_weak"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const literatureGaps = pgTable("literature_gaps", {
  id: text("id").primaryKey(),
  researchAreaId: text("research_area_id").references(() => researchAreas.id),
  title: text("title").notNull(),
  description: text("description"),
  priority: integer("priority").default(0),
  publishableForStudent: boolean("publishable_for_student").default(false),
  status: text("status").default("identified"), // identified, validating, validated, executing
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const hypotheses = pgTable("hypotheses", {
  id: text("id").primaryKey(),
  question: text("question").notNull(),
  scores: jsonb("scores").$type<{
    novelty: number;
    clinicalRelevance: number;
    feasibility: number;
    dataAvailability: number;
    ethicsComplexity: number;
    supervisorFit: number;
    publicationProbability: number;
    timeToOutput: number;
    strategicValue: number;
  }>(),
  totalScore: integer("total_score"),
  output: text("output"), // kill, park, refine, execute, publish
  status: text("status").default("draft"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const manuscripts = pgTable("manuscripts", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  hypothesisId: text("hypothesis_id").references(() => hypotheses.id),
  stage: text("stage").notNull().default("idea"), // idea, rq, protocol, ethics, data_collection, analysis, draft, coauthor_review, journal_selection, submission, revision, publication
  journal: text("journal"),
  deadline: timestamp("deadline"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const methodologyRisks = pgTable("methodology_risks", {
  id: text("id").primaryKey(),
  manuscriptId: text("manuscript_id").references(() => manuscripts.id),
  hypothesisId: text("hypothesis_id").references(() => hypotheses.id),
  type: text("type").notNull(), // selection_bias, confounding, underpowered, wrong_endpoint, unclear_inclusion, weak_control, retrospective, data_leakage, p_hacking, ai_hallucination
  description: text("description"),
  severity: text("severity").default("medium"), // low, medium, high
  mitigated: boolean("mitigated").default(false),
  mitigationNotes: text("mitigation_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

- [ ] **Step 3: Generate migration**

Run: `pnpm drizzle-kit generate`
Expected: new migration files created in `drizzle/`

- [ ] **Step 4: Commit**

```bash
git add lib/db/schema.ts drizzle/
git commit -m "feat: add research tables (areas, gaps, hypotheses, manuscripts, risks)"
```

---

## Phase 6: Forms & Microcopy

### Task 6.1: Redesign Login page — premium dark atmosphere

**Files:**
- Modify: `app/login/page.tsx`
- Modify: `app/login/login-form.tsx`

- [ ] **Step 1: Read current login files**

Read `app/login/page.tsx` and `app/login/login-form.tsx`.

- [ ] **Step 2: Redesign login page with hero atmosphere**

`app/login/page.tsx` — add gradient background and glass form card:

```tsx
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-page p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-bg-page via-primary-soft/5 to-bg-page" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center motion-premium">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-violet shadow-hero">
            <Command className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">ValgeMed</h1>
          <p className="mt-1 text-sm text-text-secondary">
            A quiet command system for serious medical students.
          </p>
        </div>
        <div className="rounded-2xl border border-border/50 bg-bg-surface p-6 shadow-premium motion-stagger-1">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update login form with username field**

`app/login/login-form.tsx` — add username input before password:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LogIn, AlertCircle } from "lucide-react";
import { loginAction } from "@/lib/auth/actions";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    try {
      const result = await loginAction(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/command");
        router.refresh();
      }
    } catch {
      setError("Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          type="text"
          placeholder="Enter your username..."
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          aria-invalid={!!error}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password..."
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={!!error}
          required
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-danger-bg px-3 py-2 text-xs text-danger motion-fade-in">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button type="submit" className="mt-2 w-full" disabled={loading}>
        {loading ? (
          "Entering ValgeMed..."
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            Enter ValgeMed
          </>
        )}
      </Button>
    </form>
  );
}
```

- [ ] **Step 4: Add username validation to login action**

Read `lib/auth/actions.ts`. Add username check if `APP_USERNAME` env var is set:

```ts
const appUsername = process.env.APP_USERNAME;
if (appUsername && formData.get("username") !== appUsername) {
  return { error: "Invalid credentials." };
}
```

- [ ] **Step 5: Verify build**

Run: `pnpm build`
Expected: exit 0

- [ ] **Step 6: Commit**

```bash
git add app/login/ lib/auth/actions.ts
git commit -m "feat: premium dark login with username field and hero atmosphere"
```

---

### Task 6.2: Update form fields with labels, helpers, and errors

**Files:**
- Modify: `components/forms/fields.tsx`

- [ ] **Step 1: Read current file**

Read `components/forms/fields.tsx` to understand current field structure.

- [ ] **Step 2: Update FieldText, FieldTextarea, FieldSelect**

Add helper text support and aria-invalid for errors. Each field should have:
- `label` prop (required)
- `placeholder` prop with default ending in `...`
- `helper` prop (optional)
- `error` prop for inline error message
- `aria-invalid` when error is present

```tsx
// Pattern for each field:
<FieldComponent>
  <Label htmlFor={id}>{label}</Label>
  {helper && <p className="text-xs text-text-muted">{helper}</p>}
  <Input id={id} aria-invalid={!!error} placeholder={placeholder} {...props} />
  {error && <p className="text-xs text-danger">{error}</p>}
</FieldComponent>
```

- [ ] **Step 3: Add mobile full-width**

Ensure all fields are full-width on mobile by default.

- [ ] **Step 4: Commit**

```bash
git add components/forms/fields.tsx
git commit -m "feat: improved form fields with labels, helpers, errors, mobile"
```

---

### Task 6.3: Update entity forms with better microcopy

**Files:**
- Modify: `components/forms/entity-forms.tsx`

- [ ] **Step 1: Read current file**

Read `components/forms/entity-forms.tsx`.

- [ ] **Step 2: Add placeholders and helpers for each form**

For each entity form, add:
- Descriptive placeholders: `"e.g. Gross Anatomy..."`
- Helper text explaining field purpose
- Submit button with loading state text: `"Creating Subject..."` / `"Saving Changes..."`

- [ ] **Step 3: Commit**

```bash
git add components/forms/entity-forms.tsx
git commit -m "feat: improved entity forms with microcopy and loading states"
```

---

## Phase 7: Cleanup & Verification

### Task 7.1: Remove Italian strings

**Files:**
- Modify: `lib/scoring/engine.ts`
- Modify: `lib/actions/resources.ts`
- Modify: `lib/validators/schemas.ts`
- Modify: `lib/labels.ts`
- Modify: `scripts/hash-password.ts`

- [ ] **Step 1: Find all Italian strings**

Run: `rg -i "non\s+trovat|errore|creato|eliminato|aggiornato|successo|fallito|obbligatorio|non\s+valido|caricamento|salvataggio" lib/ scripts/`
Expected: list of files with Italian text

- [ ] **Step 2: Replace with English equivalents**

Replace each Italian string with English:
- `"Errore"` → `"Error"`
- `"Non trovato"` → `"Not found"`
- `"Creato con successo"` → `"Created successfully"`
- `"Eliminato"` → `"Deleted"`
- `"Aggiornato"` → `"Updated"`
- `"Obbligatorio"` → `"Required"`
- `"Non valido"` → `"Invalid"`
- etc.

- [ ] **Step 3: Verify**

Run: `rg -i "non\s+trovat|errore|creato|eliminato|aggiornato|successo|fallito|obbligatorio|non\s+valido" lib/ scripts/`
Expected: no results

- [ ] **Step 4: Commit**

```bash
git add lib/scoring/engine.ts lib/actions/resources.ts lib/validators/schemas.ts lib/labels.ts scripts/hash-password.ts
git commit -m "fix: remove all Italian strings, replace with English"
```

---

### Task 7.2: Mobile responsive sweep

**Files:**
- All pages under `app/`

- [ ] **Step 1: Test each page at 360px, 390px, 768px**

Run through each page in the browser dev tools at these widths. Check for:
- Horizontal overflow
- Text truncation
- Card layout
- Table → card-list conversion (add `hidden md:table-cell` / `md:hidden` patterns)
- Form field width
- Touch targets >= 44px

- [ ] **Step 2: Fix identified issues**

Add responsive classes where needed. Common patterns:
- Tables: add `hidden md:table-cell` to non-essential columns, show card layout on mobile
- MetricCard grid: ensure `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4`
- Hero: reduce padding on mobile, stack badges
- Forms: single-column on mobile

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "fix: mobile responsive sweep across all pages"
```

---

### Task 7.3: Accessibility sweep

**Files:**
- `components/app-shell.tsx`
- `components/navigation.tsx`
- `components/ui/button.tsx`
- `components/ui/input.tsx`
- All form components

- [ ] **Step 1: Audit with checklist**

Check every file for:
- [ ] Icon-only buttons have `aria-label`
- [ ] All inputs have associated `<label>`
- [ ] Focus-visible rings on all interactive elements
- [ ] No `outline-none` without `focus-visible:` replacement
- [ ] Semantic HTML (button for actions, a/Link for navigation)
- [ ] Skip link present and functional
- [ ] `aria-live="polite"` on toast/loading announcements
- [ ] `touch-action: manipulation` on buttons
- [ ] `overscroll-behavior: contain` on Sheet/Dialog

- [ ] **Step 2: Fix issues found**

Add missing `aria-label` attributes, fix focus styles, add semantic elements.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "fix: accessibility sweep — aria-labels, focus, semantic HTML"
```

---

### Task 7.4: Final verification

**Files:**
- All

- [ ] **Step 1: Run build**

Run: `pnpm build`
Expected: exit 0, no errors

- [ ] **Step 2: Run typecheck**

Run: `pnpm typecheck`
Expected: exit 0, no type errors

- [ ] **Step 3: Run lint**

Run: `pnpm lint`
Expected: 0 errors (warnings OK)

- [ ] **Step 4: Run tests**

Run: `pnpm test`
Expected: all tests pass

- [ ] **Step 5: Visual verification**

Check at 4 breakpoints (360, 768, 1024, 1440) in both dark (default) and light mode:
- [ ] Dark mode: atmospheric, readable, nordic
- [ ] Light mode: functional alternate theme
- [ ] Brand: "ValgeMed" visible in title, header, sidebar
- [ ] Navigation: 5 collapsible sections, cookie persists
- [ ] /command: clear focal point, gamification visible
- [ ] /dashboard: hero gamification, metric cards, charts
- [ ] /research: all 4 sub-pages render
- [ ] Forms: labels, placeholders, helpers, errors visible
- [ ] Empty states: pulse animation, CTA button
- [ ] Skeleton loading: visible on data-heavy pages
- [ ] Skip link: functional (Tab on load)
- [ ] No Italian strings

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: final verification — build, typecheck, lint, tests pass"
```
