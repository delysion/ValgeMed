import { Flame, Lock, ShieldAlert, Sparkle, Target, TrendingUp, Trophy, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { TranslationKey } from "@/lib/i18n/dictionaries/en";
import { cn } from "@/lib/utils";

export type MasteryLevel =
  | "dormant"
  | "awakening"
  | "building"
  | "dangerous"
  | "examReady"
  | "mastered";

export function getMasteryLevel(input: { confidence: number; status?: string; openErrors?: number }): MasteryLevel {
  if (input.status === "exam_ready") return "examReady";
  if (input.status === "consolidated") return "mastered";
  if ((input.openErrors ?? 0) > 0 && input.confidence <= 4) return "dangerous";
  if (input.confidence <= 2) return "dormant";
  if (input.confidence <= 4) return "awakening";
  if (input.confidence <= 7) return "building";
  return "examReady";
}

export function masteryKey(level: MasteryLevel): TranslationKey {
  return `mastery.${level}` as TranslationKey;
}

export function MasteryBadge({ level, label }: { level: MasteryLevel; label: string }) {
  const variant = level === "dangerous" ? "danger" : level === "mastered" ? "success" : level === "examReady" ? "gold" : "violet";
  return <Badge variant={variant}>{label}</Badge>;
}

export function AchievementBadge({
  title,
  unlocked,
  detail,
}: {
  title: string;
  unlocked: boolean;
  detail?: string;
}) {
  return (
    <div className={cn(
      "group rounded-lg border p-3 transition-all duration-200 card-hover",
      unlocked ? "border-gold/20 bg-gold-bg" : "border-border bg-bg-surface dark:bg-bg-elevated",
    )}>
      <div className="flex items-center gap-2">
        <div className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-all duration-200 group-hover:scale-105",
          unlocked ? "bg-gold/20 text-gold" : "bg-bg-subtle text-text-muted",
        )}>
          {unlocked ? <Sparkle className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
        </div>
        <p className={cn("text-sm font-semibold", unlocked ? "text-text-primary" : "text-text-muted")}>{title}</p>
      </div>
      {detail ? <p className="mt-1.5 text-xs text-text-secondary">{detail}</p> : null}
    </div>
  );
}

export function RiskBadge({ value, labels }: { value: number; labels: { low: string; medium: string; high: string; critical: string } }) {
  const level = value >= 8 ? "critical" : value >= 6 ? "high" : value >= 3 ? "medium" : "low";
  const variant = level === "critical" || level === "high" ? "danger" : level === "medium" ? "warning" : "success";
  return (
    <Badge variant={variant}>
      <ShieldAlert className="mr-1 h-3 w-3" />
      {labels[level]}
    </Badge>
  );
}

/* ─── Level / XP System ─── */

export function computeLevel(eliteScore: number): { level: number; xp: number; xpToNext: number; levelLabel: string } {
  const raw = Math.max(0, eliteScore);
  const level = Math.min(100, Math.floor(raw) + 1);
  const xpPerLevel = 10;
  const xp = Math.round((raw % 1) * xpPerLevel);
  const xpToNext = xpPerLevel;

  const labels = [
    "Initiate", "Novice", "Apprentice", "Scholar", "Strategist",
    "Tactician", "Elite", "Master", "Grandmaster", "Legend",
  ];
  const tier = Math.min(9, Math.floor((level - 1) / 10));
  const levelLabel = labels[tier];

  return { level, xp, xpToNext, levelLabel };
}

export function LevelBadge({
  eliteScore,
  streak,
  className,
}: {
  eliteScore: number;
  streak: number;
  className?: string;
}) {
  const { level, xp, xpToNext, levelLabel } = computeLevel(eliteScore);
  const pct = Math.round((xp / xpToNext) * 100);

  return (
    <div className={cn("flex items-center gap-3 rounded-lg bg-bg-surface dark:bg-bg-elevated p-3 shadow-sm border border-border", className)}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet text-white text-sm font-bold shadow-sm">
        {level}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-text-primary">Lv.{level} {levelLabel}</p>
          {streak > 0 ? (
            <span className="flex items-center gap-0.5 text-[11px] font-medium text-gold">
              <Zap className="h-3 w-3" /> {streak}
            </span>
          ) : null}
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-bg-subtle">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-violet transition-all duration-500 progress-fill"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-0.5 text-[10px] text-text-muted">{xp}/{xpToNext} XP to next level</p>
      </div>
    </div>
  );
}

/* ─── Premium Gamification Cards ─── */

