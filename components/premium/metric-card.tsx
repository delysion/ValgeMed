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
    cyan: "text-cyan bg-cyan/10",
    violet: "text-violet bg-violet/10",
    emerald: "text-emerald bg-emerald/10",
    gold: "text-gold bg-gold/10",
    rose: "text-rose bg-rose/10",
    danger: "text-danger bg-danger/10",
  };
  const toneBorder = {
    cyan: "hover:border-cyan/15",
    violet: "hover:border-violet/15",
    emerald: "hover:border-emerald/15",
    gold: "hover:border-gold/15",
    rose: "hover:border-rose/15",
    danger: "hover:border-danger/15",
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.04] sm:p-4",
        "panel-lift glass-shine",
        toneBorder[tone],
      )}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-14 w-14 rounded-full bg-gradient-to-br from-white/[0.03] to-transparent blur-xl transition-all duration-500 group-hover:from-white/[0.06]" />
      <div className="relative">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted sm:text-[10px]">{title}</p>
          {Icon ? (
            <div className={cn("rounded-md p-1.5 transition-all duration-300 group-hover:scale-110 group-hover:[filter:drop-shadow(0_0_4px_currentColor)]", toneIcon[tone])}>
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          ) : null}
        </div>
        <div className="mt-2 flex items-end gap-2">
          <p className="font-mono text-lg font-semibold text-white sm:text-xl">{value}</p>
          {trend ? (
            <span className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-medium text-muted transition-colors group-hover:bg-white/[0.06] sm:text-[10px]">{trend}</span>
          ) : null}
        </div>
        {detail ? (
          <div className="mt-1.5 flex items-center gap-1.5">
            <div className={cn("h-1 w-1 rounded-full", toneDot[tone])} />
            <p className="text-[11px] leading-5 text-muted sm:text-xs">{detail}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
