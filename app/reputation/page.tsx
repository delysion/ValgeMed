import { AppShell, PageHeader } from "@/components/app-shell";
import { ReputationEventForm } from "@/components/forms/life-forms";
import { ResourceTable } from "@/components/tables/resource-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteReputationEventAction } from "@/lib/actions/resources";
import { requireOwnerSession } from "@/lib/auth/session";
import { getCoreData } from "@/lib/data/queries";
import { fmtDate, humanize } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function ReputationPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const session = await requireOwnerSession();
  const params = await searchParams;
  const data = await getCoreData();
  const editing = data.reputationEvents.find((event) => event.id === params.edit);

  return (
    <AppShell session={session}>
      <PageHeader title="Reputation Capital" description="Affidabilita, competenza, contributo quieto, segnali professionali." />
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <ReputationEventForm event={editing} />
        <Card>
          <CardHeader>
            <CardTitle>Reputation events</CardTitle>
          </CardHeader>
          <CardContent>
            <ResourceTable
              rows={data.reputationEvents}
              editBasePath="/reputation"
              deleteAction={deleteReputationEventAction}
              columns={[
                { header: "Evento", render: (event) => <span className="font-medium text-white">{event.title}</span> },
                { header: "Tipo", render: (event) => humanize(event.eventType) },
                { header: "Data", render: (event) => fmtDate(event.eventDate) },
                { header: "Impact", render: (event) => <Badge>{event.impact}/10</Badge> },
                { header: "Status", render: (event) => humanize(event.status) },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
