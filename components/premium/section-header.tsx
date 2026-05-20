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
    <div className={cn("flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="flex items-start gap-3 min-w-0">
        {Icon ? (
          <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        ) : null}
        <div className="min-w-0">
          <h3 className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">{title}</h3>
          {description ? <p className="mt-1 text-sm leading-relaxed text-text-secondary">{description}</p> : null}
        </div>
      </div>
      {action ? <div className="mt-1 sm:mt-0 shrink-0">{action}</div> : null}
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
    default: "text-text-muted hover:text-text-primary hover:bg-bg-subtle",
    cyan: "text-cyan hover:bg-cyan/10",
    violet: "text-violet hover:bg-violet/10",
    emerald: "text-emerald hover:bg-emerald/10",
    gold: "text-gold hover:bg-gold/10",
    rose: "text-rose hover:bg-rose/10",
  };

  return (
    <button
      onClick={onClick}
      className={cn("flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition", toneClass[tone])}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
