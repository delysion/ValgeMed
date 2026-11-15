import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  label?: string;
  title?: string;
  value: string | number;
  detail?: string;
  iconClassName?: string;
  trend?: "up" | "down" | "stable" | string;
  trendValue?: string;
  tone?: "cyan" | "violet" | "emerald" | "gold" | "rose" | "danger";
}

const toneStyles = {
  cyan: {
    icon: "text-cyan bg-gradient-to-br from-cyan-bg to-cyan/10 border-cyan/15",
    glow: "shadow-[0_0_20px_rgba(8,117,144,0.08)]",
  },
  violet: {
    icon: "text-violet bg-gradient-to-br from-violet-bg to-violet/10 border-violet/15",
    glow: "shadow-[0_0_20px_rgba(92,32,200,0.08)]",
  },
  emerald: {
    icon: "text-emerald bg-gradient-to-br from-emerald-bg to-emerald/10 border-emerald/15",
    glow: "shadow-[0_0_20px_rgba(0,104,72,0.08)]",
  },
  gold: {
    icon: "text-gold bg-gradient-to-br from-gold-bg to-gold/10 border-gold/15",
    glow: "shadow-[0_0_20px_rgba(154,68,0,0.08)]",
  },
  rose: {
    icon: "text-rose bg-gradient-to-br from-rose-bg to-rose/10 border-rose/15",
    glow: "shadow-[0_0_20px_rgba(168,8,48,0.08)]",
  },
  danger: {
    icon: "text-rose bg-gradient-to-br from-rose-bg to-rose/10 border-rose/15",
    glow: "shadow-[0_0_20px_rgba(168,8,48,0.08)]",
  },
};

export function MetricCard({
  icon: Icon,
  label,
  title,
  value,
  detail,
  className,
  iconClassName,
  trend,
  trendValue,
  tone,
  ...props
}: MetricCardProps) {
  const displayLabel = label ?? title;
  const styles = tone ? toneStyles[tone] : null;
  const isNewTrend = trend === "up" || trend === "down" || trend === "stable";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border/60 bg-gradient-to-br from-bg-surface via-bg-surface to-bg-subtle/20 p-4 shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-[var(--shadow-elevated)]",
        styles?.glow,
        className
      )}
      {...props}
    >
      {Icon ? (
        <div
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-lg border bg-gradient-to-br from-cyan-bg to-cyan/10 border-cyan/15",
            styles?.icon ?? "bg-gradient-to-br from-primary-soft to-primary/10 border-primary/15",
            iconClassName
          )}
        >
          <Icon className={cn("h-4 w-4", styles?.icon.split(" ")[0] ?? "text-primary")} />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        {displayLabel ? (
          <p className="break-words text-xs font-semibold text-text-muted">
            {displayLabel}
          </p>
        ) : null}
        <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
          <p className="text-2xl font-bold tabular-nums text-text-primary">{value}</p>
          {trend ? (
            isNewTrend ? (
              <span
                className={cn(
                  "flex items-center gap-0.5 text-[10px] font-medium",
                  trend === "up" && "text-emerald",
                  trend === "down" && "text-rose",
                  trend === "stable" && "text-text-muted"
                )}
              >
                {trend === "up" && <TrendingUp className="h-2.5 w-2.5" />}
                {trend === "down" && <TrendingDown className="h-2.5 w-2.5" />}
                {trend === "stable" && <Minus className="h-2.5 w-2.5" />}
                {trendValue}
              </span>
            ) : (
              <span className="rounded bg-gradient-to-br from-bg-subtle to-border/30 px-1.5 py-0.5 text-[9px] font-semibold text-text-secondary truncate max-w-[100px]">
                {trend}
              </span>
            )
          ) : null}
        </div>
        {detail ? (
          <p className="mt-1 break-words text-sm leading-snug text-text-secondary">{detail}</p>
        ) : null}
      </div>
    </div>
  );
}