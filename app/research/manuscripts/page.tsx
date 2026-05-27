import { GlassCard } from "@/components/premium/glass-card";
import { ManuscriptsList } from "@/components/research/manuscripts-list";
import { getI18n } from "@/lib/i18n/server-i18n";
import { getResearchPipelineData } from "@/lib/data/queries";
import { ManuscriptForm } from "@/components/forms/research-forms";

export const dynamic = "force-dynamic";

export default async function ManuscriptPipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ editManuscript?: string }>;
}) {
  const { t } = await getI18n();
  const params = await searchParams;
  const data = await getResearchPipelineData();
  const manuscripts = data.manuscripts;
  const editingManuscript = manuscripts.find((m) => m.id === params.editManuscript);
  const hypothesisById = new Map(data.hypotheses.map((hypothesis) => [hypothesis.id, hypothesis.question]));

  return (
    <div className="flex flex-col gap-6">
      <GlassCard tone="primary">
        <h3 className="text-sm font-semibold text-text-primary">{t("research.manuscriptPipeline")}</h3>
        <p className="mt-2 text-sm text-text-secondary">{t("research.manuscriptPipelineDesc")}</p>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <ManuscriptsList manuscripts={manuscripts} hypothesisNames={hypothesisById} t={t} />

        <GlassCard>
          <h3 className="text-sm font-semibold text-text-primary mb-4">{editingManuscript ? t("common.edit") : t("common.create")}</h3>
          <ManuscriptForm manuscript={editingManuscript} hypotheses={data.hypotheses} />
        </GlassCard>
      </div>
    </div>
  );
}