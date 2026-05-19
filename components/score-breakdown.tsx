import type { ScoreResult } from "@/lib/scoring/engine";
import { cn } from "@/lib/utils";

export function ScoreBreakdown({
  result,
  compact = false,
}: {
  result: ScoreResult;
  compact?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2">
        <span className="font-mono text-4xl font-semibold text-text-primary">
          {result.score.toFixed(1)}
        </span>
        <span className="pb-1 text-sm text-text-muted">/10</span>
      </div>
      <div className="space-y-2">
        {result.factors.map((factor) => (
          <div key={factor.label} className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-text-secondary">{factor.label}</span>
              <span className={cn("font-mono", factor.direction === "negative" ? "text-rose" : "text-cyan")}>
                {factor.value.toFixed(1)}
              </span>
            </div>
            {!compact ? (
              <div className="h-2 rounded-full bg-bg-subtle">
                <div
                  className={cn(
                    "h-full rounded-full",
                    factor.direction === "negative"
                      ? "bg-gradient-to-r from-rose to-gold"
                      : "bg-gradient-to-r from-cyan to-violet",
                  )}
                  style={{ width: `${factor.value * 10}%` }}
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <p className="text-xs leading-5 text-text-secondary">{result.note}</p>
    </div>
  );
}
