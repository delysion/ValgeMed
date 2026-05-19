"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function CollapsiblePanel({
  title,
  children,
  defaultOpen = false,
  icon,
  badge,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white shadow-[var(--shadow-card)]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left transition hover:bg-bg-subtle"
      >
        <div className="flex items-center gap-2.5">
          {icon}
          <span className="text-sm font-semibold text-text-primary">{title}</span>
          {badge}
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-text-muted" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" />
        )}
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          isOpen ? "max-h-[2000px] border-t border-border" : "max-h-0",
        )}
      >
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
