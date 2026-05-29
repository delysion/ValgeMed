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

  const isNewTrend = trend === "up" || trend === "down" || trend === "stable";

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border border-border/60 bg-gradient-to-br from-bg-surface via-bg-surface to-bg-subtle/20 p-2.5 shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-[var(--shadow-elevated)] sm:gap-2.5 sm:p-3 sm:rounded-2xl md:p-4",
        tone && toneStyles[tone]?.glow,
        className
      )}
      {...props}
    >
      {Icon ? (
        <div
          className={cn(
            "grid h-7 w-7 shrink-0 place-items-center rounded-md border sm:h-8 sm:w-8 sm:rounded-lg md:h-9 md:w-9 md:rounded-xl",
            tone ? toneStyles[tone]?.icon : "bg-gradient-to-br from-primary-soft to-primary/10 border-primary/15",
            iconClassName
          )}
        >
          <Icon className={cn("h-3 w-3 sm:h-4 sm:w-4", tone ? toneStyles[tone]?.icon.split(" ")[0] : "text-primary")} />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        {displayLabel ? (
          <p className="truncate text-[9px] font-medium uppercase tracking-[0.06em] text-text-muted sm:text-[10px]">{displayLabel}</p>
        ) : null}
        <div className="flex items-baseline gap-0.5 flex-wrap">
          <p className="text-base font-bold tabular-nums text-text-primary sm:text-lg md:text-xl">{value}</p>
          {trend ? (
            isNewTrend ? (
              <span
                className={cn(
                  "flex items-center gap-0.5 text-[9px] font-medium sm:text-[10px]",
                  trend === "up" && "text-emerald",
                  trend === "down" && "text-danger",
                  trend === "stable" && "text-text-muted"
                )}
              >
                {trend === "up" && <TrendingUp className="h-2 w-2 sm:h-2.5 sm:w-2.5" />}
                {trend === "down" && <TrendingDown className="h-2 w-2 sm:h-2.5 sm:w-2.5" />}
                {trend === "stable" && <Minus className="h-2 w-2 sm:h-2.5 sm:w-2.5" />}
                {trendValue}
              </span>
            ) : (
              <span className="rounded bg-gradient-to-br from-bg-subtle to-border/30 px-1 py-0.5 text-[8px] font-semibold text-text-secondary truncate max-w-[80px] sm:text-[10px] sm:max-w-[100px]">
                {trend}
              </span>
            )
          ) : null}
        </div>
        {detail ? <p className="mt-0 text-[9px] leading-relaxed text-text-muted line-clamp-1 sm:mt-0.5 sm:text-[10px] sm:line-clamp-2">{detail}</p> : null}
      </div>
    </div>
  );
}
