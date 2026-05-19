import { AppShell, PageHeader } from "@/components/app-shell";
import { StrategicReviewForm } from "@/components/forms/life-forms";
import { ResourceTable } from "@/components/tables/resource-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteStrategicReviewAction } from "@/lib/actions/resources";
import { requireOwnerSession } from "@/lib/auth/session";
import { getCoreData } from "@/lib/data/queries";
import { fmtDate, humanize } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function StrategicReviewPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const session = await requireOwnerSession();
  const params = await searchParams;
  const data = await getCoreData();
  const editing = data.strategicReviews.find((review) => review.id === params.edit);

  return (
    <AppShell session={session}>
      <PageHeader title="Strategic Review" description="Weekly, monthly e semester reviews per correggere traiettoria e standard." />
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <StrategicReviewForm review={editing} />
        <Card>
          <CardHeader>
            <CardTitle>Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <ResourceTable
              rows={data.strategicReviews}
              editBasePath="/strategic-review"
              deleteAction={deleteStrategicReviewAction}
              columns={[
                { header: "Data", render: (review) => <span className="font-medium text-white">{fmtDate(review.date)}</span> },
                { header: "Tipo", render: (review) => humanize(review.reviewType) },
                { header: "Elite snapshot", render: (review) => <Badge>{review.eliteIndexSnapshot}/10</Badge> },
                { header: "Next focus", render: (review) => <span className="line-clamp-2">{review.nextFocus ?? "-"}</span> },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
