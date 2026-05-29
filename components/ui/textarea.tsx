import * as React from "react";

import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "flex min-h-24 w-full rounded-lg border border-border bg-bg-elevated px-3 py-2.5 text-xs text-text-primary shadow-[var(--shadow-inner)] outline-none transition-all duration-150 placeholder:text-text-muted/60 placeholder:truncate focus:border-primary/50 focus:bg-bg-surface focus:shadow-[0_0_0_3px_var(--primary-glow),var(--shadow-inner)] focus:ring-0 resize-y sm:min-h-28 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm",
        className,
      )}
      {...props}
    />
  );
}
