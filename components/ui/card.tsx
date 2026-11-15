import * as React from "react";

import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "premium" | "gradient" | "glass";
}

export function Card({ className, variant = "default", ...props }: CardProps) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-panel border border-border bg-bg-surface text-text-primary shadow-panel",
        variant === "premium" && "border-border-strong",
        variant === "gradient" && "border-t-2 border-t-primary/65",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5 p-panel", className)} {...props} />;
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
  return <div className={cn("p-panel", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center gap-3 px-panel pb-panel", className)} {...props} />;
}
