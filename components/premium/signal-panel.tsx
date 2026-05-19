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
  const toneBg = {
    cyan: "bg-cyan text-white",
    violet: "bg-violet text-white",
    emerald: "bg-emerald text-white",
    gold: "bg-gold text-white",
    rose: "bg-rose text-white",
    danger: "bg-rose text-white",
  };
  const toneDot = {
    cyan: "bg-cyan",
    violet: "bg-violet",
    emerald: "bg-emerald",
    gold: "bg-gold",
    rose: "bg-rose",
    danger: "bg-rose",
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-white p-3 shadow-sm transition hover:shadow-md">
      {Icon ? (
        <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md", toneBg[tone])}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <div className={cn("h-1 w-1 shrink-0 rounded-full", toneDot[tone])} />
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.1em] text-text-secondary">{label}</p>
        </div>
        <p className="mt-0.5 truncate font-mono text-sm font-semibold text-text-primary">{value}</p>
        {status ? <p className="mt-0.5 truncate text-[10px] text-text-muted">{status}</p> : null}
      </div>
    </div>
  );
}
