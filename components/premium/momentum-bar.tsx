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

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-white">{label}</span>
        <span className="font-mono text-muted">{safe.toFixed(0)}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
        <div className={cn("h-full rounded-full bg-gradient-to-r", gradient[tone])} style={{ width: `${safe}%` }} />
      </div>
      {detail ? <p className="mt-2 text-xs text-muted">{detail}</p> : null}
    </div>
  );
}
