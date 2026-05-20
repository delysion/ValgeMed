import { AppShell, PageHeader } from "@/components/app-shell";
import { StrategicReviewForm } from "@/components/forms/life-forms";
import { ResourceTable } from "@/components/tables/resource-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteStrategicReviewAction } from "@/lib/actions/resources";
import { requireUser } from "@/lib/auth/supabase";
import { getCoreData } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server";
import { fmtDate, humanize } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function StrategicReviewPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const user = await requireUser();
  const { t } = await getI18n();
  const params = await searchParams;
  const data = await getCoreData();
  const editing = data.strategicReviews.find((review) => review.id === params.edit);

  return (
    <AppShell user={user}>
      <PageHeader title={t("strategic.title")} description={t("strategic.subtitle")} />
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <StrategicReviewForm review={editing} />
        <Card>
          <CardHeader>
            <CardTitle>{t("strategic.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResourceTable
              rows={data.strategicReviews}
              editBasePath="/strategic-review"
              deleteAction={deleteStrategicReviewAction}
              columns={[
                { header: t("common.date"), render: (review) => <span className="font-medium text-text-primary">{fmtDate(review.date)}</span> },
                { header: t("common.type"), render: (review) => humanize(review.reviewType) },
                { header: t("elite.central"), render: (review) => <Badge>{review.eliteIndexSnapshot}/10</Badge> },
                { header: t("common.nextAction"), render: (review) => <span className="line-clamp-2">{review.nextFocus ?? "-"}</span> },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
