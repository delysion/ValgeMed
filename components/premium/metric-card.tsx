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
  const toneIcon = {
    cyan: "text-cyan bg-cyan-bg border-cyan/15",
    violet: "text-violet bg-violet-bg border-violet/15",
    emerald: "text-emerald bg-emerald-bg border-emerald/15",
    gold: "text-gold bg-gold-bg border-gold/15",
    rose: "text-rose bg-rose-bg border-rose/15",
    danger: "text-rose bg-rose-bg border-rose/15",
  };
  const toneBorder = {
    cyan: "border-cyan/20",
    violet: "border-violet/20",
    emerald: "border-emerald/20",
    gold: "border-gold/20",
    rose: "border-rose/20",
    danger: "border-rose/20",
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-bg-elevated p-4 shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-[2px] sm:p-5",
        toneBorder[tone],
      )}
    >
      <div className="flex items-center gap-3 sm:block">
        {Icon ? (
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-110 sm:mb-3 sm:h-9 sm:w-9", toneIcon[tone])}>
            <Icon className="h-5 w-5 sm:h-4 sm:w-4" />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-text-secondary">{title}</p>
          <div className="mt-0.5 flex items-baseline gap-2 sm:mt-1">
            <p className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl">{value}</p>
            {trend ? (
              <span className="rounded-md bg-bg-subtle px-1.5 py-0.5 text-[10px] font-semibold text-text-secondary">{trend}</span>
            ) : null}
          </div>
          {detail ? (
            <p className="mt-1 text-xs leading-relaxed text-text-muted">{detail}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
