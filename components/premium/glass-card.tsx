import type React from "react";

import { cn } from "@/lib/utils";

export function GlassCard({
  className,
  children,
  tone = "default",
  hover = false,
}: {
  className?: string;
  children: React.ReactNode;
  tone?: "default" | "cyan" | "violet" | "gold" | "rose" | "emerald" | "danger";
  hover?: boolean;
}) {
  const tones = {
    default: "bg-bg-surface border-border",
    cyan: "bg-bg-surface border-cyan/20",
    violet: "bg-bg-surface border-violet/20",
    gold: "bg-bg-surface border-gold/20",
    rose: "bg-bg-surface border-rose/20",
    emerald: "bg-bg-surface border-emerald/20",
    danger: "bg-bg-surface border-rose/20",
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
        "relative overflow-hidden rounded-xl shadow-[var(--shadow-card)]",
        tones[tone],
        bgTones[tone],
        hover && "card-hover",
        className,
      )}
    >
      {children}
    </section>
  );
}
