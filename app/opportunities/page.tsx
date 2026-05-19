import { AppShell, PageHeader } from "@/components/app-shell";
import { OpportunityForm } from "@/components/forms/life-forms";
import { ResourceTable } from "@/components/tables/resource-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteOpportunityAction } from "@/lib/actions/resources";
import { requireOwnerSession } from "@/lib/auth/session";
import { getCoreData } from "@/lib/data/queries";
import { fmtDate, humanize } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const session = await requireOwnerSession();
  const params = await searchParams;
  const data = await getCoreData();
  const editing = data.opportunities.find((opportunity) => opportunity.id === params.edit);

  return (
    <AppShell session={session}>
      <PageHeader title="Opportunity Radar" description="Research, internships, shadowing, scholarships, mentorship e clinical exposure." />
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <OpportunityForm opportunity={editing} />
        <Card>
          <CardHeader>
            <CardTitle>Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <ResourceTable
              rows={data.opportunities}
              editBasePath="/opportunities"
              deleteAction={deleteOpportunityAction}
              columns={[
                { header: "Opportunita", render: (item) => <span className="font-medium text-white">{item.title}</span> },
                { header: "Tipo", render: (item) => humanize(item.opportunityType) },
                { header: "Deadline", render: (item) => fmtDate(item.deadline) },
                { header: "Upside", render: (item) => <Badge>{item.strategicUpside}/10</Badge> },
                { header: "Status", render: (item) => humanize(item.status) },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
