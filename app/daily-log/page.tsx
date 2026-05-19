import { AppShell, PageHeader } from "@/components/app-shell";
import { TrendLineChart } from "@/components/charts/study-charts";
import { DailyLogForm } from "@/components/forms/entity-forms";
import { ResourceTable } from "@/components/tables/resource-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteDailyLogAction } from "@/lib/actions/resources";
import { requireOwnerSession } from "@/lib/auth/session";
import { getCoreData } from "@/lib/data/queries";
import { fmtDate } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function DailyLogPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const session = await requireOwnerSession();
  const params = await searchParams;
  const data = await getCoreData();
  const editing = data.dailyLogs.find((log) => log.id === params.edit);
  const trend = data.dailyLogs
    .slice()
    .reverse()
    .slice(-30)
    .map((log) => ({
      date: log.date.slice(5),
      energy: log.energyLevel,
      stress: log.stressLevel,
      mood: log.moodLevel,
      sleep: log.sleepHours,
    }));

  return (
    <AppShell session={session}>
      <PageHeader title="Daily log" description="Energia, sonno, stress e minuti di studio." />
      <div className="grid gap-4 xl:grid-cols-[460px_1fr]">
        <DailyLogForm log={editing} />
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendLineChart
                data={trend}
                lines={[
                  { key: "energy", color: "#a8d8ff" },
                  { key: "stress", color: "#fca5a5" },
                  { key: "mood", color: "#b9a7ff" },
                  { key: "sleep", color: "#d8dee9" },
                ]}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <ResourceTable
                rows={data.dailyLogs}
                editBasePath="/daily-log"
                deleteAction={deleteDailyLogAction}
                columns={[
                  { header: "Data", render: (log) => fmtDate(log.date) },
                  { header: "Sonno", render: (log) => log.sleepHours ?? "-" },
                  { header: "Energia", render: (log) => <Badge>{log.energyLevel ?? "-"}</Badge> },
                  { header: "Stress", render: (log) => <Badge variant={(log.stressLevel ?? 0) >= 7 ? "danger" : "muted"}>{log.stressLevel ?? "-"}</Badge> },
                  { header: "Study", render: (log) => `${log.studyMinutes} min` },
                  { header: "Recall/passive", render: (log) => `${log.activeRecallMinutes}/${log.passiveStudyMinutes}` },
                ]}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
