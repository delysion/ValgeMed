import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ErrorState({
  title = "Something went wrong",
  description = "The system encountered an error. Try again or check your connection.",
  retryLabel = "Retry",
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-3 rounded-2xl border border-rose/20 bg-rose-bg/50 p-8 text-center", className)}>
      <div className="grid h-12 w-12 place-items-center rounded-xl border border-rose/20 bg-bg-surface shadow-sm">
        <AlertTriangle className="h-6 w-6 text-rose" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-text-primary">{title}</h3>
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-text-secondary">{description}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
