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
    <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.04]">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">{title}</p>
        {Icon ? <Icon className={cn("h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-105", toneIcon[tone])} /> : null}
      </div>
      <div className="mt-2.5 flex items-end gap-2">
        <p className="font-mono text-xl font-semibold text-white">{value}</p>
        {trend ? (
          <span className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-muted">{trend}</span>
        ) : null}
      </div>
      {detail ? (
        <div className="mt-1.5 flex items-center gap-1.5">
          <div className={cn("h-1 w-1 rounded-full", toneDot[tone])} />
          <p className="text-xs leading-5 text-muted">{detail}</p>
        </div>
      ) : null}
    </div>
  );
}
