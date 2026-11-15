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
          <div className="grid size-8 shrink-0 place-items-center rounded-control bg-bg-subtle text-text-secondary">
            <Icon aria-hidden="true" className="size-4" />
          </div>
        ) : null}
        <div className="min-w-0 max-w-full">
          <h3 className="break-words text-base font-semibold tracking-tight text-text-primary sm:text-lg">{title}</h3>
          {description ? <p className="break-words text-ui-label leading-relaxed text-text-secondary sm:mt-0.5 sm:text-ui-body">{description}</p> : null}
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
    default: "text-text-muted hover:text-text-primary hover:bg-bg-subtle",
    cyan: "text-cyan hover:bg-cyan-bg",
    violet: "text-violet hover:bg-violet-bg",
    emerald: "text-emerald hover:bg-emerald-bg",
    gold: "text-gold hover:bg-gold-bg",
    rose: "text-rose hover:bg-rose-bg",
  };

  return (
    <button
      onClick={onClick}
      className={cn("flex items-center gap-2 rounded-control px-3 py-2 text-ui-body font-medium transition-colors duration-150", toneClass[tone])}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
