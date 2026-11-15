import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control text-ui-body font-semibold select-none touch-manipulation transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border border-transparent bg-action text-action-foreground hover:bg-action-hover",
        destructive: "border border-rose/35 bg-rose-bg text-rose hover:border-rose",
        outline: "border border-control-border bg-bg-surface text-text-primary hover:bg-bg-subtle",
        ghost: "border border-transparent text-text-secondary hover:bg-bg-subtle hover:text-text-primary",
        muted: "border border-border bg-bg-subtle text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
        gold: "border border-gold/35 bg-gold-bg text-gold hover:border-gold",
        emerald: "border border-emerald/35 bg-emerald-bg text-emerald hover:border-emerald",
        cyan: "border border-cyan/35 bg-cyan-bg text-cyan hover:border-cyan",
      },
      size: {
        default: "h-control px-4",
        sm: "h-8 px-3 text-ui-label",
        lg: "h-control-lg px-5",
        icon: "size-control shrink-0",
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
