"use client";

import { useId } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { cn } from "@/lib/utils";

const colorByTone = {
  cyan: "var(--color-cyan)",
  violet: "var(--color-violet)",
  emerald: "var(--color-emerald)",
  gold: "var(--color-gold)",
  rose: "var(--color-rose)",
  danger: "var(--color-rose)",
};

const sizeClass = {
  xs: "h-14 w-14",
  sm: "h-24 w-24",
  md: "h-32 w-32",
  lg: "h-40 w-40",
  xl: "h-52 w-52",
};

const scoreTextSize = {
  xs: "text-[1rem]",
  sm: "text-[1.5rem]",
  md: "text-[2rem]",
  lg: "text-[2.2rem]",
  xl: "text-[2.8rem]",
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

const RADIUS = 42;
const CENTER = 50;
const STROKE_WIDTH = 4;
const GLOW_SIZE = 8;
const TEXT_MAX_WIDTH = "66%";

export function ScoreRing({
  score,
  label,
  caption,
  size = "lg",
  tone = "cyan",
  animated = false,
  glow = false,
}: {
  score: number;
  label: string;
  caption?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  tone?: "cyan" | "violet" | "emerald" | "gold" | "rose" | "danger";
  animated?: boolean;
  glow?: boolean;
}) {
  const { t } = useTranslation();
  const gradientId = useId();
  const safe = Math.max(0, Math.min(10, score));
  const circumference = 2 * Math.PI * RADIUS;
  const dash = (safe / 10) * circumference;

  return (
    <div
      className={cn(
        "relative grid place-items-center rounded-full border bg-gradient-to-br shadow-[var(--shadow-hero)]",
        sizeClass[size],
        borderTone[tone],
        bgTone[tone],
        glow && "shadow-[0_0_40px_rgba(120,152,248,0.25)]"
      )}
      role="img"
      aria-label={t("scoreRing.ariaLabel", { label, value: safe.toFixed(1) })}
    >
      {animated ? (
        <div
          className="absolute -inset-6 rounded-full blur-[40px] opacity-60"
          style={{ background: `radial-gradient(circle, ${colorByTone[tone]}30 0%, transparent 70%)` }}
        />
      ) : null}
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90" style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colorByTone[tone]} stopOpacity="0.8" />
            <stop offset="100%" stopColor={colorByTone[tone]} stopOpacity="1" />
          </linearGradient>
        </defs>
        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="var(--border-light)" strokeWidth={STROKE_WIDTH} opacity="0.5" />
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round"
          strokeWidth={STROKE_WIDTH}
          className={cn(animated && "progress-fill")}
          filter={`drop-shadow(0 0 ${GLOW_SIZE}px currentColor)`}
        />
      </svg>
      <div className="relative text-center" style={{ maxWidth: TEXT_MAX_WIDTH }}>
        <div className={cn("font-mono font-bold leading-none tabular-nums text-text-primary tracking-normal drop-shadow-sm", scoreTextSize[size])}>
          {safe.toFixed(1)}
        </div>
        <div className={cn("font-semibold uppercase tracking-[0.12em] text-text-secondary", size === "xs" ? "mt-0.5 text-[10px] tracking-normal" : "mt-1 text-xs tracking-normal")}>
          {label}
        </div>
        {caption ? (
          <div className={cn("leading-snug text-text-muted", size === "xs" ? "mt-0.5 text-[10px]" : "mt-1 text-xs")}>
            {caption}
          </div>
        ) : null}
      </div>
    </div>
  );
}
