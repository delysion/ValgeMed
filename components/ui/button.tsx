import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white shadow-sm hover:bg-primary/90 hover:shadow-md active:scale-[0.97]",
        destructive: "border border-rose/20 bg-rose-bg text-rose hover:bg-rose/10 active:scale-[0.97]",
        outline: "border border-border bg-white text-text-secondary hover:bg-bg-subtle hover:text-text-primary active:scale-[0.97]",
        ghost: "text-text-secondary hover:bg-bg-subtle hover:text-text-primary active:scale-[0.97]",
        muted: "bg-bg-subtle text-text-secondary hover:bg-border hover:text-text-primary active:scale-[0.97]",
        gold: "border border-gold/20 bg-gold-bg text-gold hover:bg-gold/10 active:scale-[0.97]",
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
