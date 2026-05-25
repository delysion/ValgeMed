import { AppShell, PageHeader } from "@/components/app-shell";
import { StrategicReviewForm } from "@/components/forms/life-forms";
import { ResourceTable } from "@/components/tables/resource-table";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/premium/glass-card";
import { SectionHeader } from "@/components/premium/section-header";
import { deleteStrategicReviewAction } from "@/lib/actions/resources";
import { requireUser } from "@/lib/auth/supabase";
import { getStrategicReviews } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";
import { fmtDate, humanize } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function StrategicReviewPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const user = await requireUser();
  const { t } = await getI18n();
  const params = await searchParams;
  const strategicReviews = await getStrategicReviews();
  const editing = strategicReviews.find((review) => review.id === params.edit);

  return (
    <AppShell user={user}>
      <PageHeader title={t("strategic.title")} description={t("strategic.subtitle")} />
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <StrategicReviewForm review={editing} />
        <GlassCard>
          <SectionHeader title={t("strategic.title")} description={`${strategicReviews.length} reviews`} />
          <div className="mt-4">
            <ResourceTable
              rows={strategicReviews}
              editBasePath="/strategic-review"
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
