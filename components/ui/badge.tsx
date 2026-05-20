import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-0.5 text-xs font-medium tracking-tight transition-colors duration-150",
  {
    variants: {
      variant: {
        default: "border-cyan/25 bg-gradient-to-br from-cyan-bg to-cyan/8 text-cyan",
        violet: "border-violet/25 bg-gradient-to-br from-violet-bg to-violet/8 text-violet",
        muted: "border-border bg-gradient-to-br from-bg-subtle to-border/20 text-text-secondary",
        danger: "border-rose/25 bg-gradient-to-br from-rose-bg to-rose/8 text-rose",
        warning: "border-gold/25 bg-gradient-to-br from-gold-bg to-gold/8 text-gold",
        success: "border-emerald/25 bg-gradient-to-br from-emerald-bg to-emerald/8 text-emerald",
        gold: "border-gold/25 bg-gradient-to-br from-gold-bg to-gold/8 text-gold",
        rose: "border-rose/25 bg-gradient-to-br from-rose-bg to-rose/8 text-rose",
        outline: "border border-border bg-transparent text-text-secondary hover:bg-bg-subtle",
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
