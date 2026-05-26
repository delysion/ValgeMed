import { GlassCard } from "@/components/premium/glass-card";
import { EmptyState } from "@/components/premium/empty-state";
import { FileText } from "lucide-react";
import { getI18n } from "@/lib/i18n/server-i18n";
import { getManuscripts } from "@/lib/data/queries";
import { ManuscriptForm } from "@/components/forms/research-forms";
import { deleteManuscriptAction } from "@/lib/actions/research";
import { DeleteButton } from "@/components/forms/delete-button";

export const dynamic = "force-dynamic";

export default async function ManuscriptPipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ editManuscript?: string }>;
}) {
  const { t } = await getI18n();
  const params = await searchParams;
  const manuscripts = await getManuscripts();
  const editingManuscript = manuscripts.find((m) => m.id === params.editManuscript);

  return (
    <div className="flex flex-col gap-6">
      <GlassCard tone="primary">
        <h3 className="text-sm font-semibold text-text-primary">{t("research.manuscriptPipeline")}</h3>
        <p className="mt-2 text-sm text-text-secondary">{t("research.manuscriptPipelineDesc")}</p>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          {manuscripts.length > 0 ? (
            manuscripts.map((manuscript) => (
              <div key={manuscript.id} className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-bg-surface/50 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary">{manuscript.title}</p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    Stage: {manuscript.stage.replace(/_/g, " ")}
                    {manuscript.journal && ` · ${manuscript.journal}`}
                  </p>
                  {manuscript.notes && <p className="mt-1 text-xs text-text-secondary line-clamp-2">{manuscript.notes}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <a
                    href={`/research/manuscripts?editManuscript=${manuscript.id}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-text-muted hover:bg-bg-subtle hover:text-text-primary transition-colors"
                    aria-label={t("common.edit")}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.844a.5.5 0 0 1-.62-.62l.844-2.872a2 2 0 0 1 .506-.855z"/></svg>
                  </a>
                  <DeleteButton action={deleteManuscriptAction} id={manuscript.id} />
                </div>
              </div>
            ))
          ) : (
            <EmptyState icon={FileText} title={t("common.emptyTitle")} description={t("common.emptyBody")} variant="first-time" />
          )}
        </div>

        <GlassCard>
          <h3 className="text-sm font-semibold text-text-primary mb-4">{editingManuscript ? t("common.edit") : t("common.create")}</h3>
          <ManuscriptForm manuscript={editingManuscript} />
        </GlassCard>
      </div>
    </div>
  );
}