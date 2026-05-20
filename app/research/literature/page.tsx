import { GlassCard } from "@/components/premium/glass-card";
import { EmptyState } from "@/components/premium/empty-state";
import { BookOpen } from "lucide-react";

export default function LiteratureMapPage() {
  return (
    <div className="flex flex-col gap-6">
      <GlassCard tone="primary">
        <h3 className="text-sm font-semibold text-text-primary">Research Area Map</h3>
        <p className="mt-2 text-sm text-text-secondary">
          Map what is known, unknown, controversial, and methodologically weak in your research area.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-border/50 bg-bg-subtle px-3 py-2">
            <p className="text-xs font-medium text-text-primary">What we know</p>
            <p className="text-xs text-text-muted">Document established findings</p>
          </div>
          <div className="rounded-lg border border-border/50 bg-bg-subtle px-3 py-2">
            <p className="text-xs font-medium text-text-primary">What we don&apos;t know</p>
            <p className="text-xs text-text-muted">Identify research gaps</p>
          </div>
          <div className="rounded-lg border border-border/50 bg-bg-subtle px-3 py-2">
            <p className="text-xs font-medium text-text-primary">Controversial findings</p>
            <p className="text-xs text-text-muted">Track conflicting evidence</p>
          </div>
          <div className="rounded-lg border border-border/50 bg-bg-subtle px-3 py-2">
            <p className="text-xs font-medium text-text-primary">Methodologically weak</p>
            <p className="text-xs text-text-muted">Flag studies with design issues</p>
          </div>
        </div>
      </GlassCard>

      <EmptyState
        icon={BookOpen}
        title="No gaps mapped yet"
        description="Start by identifying a research area and mapping what the literature says — and what it doesn't."
        variant="first-time"
      />
    </div>
  );
}
