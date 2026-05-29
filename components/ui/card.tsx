import * as React from "react";

import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "premium" | "gradient" | "glass";
}

export function Card({ className, variant = "default", ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-bg-surface text-text-primary shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-[var(--shadow-elevated)]",
        variant === "premium" && "border-border/50 bg-gradient-to-br from-bg-surface via-bg-surface to-bg-subtle/50 backdrop-blur-sm",
        variant === "gradient" && "border-primary/15 bg-gradient-to-br from-primary-soft/60 via-bg-surface to-violet-bg/30",
        variant === "glass" && "border-border/40 bg-bg-surface/70 backdrop-blur-xl",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5 p-4 sm:p-5", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-base font-semibold tracking-tight text-text-primary", className)} {...props} />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm leading-relaxed text-text-secondary", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4 sm:p-5", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center gap-3 p-4 pt-0 sm:p-5 sm:pt-0", className)} {...props} />;
}
