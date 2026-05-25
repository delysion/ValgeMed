import { GlassCard } from "@/components/premium/glass-card";
import { EmptyState } from "@/components/premium/empty-state";
import { FileText } from "lucide-react";
import { getI18n } from "@/lib/i18n/server-i18n";

export default async function ManuscriptPipelinePage() {
  const { t } = await getI18n();
  const stages = t("research.manuscriptStages").split(",");

  return (
    <div className="flex flex-col gap-6">
      <GlassCard>
        <h3 className="text-sm font-semibold text-text-primary">{t("research.manuscriptPipeline")}</h3>
        <p className="mt-2 text-sm text-text-secondary">
          {t("research.manuscriptPipelineDesc")}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {stages.map((stage, i) => (
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
        title={t("research.noManuscripts")}
        description={t("research.noManuscriptsDesc")}
        variant="first-time"
      />
    </div>
  );
}
