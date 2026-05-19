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
  const toneGlow = {
    cyan: "shadow-[0_0_20px_rgba(121,231,255,0.06)]",
    violet: "shadow-[0_0_20px_rgba(199,166,255,0.06)]",
    emerald: "shadow-[0_0_20px_rgba(142,240,196,0.06)]",
    gold: "shadow-[0_0_20px_rgba(242,213,138,0.06)]",
    rose: "shadow-[0_0_20px_rgba(255,184,199,0.06)]",
  };

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3.5 transition-all duration-300 hover:bg-white/[0.05]",
        complete ? "border-emerald/20 bg-emerald/[0.04]" : [toneBorder[tone], toneGlow[tone]],
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-transform duration-300 group-hover:scale-110",
          complete ? "border-emerald/20 bg-emerald/10 text-emerald" : [toneBorder[tone], toneIcon[tone]],
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