export function LevelCard({
  level,
  levelLabel,
  xp,
  xpToNext,
  streak,
  className,
}: {
  level: number;
  levelLabel: string;
  xp: number;
  xpToNext: number;
  streak: number;
  className?: string;
}) {
  const pct = Math.round((xp / xpToNext) * 100);
  return (
    <div className={cn("rounded-xl border border-border bg-bg-surface dark:bg-bg-elevated p-5 shadow-[var(--shadow-card)]", className)}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">Your Level</p>
      <div className="mt-3 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet text-white text-xl font-bold shadow-md">
          {level}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-text-primary">Level {level} — {levelLabel}</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg-subtle">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-violet progress-fill"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between">
            <p className="text-[11px] text-text-muted">{xp} / {xpToNext} XP</p>
            {streak > 0 ? (
              <span className="flex items-center gap-0.5 text-[11px] font-medium text-gold">
                <Flame className="h-3 w-3" /> {streak} day streak
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MomentumCard({
  score,
  label,
  subtitle,
  tone = "cyan",
  className,
}: {
  score: number;
  label: string;
  subtitle?: string;
  tone?: "cyan" | "violet" | "emerald" | "gold" | "rose";
  className?: string;
}) {
  const safe = Math.max(0, Math.min(10, score));
  const pct = (safe / 10) * 100;
  const colorMap = {
    cyan: "stroke-cyan",
    violet: "stroke-violet",
    emerald: "stroke-emerald",
    gold: "stroke-gold",
    rose: "stroke-rose",
  };
  const fillMap = {
    cyan: "text-cyan",
    violet: "text-violet",
    emerald: "text-emerald",
    gold: "text-gold",
    rose: "text-rose",
  };

  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const dash = (safe / 10) * circumference;

  return (
    <div className={cn("rounded-xl border border-border bg-bg-surface dark:bg-bg-elevated p-5 shadow-[var(--shadow-card)] card-hover", className)}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">{label}</p>
      <div className="mt-3 flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0">
          <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
            <circle cx="40" cy="40" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="6" />
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              className={cn("transition-all duration-1000 ease-out", colorMap[tone])}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference - dash}`}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <span className={cn("font-mono text-lg font-bold", fillMap[tone])}>{safe.toFixed(1)}</span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="h-2 overflow-hidden rounded-full bg-bg-subtle">
            <div
              className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out", {
                cyan: "from-cyan to-blue-400",
                violet: "from-violet to-purple-400",
                emerald: "from-emerald to-green-400",
                gold: "from-gold to-amber-400",
                rose: "from-rose to-pink-400",
              }[tone])}
              style={{ width: `${pct}%` }}
            />
          </div>
          {subtitle ? <p className="mt-1.5 text-xs text-text-secondary">{subtitle}</p> : null}
          <p className="mt-0.5 text-[11px] font-medium text-text-muted">{pct.toFixed(0)}%</p>
        </div>
      </div>
    </div>
  );
}

export function DailyStreakCard({
  streak,
  longestStreak,
  className,
}: {
  streak: number;
  longestStreak?: number;
  className?: string;
}) {
  const pct = longestStreak && longestStreak > 0 ? Math.round((streak / longestStreak) * 100) : streak > 0 ? 100 : 0;
  return (
    <div className={cn("rounded-xl border border-border bg-bg-surface dark:bg-bg-elevated p-5 shadow-[var(--shadow-card)] card-hover", className)}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">Daily Streak</p>
        {streak > 0 ? (
          <div className="flex items-center gap-1">
            <Flame className="h-4 w-4 text-gold" />
            <span className="font-mono text-lg font-bold text-gold">{streak}</span>
          </div>
        ) : (
          <Flame className="h-4 w-4 text-text-muted" />
        )}
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-bg-subtle">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold to-amber-400 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 text-[11px] text-text-secondary">
        {streak > 0 ? `${streak} day${streak > 1 ? "s" : ""} active` : "Start your streak today"}
        {longestStreak ? ` · Best: ${longestStreak}` : ""}
      </p>
    </div>
  );
}

export function SystemHealthCard({
  energy,
  sleep,
  stress,
  momentum,
  className,
}: {
  energy: number;
  sleep: number;
  stress: number;
  momentum: number;
  className?: string;
}) {
  const metrics = [
    { label: "Energy", value: energy, tone: energy >= 6 ? "emerald" : energy >= 4 ? "gold" : "rose" as const },
    { label: "Sleep", value: sleep, tone: sleep >= 7 ? "emerald" as const : sleep >= 5 ? "gold" as const : "rose" as const },
    { label: "Stress", value: 10 - stress, tone: stress <= 3 ? "emerald" as const : stress <= 6 ? "gold" as const : "rose" as const },
    { label: "Momentum", value: momentum, tone: momentum >= 6 ? "emerald" as const : momentum >= 4 ? "gold" as const : "rose" as const },
  ];

  return (
    <div className={cn("rounded-xl border border-border bg-bg-surface dark:bg-bg-elevated p-5 shadow-[var(--shadow-card)]", className)}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">System Health</p>
      <div className="mt-4 space-y-3">
        {metrics.map((m) => (
          <div key={m.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-text-secondary">{m.label}</span>
              <span className={cn("font-mono font-medium", {
                "text-emerald": m.tone === "emerald",
                "text-gold": m.tone === "gold",
                "text-rose": m.tone === "rose",
              })}>
                {m.value.toFixed(1)}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-bg-subtle">
              <div
                className={cn("h-full rounded-full transition-all duration-700", {
                  "bg-emerald": m.tone === "emerald",
                  "bg-gold": m.tone === "gold",
                  "bg-rose": m.tone === "rose",
                })}
                style={{ width: `${(m.value / 10) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MissionCard({
  title,
  detail,
  progress,
  completed,
  tone = "cyan",
  className,
}: {
  title: string;
  detail: string;
  progress: number;
  completed: boolean;
  tone?: "cyan" | "violet" | "emerald" | "gold" | "rose";
  className?: string;
}) {
  const toneBorder = {
    cyan: "border-cyan/20",
    violet: "border-violet/20",
    emerald: "border-emerald/20",
    gold: "border-gold/20",
    rose: "border-rose/20",
  };
  const pct = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn(
      "rounded-lg border p-3.5 transition-all duration-200 card-hover",
      completed ? "border-emerald/20 bg-emerald-bg" : "border-border bg-bg-surface dark:bg-bg-elevated",
      !completed && toneBorder[tone],
      className,
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-all",
          completed ? "bg-emerald/20 text-emerald" : "bg-bg-subtle text-text-muted",
        )}>
          {completed ? <Sparkle className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn("text-sm font-semibold", completed ? "text-emerald" : "text-text-primary")}>{title}</p>
          <p className="mt-0.5 text-xs text-text-secondary">{detail}</p>
          {!completed ? (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-subtle">
              <div
                className={cn("h-full rounded-full transition-all duration-700", {
                  "bg-cyan": tone === "cyan",
                  "bg-violet": tone === "violet",
                  "bg-emerald": tone === "emerald",
                  "bg-gold": tone === "gold",
                  "bg-rose": tone === "rose",
                })}
                style={{ width: `${pct}%` }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ─── Gamification Dashboard ─── */

interface BadgeItem {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  unlocked: boolean;
}

interface MissionItem {
  id: string;
  name: string;
  current: number;
  target: number;
}

interface GamificationDashboardProps {
  eliteIndex: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  badges: BadgeItem[];
  missions: MissionItem[];
}

export function GamificationDashboard({
  eliteIndex,
  level,
  xp,
  xpToNextLevel,
  streak,
  badges,
  missions,
}: GamificationDashboardProps) {
  const xpPct = Math.round((xp / xpToNextLevel) * 100);

  return (
    <div className="space-y-6">
      {/* Level + Streak + XP */}
      <div className="rounded-2xl border border-border bg-bg-surface dark:bg-bg-elevated p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-cyan text-white text-xl font-bold shadow-md">
            {level}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
              Level {level} · Elite Index {eliteIndex.toFixed(1)}
            </p>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-bg-subtle">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-cyan progress-fill"
                style={{ width: `${xpPct}%` }}
              />
            </div>
            <div className="mt-1 flex items-center justify-between">
              <p className="text-[11px] text-text-muted">{xp} / {xpToNextLevel} XP</p>
              {streak > 0 ? (
                <span className="flex items-center gap-0.5 text-[11px] font-medium text-gold">
                  <Flame className="h-3 w-3" /> {streak} day streak
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Badge Grid */}
      <div className="rounded-2xl border border-border bg-bg-surface dark:bg-bg-elevated p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-4 w-4 text-gold" />
          <p className="text-sm font-semibold text-text-primary">Badges</p>
          <span className="rounded-md bg-bg-subtle px-1.5 py-0.5 font-mono text-[11px] text-text-muted">
            {badges.filter((b) => b.unlocked).length}/{badges.length}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all",
                badge.unlocked
                  ? "border-gold/20 bg-gold-bg"
                  : "border-border opacity-30"
              )}
            >
              <div className={cn(
                "grid h-8 w-8 place-items-center rounded-lg",
                badge.unlocked ? "bg-gold/20 text-gold" : "bg-bg-subtle text-text-muted"
              )}>
                {badge.unlocked ? (
                  <badge.icon className="h-4 w-4" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
              </div>
              <p className="text-[11px] font-medium text-text-primary leading-tight">{badge.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Missions */}
      <div className="rounded-2xl border border-border bg-bg-surface dark:bg-bg-elevated p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-text-primary">Missions</p>
        </div>
        <div className="space-y-3">
          {missions.map((mission) => {
            const pct = Math.min(100, Math.round((mission.current / mission.target) * 100));
            const complete = mission.current >= mission.target;
            return (
              <div key={mission.id}>
                <div className="flex items-center justify-between mb-1">
                  <p className={cn("text-sm", complete ? "text-emerald font-medium" : "text-text-primary")}>
                    {mission.name}
                  </p>
                  <span className="font-mono text-[11px] text-text-muted">
                    {mission.current}/{mission.target}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-bg-subtle">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      complete ? "bg-emerald" : "bg-primary"
                    )}
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


