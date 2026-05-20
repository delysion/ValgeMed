import { GlassCard } from "@/components/premium/glass-card";
import { EmptyState } from "@/components/premium/empty-state";
import { Beaker } from "lucide-react";

const SCORING_DIMENSIONS = [
  "Novelty",
  "Clinical relevance",
  "Feasibility",
  "Data availability",
  "Ethics complexity",
  "Supervisor fit",
  "Publication probability",
  "Time-to-output",
  "Strategic value",
];

const OUTPUTS = ["Kill", "Park", "Refine", "Execute", "Publish"];

export default function HypothesisEnginePage() {
  return (
    <div className="flex flex-col gap-6">
      <GlassCard>
        <h3 className="text-sm font-semibold text-text-primary">Research Question Scoring</h3>
        <p className="mt-2 text-sm text-text-secondary">
          Score each research question across 9 dimensions (0-10). Output determines the next action.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {SCORING_DIMENSIONS.map((dim) => (
            <div key={dim} className="rounded-lg border border-border/50 bg-bg-subtle px-3 py-2 text-xs text-text-secondary">
              {dim}
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="text-sm font-semibold text-text-primary">Output</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {OUTPUTS.map((out, i) => (
            <div key={out} className="rounded-full border border-border/50 bg-bg-subtle px-3 py-1 text-xs text-text-muted">
              {i + 1}. {out}
            </div>
          ))}
        </div>
      </GlassCard>

      <EmptyState
        icon={Beaker}
        title="No hypotheses scored yet"
        description="Create your first research question and score it against the 9 dimensions to see the recommended action."
        variant="first-time"
      />
    </div>
  );
}
