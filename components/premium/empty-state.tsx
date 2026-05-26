import { PackageOpen } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; href: string };
  actionLabel?: string;
  href?: string;
  variant?: "no-data" | "no-results" | "first-time";
  tone?: "cyan" | "violet" | "emerald" | "gold" | "rose";
  className?: string;
}

export function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  action,
  actionLabel,
  href,
  tone,
  className,
}: EmptyStateProps) {
  const toneBg = {
    cyan: "text-cyan bg-gradient-to-br from-cyan-bg to-cyan/10 border-cyan/20",
    violet: "text-violet bg-gradient-to-br from-violet-bg to-violet/10 border-violet/20",
    emerald: "text-emerald bg-gradient-to-br from-emerald-bg to-emerald/10 border-emerald/20",
    gold: "text-gold bg-gradient-to-br from-gold-bg to-gold/10 border-gold/20",
    rose: "text-rose bg-gradient-to-br from-rose-bg to-rose/10 border-rose/20",
  };

  const effectiveAction = action ?? (actionLabel && href ? { label: actionLabel, href } : undefined);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-gradient-to-br from-bg-subtle/50 to-bg-subtle/20 px-6 py-14 text-center",
        className
      )}
    >
      <div className="ping-dot">
        {tone ? (
          <div className={cn("mx-auto grid h-14 w-14 place-items-center rounded-2xl border shadow-sm", toneBg[tone])}>
            <Icon className="h-7 w-7" aria-hidden="true" />
          </div>
        ) : (
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-border bg-gradient-to-br from-bg-surface to-bg-subtle/30 shadow-sm">
            <Icon className="h-7 w-7 text-text-muted-2" aria-hidden="true" />
          </div>
        )}
      </div>
      <h3 className="mt-5 text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-text-secondary">{description}</p>
      {effectiveAction ? (
        <Button asChild className="mt-6" size="sm">
          <Link href={effectiveAction.href}>{effectiveAction.label}</Link>
        </Button>
      ) : null}
    </div>
  );
}
