import * as React from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-9 w-full rounded-md border border-white/10 bg-black/30 px-3 py-1 text-sm text-white outline-none transition placeholder:text-muted focus:border-ice/70 focus:ring-2 focus:ring-ice/15",
        className,
      )}
      {...props}
    />
  );
}
