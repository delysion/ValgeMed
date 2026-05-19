import { AppShell, PageHeader } from "@/components/app-shell";
import { LifeAdminItemForm } from "@/components/forms/life-forms";
import { ResourceTable } from "@/components/tables/resource-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteLifeAdminItemAction } from "@/lib/actions/resources";
import { requireOwnerSession } from "@/lib/auth/session";
import { getCoreData } from "@/lib/data/queries";
import { fmtDate, humanize } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function LifeAdminPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const session = await requireOwnerSession();
  const params = await searchParams;
  const data = await getCoreData();
  const editing = data.lifeAdminItems.find((item) => item.id === params.edit);

  return (
    <AppShell session={session}>
      <PageHeader title="Life Admin" description="Scadenze e attriti pratici: documenti, housing, salute, universita, travel." />
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <LifeAdminItemForm item={editing} />
        <Card>
          <CardHeader>
            <CardTitle>Life admin items</CardTitle>
          </CardHeader>
          <CardContent>
            <ResourceTable
              rows={data.lifeAdminItems}
              editBasePath="/life-admin"
              deleteAction={deleteLifeAdminItemAction}
              columns={[
                { header: "Item", render: (item) => <span className="font-medium text-white">{item.title}</span> },
                { header: "Categoria", render: (item) => humanize(item.category) },
                { header: "Due", render: (item) => fmtDate(item.dueAt) },
                { header: "Status", render: (item) => <Badge variant={item.status === "done" ? "success" : "muted"}>{humanize(item.status)}</Badge> },
                { header: "Priorita", render: (item) => `${item.priority}/10` },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
