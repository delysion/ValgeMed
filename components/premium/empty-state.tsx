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
    cyan: "text-cyan bg-cyan-bg border-cyan/15",
    violet: "text-violet bg-violet-bg border-violet/15",
    emerald: "text-emerald bg-emerald-bg border-emerald/15",
    gold: "text-gold bg-gold-bg border-gold/15",
    rose: "text-rose bg-rose-bg border-rose/15",
  };

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-2xl border border-dashed border-border bg-bg-elevated p-8 text-center shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-[var(--shadow-elevated)] sm:p-10",
      className,
    )}>
      {Icon ? (
        <div className={cn("mx-auto grid h-14 w-14 place-items-center rounded-2xl border transition-transform duration-300 group-hover:scale-105", toneBg[tone])}>
          <Icon className="h-6 w-6" />
        </div>
      ) : (
        <div className={cn("mx-auto grid h-14 w-14 place-items-center rounded-2xl border", toneBg[tone])}>
          <div className="h-6 w-6 rounded-full border-2 border-current border-dashed opacity-40" />
        </div>
      )}
      <h3 className="mt-5 text-lg font-bold tracking-tight text-text-primary">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-text-secondary">{description}</p>
      {actionLabel && href ? (
        <Button asChild className="mt-6 rounded-xl">
          <a href={href}>{actionLabel}</a>
        </Button>
      ) : null}
    </div>
  );
}
