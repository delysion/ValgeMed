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
        <span className="font-mono text-4xl font-semibold text-white">
          {result.score.toFixed(1)}
        </span>
        <span className="pb-1 text-sm text-muted">/10</span>
      </div>
      <div className="space-y-2">
        {result.factors.map((factor) => (
          <div key={factor.label} className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-muted">{factor.label}</span>
              <span className={cn("font-mono", factor.direction === "negative" ? "text-danger" : "text-cyan")}>
                {factor.value.toFixed(1)}
              </span>
            </div>
            {!compact ? (
              <div className="h-2 rounded-full bg-white/[0.07]">
                <div
                  className={cn(
                    "h-full rounded-full",
                    factor.direction === "negative"
                      ? "bg-gradient-to-r from-danger to-warning"
                      : "bg-gradient-to-r from-cyan to-violet",
                  )}
                  style={{ width: `${factor.value * 10}%` }}
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <p className="text-xs leading-5 text-muted">{result.note}</p>
    </div>
  );
}
