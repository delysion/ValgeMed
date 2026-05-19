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
  const toneIcon = {
    cyan: "text-cyan",
    violet: "text-violet",
    emerald: "text-emerald",
    gold: "text-gold",
    rose: "text-rose",
  };
  const toneBorder = {
    cyan: "border-cyan/10",
    violet: "border-violet/10",
    emerald: "border-emerald/10",
    gold: "border-gold/10",
    rose: "border-rose/10",
  };

  return (
    <div className={cn("rounded-2xl border border-dashed border-white/[0.06] bg-white/[0.02] p-8 text-center", toneBorder[tone], className)}>
      {Icon ? (
        <div className={cn("mx-auto grid h-12 w-12 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.03]", toneIcon[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      ) : null}
      <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">{description}</p>
      {actionLabel && href ? (
        <Button asChild className="mt-5">
          <a href={href}>{actionLabel}</a>
        </Button>
      ) : null}
    </div>
  );
}
