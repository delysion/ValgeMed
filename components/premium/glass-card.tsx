import type React from "react";

import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: "primary" | "neutral" | "default" | "cyan" | "violet" | "gold" | "emerald" | "rose" | "danger";
  hover?: boolean;
  padded?: boolean;
}

export function GlassCard({
  className,
  children,
  tone = "neutral",
  hover = false,
  padded = true,
  ...props
}: GlassCardProps) {
  const accentColors = {
    primary: "border-l-primary border-l-[3px]",
    neutral: "border-l-border border-l-[3px]",
    default: "border-l-border border-l-[3px]",
    cyan: "border-l-cyan border-l-[3px]",
    violet: "border-l-violet border-l-[3px]",
    gold: "border-l-gold border-l-[3px]",
    emerald: "border-l-emerald border-l-[3px]",
    rose: "border-l-rose border-l-[3px]",
    danger: "border-l-rose border-l-[3px]",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 transition-all duration-200 card-hover",
        padded && "p-5 sm:p-6",
        tone === "primary" && "bg-gradient-to-br from-primary-soft/40 via-bg-surface to-bg-surface",
        tone === "neutral" && "bg-gradient-to-br from-bg-surface via-bg-surface to-bg-subtle/30",
        tone === "default" && "bg-gradient-to-br from-bg-surface to-bg-subtle/20",
        tone === "cyan" && "bg-gradient-to-br from-cyan-bg/40 via-bg-surface to-bg-surface",
        tone === "violet" && "bg-gradient-to-br from-violet-bg/40 via-bg-surface to-bg-surface",
        tone === "gold" && "bg-gradient-to-br from-gold-bg/40 via-bg-surface to-bg-surface",
        tone === "rose" && "bg-gradient-to-br from-rose-bg/40 via-bg-surface to-bg-surface",
        tone === "emerald" && "bg-gradient-to-br from-emerald-bg/40 via-bg-surface to-bg-surface",
        tone === "danger" && "bg-gradient-to-br from-rose-bg/40 via-bg-surface to-bg-surface",
        accentColors[tone],
        "shadow-[var(--shadow-card)]",
        hover && "hover:shadow-[var(--shadow-elevated)] hover:-translate-y-[2px]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
