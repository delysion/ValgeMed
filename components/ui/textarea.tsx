import * as React from "react";

import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition placeholder:text-muted-2 focus:border-cyan/70 focus:ring-2 focus:ring-cyan/15",
        className,
      )}
      {...props}
    />
  );
}
