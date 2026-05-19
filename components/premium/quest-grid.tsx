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
    cyan: "border-cyan/15",
    violet: "border-violet/15",
    emerald: "border-emerald/15",
    gold: "border-gold/15",
    rose: "border-rose/15",
  };
  const toneIcon = {
    cyan: "bg-cyan/10 text-cyan",
    violet: "bg-violet/10 text-violet",
    emerald: "bg-emerald/10 text-emerald",
    gold: "bg-gold/10 text-gold",
    rose: "bg-rose/10 text-rose",
  };

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 transition-all duration-300 hover:bg-white/[0.04]",
        complete ? "border-emerald/15 bg-emerald/[0.03]" : [toneBorder[tone]],
      )}
    >
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-transform duration-300 group-hover:scale-105",
          complete ? "border-emerald/15 bg-emerald/10 text-emerald" : [toneBorder[tone], toneIcon[tone]],
        )}
      >
        {complete ? <Check className="h-3.5 w-3.5" /> : <Sparkle className="h-3.5 w-3.5" />}
      </div>
      <div className="min-w-0">
        <p className={cn("text-sm font-medium", complete ? "text-emerald" : "text-white")}>{title}</p>
        <p className="mt-0.5 truncate text-xs text-muted">{detail}</p>
      </div>
    </div>
  );
}
