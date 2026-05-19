import * as React from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white outline-none transition placeholder:text-muted-2 focus:border-estonian-blue/50 focus:ring-2 focus:ring-estonian-blue/15",
        className,
      )}
      {...props}
    />
  );
}
