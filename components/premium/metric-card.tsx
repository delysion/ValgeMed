import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
  tone = "cyan",
  trend,
}: {
  title: string;
  value: string | number;
  detail?: string;
  icon?: LucideIcon;
  tone?: "cyan" | "violet" | "emerald" | "gold" | "rose" | "danger";
  trend?: string;
}) {
  const toneDot = {
    cyan: "bg-cyan",
    violet: "bg-violet",
    emerald: "bg-emerald",
    gold: "bg-gold",
    rose: "bg-rose",
    danger: "bg-danger",
  };
  const toneIcon = {
    cyan: "text-cyan",
    violet: "text-violet",
    emerald: "text-emerald",
    gold: "text-gold",
    rose: "text-rose",
    danger: "text-danger",
  };

  return (
    <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.04] sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted sm:text-[10px]">{title}</p>
        {Icon ? <Icon className={cn("h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:scale-105 sm:h-4 sm:w-4", toneIcon[tone])} /> : null}
      </div>
      <div className="mt-2 flex items-end gap-2">
        <p className="font-mono text-lg font-semibold text-white sm:text-xl">{value}</p>
        {trend ? (
          <span className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-medium text-muted sm:text-[10px]">{trend}</span>
        ) : null}
      </div>
      {detail ? (
        <div className="mt-1 flex items-center gap-1.5">
          <div className={cn("h-1 w-1 rounded-full", toneDot[tone])} />
          <p className="text-[11px] leading-5 text-muted sm:text-xs">{detail}</p>
        </div>
      ) : null}
    </div>
  );
}
