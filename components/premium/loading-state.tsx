import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export function LoadingState({
  label = "Loading",
  fullScreen = false,
  className,
}: {
  label?: string;
  fullScreen?: boolean;
  className?: string;
}) {
  const content = (
    <div className={cn("flex items-center gap-3", fullScreen ? "flex-col" : "")}>
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      <p className={cn("font-medium text-text-secondary", fullScreen ? "text-xs uppercase tracking-[0.14em]" : "text-[11px]")}>{label}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className={cn("grid min-h-screen place-items-center bg-bg-page", className)}>
        {content}
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-border bg-bg-surface p-5 shadow-[var(--shadow-card)]", className)}>
      {content}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-bg-surface p-4 shadow-[var(--shadow-card)]", className)}>
      <div className="skeleton-pulse h-3 w-24 rounded bg-bg-subtle" />
      <div className="skeleton-pulse mt-3 h-7 w-16 rounded bg-bg-subtle" />
      <div className="skeleton-pulse mt-2 h-3 w-32 rounded bg-bg-subtle" />
    </div>
  );
}

export function SkeletonRow({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 rounded-lg border border-border bg-bg-surface p-3", className)}>
      <div className="skeleton-pulse h-8 w-8 shrink-0 rounded-lg bg-bg-subtle" />
      <div className="flex-1 space-y-1.5">
        <div className="skeleton-pulse h-3 w-3/5 rounded bg-bg-subtle" />
        <div className="skeleton-pulse h-2 w-2/5 rounded bg-bg-subtle" />
      </div>
    </div>
  );
}
