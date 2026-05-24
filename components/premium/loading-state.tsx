import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import type { TranslationKey } from "@/lib/i18n/dictionaries/en";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  skeleton?: ReactNode;
  message?: string;
  label?: string;
  fullScreen?: boolean;
  className?: string;
  t: (key: TranslationKey) => string;
}

export function LoadingState({
  skeleton,
  message,
  label,
  fullScreen = false,
  className,
  t,
}: LoadingStateProps) {
  if (skeleton) return <>{skeleton}</>;

  const displayMessage = message ?? label;

  if (fullScreen) {
    return (
      <div className={cn("grid min-h-screen place-items-center bg-bg-page", className)} role="status" aria-label={displayMessage ?? t("common.loading")}>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-bg-subtle/50 px-6 py-14 text-center">
          <div className="flex flex-col gap-3 w-full max-w-md">
            <Skeleton variant="circular" className="mx-auto size-14" />
            <Skeleton variant="text" className="mx-auto w-36" />
            <Skeleton variant="text" className="w-full" />
            <Skeleton variant="text" className="w-3/4" />
          </div>
          {displayMessage ? <p className="mt-6 text-sm text-text-muted">{displayMessage}</p> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-bg-subtle/50 px-6 py-14 text-center" role="status" aria-label={displayMessage ?? t("common.loading")}>
      <div className="flex flex-col gap-3 w-full max-w-md">
        <Skeleton variant="circular" className="mx-auto size-14" />
        <Skeleton variant="text" className="mx-auto w-36" />
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-3/4" />
      </div>
      {displayMessage ? <p className="mt-6 text-sm text-text-muted">{displayMessage}</p> : null}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border/60 bg-bg-surface p-4 shadow-[var(--shadow-card)]", className)} aria-hidden="true">
      <Skeleton variant="text" className="h-3 w-24" />
      <Skeleton variant="text" className="mt-3 h-7 w-16" />
      <Skeleton variant="text" className="mt-2 h-3 w-32" />
    </div>
  );
}

export function SkeletonRow({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 rounded-xl border border-border/60 bg-bg-surface p-3", className)} aria-hidden="true">
      <Skeleton variant="circular" className="h-8 w-8 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton variant="text" className="h-3 w-3/5" />
        <Skeleton variant="text" className="h-2 w-2/5" />
      </div>
    </div>
  );
}
