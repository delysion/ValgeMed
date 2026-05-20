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
          "bg-primary text-white shadow-[0_1px_3px_rgba(80,64,208,0.25)] hover:bg-primary-ring hover:shadow-[0_4px_20px_rgba(80,64,208,0.20)] hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.97]",
        destructive: "border border-rose/25 bg-rose-bg text-rose hover:bg-rose/10 hover:border-rose/40 hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.97]",
        outline: "border border-border-strong bg-bg-elevated text-text-secondary hover:bg-bg-subtle hover:text-text-primary hover:border-border hover:shadow-sm hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.97]",
        ghost: "text-text-secondary hover:bg-bg-subtle hover:text-text-primary active:scale-[0.97]",
        muted: "bg-bg-subtle text-text-secondary hover:bg-border hover:text-text-primary active:scale-[0.97]",
        gold: "border border-gold/25 bg-gold-bg text-gold hover:bg-gold/10 hover:border-gold/40 hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.97]",
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
