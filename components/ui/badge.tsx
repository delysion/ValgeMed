import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold tracking-tight transition-colors duration-150",
  {
    variants: {
      variant: {
        default: "border-cyan/25 bg-cyan-bg text-cyan",
        violet: "border-violet/25 bg-violet-bg text-violet",
        muted: "border-border bg-bg-subtle text-text-secondary",
        danger: "border-rose/25 bg-rose-bg text-rose",
        warning: "border-gold/25 bg-gold-bg text-gold",
        success: "border-emerald/25 bg-emerald-bg text-emerald",
        gold: "border-gold/25 bg-gold-bg text-gold",
        rose: "border-rose/25 bg-rose-bg text-rose",
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

export { badgeVariants };
