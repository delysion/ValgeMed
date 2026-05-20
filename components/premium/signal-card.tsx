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
  const toneBorder = {
    cyan: "border-cyan/20 hover:border-cyan/30",
    violet: "border-violet/20 hover:border-violet/30",
    emerald: "border-emerald/20 hover:border-emerald/30",
    gold: "border-gold/20 hover:border-gold/30",
    rose: "border-rose/20 hover:border-rose/30",
    danger: "border-rose/20 hover:border-rose/30",
  };
  const toneIcon = {
    cyan: "bg-cyan-bg text-cyan",
    violet: "bg-violet-bg text-violet",
    emerald: "bg-emerald-bg text-emerald",
    gold: "bg-gold-bg text-gold",
    rose: "bg-rose-bg text-rose",
    danger: "bg-rose-bg text-rose",
  };
  const Tag = href ? "a" : "div";

  return (
    <Tag
      href={href}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-bg-surface to-bg-subtle/20 p-4 shadow-[var(--shadow-card)] transition-all duration-200 card-hover",
        toneBorder[tone],
      )}
    >
      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-secondary">{title}</p>
          {Icon ? (
            <div className={cn("rounded-md p-1.5 transition-all duration-200 group-hover:scale-110", toneIcon[tone])}>
              <Icon className="h-3.5 w-3.5" />
            </div>
          ) : null}
        </div>
        <p className="mt-2.5 font-mono text-xl font-semibold text-text-primary">{value}</p>
        {detail ? <p className="mt-1.5 text-xs leading-5 text-text-secondary">{detail}</p> : null}
        {accent ? (
          <div className="mt-2 flex items-center gap-1.5">
            <div className={cn("h-1 w-1 rounded-full", toneIcon[tone].split(" ")[1] === "text-cyan" ? "bg-cyan" : toneIcon[tone].split(" ")[1].replace("text-", "bg-"))} />
            <span className="text-[10px] font-medium text-text-muted">{accent}</span>
          </div>
        ) : null}
      </div>
    </Tag>
  );
}
