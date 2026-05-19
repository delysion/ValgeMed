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
    cyan: "shadow-[0_0_24px_rgba(124,175,214,0.06)]",
    violet: "shadow-[0_0_24px_rgba(139,156,191,0.06)]",
    emerald: "shadow-[0_0_24px_rgba(74,124,111,0.06)]",
    gold: "shadow-[0_0_24px_rgba(201,164,92,0.06)]",
    rose: "shadow-[0_0_24px_rgba(168,107,125,0.06)]",
    danger: "shadow-[0_0_24px_rgba(139,74,90,0.06)]",
  };
  const toneBorder = {
    cyan: "border-cyan/12 hover:border-cyan/20",
    violet: "border-violet/12 hover:border-violet/20",
    emerald: "border-emerald/12 hover:border-emerald/20",
    gold: "border-gold/12 hover:border-gold/20",
    rose: "border-rose/12 hover:border-rose/20",
    danger: "border-danger/12 hover:border-danger/20",
  };
  const toneIcon = {
    cyan: "bg-cyan/10 text-cyan group-hover:shadow-[0_0_12px_rgba(124,175,214,0.15)]",
    violet: "bg-violet/10 text-violet group-hover:shadow-[0_0_12px_rgba(139,156,191,0.15)]",
    emerald: "bg-emerald/10 text-emerald group-hover:shadow-[0_0_12px_rgba(74,124,111,0.15)]",
    gold: "bg-gold/10 text-gold group-hover:shadow-[0_0_12px_rgba(201,164,92,0.15)]",
    rose: "bg-rose/10 text-rose group-hover:shadow-[0_0_12px_rgba(168,107,125,0.15)]",
    danger: "bg-danger/10 text-danger group-hover:shadow-[0_0_12px_rgba(139,74,90,0.15)]",
  };
  const Tag = href ? "a" : "div";

  return (
    <Tag
      href={href}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.04]",
        "panel-lift",
        toneBorder[tone],
        toneGlow[tone],
      )}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-gradient-to-br from-white/[0.03] to-transparent blur-xl transition-all duration-500 group-hover:from-white/[0.06]" />
      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">{title}</p>
          {Icon ? (
            <div className={cn("rounded-md p-1.5 transition-all duration-300 group-hover:scale-110", toneIcon[tone])}>
              <Icon className="h-3.5 w-3.5" />
            </div>
          ) : null}
        </div>
        <p className="mt-2.5 font-mono text-xl font-semibold text-white">{value}</p>
        {detail ? <p className="mt-1.5 text-xs leading-5 text-muted">{detail}</p> : null}
        {accent ? (
          <div className="mt-2 flex items-center gap-1.5">
            <div className={cn("h-1 w-1 rounded-full", toneIcon[tone].split(" ")[1])} />
            <span className="text-[10px] font-medium text-muted-2">{accent}</span>
          </div>
        ) : null}
      </div>
    </Tag>
  );
}
