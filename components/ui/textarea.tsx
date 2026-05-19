import * as React from "react";

import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "flex min-h-28 w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary shadow-[var(--shadow-inner)] outline-none transition-all duration-150 placeholder:text-text-muted/60 focus:border-primary/50 focus:bg-bg-surface focus:shadow-[0_0_0_3px_var(--primary-glow),var(--shadow-inner)] focus:ring-0 resize-y",
        className,
      )}
      {...props}
    />
  );
}
