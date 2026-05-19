import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function SignalCard({
  title,
  value,
  detail,
  icon: Icon,
  tone = "cyan",
  href,
  accent,
}: {
  title: string;
  value: string | number;
  detail?: string;
  icon?: LucideIcon;
  tone?: "cyan" | "violet" | "emerald" | "gold" | "rose" | "danger";
  href?: string;
  accent?: string;
}) {
  const toneGlow = {
    cyan: "shadow-[0_0_30px_rgba(121,231,255,0.08)]",
    violet: "shadow-[0_0_30px_rgba(199,166,255,0.08)]",
    emerald: "shadow-[0_0_30px_rgba(142,240,196,0.08)]",
    gold: "shadow-[0_0_30px_rgba(242,213,138,0.08)]",
    rose: "shadow-[0_0_30px_rgba(255,184,199,0.08)]",
    danger: "shadow-[0_0_30px_rgba(255,116,116,0.08)]",
  };
  const toneBorder = {
    cyan: "border-cyan/15 hover:border-cyan/30",
    violet: "border-violet/15 hover:border-violet/30",
    emerald: "border-emerald/15 hover:border-emerald/30",
    gold: "border-gold/15 hover:border-gold/30",
    rose: "border-rose/15 hover:border-rose/30",
    danger: "border-danger/15 hover:border-danger/30",
  };
  const toneIcon = {
    cyan: "bg-cyan/10 text-cyan",
    violet: "bg-violet/10 text-violet",
    emerald: "bg-emerald/10 text-emerald",
    gold: "bg-gold/10 text-gold",
    rose: "bg-rose/10 text-rose",
    danger: "bg-danger/10 text-danger",
  };
  const Tag = href ? "a" : "div";

  return (
    <Tag
      href={href}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.055]",
        toneBorder[tone],
        toneGlow[tone],
      )}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br from-white/5 to-transparent blur-xl transition-all duration-500 group-hover:from-white/10" />
      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{title}</p>
          {Icon ? (
            <div className={cn("rounded-xl p-1.5 transition-transform duration-300 group-hover:scale-110", toneIcon[tone])}>
              <Icon className="h-3.5 w-3.5" />
            </div>
          ) : null}
        </div>
        <p className="mt-3 font-mono text-2xl font-semibold text-white">{value}</p>
        {detail ? <p className="mt-1.5 text-xs leading-5 text-muted">{detail}</p> : null}
        {accent ? (
          <div className="mt-2.5 flex items-center gap-1.5">
            <div className={cn("h-1.5 w-1.5 rounded-full", toneIcon[tone].split(" ")[1].replace("text-", "bg-"))} />
            <span className="text-[11px] font-medium text-muted-2">{accent}</span>
          </div>
        ) : null}
      </div>
    </Tag>
  );
}
