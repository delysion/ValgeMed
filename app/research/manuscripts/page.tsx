import { GlassCard } from "@/components/premium/glass-card";
import { EmptyState } from "@/components/premium/empty-state";
import { FileText } from "lucide-react";

const PIPELINE_STAGES = [
  "Idea",
  "Research Question",
  "Protocol",
  "Ethics",
  "Data Collection",
  "Analysis",
  "Draft",
  "Co-author Review",
  "Journal Selection",
  "Submission",
  "Revision",
  "Publication",
];

export default function ManuscriptPipelinePage() {
  return (
    <div className="flex flex-col gap-6">
      <GlassCard>
        <h3 className="text-sm font-semibold text-text-primary">Manuscript Pipeline</h3>
        <p className="mt-2 text-sm text-text-secondary">
          Track each manuscript through 12 stages from idea to publication.
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {PIPELINE_STAGES.map((stage, i) => (
            <div
              key={stage}
              className="rounded-full border border-border/50 bg-bg-subtle px-3 py-1 text-xs text-text-muted"
            >
              {i + 1}. {stage}
            </div>
          ))}
        </div>
      </GlassCard>

      <EmptyState
        icon={FileText}
        title="No manuscripts in pipeline"
        description="Start tracking your first manuscript from idea to publication."
        variant="first-time"
      />
    </div>
  );
}
