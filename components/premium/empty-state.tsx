import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  href,
  tone = "cyan",
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  href?: string;
  tone?: "cyan" | "violet" | "emerald" | "gold" | "rose";
  className?: string;
}) {
  const toneBg = {
    cyan: "text-cyan bg-cyan-bg",
    violet: "text-violet bg-violet-bg",
    emerald: "text-emerald bg-emerald-bg",
    gold: "text-gold bg-gold-bg",
    rose: "text-rose bg-rose-bg",
  };

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-xl border border-dashed border-border bg-white p-10 text-center shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-md",
      className,
    )}>
      {Icon ? (
        <div className={cn("mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-border", toneBg[tone])}>
          <Icon className="h-6 w-6" />
        </div>
      ) : null}
      <h3 className="mt-5 text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-text-secondary">{description}</p>
      {actionLabel && href ? (
        <Button asChild className="mt-6">
          <a href={href}>{actionLabel}</a>
        </Button>
      ) : null}
    </div>
  );
}
