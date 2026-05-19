import { AppShell, PageHeader } from "@/components/app-shell";
import { HealthLogForm } from "@/components/forms/life-forms";
import { ResourceTable } from "@/components/tables/resource-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteHealthLogAction } from "@/lib/actions/resources";
import { requireOwnerSession } from "@/lib/auth/session";
import { getCoreData } from "@/lib/data/queries";
import { fmtDate } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function HealthPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const session = await requireOwnerSession();
  const params = await searchParams;
  const data = await getCoreData();
  const editing = data.healthLogs.find((log) => log.id === params.edit);

  return (
    <AppShell session={session}>
      <PageHeader title="Health / Energy" description="Energy Integrity: sonno, recovery, fatica cognitiva, movimento e cibo." />
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <HealthLogForm log={editing} />
        <Card>
          <CardHeader>
            <CardTitle>Health logs</CardTitle>
          </CardHeader>
          <CardContent>
            <ResourceTable
              rows={data.healthLogs}
              editBasePath="/health"
              deleteAction={deleteHealthLogAction}
              columns={[
                { header: "Data", render: (log) => <span className="font-medium text-white">{fmtDate(log.date)}</span> },
                { header: "Sleep", render: (log) => log.sleepQuality ?? "-" },
                { header: "Fatica", render: (log) => log.cognitiveFatigue ?? "-" },
                { header: "Recovery", render: (log) => log.recoveryQuality ?? "-" },
                { header: "Energy Integrity", render: (log) => <Badge>{log.energyIntegrityScore}/10</Badge> },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
