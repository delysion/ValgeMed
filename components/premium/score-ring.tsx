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
    cyan: "var(--frozen-blue)",
    violet: "var(--violet)",
    emerald: "var(--emerald)",
    gold: "var(--muted-amber)",
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
    cyan: "rgba(124, 175, 214, 0.15)",
    violet: "rgba(139, 156, 191, 0.15)",
    emerald: "rgba(74, 124, 111, 0.15)",
    gold: "rgba(201, 164, 92, 0.15)",
    rose: "rgba(168, 107, 125, 0.15)",
    danger: "rgba(139, 74, 90, 0.15)",
  };
  const ringBorder = {
    cyan: "border-cyan/10",
    violet: "border-violet/10",
    emerald: "border-emerald/10",
    gold: "border-gold/10",
    rose: "border-rose/10",
    danger: "border-danger/10",
  };

  return (
    <div
      className={cn(
        "relative grid place-items-center rounded-full border bg-white/[0.02] backdrop-blur-xl",
        sizeClass[size],
        ringBorder[tone],
      )}
      aria-label={`${label}: ${safe.toFixed(1)} out of 10`}
    >
      {animated ? (
        <div
          className="absolute -inset-4 rounded-full blur-2xl"
          style={{ background: `radial-gradient(circle, ${glowColor[tone]} 0%, transparent 70%)` }}
        />
      ) : null}
      <svg viewBox="0 0 120 120" className={cn("absolute inset-0 h-full w-full -rotate-90 p-2", animated ? "ring-glow" : "")}>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(248,250,252,0.05)" strokeWidth="8" />
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
            transition: "stroke-dasharray 1s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </svg>
      <div className="relative text-center">
        <div className={cn("font-mono font-semibold text-white", textSize[size])}>{safe.toFixed(1)}</div>
        <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</div>
        {caption ? <div className="mt-1.5 text-[11px] leading-snug text-muted-2">{caption}</div> : null}
      </div>
    </div>
  );
}
