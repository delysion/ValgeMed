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
    default: "from-white/[0.04] to-white/[0.015]",
    cyan: "from-cyan/6 to-white/[0.015]",
    violet: "from-violet/6 to-white/[0.015]",
    gold: "from-gold/6 to-white/[0.015]",
    rose: "from-rose/6 to-white/[0.015]",
    emerald: "from-emerald/6 to-white/[0.015]",
    danger: "from-danger/6 to-white/[0.015]",
  };

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-br p-5 text-white shadow-[var(--shadow-premium)] backdrop-blur-2xl",
        tones[tone],
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      {children}
    </section>
  );
}
