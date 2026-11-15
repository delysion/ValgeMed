import type React from "react";

import { cn } from "@/lib/utils";

const accentColors = {
  primary: "border-t-primary",
  neutral: "",
  default: "",
  cyan: "border-t-cyan/50",
  violet: "border-t-violet/50",
  gold: "border-t-gold/55",
  emerald: "border-t-emerald/50",
  rose: "border-t-rose/60",
  danger: "border-t-rose",
};

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
  const accent = accentColors[tone];

  return (
    <div
      className={cn(
        "min-w-0 rounded-panel border border-border bg-bg-surface shadow-panel",
        padded && "p-panel",
        accent && "border-t-2",
        accent,
        hover && "transition-colors duration-150 hover:border-x-border-strong hover:border-b-border-strong",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
