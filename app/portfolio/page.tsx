import { AppShell, PageHeader } from "@/components/app-shell";
import { PortfolioItemForm } from "@/components/forms/life-forms";
import { ResourceTable } from "@/components/tables/resource-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deletePortfolioItemAction } from "@/lib/actions/resources";
import { requireOwnerSession } from "@/lib/auth/session";
import { getCoreData } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server";
import { fmtDate, humanize } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function PortfolioPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const session = await requireOwnerSession();
  const { t } = await getI18n();
  const params = await searchParams;
  const data = await getCoreData();
  const editing = data.portfolioItems.find((item) => item.id === params.edit);

  return (
    <AppShell session={session}>
      <PageHeader title={t("portfolio.title")} description={t("portfolio.subtitle")} />
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <PortfolioItemForm item={editing} />
        <Card>
          <CardHeader>
            <CardTitle>{t("portfolio.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResourceTable
              rows={data.portfolioItems}
              editBasePath="/portfolio"
              deleteAction={deletePortfolioItemAction}
              columns={[
                { header: t("common.title"), render: (item) => <span className="font-medium text-white">{item.title}</span> },
                { header: t("common.type"), render: (item) => humanize(item.itemType) },
                { header: t("common.date"), render: (item) => fmtDate(item.date) },
                { header: t("opportunities.value"), render: (item) => <Badge>{item.strategicValue}/10</Badge> },
                { header: t("common.status"), render: (item) => humanize(item.status) },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
