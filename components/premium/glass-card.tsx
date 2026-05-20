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
  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-200 card-hover",
        padded && "p-5 sm:p-6",
        tone === "primary" && "border-l-[3px] border-l-primary bg-gradient-to-br from-primary-soft/40 via-bg-surface to-bg-surface",
        tone === "neutral" && "border-border/60 bg-gradient-to-br from-bg-surface via-bg-surface to-bg-subtle/30",
        tone === "default" && "border-border bg-gradient-to-br from-bg-surface to-bg-subtle/20",
        tone === "cyan" && "border-cyan/20 bg-gradient-to-br from-cyan-bg/40 via-bg-surface to-bg-surface",
        tone === "violet" && "border-violet/20 bg-gradient-to-br from-violet-bg/40 via-bg-surface to-bg-surface",
        tone === "gold" && "border-gold/20 bg-gradient-to-br from-gold-bg/40 via-bg-surface to-bg-surface",
        tone === "rose" && "border-rose/20 bg-gradient-to-br from-rose-bg/40 via-bg-surface to-bg-surface",
        tone === "emerald" && "border-emerald/20 bg-gradient-to-br from-emerald-bg/40 via-bg-surface to-bg-surface",
        tone === "danger" && "border-rose/20 bg-gradient-to-br from-rose-bg/40 via-bg-surface to-bg-surface",
        "shadow-[var(--shadow-card)] backdrop-blur-sm",
        hover && "hover:shadow-[var(--shadow-elevated)] hover:-translate-y-[2px]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
