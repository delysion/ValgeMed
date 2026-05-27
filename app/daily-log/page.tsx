import { AppShell, PageHeader } from "@/components/app-shell";
import { TrendLineChart } from "@/components/charts/study-charts";
import { DailyLogForm } from "@/components/forms/entity-forms";
import { ResourceTable } from "@/components/tables/resource-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteDailyLogAction } from "@/lib/actions/resources";
import { requireApprovedUser } from "@/lib/auth/supabase";
import { getDailyLogs } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";
import { fmtDate } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function DailyLogPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const user = await requireApprovedUser();
  const { t } = await getI18n();
  const params = await searchParams;
  const dailyLogs = await getDailyLogs();
  const editing = dailyLogs.find((log) => log.id === params.edit);
  const trend = dailyLogs
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
    <AppShell user={user}>
      <PageHeader title={t("nav.dailyLog")} description={t("health.subtitle")} />
      <div className="grid gap-4 xl:grid-cols-[460px_1fr]">
        <DailyLogForm log={editing} t={t as (key: string) => string} />
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("gamification.readinessTrend")}</CardTitle>
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
              <CardTitle>{t("nav.dailyLog")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResourceTable
                rows={dailyLogs}
                editBasePath="/daily-log"
                deleteAction={deleteDailyLogAction}
                columns={[
                  { header: t("common.date"), render: (log) => fmtDate(log.date) },
                  { header: t("health.sleep"), render: (log) => log.sleepHours ?? "-" },
                  { header: t("command.energySignal"), render: (log) => <Badge>{log.energyLevel ?? "-"}</Badge> },
                  { header: t("health.stress"), render: (log) => <Badge variant={(log.stressLevel ?? 0) >= 7 ? "danger" : "muted"}>{log.stressLevel ?? "-"}</Badge> },
                  { header: t("study.title"), render: (log) => `${log.studyMinutes} ${t("common.minutes").toLowerCase()}` },
                  { header: t("dashboard.activeVsPassive"), render: (log) => `${log.activeRecallMinutes}/${log.passiveStudyMinutes}` },
                ]}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
