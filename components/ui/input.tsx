import * as React from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-2 text-sm text-white outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition placeholder:text-muted-2 focus:border-cyan/70 focus:ring-2 focus:ring-cyan/15",
        className,
      )}
      {...props}
    />
  );
}
