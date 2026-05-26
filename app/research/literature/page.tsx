import { GlassCard } from "@/components/premium/glass-card";
import { EmptyState } from "@/components/premium/empty-state";
import { BookOpen, Lightbulb } from "lucide-react";
import { getI18n } from "@/lib/i18n/server-i18n";
import { getLiteratureGaps } from "@/lib/data/queries";
import { LiteratureGapForm } from "@/components/forms/research-forms";
import { deleteLiteratureGapAction } from "@/lib/actions/research";
import { DeleteButton } from "@/components/forms/delete-button";

export const dynamic = "force-dynamic";

export default async function LiteratureMapPage({
  searchParams,
}: {
  searchParams: Promise<{ editGap?: string }>;
}) {
  const { t } = await getI18n();
  const params = await searchParams;
  const gaps = await getLiteratureGaps();
  const editingGap = gaps.find((gap) => gap.id === params.editGap);

  return (
    <div className="flex flex-col gap-6">
      <GlassCard tone="primary">
        <h3 className="text-sm font-semibold text-text-primary">{t("research.literatureTitle")}</h3>
        <p className="mt-2 text-sm text-text-secondary">{t("research.literatureDesc")}</p>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          {gaps.length > 0 ? (
            gaps.map((gap) => (
              <div key={gap.id} className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-bg-surface/50 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary">{gap.title}</p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {t("common.priority")}: {gap.priority}/10 · {t("common.status")}: {gap.status}
                  </p>
                  {gap.description && <p className="mt-1 text-xs text-text-secondary line-clamp-2">{gap.description}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <a
                    href={`/research/literature?editGap=${gap.id}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-text-muted hover:bg-bg-subtle hover:text-text-primary transition-colors"
                    aria-label={t("common.edit")}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.844a.5.5 0 0 1-.62-.62l.844-2.872a2 2 0 0 1 .506-.855z"/></svg>
                  </a>
                  <DeleteButton action={deleteLiteratureGapAction} id={gap.id} />
                </div>
              </div>
            ))
          ) : (
            <EmptyState icon={BookOpen} title={t("research.noGaps")} description={t("research.noGapsDesc")} variant="first-time" />
          )}
        </div>

        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold text-text-primary">{editingGap ? t("common.edit") : t("common.create")}</h3>
          </div>
          <LiteratureGapForm gap={editingGap} />
        </GlassCard>
      </div>
    </div>
  );
}