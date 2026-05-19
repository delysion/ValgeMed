import { AppShell, PageHeader } from "@/components/app-shell";
import { ReputationEventForm } from "@/components/forms/life-forms";
import { ResourceTable } from "@/components/tables/resource-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteReputationEventAction } from "@/lib/actions/resources";
import { requireOwnerSession } from "@/lib/auth/session";
import { getCoreData } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server";
import { fmtDate, humanize } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function ReputationPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const session = await requireOwnerSession();
  const { t } = await getI18n();
  const params = await searchParams;
  const data = await getCoreData();
  const editing = data.reputationEvents.find((event) => event.id === params.edit);

  return (
    <AppShell session={session}>
      <PageHeader title={t("reputation.title")} description={t("reputation.subtitle")} />
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <ReputationEventForm event={editing} />
        <Card>
          <CardHeader>
            <CardTitle>{t("reputation.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResourceTable
              rows={data.reputationEvents}
              editBasePath="/reputation"
              deleteAction={deleteReputationEventAction}
              columns={[
                { header: t("common.title"), render: (event) => <span className="font-medium text-white">{event.title}</span> },
                { header: t("common.type"), render: (event) => humanize(event.eventType) },
                { header: t("common.date"), render: (event) => fmtDate(event.eventDate) },
                { header: t("reputation.trust"), render: (event) => <Badge>{event.impact}/10</Badge> },
                { header: t("common.status"), render: (event) => humanize(event.status) },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
