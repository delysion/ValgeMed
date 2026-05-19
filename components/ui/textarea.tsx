import * as React from "react";

import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-20 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition placeholder:text-muted focus:border-ice/70 focus:ring-2 focus:ring-ice/15",
        className,
      )}
      {...props}
    />
  );
}
