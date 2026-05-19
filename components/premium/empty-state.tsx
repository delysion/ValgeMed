import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  href,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  href?: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.035] p-8 text-center">
      {Icon ? (
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] text-cyan">
          <Icon className="h-5 w-5" />
        </div>
      ) : null}
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>
      {actionLabel && href ? (
        <Button asChild className="mt-5">
          <a href={href}>{actionLabel}</a>
        </Button>
      ) : null}
    </div>
  );
}
