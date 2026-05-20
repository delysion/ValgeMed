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
  variant = "no-data",
  tone,
  className,
}: EmptyStateProps) {
  const toneBg = {
    cyan: "text-cyan bg-cyan-bg border-cyan/15",
    violet: "text-violet bg-violet-bg border-violet/15",
    emerald: "text-emerald bg-emerald-bg border-emerald/15",
    gold: "text-gold bg-gold-bg border-gold/15",
    rose: "text-rose bg-rose-bg border-rose/15",
  };

  const effectiveAction = action ?? (actionLabel && href ? { label: actionLabel, href } : undefined);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-bg-subtle px-6 py-12 text-center",
        className
      )}
    >
      <div className="ping-dot">
        {tone ? (
          <div className={cn("mx-auto grid h-12 w-12 place-items-center rounded-2xl border", toneBg[tone])}>
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
        ) : (
          <Icon className="mx-auto h-12 w-12 text-text-muted-2" aria-hidden="true" />
        )}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-text-secondary">{description}</p>
      {effectiveAction ? (
        <Button asChild className="mt-5" size="sm">
          <Link href={effectiveAction.href}>{effectiveAction.label}</Link>
        </Button>
      ) : null}
    </div>
  );
}
