import { GlassCard } from "@/components/premium/glass-card";
import { EmptyState } from "@/components/premium/empty-state";
import { Beaker } from "lucide-react";
import { getI18n } from "@/lib/i18n/server-i18n";
import { HypothesisForm } from "@/components/forms/research-forms";

export const dynamic = "force-dynamic";

export default async function HypothesisEnginePage() {
  const { t } = await getI18n();

  return (
    <div className="flex flex-col gap-6">
      <GlassCard tone="primary">
        <h3 className="text-sm font-semibold text-text-primary">{t("research.scoringTitle")}</h3>
        <p className="mt-2 text-sm text-text-secondary">{t("research.scoringDesc")}</p>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <EmptyState icon={Beaker} title={t("common.emptyTitle")} description={t("common.emptyBody")} variant="first-time" />

        <GlassCard>
          <h3 className="text-sm font-semibold text-text-primary mb-4">{t("common.create")}</h3>
          <HypothesisForm />
        </GlassCard>
      </div>
    </div>
  );
}
