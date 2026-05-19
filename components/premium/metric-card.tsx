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
    danger: "bg-rose",
  };
  const toneIcon = {
    cyan: "text-cyan bg-cyan-bg",
    violet: "text-violet bg-violet-bg",
    emerald: "text-emerald bg-emerald-bg",
    gold: "text-gold bg-gold-bg",
    rose: "text-rose bg-rose-bg",
    danger: "text-rose bg-rose-bg",
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-white p-3.5 shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-md sm:p-4",
        "card-hover",
      )}
    >
      <div className="relative">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-text-secondary sm:text-[10px]">{title}</p>
          {Icon ? (
            <div className={cn("rounded-md p-1.5 transition-all duration-200 group-hover:scale-110", toneIcon[tone])}>
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          ) : null}
        </div>
        <div className="mt-2 flex items-end gap-2">
          <p className="font-mono text-lg font-semibold text-text-primary sm:text-xl">{value}</p>
          {trend ? (
            <span className="rounded bg-bg-subtle px-1.5 py-0.5 text-[9px] font-medium text-text-secondary sm:text-[10px]">{trend}</span>
          ) : null}
        </div>
        {detail ? (
          <div className="mt-1.5 flex items-center gap-1.5">
            <div className={cn("h-1 w-1 rounded-full", toneDot[tone])} />
            <p className="text-[11px] leading-5 text-text-secondary sm:text-xs">{detail}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
