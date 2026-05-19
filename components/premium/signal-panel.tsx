import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function SignalTile({
  label,
  value,
  icon: Icon,
  tone = "cyan",
  status,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: "cyan" | "violet" | "emerald" | "gold" | "rose" | "danger";
  status?: string;
}) {
  const toneDot = {
    cyan: "bg-cyan",
    violet: "bg-violet",
    emerald: "bg-emerald",
    gold: "bg-gold",
    rose: "bg-rose",
    danger: "bg-danger",
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl transition hover:bg-white/[0.05]">
      {Icon ? (
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", toneDot[tone], "text-black/70")}>
          <Icon className="h-4 w-4" />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <div className={cn("h-1.5 w-1.5 shrink-0 rounded-full", toneDot[tone])} />
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">{label}</p>
        </div>
        <p className="mt-0.5 truncate font-mono text-sm font-semibold text-white">{value}</p>
        {status ? <p className="mt-0.5 truncate text-[11px] text-muted-2">{status}</p> : null}
      </div>
    </div>
  );
}
