import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-ice/25 bg-ice/10 text-ice",
        violet: "border-violet/25 bg-violet/10 text-violet",
        muted: "border-white/10 bg-white/[0.04] text-muted",
        danger: "border-red-400/20 bg-red-400/10 text-red-200",
        success: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
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
