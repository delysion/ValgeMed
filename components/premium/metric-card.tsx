import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
  const toneClass = {
    cyan: "text-cyan bg-cyan/10 border-cyan/20",
    violet: "text-violet bg-violet/10 border-violet/20",
    emerald: "text-emerald bg-emerald/10 border-emerald/20",
    gold: "text-gold bg-gold/10 border-gold/20",
    rose: "text-rose bg-rose/10 border-rose/20",
    danger: "text-danger bg-danger/10 border-danger/20",
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 shadow-[var(--ring-soft)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/[0.065]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{title}</p>
        {Icon ? (
          <div className={cn("rounded-2xl border p-2", toneClass[tone])}>
            <Icon className="h-4 w-4" />
          </div>
        ) : null}
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="font-mono text-3xl font-semibold text-white">{value}</p>
        {trend ? <Badge variant={tone === "danger" ? "danger" : "muted"}>{trend}</Badge> : null}
      </div>
      {detail ? <p className="mt-2 text-sm leading-6 text-muted">{detail}</p> : null}
    </div>
  );
}
