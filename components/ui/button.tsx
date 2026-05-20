import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.97] touch-action:manipulation select-none outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-primary to-primary-ring text-white shadow-[0_2px_8px_rgba(74,56,200,0.30)] hover:shadow-[0_6px_24px_rgba(74,56,200,0.28)] hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.97]",
        destructive: "border border-rose/30 bg-gradient-to-br from-rose-bg to-rose/10 text-rose hover:bg-rose/15 hover:border-rose/45 hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.97]",
        outline: "border border-border-strong bg-gradient-to-br from-bg-elevated to-bg-subtle/30 text-text-secondary hover:bg-bg-subtle hover:text-text-primary hover:border-border hover:shadow-sm hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.97]",
        ghost: "text-text-secondary hover:bg-bg-subtle hover:text-text-primary active:scale-[0.97]",
        muted: "bg-gradient-to-br from-bg-subtle to-border/30 text-text-secondary hover:bg-border hover:text-text-primary active:scale-[0.97]",
        gold: "border border-gold/30 bg-gradient-to-br from-gold-bg to-gold/10 text-gold hover:bg-gold/15 hover:border-gold/45 hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.97]",
        emerald: "border border-emerald/30 bg-gradient-to-br from-emerald-bg to-emerald/10 text-emerald hover:bg-emerald/15 hover:border-emerald/45 hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.97]",
        cyan: "border border-cyan/30 bg-gradient-to-br from-cyan-bg to-cyan/10 text-cyan hover:bg-cyan/15 hover:border-cyan/45 hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.97]",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
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
