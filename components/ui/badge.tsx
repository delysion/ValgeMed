import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-chip border font-medium leading-4",
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
        outline: "border border-border bg-transparent text-text-secondary",
        ghost: "border-transparent bg-transparent text-text-secondary",
      },
      size: {
        sm: "px-2 py-0.5 text-ui-label",
        default: "px-2.5 py-0.5 text-ui-label",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { badgeVariants };