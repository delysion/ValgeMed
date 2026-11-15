import { Flame, Lock, ShieldAlert, Sparkle, Target, TrendingUp, Trophy, Zap, Languages, Brain, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TranslationKey } from "@/lib/i18n/dictionaries/en";
import { cn } from "@/lib/utils";
import { progressionLevel } from "@/lib/scoring/progression";

export type TFunction = (key: string, params?: Record<string, string | number>) => string;

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
      "group rounded-xl border p-3.5 transition-all duration-200 card-hover",
      unlocked ? "border-gold/25 bg-gradient-to-br from-gold-bg via-gold-bg to-gold/8 shadow-sm shadow-gold/10" : "border-border/60 bg-gradient-to-br from-bg-surface to-bg-subtle/20",
    )}>
      <div className="flex items-center gap-2.5">
        <div className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200 group-hover:scale-105",
          unlocked ? "bg-gradient-to-br from-gold/25 to-gold/10 text-gold shadow-sm shadow-gold/20" : "bg-bg-subtle text-text-muted",
        )}>
          {unlocked ? <Sparkle className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
        </div>
        <p className={cn("text-sm font-semibold", unlocked ? "text-text-primary" : "text-text-muted")}>{title}</p>
      </div>
      {detail ? <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">{detail}</p> : null}
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

const levelLabelKeys: TranslationKey[] = [
  "gamification.levelInitiate",
  "gamification.levelNovice",
  "gamification.levelApprentice",
  "gamification.levelScholar",
  "gamification.levelStrategist",
  "gamification.levelTactician",
  "gamification.levelElite",
  "gamification.levelMaster",
  "gamification.levelGrandmaster",
  "gamification.levelLegend",
];

export function computeLevel(totalXp: number): { level: number; xp: number; xpToNext: number; levelLabel: string; levelLabelKey: TranslationKey } {
  const { level, xp, xpToNext } = progressionLevel(totalXp);
  const labels = [
    "Initiate", "Novice", "Apprentice", "Scholar", "Strategist",
    "Tactician", "Elite", "Master", "Grandmaster", "Legend",
  ];
  const tier = Math.min(9, Math.floor((level - 1) / 10));
  const levelLabel = labels[tier];
  const levelLabelKey = levelLabelKeys[tier];

  return { level, xp, xpToNext, levelLabel, levelLabelKey };
}

export function LevelBadge({
  totalXp,
  streak,
  t,
  className,
}: {
  totalXp: number;
  streak: number;
  t: TFunction;
  className?: string;
}) {
  const { level, xp, xpToNext, levelLabelKey } = computeLevel(totalXp);
  const pct = Math.round((xp / xpToNext) * 100);

  return (
    <div className={cn("flex items-center gap-3 rounded-xl bg-gradient-to-br from-bg-surface via-bg-surface to-bg-subtle/30 p-3 shadow-sm border border-border/60", className)}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary-ring to-violet text-white text-sm font-bold shadow-md shadow-primary/25">
        {level}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-text-primary">{t("gamification.levelDisplay", { level, name: t(levelLabelKey) })}</p>
          {streak > 0 ? (
            <span className="flex items-center gap-0.5 text-xs font-medium text-gold">
              <Zap className="h-3 w-3" /> {streak}
            </span>
          ) : null}
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-bg-subtle">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary via-primary-ring to-violet transition-all duration-500 progress-fill"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-0.5 text-[11px] text-text-muted">{xp}/{xpToNext} {t("gamification.xpToNext")}</p>
      </div>
    </div>
  );
}

/* ─── Premium Gamification Cards ─── */

function getLevelLabelKey(label: string): TranslationKey {
  const map: Record<string, TranslationKey> = {
    "Initiate": "gamification.levelInitiate",
    "Novice": "gamification.levelNovice",
    "Apprentice": "gamification.levelApprentice",
    "Scholar": "gamification.levelScholar",
    "Strategist": "gamification.levelStrategist",
    "Tactician": "gamification.levelTactician",
    "Elite": "gamification.levelElite",
    "Master": "gamification.levelMaster",
    "Grandmaster": "gamification.levelGrandmaster",
    "Legend": "gamification.levelLegend",
  };
  return map[label] ?? "gamification.levelInitiate";
}

export function LevelCard({
  level,
  levelLabel,
  levelLabelKey,
  xp,
  xpToNext,
  streak,
  t,
  className,
}: {
  level: number;
  levelLabel: string;
  levelLabelKey?: TranslationKey;
  xp: number;
  xpToNext: number;
  streak: number;
  t: TFunction;
  className?: string;
}) {
  const labelKey = levelLabelKey ?? getLevelLabelKey(levelLabel);
  const pct = Math.round((xp / xpToNext) * 100);
  return (
    <div className={cn("rounded-xl border border-border/60 bg-gradient-to-br from-bg-surface via-bg-surface to-primary-soft/20 p-5 shadow-[var(--shadow-card)]", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">{t("gamification.yourLevel")}</p>
      <div className="mt-3 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary-ring to-violet text-white text-xl font-bold shadow-lg shadow-primary/30">
          {level}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-text-primary">{t("gamification.levelDisplay", { level, name: t(labelKey) })}</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg-subtle">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-primary-ring to-violet progress-fill"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <p className="text-xs text-text-muted">{xp} / {xpToNext} {t("gamification.xp")}</p>
            {streak > 0 ? (
              <span className="flex items-center gap-0.5 text-xs font-medium text-gold">
                <Flame className="h-3 w-3" /> {streak} {t("gamification.dayStreak")}
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
  const bgMap = {
    cyan: "from-cyan-bg/50 to-bg-surface",
    violet: "from-violet-bg/50 to-bg-surface",
    emerald: "from-emerald-bg/50 to-bg-surface",
    gold: "from-gold-bg/50 to-bg-surface",
    rose: "from-rose-bg/50 to-bg-surface",
  };

  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const dash = (safe / 10) * circumference;

  return (
    <div className={cn("rounded-xl border border-border bg-gradient-to-br p-5 shadow-[var(--shadow-card)] card-hover", bgMap[tone], className)}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">{label}</p>
      <div className="mt-3 flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0">
          <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
            <circle cx="40" cy="40" r={radius} fill="none" stroke="var(--border-light)" strokeWidth="6" opacity="0.5" />
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
  t,
  className,
}: {
  streak: number;
  longestStreak?: number;
  t: TFunction;
  className?: string;
}) {
  const pct = longestStreak && longestStreak > 0 ? Math.round((streak / longestStreak) * 100) : streak > 0 ? 100 : 0;
  return (
    <div className={cn("rounded-xl border border-border bg-gradient-to-br from-gold-bg/30 via-bg-surface to-bg-surface p-5 shadow-[var(--shadow-card)] card-hover", className)}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">{t("gamification.dailyStreak")}</p>
        {streak > 0 ? (
          <div className="flex items-center gap-1">
            <Flame className="h-4 w-4 text-gold drop-shadow-sm" />
            <span className="font-mono text-lg font-bold text-gold">{streak}</span>
          </div>
        ) : (
          <Flame className="h-4 w-4 text-text-muted" />
        )}
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-bg-subtle">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold via-amber-400 to-gold transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 text-[11px] text-text-secondary">
        {streak > 0 ? `${streak} ${t("gamification.daysActive")}` : t("gamification.startStreak")}
        {longestStreak ? ` · ${t("gamification.bestStreak", { streak: longestStreak })}` : ""}
      </p>
    </div>
  );
}

export function SystemHealthCard({
  energy,
  sleep,
  stress,
  momentum,
  t,
  className,
}: {
  energy: number;
  sleep: number;
  stress: number;
  momentum: number;
  t: TFunction;
  className?: string;
}) {
  const metrics = [
    { label: t("gamification.energy"), value: energy, tone: energy >= 6 ? "emerald" : energy >= 4 ? "gold" : "rose" as const },
    { label: t("gamification.sleep"), value: sleep, tone: sleep >= 7 ? "emerald" as const : sleep >= 5 ? "gold" as const : "rose" as const },
    { label: t("gamification.stress"), value: 10 - stress, tone: stress <= 3 ? "emerald" as const : stress <= 6 ? "gold" as const : "rose" as const },
    { label: t("gamification.momentum"), value: momentum, tone: momentum >= 6 ? "emerald" as const : momentum >= 4 ? "gold" as const : "rose" as const },
  ];

  return (
    <div className={cn("rounded-xl border border-border bg-gradient-to-br from-bg-surface via-bg-surface to-bg-subtle/20 p-5 shadow-[var(--shadow-card)]", className)}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">{t("gamification.systemHealth")}</p>
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
                  "bg-gradient-to-r from-emerald to-green-400": m.tone === "emerald",
                  "bg-gradient-to-r from-gold to-amber-400": m.tone === "gold",
                  "bg-gradient-to-r from-rose to-pink-400": m.tone === "rose",
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
      completed ? "border-emerald/25 bg-gradient-to-br from-emerald-bg to-emerald/8" : "border-border bg-gradient-to-br from-bg-surface to-bg-subtle/20",
      !completed && toneBorder[tone],
      className,
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-all",
          completed ? "bg-gradient-to-br from-emerald/25 to-emerald/10 text-emerald shadow-sm shadow-emerald/20" : "bg-bg-subtle text-text-muted",
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
                  "bg-gradient-to-r from-cyan to-blue-400": tone === "cyan",
                  "bg-gradient-to-r from-violet to-purple-400": tone === "violet",
                  "bg-gradient-to-r from-emerald to-green-400": tone === "emerald",
                  "bg-gradient-to-r from-gold to-amber-400": tone === "gold",
                  "bg-gradient-to-r from-rose to-pink-400": tone === "rose",
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
  icon: string;
  unlocked: boolean;
}

interface MissionItem {
  id: string;
  name: string;
  current: number;
  target: number;
}

interface GamificationDashboardProps {
  eliteIndex: number | null;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  badges: BadgeItem[];
  missions: MissionItem[];
  t: TFunction;
}

export function GamificationDashboard({
  eliteIndex,
  level,
  xp,
  xpToNextLevel,
  streak,
  badges,
  missions,
  t,
}: GamificationDashboardProps) {
  const xpPct = Math.round((xp / xpToNextLevel) * 100);

  return (
    <div className="space-y-6">
      {/* Level + Streak + XP */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary-soft/30 via-bg-surface to-bg-surface p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary-ring to-cyan text-white text-xl font-bold shadow-lg shadow-primary/30">
            {level}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
              {t("gamification.yourLevel")} {level}{eliteIndex !== null && <> · {t("elite.central")} {eliteIndex.toFixed(1)}</>}
            </p>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-bg-subtle">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary via-primary-ring to-cyan progress-fill"
                style={{ width: `${xpPct}%` }}
              />
            </div>
            <div className="mt-1 flex items-center justify-between">
              <p className="text-[11px] text-text-muted">{xp} / {xpToNextLevel} {t("gamification.xp")}</p>
              {streak > 0 ? (
                <span className="flex items-center gap-0.5 text-[11px] font-medium text-gold">
                  <Flame className="h-3 w-3" /> {streak} {t("gamification.dayStreak")}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Badge Grid */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-bg-surface via-bg-surface to-gold-bg/20 p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-4 w-4 text-gold drop-shadow-sm" />
          <p className="text-sm font-semibold text-text-primary">{t("gamification.badges")}</p>
          <span className="rounded-md bg-gradient-to-br from-bg-subtle to-border/30 px-1.5 py-0.5 font-mono text-[11px] text-text-muted">
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
                  ? "border-gold/25 bg-gradient-to-br from-gold-bg to-gold/8 shadow-sm shadow-gold/10"
                  : "border-border opacity-30"
              )}
            >
              <div className={cn(
                "grid h-8 w-8 place-items-center rounded-lg",
                badge.unlocked ? "bg-gradient-to-br from-gold/25 to-gold/10 text-gold shadow-sm" : "bg-bg-subtle text-text-muted"
              )}>
{badge.unlocked ? (
  badge.icon === "shield" ? (
    <ShieldAlert className="h-4 w-4" />
  ) : badge.icon === "language" ? (
    <Languages className="h-4 w-4" />
  ) : badge.icon === "brain" ? (
    <Brain className="h-4 w-4" />
  ) : badge.icon === "book" ? (
    <BookOpen className="h-4 w-4" />
  ) : badge.icon === "zap" ? (
    <Zap className="h-4 w-4" />
  ) : badge.icon === "flame" ? (
    <Flame className="h-4 w-4" />
  ) : (
    <ShieldAlert className="h-4 w-4" />
  )
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
      <div className="rounded-2xl border border-border bg-gradient-to-br from-bg-surface via-bg-surface to-primary-soft/15 p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-4 w-4 text-primary drop-shadow-sm" />
          <p className="text-sm font-semibold text-text-primary">{t("gamification.missions")}</p>
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
                      complete ? "bg-gradient-to-r from-emerald to-green-400" : "bg-gradient-to-r from-primary to-primary-ring"
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
