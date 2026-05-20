import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: string;
}

export function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary shadow-[var(--shadow-inner)] outline-none transition-all duration-150 placeholder:text-text-muted-2 focus-visible:ring-2 focus-visible:ring-primary/25 aria-[invalid=true]:border-danger",
        className,
      )}
      {...props}
    />
  );
}
