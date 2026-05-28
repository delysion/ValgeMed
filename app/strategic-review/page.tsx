import { AppShell, PageHeader } from "@/components/app-shell";
import { StrategicReviewForm } from "@/components/forms/life-forms";
import { ResourceTable } from "@/components/tables/resource-table";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/premium/glass-card";
import { SectionHeader } from "@/components/premium/section-header";
import { deleteStrategicReviewAction } from "@/lib/actions/resources";
import { requireApprovedUser } from "@/lib/auth/supabase";
import { getStrategicReviews } from "@/lib/data/queries";
import type { StrategicReview } from "@/lib/db/schema";
import { getI18n } from "@/lib/i18n/server-i18n";
import { fmtDate, humanize } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function StrategicReviewPage({ searchParams }: { searchParams: Promise<{ edit?: string; view?: string }> }) {
  const user = await requireApprovedUser();
  const { t } = await getI18n();
  const params = await searchParams;
  const strategicReviews = await getStrategicReviews();
  const editing = strategicReviews.find((review) => review.id === params.edit);
  const selectedReview = strategicReviews.find((review) => review.id === params.view);

  return (
    <AppShell user={user}>
      <PageHeader title={t("strategic.title")} description={t("strategic.subtitle")} />
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <StrategicReviewForm review={editing} />
        <GlassCard className="min-w-0">
          <SectionHeader title={t("strategic.title")} description={`${strategicReviews.length} reviews`} />
          {selectedReview ? <StrategicReviewDetail review={selectedReview} /> : null}
          <div className="mt-4">
            <ResourceTable
              rows={strategicReviews}
              editBasePath="/strategic-review"
              viewBasePath="/strategic-review"
              deleteAction={deleteStrategicReviewAction}
              columns={[
                { header: t("common.date"), render: (review) => <span className="font-medium text-text-primary">{fmtDate(review.date)}</span> },
                { header: t("common.type"), render: (review) => humanize(review.reviewType) },
                { header: t("elite.central"), render: (review) => <Badge>{review.eliteIndexSnapshot}/10</Badge> },
                { header: t("common.nextAction"), render: (review) => <span className="line-clamp-2">{review.nextFocus ?? "-"}</span> },
              ]}
            />
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}

function StrategicReviewDetail({ review }: { review: StrategicReview }) {
  return (
    <div className="mt-4 rounded-2xl border border-primary/20 bg-primary-soft/10 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{humanize(review.reviewType)}</Badge>
        <span className="text-sm font-semibold text-text-primary">{fmtDate(review.date)}</span>
        <span className="text-xs text-text-muted">Elite Index {review.eliteIndexSnapshot}/10</span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <DetailBlock title="Wins" value={review.wins} />
        <DetailBlock title="Weaknesses" value={review.weaknesses} />
        <DetailBlock title="Decisions" value={review.decisions} />
        <DetailBlock title="Next focus" value={review.nextFocus} />
      </div>
    </div>
  );
}

function DetailBlock({ title, value }: { title: string; value?: string | null }) {
  return (
    <section className="rounded-xl border border-border/60 bg-bg-page/35 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">{title}</p>
      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-text-secondary">{value || "-"}</p>
    </section>
  );
}
