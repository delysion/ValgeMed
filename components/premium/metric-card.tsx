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

  const toneIcon = {
    cyan: "text-cyan bg-cyan-bg border-cyan/15",
    violet: "text-violet bg-violet-bg border-violet/15",
    emerald: "text-emerald bg-emerald-bg border-emerald/15",
    gold: "text-gold bg-gold-bg border-gold/15",
    rose: "text-rose bg-rose-bg border-rose/15",
    danger: "text-rose bg-rose-bg border-rose/15",
  };

  const isNewTrend = trend === "up" || trend === "down" || trend === "stable";

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border border-border/50 bg-bg-surface p-4 sm:flex-col sm:items-start sm:gap-2 sm:p-5 card-hover",
        className
      )}
      {...props}
    >
      {Icon ? (
        <div
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft",
            tone && toneIcon[tone],
            iconClassName
          )}
        >
          <Icon className={cn("h-5 w-5 text-primary", tone && toneIcon[tone]?.split(" ")[0])} />
        </div>
      ) : null}
      <div className="min-w-0 sm:mt-1">
        {displayLabel ? (
          <p className="text-xs font-medium text-text-muted uppercase tracking-[0.08em]">{displayLabel}</p>
        ) : null}
        <div className="flex items-baseline gap-1.5">
          <p className="text-xl font-bold tabular-nums text-text-primary sm:text-2xl">{value}</p>
          {trend ? (
            isNewTrend ? (
              <span
                className={cn(
                  "flex items-center gap-0.5 text-xs font-medium",
                  trend === "up" && "text-emerald",
                  trend === "down" && "text-danger",
                  trend === "stable" && "text-text-muted"
                )}
              >
                {trend === "up" && <TrendingUp className="h-3 w-3" />}
                {trend === "down" && <TrendingDown className="h-3 w-3" />}
                {trend === "stable" && <Minus className="h-3 w-3" />}
                {trendValue}
              </span>
            ) : (
              <span className="rounded-md bg-bg-subtle px-1.5 py-0.5 text-[10px] font-semibold text-text-secondary">
                {trend}
              </span>
            )
          ) : null}
        </div>
        {detail ? <p className="mt-1 text-xs leading-relaxed text-text-muted">{detail}</p> : null}
      </div>
    </div>
  );
}
