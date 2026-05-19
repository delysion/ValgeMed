import { cn } from "@/lib/utils";

export function ScoreRing({
  score,
  label,
  caption,
  size = "lg",
  tone = "cyan",
}: {
  score: number;
  label: string;
  caption?: string;
  size?: "sm" | "md" | "lg";
  tone?: "cyan" | "violet" | "emerald" | "gold" | "rose" | "danger";
}) {
  const safe = Math.max(0, Math.min(10, score));
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const dash = (safe / 10) * circumference;
  const colorByTone = {
    cyan: "var(--cyan)",
    violet: "var(--violet)",
    emerald: "var(--emerald)",
    gold: "var(--gold)",
    rose: "var(--rose)",
    danger: "var(--danger)",
  };
  const sizeClass = {
    sm: "h-28 w-28",
    md: "h-36 w-36",
    lg: "h-48 w-48",
  };

  return (
    <div className={cn("relative grid place-items-center", sizeClass[size])} aria-label={`${label}: ${safe.toFixed(1)} out of 10`}>
      <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="9" />
        <circle
          className="motion-premium"
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={colorByTone[tone]}
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round"
          strokeWidth="9"
        />
      </svg>
      <div className="text-center">
        <div className="font-mono text-4xl font-semibold text-white">{safe.toFixed(1)}</div>
        <div className="mt-1 text-xs uppercase tracking-[0.14em] text-muted">{label}</div>
        {caption ? <div className="mt-1 text-xs text-muted-2">{caption}</div> : null}
      </div>
    </div>
  );
}
