"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";
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
  const { t } = useTranslation();
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
    cyan: "border-cyan/25",
    violet: "border-violet/25",
    emerald: "border-emerald/25",
    gold: "border-gold/25",
    rose: "border-rose/25",
    danger: "border-rose/25",
  };
  const bgTone = {
    cyan: "from-cyan-bg/60 to-bg-surface",
    violet: "from-violet-bg/60 to-bg-surface",
    emerald: "from-emerald-bg/60 to-bg-surface",
    gold: "from-gold-bg/60 to-bg-surface",
    rose: "from-rose-bg/60 to-bg-surface",
    danger: "from-rose-bg/60 to-bg-surface",
  };

  return (
    <div
      className={cn(
        "relative grid place-items-center rounded-full border bg-gradient-to-br shadow-[var(--shadow-hero)]",
        sizeClass[size],
        borderTone[tone],
        bgTone[tone],
      )}
      aria-label={t("scoreRing.ariaLabel", { label, value: safe.toFixed(1) })}
    >
      {animated ? (
        <div
          className="absolute -inset-6 rounded-full blur-[40px] opacity-60"
          style={{ background: `radial-gradient(circle, ${colorByTone[tone]}30 0%, transparent 70%)` }}
        />
      ) : null}
      <svg viewBox="0 0 120 120" className={cn("absolute inset-0 h-full w-full -rotate-90 p-2")}>
        <defs>
          <linearGradient id={`ring-grad-${tone}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colorByTone[tone]} stopOpacity="0.8" />
            <stop offset="100%" stopColor={colorByTone[tone]} stopOpacity="1" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--border-light)" strokeWidth="8" opacity="0.5" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={`url(#ring-grad-${tone})`}
          strokeDasharray={animated ? `${dash} ${circumference - dash}` : `${circumference * 0.01} ${circumference * 0.99}`}
          strokeLinecap="round"
          strokeWidth="8"
          className={cn(animated && "progress-fill")}
          style={animated ? { strokeDasharray: `${dash} ${circumference - dash}` } : undefined}
          filter="drop-shadow(0 0 6px currentColor)"
        />
      </svg>
      <div className="relative text-center">
        <div className={cn("font-mono font-bold text-text-primary tracking-tight drop-shadow-sm", textSize[size])}>{safe.toFixed(1)}</div>
        <div className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-text-secondary">{label}</div>
        {caption ? <div className="mt-1.5 text-xs leading-snug text-text-muted">{caption}</div> : null}
      </div>
    </div>
  );
}
