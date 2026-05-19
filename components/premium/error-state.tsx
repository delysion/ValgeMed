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
    <div className={cn("flex flex-col items-center gap-3 rounded-xl border border-rose/20 bg-rose-bg p-6 text-center", className)}>
      <div className="grid h-10 w-10 place-items-center rounded-lg border border-rose/20 bg-bg-surface">
        <AlertTriangle className="h-5 w-5 text-rose" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-text-secondary">{description}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
