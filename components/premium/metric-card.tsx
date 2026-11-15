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

const iconTones = {
  cyan: "text-cyan",
  violet: "text-violet",
  emerald: "text-emerald",
  gold: "text-gold",
  rose: "text-rose",
  danger: "text-rose",
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
  const isNewTrend = trend === "up" || trend === "down" || trend === "stable";

  return (
    <div
      className={cn(
        "flex min-w-0 items-start gap-3 rounded-panel border border-border bg-bg-surface px-4 py-3.5 shadow-panel",
        className
      )}
      {...props}
    >
      {Icon ? (
        <div
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-control bg-bg-subtle",
            tone ? iconTones[tone] : "text-text-muted",
            iconClassName
          )}
        >
          <Icon aria-hidden="true" className="size-4" />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        {displayLabel ? (
          <p className="break-words text-ui-label font-medium text-text-secondary">
            {displayLabel}
          </p>
        ) : null}
        <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
          <p className="text-ui-metric font-semibold tracking-tight tabular-nums text-text-primary">{value}</p>
          {trend ? (
            isNewTrend ? (
              <span
                className={cn(
                  "flex items-center gap-0.5 text-ui-label font-medium",
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
              <span className="rounded-chip bg-bg-subtle px-1.5 py-0.5 text-ui-label font-medium text-text-secondary">
                {trend}
              </span>
            )
          ) : null}
        </div>
        {detail ? (
          <p className="mt-1 break-words text-ui-label leading-snug text-text-secondary">{detail}</p>
        ) : null}
      </div>
    </div>
  );
}