import { AppShell, PageHeader } from "@/components/app-shell";
import { OpportunityForm } from "@/components/forms/life-forms";
import { ResourceTable } from "@/components/tables/resource-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteOpportunityAction } from "@/lib/actions/resources";
import { requireOwnerSession } from "@/lib/auth/session";
import { getCoreData } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server";
import { fmtDate, humanize } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const session = await requireOwnerSession();
  const { t } = await getI18n();
  const params = await searchParams;
  const data = await getCoreData();
  const editing = data.opportunities.find((opportunity) => opportunity.id === params.edit);

  return (
    <AppShell session={session}>
      <PageHeader title={t("opportunities.title")} description={t("opportunities.subtitle")} />
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <OpportunityForm opportunity={editing} />
        <Card>
          <CardHeader>
            <CardTitle>{t("opportunities.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResourceTable
              rows={data.opportunities}
              editBasePath="/opportunities"
              deleteAction={deleteOpportunityAction}
              columns={[
                { header: t("common.title"), render: (item) => <span className="font-medium text-white">{item.title}</span> },
                { header: t("common.type"), render: (item) => humanize(item.opportunityType) },
                { header: t("opportunities.deadline"), render: (item) => fmtDate(item.deadline) },
                { header: t("opportunities.upside"), render: (item) => <Badge>{item.strategicUpside}/10</Badge> },
                { header: t("common.status"), render: (item) => humanize(item.status) },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
