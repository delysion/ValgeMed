import type React from "react";

import { cn } from "@/lib/utils";

export function GlassCard({
  className,
  children,
  tone = "default",
  hover = false,
  padded = true,
}: {
  className?: string;
  children: React.ReactNode;
  tone?: "default" | "cyan" | "violet" | "gold" | "rose" | "emerald" | "danger";
  hover?: boolean;
  padded?: boolean;
}) {
  const tones = {
    default: "bg-bg-surface border-border",
    cyan: "bg-bg-surface border-cyan/25",
    violet: "bg-bg-surface border-violet/25",
    gold: "bg-bg-surface border-gold/25",
    rose: "bg-bg-surface border-rose/25",
    emerald: "bg-bg-surface border-emerald/25",
    danger: "bg-bg-surface border-rose/25",
  };

  const bgTones = {
    default: "",
    cyan: "bg-gradient-to-br from-cyan-bg/50 to-bg-surface",
    violet: "bg-gradient-to-br from-violet-bg/50 to-bg-surface",
    gold: "bg-gradient-to-br from-gold-bg/50 to-bg-surface",
    rose: "bg-gradient-to-br from-rose-bg/50 to-bg-surface",
    emerald: "bg-gradient-to-br from-emerald-bg/50 to-bg-surface",
    danger: "bg-gradient-to-br from-rose-bg/50 to-bg-surface",
  };

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border shadow-[var(--shadow-card)] transition-all duration-200",
        tones[tone],
        bgTones[tone],
        hover && "card-hover",
        padded && "p-5 sm:p-6",
        className,
      )}
    >
      {children}
    </section>
  );
}
