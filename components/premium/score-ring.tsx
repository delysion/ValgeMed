import { cn } from "@/lib/utils";

export function ScoreRing({
  score,
  label,
  caption,
  size = "lg",
  tone = "cyan",
  animated = false,
}: {
  score: number;
  label: string;
  caption?: string;
  size?: "sm" | "md" | "lg" | "xl";
  tone?: "cyan" | "violet" | "emerald" | "gold" | "rose" | "danger";
  animated?: boolean;
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
    sm: "h-24 w-24",
    md: "h-32 w-32",
    lg: "h-40 w-40",
    xl: "h-52 w-52",
  };
  const textSize = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-4xl",
    xl: "text-5xl",
  };
  const glowColor = {
    cyan: "rgba(121, 231, 255, 0.25)",
    violet: "rgba(199, 166, 255, 0.25)",
    emerald: "rgba(142, 240, 196, 0.25)",
    gold: "rgba(242, 213, 138, 0.25)",
    rose: "rgba(255, 184, 199, 0.25)",
    danger: "rgba(255, 116, 116, 0.25)",
  };

  return (
    <div className={cn("relative grid place-items-center", sizeClass[size])} aria-label={`${label}: ${safe.toFixed(1)} out of 10`}>
      {animated ? (
        <div
          className="absolute -inset-4 rounded-full blur-2xl"
          style={{ background: `radial-gradient(circle, ${glowColor[tone]} 0%, transparent 70%)` }}
        />
      ) : null}
      <svg viewBox="0 0 120 120" className={cn("absolute inset-0 h-full w-full -rotate-90", animated ? "ring-glow" : "")}>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={colorByTone[tone]}
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round"
          strokeWidth="8"
          className="motion-premium"
          style={{
            filter: animated ? `drop-shadow(0 0 8px ${colorByTone[tone]})` : undefined,
            transition: "stroke-dasharray 800ms ease-out",
          }}
        />
      </svg>
      <div className="relative text-center">
        <div className={cn("font-mono font-semibold text-white", textSize[size])}>{safe.toFixed(1)}</div>
        <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</div>
        {caption ? <div className="mt-1 text-[11px] leading-snug text-muted-2">{caption}</div> : null}
      </div>
    </div>
  );
}
