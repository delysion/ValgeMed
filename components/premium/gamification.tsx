import { Lock, ShieldAlert, Sparkle } from "lucide-react";

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
    <div className={cn("group rounded-lg border p-3 transition-all duration-300", unlocked ? "border-gold/15 bg-gold/[0.04] hover:bg-gold/[0.06]" : "border-white/[0.06] bg-white/[0.02]")}>
      <div className="flex items-center gap-2">
        <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-transform duration-300 group-hover:scale-105", unlocked ? "bg-gold/10 text-gold" : "bg-white/[0.04] text-muted-2")}>
          {unlocked ? <Sparkle className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
        </div>
        <p className={cn("text-sm font-semibold", unlocked ? "text-white" : "text-muted")}>{title}</p>
      </div>
      {detail ? <p className="mt-1.5 text-xs text-muted">{detail}</p> : null}
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
