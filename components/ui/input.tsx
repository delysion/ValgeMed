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
        "ui-field flex h-control w-full min-w-0 px-3 py-2 text-base transition-colors duration-150 sm:text-ui-body",
        className,
      )}
      {...props}
    />
  );
}
