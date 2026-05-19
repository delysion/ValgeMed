import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/70 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(135deg,var(--ice),var(--violet))] text-graphite shadow-[0_14px_40px_rgba(121,231,255,0.18)] hover:scale-[1.01]",
        destructive: "border border-danger/25 bg-danger/10 text-red-100 hover:bg-danger/20",
        outline: "border border-white/10 bg-white/[0.045] text-white shadow-[var(--ring-soft)] hover:bg-white/[0.08]",
        ghost: "text-muted hover:bg-white/[0.07] hover:text-white",
        muted: "bg-white/[0.07] text-muted hover:bg-white/[0.1] hover:text-white",
        gold: "border border-gold/30 bg-gold/10 text-gold hover:bg-gold/20",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
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
