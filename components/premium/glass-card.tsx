import type React from "react";

import { cn } from "@/lib/utils";

export function GlassCard({
  className,
  children,
  tone = "default",
}: {
  className?: string;
  children: React.ReactNode;
  tone?: "default" | "cyan" | "violet" | "gold" | "rose" | "emerald" | "danger";
}) {
  const tones = {
    default: "from-white/[0.06] to-white/[0.02]",
    cyan: "from-cyan/8 to-white/[0.02]",
    violet: "from-violet/8 to-white/[0.02]",
    gold: "from-gold/8 to-white/[0.02]",
    rose: "from-rose/8 to-white/[0.02]",
    emerald: "from-emerald/8 to-white/[0.02]",
    danger: "from-danger/8 to-white/[0.02]",
  };

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br p-5 text-white shadow-[var(--shadow-premium)] backdrop-blur-2xl",
        tones[tone],
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      {children}
    </section>
  );
}
