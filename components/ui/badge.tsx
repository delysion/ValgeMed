import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]",
  {
    variants: {
      variant: {
        default: "border-cyan/25 bg-cyan/10 text-cyan",
        violet: "border-violet/25 bg-violet/10 text-violet",
        muted: "border-white/10 bg-white/[0.055] text-muted",
        danger: "border-danger/25 bg-danger/10 text-red-100",
        warning: "border-warning/25 bg-warning/10 text-warning",
        success: "border-emerald/25 bg-emerald/10 text-emerald",
        gold: "border-gold/25 bg-gold/10 text-gold",
        rose: "border-rose/25 bg-rose/10 text-rose",
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
