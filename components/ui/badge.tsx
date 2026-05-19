import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-cyan/20 bg-cyan/10 text-cyan",
        violet: "border-violet/20 bg-violet/10 text-violet",
        muted: "border-white/[0.06] bg-white/[0.04] text-muted",
        danger: "border-danger/20 bg-danger/10 text-red-200",
        warning: "border-warning/20 bg-warning/10 text-warning",
        success: "border-emerald/20 bg-emerald/10 text-emerald",
        gold: "border-gold/20 bg-gold/10 text-gold",
        rose: "border-rose/20 bg-rose/10 text-rose",
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
