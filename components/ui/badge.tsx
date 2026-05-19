import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-cyan/20 bg-cyan-bg text-cyan",
        violet: "border-violet/20 bg-violet-bg text-violet",
        muted: "border-border bg-bg-subtle text-text-secondary",
        danger: "border-rose/20 bg-rose-bg text-rose",
        warning: "border-gold/20 bg-gold-bg text-gold",
        success: "border-emerald/20 bg-emerald-bg text-emerald",
        gold: "border-gold/20 bg-gold-bg text-gold",
        rose: "border-rose/20 bg-rose-bg text-rose",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
