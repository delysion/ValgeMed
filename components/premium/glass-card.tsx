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
    default: "bg-white border-border",
    cyan: "bg-white border-cyan/20",
    violet: "bg-white border-violet/20",
    gold: "bg-white border-gold/20",
    rose: "bg-white border-rose/20",
    emerald: "bg-white border-emerald/20",
    danger: "bg-white border-rose/20",
  };

  const bgTones = {
    default: "",
    cyan: "bg-gradient-to-br from-cyan-bg/50 to-white",
    violet: "bg-gradient-to-br from-violet-bg/50 to-white",
    gold: "bg-gradient-to-br from-gold-bg/50 to-white",
    rose: "bg-gradient-to-br from-rose-bg/50 to-white",
    emerald: "bg-gradient-to-br from-emerald-bg/50 to-white",
    danger: "bg-gradient-to-br from-rose-bg/50 to-white",
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
