import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estonian-blue/60 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-estonian-blue text-white shadow-[0_8px_24px_rgba(0,114,206,0.18)] hover:bg-[#0068BD] hover:shadow-[0_12px_32px_rgba(0,114,206,0.28)] active:scale-[0.97]",
        destructive: "border border-danger/25 bg-danger/10 text-red-200 hover:bg-danger/20 active:scale-[0.97]",
        outline: "border border-white/[0.08] bg-white/[0.03] text-muted hover:bg-white/[0.06] hover:text-white hover:border-white/[0.12] active:scale-[0.97]",
        ghost: "text-muted-2 hover:bg-white/[0.05] hover:text-white active:scale-[0.97]",
        muted: "bg-white/[0.05] text-muted hover:bg-white/[0.08] hover:text-white active:scale-[0.97]",
        gold: "border border-gold/25 bg-gold/10 text-gold hover:bg-gold/15 active:scale-[0.97]",
      },
      size: {
        default: "h-9 px-4",
        sm: "h-8 px-3 text-xs",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { buttonVariants };
