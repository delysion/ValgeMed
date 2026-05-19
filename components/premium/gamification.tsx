import { Lock, ShieldAlert, Sparkle, Zap } from "lucide-react";

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
      unlocked ? "border-gold/20 bg-gold-bg" : "border-border bg-white",
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

/* ─── Elise Gamification: Level / XP / Streak ─── */

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
    <div className={cn("flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm border border-border", className)}>
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
            className="h-full rounded-full bg-gradient-to-r from-primary to-violet transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-0.5 text-[10px] text-text-muted">{xp}/{xpToNext} XP to next level</p>
      </div>
    </div>
  );
}
