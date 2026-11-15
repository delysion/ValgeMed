"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";
import { cn } from "@/lib/utils";

const colorByTone = {
  cyan: "var(--cyan)",
  violet: "var(--violet)",
  emerald: "var(--emerald)",
  gold: "var(--gold)",
  rose: "var(--rose)",
  danger: "var(--rose)",
};

const sizes = {
  xs: { ring: "size-14", value: "text-base", label: "max-w-20" },
  sm: { ring: "size-20", value: "text-xl", label: "max-w-24" },
  md: { ring: "size-24", value: "text-ui-metric", label: "max-w-32" },
  lg: { ring: "size-32", value: "text-3xl", label: "max-w-40" },
  xl: { ring: "size-40", value: "text-4xl", label: "max-w-48" },
};

const center = 50;
const radius = 42;

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
  const safe = Math.max(0, Math.min(10, score));
  const circumference = 2 * Math.PI * radius;
  const dash = (safe / 10) * circumference;
  const variant = sizes[size];
  const name = t("scoreRing.ariaLabel", { label, value: safe.toFixed(1) });

  return (
    <figure role="img" aria-label={caption ? name + ". " + caption : name} className="grid w-fit max-w-full shrink-0 justify-items-center gap-1.5 text-center">
      <div className={cn("relative grid place-items-center rounded-full bg-bg-surface", variant.ring)}>
        <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-90">
          <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--border-strong)" strokeWidth={3} />
          {safe > 0 && (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={colorByTone[tone]}
              strokeDasharray={dash + " " + (circumference - dash)}
              strokeLinecap="round"
              strokeWidth={glow ? 6 : 4}
              className={cn(animated && "motion-safe:transition-[stroke-dasharray] motion-safe:duration-200")}
            />
          )}
        </svg>
        <span className={cn("relative font-mono font-semibold tabular-nums leading-none text-text-primary", variant.value)}>
          {safe.toFixed(1)}
        </span>
      </div>
      <figcaption className={cn("grid gap-0.5 break-words text-ui-label", variant.label)}>
        <span className="font-medium text-text-primary">{label}</span>
        {caption && <span className="text-text-muted">{caption}</span>}
      </figcaption>
    </figure>
  );
}
