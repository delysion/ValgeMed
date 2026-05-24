import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { TranslationKey } from "@/lib/i18n/dictionaries/en";
import { cn } from "@/lib/utils";

export function ErrorState({
  title,
  description,
  retryLabel,
  onRetry,
  className,
  t,
}: {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
  t: (key: TranslationKey) => string;
}) {
  const displayTitle = title ?? t("error.somethingWrong");
  const displayDescription = description ?? t("error.description");
  const displayRetryLabel = retryLabel ?? t("error.retry");
  return (
    <div className={cn("flex flex-col items-center gap-3 rounded-2xl border border-rose/20 bg-rose-bg/50 p-8 text-center", className)}>
      <div className="grid h-12 w-12 place-items-center rounded-xl border border-rose/20 bg-bg-surface shadow-sm">
        <AlertTriangle className="h-6 w-6 text-rose" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-text-primary">{displayTitle}</h3>
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-text-secondary">{displayDescription}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
          {displayRetryLabel}
        </Button>
      ) : null}
    </div>
  );
}
