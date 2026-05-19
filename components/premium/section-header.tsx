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
    <div className={cn("flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="flex items-center gap-2.5">
        {Icon ? <Icon className="h-4 w-4 text-muted-2" /> : null}
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          {description ? <p className="mt-0.5 text-sm text-muted">{description}</p> : null}
        </div>
      </div>
      {action ? <div className="mt-2 sm:mt-0">{action}</div> : null}
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
    default: "text-muted-2 hover:text-white hover:bg-white/[0.05]",
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
