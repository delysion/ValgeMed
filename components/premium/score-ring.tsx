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
    cyan: "var(--color-cyan)",
    violet: "var(--color-violet)",
    emerald: "var(--color-emerald)",
    gold: "var(--color-gold)",
    rose: "var(--color-rose)",
    danger: "var(--color-rose)",
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
  const borderTone = {
    cyan: "border-cyan/20",
    violet: "border-violet/20",
    emerald: "border-emerald/20",
    gold: "border-gold/20",
    rose: "border-rose/20",
    danger: "border-rose/20",
  };

  return (
    <div
      className={cn(
        "relative grid place-items-center rounded-full border bg-bg-surface dark:bg-bg-elevated shadow-[var(--shadow-hero)]",
        sizeClass[size],
        borderTone[tone],
      )}
      aria-label={`${label}: ${safe.toFixed(1)} out of 10`}
    >
      {animated ? (
        <div
          className="absolute -inset-4 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${colorByTone[tone]}20 0%, transparent 70%)` }}
        />
      ) : null}
      <svg viewBox="0 0 120 120" className={cn("absolute inset-0 h-full w-full -rotate-90 p-2")}>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="8" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={colorByTone[tone]}
          strokeDasharray={animated ? `${dash} ${circumference - dash}` : `${circumference * 0.01} ${circumference * 0.99}`}
          strokeLinecap="round"
          strokeWidth="8"
          className={cn(animated && "progress-fill")}
          style={animated ? { strokeDasharray: `${dash} ${circumference - dash}` } : undefined}
        />
      </svg>
      <div className="relative text-center">
        <div className={cn("font-mono font-semibold text-text-primary", textSize[size])}>{safe.toFixed(1)}</div>
        <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-secondary">{label}</div>
        {caption ? <div className="mt-1.5 text-[11px] leading-snug text-text-muted">{caption}</div> : null}
      </div>
    </div>
  );
}
