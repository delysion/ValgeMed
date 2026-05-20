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
        "rounded-2xl border transition-all duration-250 card-hover",
        padded && "p-6",
        tone === "primary" && "border-l-[3px] border-l-primary",
        tone === "neutral" && "border-border/50",
        tone === "default" && "border-border",
        tone === "cyan" && "border-cyan/25",
        tone === "violet" && "border-violet/25",
        tone === "gold" && "border-gold/25",
        tone === "rose" && "border-rose/25",
        tone === "emerald" && "border-emerald/25",
        tone === "danger" && "border-rose/25",
        "bg-bg-surface/70 backdrop-blur-sm shadow-[var(--shadow-card)]",
        hover && "hover:shadow-elevated hover:-translate-y-px",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
