import { GlassCard } from "@/components/premium/glass-card";
import { HypothesesList } from "@/components/research/hypotheses-list";
import { getI18n } from "@/lib/i18n/server-i18n";
import { getHypotheses } from "@/lib/data/queries";
import { HypothesisForm } from "@/components/forms/research-forms";

export const dynamic = "force-dynamic";

export default async function HypothesisEnginePage({
  searchParams,
}: {
  searchParams: Promise<{ editHypothesis?: string }>;
}) {
  const { t } = await getI18n();
  const params = await searchParams;
  const hypotheses = await getHypotheses();
  const editingHypothesis = hypotheses.find((h) => h.id === params.editHypothesis);

  return (
    <div className="flex flex-col gap-6">
      <GlassCard tone="primary">
        <h3 className="text-sm font-semibold text-text-primary">{t("research.scoringTitle")}</h3>
        <p className="mt-2 text-sm text-text-secondary">{t("research.scoringDesc")}</p>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <HypothesesList hypotheses={hypotheses} t={t} />

        <GlassCard>
          <h3 className="text-sm font-semibold text-text-primary mb-4">{editingHypothesis ? t("common.edit") : t("common.create")}</h3>
          <HypothesisForm hypothesis={editingHypothesis} />
        </GlassCard>
      </div>
    </div>
  );
}