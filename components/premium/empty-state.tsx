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
    cyan: "text-cyan bg-cyan/[0.08]",
    violet: "text-violet bg-violet/[0.08]",
    emerald: "text-emerald bg-emerald/[0.08]",
    gold: "text-gold bg-gold/[0.08]",
    rose: "text-rose bg-rose/[0.08]",
  };

  return (
    <div className={cn("group relative overflow-hidden rounded-2xl border border-dashed border-white/[0.06] bg-white/[0.02] p-10 text-center backdrop-blur-xl transition-all duration-300 hover:border-white/[0.10] hover:bg-white/[0.03]", className)}>
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-white/[0.03] to-transparent blur-2xl transition-all duration-500 group-hover:from-white/[0.06]" />
      {Icon ? (
        <div className={cn("mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/[0.06]", toneIcon[tone])}>
          <Icon className="h-6 w-6" />
        </div>
      ) : null}
      <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">{description}</p>
      {actionLabel && href ? (
        <Button asChild className="mt-6">
          <a href={href}>{actionLabel}</a>
        </Button>
      ) : null}
    </div>
  );
}
