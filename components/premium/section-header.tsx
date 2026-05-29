import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function SectionHeader({
  title,
  description,
  icon: Icon,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2", className)}>
      <div className="flex items-center gap-2.5 min-w-0 max-w-full sm:gap-3">
        {Icon ? (
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-primary/15 bg-gradient-to-br from-primary-soft to-primary/8 text-primary shadow-sm shadow-primary/10 sm:h-9 sm:w-9 sm:rounded-xl">
            <Icon className="h-[16px] w-[16px] sm:h-[18px] sm:w-[18px]" />
          </div>
        ) : null}
        <div className="min-w-0 max-w-full">
          <h3 className="truncate text-base font-semibold tracking-tight text-text-primary sm:text-lg">{title}</h3>
          {description ? <p className="truncate text-xs leading-relaxed text-text-secondary sm:text-sm sm:mt-0.5">{description}</p> : null}
        </div>
      </div>
      {action ? <div className="mt-0.5 sm:mt-0 shrink-0">{action}</div> : null}
    </div>
  );
}

export function QuickAction({
  label,
  icon: Icon,
  onClick,
  tone = "default",
}: {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  tone?: "default" | "cyan" | "violet" | "emerald" | "gold" | "rose";
}) {
  const toneClass = {
    default: "text-text-muted hover:text-text-primary hover:bg-gradient-to-br hover:from-bg-subtle hover:to-border/20",
    cyan: "text-cyan hover:bg-gradient-to-br hover:from-cyan-bg hover:to-cyan/8",
    violet: "text-violet hover:bg-gradient-to-br hover:from-violet-bg hover:to-violet/8",
    emerald: "text-emerald hover:bg-gradient-to-br hover:from-emerald-bg hover:to-emerald/8",
    gold: "text-gold hover:bg-gradient-to-br hover:from-gold-bg hover:to-gold/8",
    rose: "text-rose hover:bg-gradient-to-br hover:from-rose-bg hover:to-rose/8",
  };

  return (
    <button
      onClick={onClick}
      className={cn("flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 hover:shadow-sm", toneClass[tone])}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
