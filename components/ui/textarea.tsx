import * as React from "react";

import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "flex min-h-24 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white outline-none transition placeholder:text-muted-2 focus:border-estonian-blue/50 focus:ring-2 focus:ring-estonian-blue/15",
        className,
      )}
      {...props}
    />
  );
}
