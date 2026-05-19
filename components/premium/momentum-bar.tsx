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
    cyan: "from-cyan to-blue-400",
    violet: "from-violet to-purple-400",
    emerald: "from-emerald to-green-400",
    gold: "from-gold to-amber-400",
    rose: "from-rose to-pink-400",
    danger: "from-rose to-red-400",
  };
  const dotColor = {
    cyan: "bg-cyan",
    violet: "bg-violet",
    emerald: "bg-emerald",
    gold: "bg-gold",
    rose: "bg-rose",
    danger: "bg-rose",
  };

  return (
    <div className="group">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-text-primary">{label}</span>
        <span className="font-mono text-xs text-text-secondary transition-colors group-hover:text-text-primary">{safe.toFixed(0)}%</span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-bg-subtle">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out", gradient[tone])}
          style={{ width: `${safe}%` }}
        />
      </div>
      {detail ? (
        <div className="mt-1.5 flex items-center gap-1.5">
          <div className={cn("h-1 w-1 rounded-full", dotColor[tone])} />
          <p className="text-[11px] text-text-secondary">{detail}</p>
        </div>
      ) : null}
    </div>
  );
}
