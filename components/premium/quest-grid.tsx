import { Check, Sparkle } from "lucide-react";

import { cn } from "@/lib/utils";

export function QuestItem({
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
  const toneBorder = {
    cyan: "border-cyan/20",
    violet: "border-violet/20",
    emerald: "border-emerald/20",
    gold: "border-gold/20",
    rose: "border-rose/20",
  };
  const toneIcon = {
    cyan: "bg-cyan-bg text-cyan",
    violet: "bg-violet-bg text-violet",
    emerald: "bg-emerald-bg text-emerald",
    gold: "bg-gold-bg text-gold",
    rose: "bg-rose-bg text-rose",
  };

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-lg border border-border bg-white p-3 shadow-sm transition-all duration-200 hover:shadow-md",
        complete ? "border-emerald/30 bg-emerald-bg" : toneBorder[tone],
      )}
    >
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-all duration-200 group-hover:scale-105",
          complete ? "border-emerald/30 bg-emerald-bg text-emerald" : [toneBorder[tone], toneIcon[tone]],
        )}
      >
        {complete ? <Check className="h-3.5 w-3.5" /> : <Sparkle className="h-3.5 w-3.5" />}
      </div>
      <div className="min-w-0">
        <p className={cn("text-sm font-medium", complete ? "text-emerald" : "text-text-primary")}>{title}</p>
        <p className="mt-0.5 truncate text-xs text-text-secondary">{detail}</p>
      </div>
    </div>
  );
}
