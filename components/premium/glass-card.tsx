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
        "relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br p-5 text-white shadow-[var(--shadow-glass)] backdrop-blur-2xl",
        "before:pointer-events-none before:absolute before:-inset-px before:rounded-[inherit] before:opacity-0 before:transition-opacity before:duration-300 before:[background:linear-gradient(135deg,rgba(248,250,252,0.08),transparent_50%,rgba(248,250,252,0.02))]",
        "after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-white/15 after:to-transparent",
        tones[tone],
        hover && "panel-lift glass-shine before:hover:opacity-100",
        className,
      )}
    >
      {children}
    </section>
  );
}
