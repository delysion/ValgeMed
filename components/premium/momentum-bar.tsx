import { cn } from "@/lib/utils";

export function MomentumBar({
  label,
  value,
  detail,
  tone = "cyan",
}: {
  label: string;
  value: number;
  detail?: string;
  tone?: "cyan" | "violet" | "emerald" | "gold" | "rose" | "danger";
}) {
  const safe = Math.max(0, Math.min(100, value));
  const gradient = {
    cyan: "from-cyan to-ice",
    violet: "from-violet to-rose",
    emerald: "from-emerald to-cyan",
    gold: "from-gold to-rose",
    rose: "from-rose to-violet",
    danger: "from-danger to-warning",
  };
  const dotColor = {
    cyan: "bg-cyan",
    violet: "bg-violet",
    emerald: "bg-emerald",
    gold: "bg-gold",
    rose: "bg-rose",
    danger: "bg-danger",
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-white">{label}</span>
        <span className="font-mono text-xs text-muted">{safe.toFixed(0)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out", gradient[tone])}
          style={{ width: `${safe}%` }}
        />
      </div>
      {detail ? (
        <div className="mt-2 flex items-center gap-1.5">
          <div className={cn("h-1 w-1 rounded-full", dotColor[tone])} />
          <p className="text-[11px] text-muted-2">{detail}</p>
        </div>
      ) : null}
    </div>
  );
}
