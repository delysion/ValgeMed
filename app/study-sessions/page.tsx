import { AppShell, PageHeader } from "@/components/app-shell";
import { StudySessionForm } from "@/components/forms/entity-forms";
import { MethodPieChart, MinutesBarChart } from "@/components/charts/study-charts";
import { ResourceTable } from "@/components/tables/resource-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteStudySessionAction } from "@/lib/actions/resources";
import { requireOwnerSession } from "@/lib/auth/session";
import { getCoreData } from "@/lib/data/queries";
import { fmtDate, humanize } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function StudySessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const session = await requireOwnerSession();
  const params = await searchParams;
  const data = await getCoreData();
  const editing = data.studySessions.find((item) => item.id === params.edit);
  const subjectById = new Map(data.subjects.map((subject) => [subject.id, subject]));
  const methodTotals = Object.entries(
    data.studySessions.reduce<Record<string, number>>((acc, item) => {
      acc[item.method] = (acc[item.method] ?? 0) + item.durationMinutes;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name: humanize(name), value }));
  const dayTotals = Object.entries(
    data.studySessions.slice(0, 80).reduce<Record<string, number>>((acc, item) => {
      const key = item.startedAt.toISOString().slice(5, 10);
      acc[key] = (acc[key] ?? 0) + item.durationMinutes;
      return acc;
    }, {}),
  )
    .map(([name, minutes]) => ({ name, minutes }))
    .slice(-14);
  const activeMethods = new Set(["active_recall", "quiz", "simulation", "error_review"]);
  const activeMinutes = data.studySessions
    .filter((item) => activeMethods.has(item.method))
    .reduce((sum, item) => sum + item.durationMinutes, 0);
  const passiveMinutes = data.studySessions
    .filter((item) => ["reading", "notes"].includes(item.method))
    .reduce((sum, item) => sum + item.durationMinutes, 0);

  return (
    <AppShell session={session}>
      <PageHeader title="Study sessions" description="Metodo, output e rapporto active/passive." />
      <div className="grid gap-4 xl:grid-cols-[460px_1fr]">
        <StudySessionForm session={editing} subjects={data.subjects} topics={data.topics} exams={data.exams} />
        <div className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Active vs passive</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <span className="font-mono text-4xl text-white">{activeMinutes}</span>
                  <span className="pb-1 text-sm text-muted">active min</span>
                </div>
                <div className="mt-2 text-sm text-muted">{passiveMinutes} passive min</div>
              </CardContent>
            </Card>
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>Minutes by day</CardTitle>
              </CardHeader>
              <CardContent>
                <MinutesBarChart data={dayTotals} />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <MethodPieChart data={methodTotals} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Session list</CardTitle>
              </CardHeader>
              <CardContent>
                <ResourceTable
                  rows={data.studySessions}
                  editBasePath="/study-sessions"
                  deleteAction={deleteStudySessionAction}
                  columns={[
                    { header: "Data", render: (item) => fmtDate(item.startedAt) },
                    { header: "Materia", render: (item) => subjectById.get(item.subjectId)?.name ?? "-" },
                    { header: "Metodo", render: (item) => humanize(item.method) },
                    { header: "Minuti", render: (item) => <Badge>{item.durationMinutes}</Badge> },
                    { header: "Focus", render: (item) => `${item.focusLevel}/10` },
                    { header: "Output", render: (item) => `${item.outputQuality}/10` },
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
