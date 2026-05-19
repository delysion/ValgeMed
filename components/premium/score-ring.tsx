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
    cyan: "#06B6D4",
    violet: "#8B5CF6",
    emerald: "#10B981",
    gold: "#F59E0B",
    rose: "#F43F5E",
    danger: "#EF4444",
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
    cyan: "rgba(6, 182, 212, 0.12)",
    violet: "rgba(139, 92, 246, 0.12)",
    emerald: "rgba(16, 185, 129, 0.12)",
    gold: "rgba(245, 158, 11, 0.12)",
    rose: "rgba(244, 63, 94, 0.12)",
    danger: "rgba(239, 68, 68, 0.12)",
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
        "relative grid place-items-center rounded-full border bg-white shadow-sm",
        sizeClass[size],
        borderTone[tone],
      )}
      aria-label={`${label}: ${safe.toFixed(1)} out of 10`}
    >
      {animated ? (
        <div
          className="absolute -inset-4 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${glowColor[tone]} 0%, transparent 70%)` }}
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
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round"
          strokeWidth="8"
          className="motion-premium"
          style={{
            filter: animated ? `drop-shadow(0 0 6px ${colorByTone[tone]})` : undefined,
            transition: "stroke-dasharray 1s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
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
