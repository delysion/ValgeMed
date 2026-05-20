import { getI18n } from "@/lib/i18n/server";
import { GlassCard } from "@/components/premium/glass-card";
import { AlertTriangle, BookOpen, Beaker, FileText, Shield } from "lucide-react";
import Link from "next/link";

export default async function ResearchCommandPage() {
  const { t } = await getI18n();

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <GlassCard tone="primary">
          <h3 className="text-sm font-semibold text-text-primary">Highest-Return Move</h3>
          <p className="mt-2 text-sm text-text-secondary">
            Add research areas and hypotheses to see your highest-return research move.
          </p>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h3 className="text-sm font-semibold text-text-primary">At Risk</h3>
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            No projects currently at risk. Monitor deadlines and methodology warnings.
          </p>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-text-primary">Ethics/GDPR</h3>
          </div>
          <p className="mt-2 text-xs text-text-muted">
            Research workflow support only. No diagnosis. No treatment advice. No clinical decision support.
          </p>
        </GlassCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/research/literature" className="group rounded-2xl border border-border/50 bg-bg-surface p-5 card-hover">
          <BookOpen className="h-6 w-6 text-primary" />
          <h3 className="mt-3 text-sm font-semibold text-text-primary">Literature Map</h3>
          <p className="mt-1 text-xs text-text-secondary">Gap inventory and paper assessment</p>
        </Link>
        <Link href="/research/hypotheses" className="group rounded-2xl border border-border/50 bg-bg-surface p-5 card-hover">
          <Beaker className="h-6 w-6 text-cyan" />
          <h3 className="mt-3 text-sm font-semibold text-text-primary">Hypothesis Engine</h3>
          <p className="mt-1 text-xs text-text-secondary">Score, rank, and refine research questions</p>
        </Link>
        <Link href="/research/manuscripts" className="group rounded-2xl border border-border/50 bg-bg-surface p-5 card-hover">
          <FileText className="h-6 w-6 text-violet" />
          <h3 className="mt-3 text-sm font-semibold text-text-primary">Manuscript Pipeline</h3>
          <p className="mt-1 text-xs text-text-secondary">Idea to publication tracking</p>
        </Link>
      </div>

      <GlassCard>
        <h3 className="text-sm font-semibold text-text-primary">Methodology Risks</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 text-xs text-text-secondary">
          <p>Selection bias: No flagged</p>
          <p>Confounding risk: No flagged</p>
          <p>Underpowered sample: No flagged</p>
          <p>Data leakage: No flagged</p>
          <p>Wrong endpoint: No flagged</p>
          <p>Unclear inclusion: No flagged</p>
          <p>Weak control group: No flagged</p>
          <p>Retrospective limitation: No flagged</p>
          <p>p-hacking risk: No flagged</p>
          <p>AI hallucination risk: No flagged</p>
        </div>
      </GlassCard>
    </div>
  );
}
