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
    <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 backdrop-blur-xl transition hover:bg-white/[0.04]">
      {Icon ? (
        <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md", toneDot[tone], "text-white/80")}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <div className={cn("h-1 w-1 shrink-0 rounded-full", toneDot[tone])} />
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">{label}</p>
        </div>
        <p className="mt-0.5 truncate font-mono text-sm font-semibold text-white">{value}</p>
        {status ? <p className="mt-0.5 truncate text-[10px] text-muted-2">{status}</p> : null}
      </div>
    </div>
  );
}
