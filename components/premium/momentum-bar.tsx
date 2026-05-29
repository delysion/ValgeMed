import { cn } from "@/lib/utils";

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

export function MomentumBar({
  label,
  value,
  detail,
  tone = "cyan",
  compact = false,
}: {
  label: string;
  value: number;
  detail?: string;
  tone?: "cyan" | "violet" | "emerald" | "gold" | "rose" | "danger";
  compact?: boolean;
}) {
  const safe = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("group", compact ? "space-y-1" : "space-y-1.5")}>
      <div className={cn("flex items-center justify-between gap-2", compact ? "text-[10px]" : "text-xs")}>
        <span className="truncate font-medium text-text-primary">{label}</span>
        <span className="shrink-0 font-mono tabular-nums text-text-secondary transition-colors group-hover:text-text-primary">
          {safe.toFixed(0)}%
        </span>
      </div>
      <div className={cn("relative overflow-hidden rounded-full bg-bg-subtle", compact ? "h-1" : "h-1.5 sm:h-2")}>
        <div
          className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out", gradient[tone])}
          style={{ width: `${safe}%` }}
        />
      </div>
      {detail ? (
        <div className="flex items-center gap-1.5">
          <div className={cn("h-0.5 w-0.5 rounded-full", dotColor[tone])} />
          <p className={cn("text-text-secondary", compact ? "text-[10px]" : "text-[11px]")}>{detail}</p>
        </div>
      ) : null}
    </div>
  );
}