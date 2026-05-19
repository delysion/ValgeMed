import { Check, Lock, ShieldAlert, Sparkle } from "lucide-react";

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

export function QuestCard({
  title,
  detail,
  complete,
  tone = "cyan",
}: {
  title: string;
  detail: string;
  complete: boolean;
  tone?: "cyan" | "violet" | "emerald" | "gold" | "rose";
}) {
  const toneClass = {
    cyan: "border-cyan/20 bg-cyan/10 text-cyan",
    violet: "border-violet/20 bg-violet/10 text-violet",
    emerald: "border-emerald/20 bg-emerald/10 text-emerald",
    gold: "border-gold/20 bg-gold/10 text-gold",
    rose: "border-rose/20 bg-rose/10 text-rose",
  };

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-4 transition hover:bg-white/[0.065]">
      <div className={cn("rounded-2xl border p-2", complete ? "border-emerald/20 bg-emerald/10 text-emerald" : toneClass[tone])}>
        {complete ? <Check className="h-4 w-4" /> : <Sparkle className="h-4 w-4" />}
      </div>
      <div>
        <p className="font-medium text-white">{title}</p>
        <p className="mt-1 text-sm text-muted">{detail}</p>
      </div>
    </div>
  );
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
    <div className={cn("rounded-2xl border p-4", unlocked ? "border-gold/25 bg-gold/10" : "border-white/10 bg-white/[0.035]")}>
      <div className="flex items-center gap-2">
        {unlocked ? <Sparkle className="h-4 w-4 text-gold" /> : <Lock className="h-4 w-4 text-muted-2" />}
        <p className={cn("text-sm font-semibold", unlocked ? "text-white" : "text-muted")}>{title}</p>
      </div>
      {detail ? <p className="mt-2 text-xs text-muted">{detail}</p> : null}
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
