import { Lightbulb } from "lucide-react";
import { GlassCard } from "@/components/premium/glass-card";
import { LiteratureList } from "@/components/research/literature-list";
import { getI18n } from "@/lib/i18n/server-i18n";
import { getResearchPipelineData } from "@/lib/data/queries";
import { LiteratureGapForm } from "@/components/forms/research-forms";

export const dynamic = "force-dynamic";

export default async function LiteratureMapPage({
  searchParams,
}: {
  searchParams: Promise<{ editGap?: string }>;
}) {
  const { t } = await getI18n();
  const params = await searchParams;
  const data = await getResearchPipelineData();
  const gaps = data.literatureGaps;
  const editingGap = gaps.find((gap) => gap.id === params.editGap);
  const areaById = new Map(data.researchAreas.map((area) => [area.id, area.name]));

  return (
    <div className="flex flex-col gap-6">
      <GlassCard tone="primary">
        <h3 className="text-sm font-semibold text-text-primary">{t("research.literatureTitle")}</h3>
        <p className="mt-2 text-sm text-text-secondary">{t("research.literatureDesc")}</p>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <LiteratureList gaps={gaps} areaNames={areaById} t={t} />

        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold text-text-primary">{editingGap ? t("common.edit") : t("common.create")}</h3>
          </div>
          <LiteratureGapForm gap={editingGap} researchAreas={data.researchAreas} />
        </GlassCard>
      </div>
    </div>
  );
}
