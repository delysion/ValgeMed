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
    default: "from-white/[0.08] to-white/[0.025]",
    cyan: "from-cyan/15 to-white/[0.025]",
    violet: "from-violet/15 to-white/[0.025]",
    gold: "from-gold/15 to-white/[0.025]",
    rose: "from-rose/15 to-white/[0.025]",
    emerald: "from-emerald/15 to-white/[0.025]",
    danger: "from-danger/15 to-white/[0.025]",
  };

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br p-5 text-white shadow-[var(--shadow-premium)] backdrop-blur-2xl",
        tones[tone],
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
      {children}
    </section>
  );
}
