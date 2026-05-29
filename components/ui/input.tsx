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
        "flex h-10 w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-xs text-text-primary shadow-[var(--shadow-inner)] outline-none transition-all duration-150 placeholder:text-text-muted-2 truncate focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:border-primary/40 aria-[invalid=true]:border-danger aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-danger/20 sm:h-12 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm",
        type === "date" && "pr-8 min-w-[140px] sm:pr-10 sm:min-w-[160px]",
        className,
      )}
      {...props}
    />
  );
}
