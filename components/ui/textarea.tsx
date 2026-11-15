import * as React from "react";

import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "ui-field flex min-h-24 w-full min-w-0 resize-y px-3 py-2.5 text-base transition-colors duration-150 sm:text-ui-body",
        className,
      )}
      {...props}
    />
  );
}
