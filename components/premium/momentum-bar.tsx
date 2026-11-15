import { cn } from "@/lib/utils";

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
      <div className="flex items-start justify-between gap-2 text-ui-label">
        <span className="min-w-0 break-words font-medium text-text-primary">{label}</span>
        <span className="shrink-0 font-mono tabular-nums text-text-secondary">
          {safe.toFixed(0)}%
        </span>
      </div>
      <div className={cn("relative overflow-hidden rounded-full bg-bg-subtle", compact ? "h-1" : "h-1.5 sm:h-2")}>
        <div
          className={cn("h-full rounded-full", dotColor[tone])}
          style={{ width: `${safe}%` }}
        />
      </div>
      {detail ? (
        <div className="flex items-center gap-1.5">
          <div className={cn("h-0.5 w-0.5 rounded-full", dotColor[tone])} />
          <p className="text-ui-label text-text-secondary">{detail}</p>
        </div>
      ) : null}
    </div>
  );
}