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
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="truncate text-xs font-medium text-text-primary sm:text-sm">{label}</span>
        <span className="shrink-0 font-mono text-[10px] text-text-secondary transition-colors group-hover:text-text-primary sm:text-xs">{safe.toFixed(0)}%</span>
      </div>
      <div className="relative h-1.5 overflow-hidden rounded-full bg-bg-subtle sm:h-2">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out", gradient[tone])}
          style={{ width: `${safe}%` }}
        />
      </div>
      {detail ? (
        <div className="mt-1 flex items-center gap-1.5">
          <div className={cn("h-0.5 w-0.5 rounded-full", dotColor[tone])} />
          <p className="text-[10px] text-text-secondary sm:text-[11px]">{detail}</p>
        </div>
      ) : null}
    </div>
  );
}
