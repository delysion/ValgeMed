import { AppShell, PageHeader } from "@/components/app-shell";
import { GoalForm, IdentityNoteForm, TaskForm } from "@/components/forms/entity-forms";
import { ResourceTable } from "@/components/tables/resource-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  deleteGoalAction,
  deleteIdentityNoteAction,
  deleteTaskAction,
} from "@/lib/actions/resources";
import { requireUser } from "@/lib/auth/supabase";
import { getGoalPageData } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server";
import { fmtDate, humanize } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function GoalsPage({
  searchParams,
}: {
  searchParams: Promise<{ editGoal?: string; editTask?: string; editNote?: string }>;
}) {
  const user = await requireUser();
  const { t } = await getI18n();
  const params = await searchParams;
  const data = await getGoalPageData();
  const editingGoal = data.goals.find((goal) => goal.id === params.editGoal);
  const editingTask = data.tasks.find((task) => task.id === params.editTask);
  const editingNote = data.identityNotes.find((note) => note.id === params.editNote);

  return (
    <AppShell user={user}>
      <PageHeader title={t("nav.goals")} description={t("strategic.subtitle")} />
      <Tabs defaultValue="goals">
        <TabsList>
          <TabsTrigger value="goals">{t("nav.goals")}</TabsTrigger>
          <TabsTrigger value="tasks">{t("common.nextAction")}</TabsTrigger>
          <TabsTrigger value="identity">{t("nav.identity")}</TabsTrigger>
        </TabsList>

        <TabsContent value="goals">
          <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
            <GoalForm goal={editingGoal} t={t as (key: string) => string} />
            <Card>
              <CardHeader>
                <CardTitle>{t("nav.goals")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResourceTable
                  rows={data.goals}
                  editBasePath="/goals"
                  editParam="editGoal"
                  deleteAction={deleteGoalAction}
                  columns={[
                    { header: t("common.title"), render: (goal) => <span className="font-medium text-text-primary">{goal.title}</span> },
                    { header: t("common.type"), render: (goal) => humanize(goal.goalType) },
                    { header: t("common.date"), render: (goal) => fmtDate(goal.targetDate) },
                    { header: t("common.status"), render: (goal) => <Badge variant={goal.status === "completed" ? "success" : "muted"}>{humanize(goal.status)}</Badge> },
                    { header: t("common.priority"), render: (goal) => `${goal.priority}/10` },
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
            <TaskForm task={editingTask} subjects={data.subjects} exams={data.exams} topics={data.topics} t={t as (key: string) => string} />
            <Card>
              <CardHeader>
                <CardTitle>{t("common.nextAction")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResourceTable
                  rows={data.tasks}
                  editBasePath="/goals"
                  editParam="editTask"
                  deleteAction={deleteTaskAction}
                  columns={[
                    { header: t("common.title"), render: (task) => <span className="font-medium text-text-primary">{task.title}</span> },
                    { header: t("common.date"), render: (task) => fmtDate(task.dueAt) },
                    { header: t("common.status"), render: (task) => humanize(task.status) },
                    { header: t("common.priority"), render: (task) => <Badge>{task.priority}/10</Badge> },
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="identity">
          <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
            <IdentityNoteForm note={editingNote} cancelHref="/goals" t={t as (key: string) => string} />
            <Card>
              <CardHeader>
                <CardTitle>{t("nav.identity")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResourceTable
                  rows={data.identityNotes}
                  editBasePath="/goals"
                  editParam="editNote"
                  deleteAction={deleteIdentityNoteAction}
                  columns={[
                    { header: t("common.title"), render: (note) => <span className="font-medium text-text-primary">{note.title}</span> },
                    { header: t("common.category"), render: (note) => humanize(note.category) },
                    { header: t("common.output"), render: (note) => <span className="line-clamp-2">{note.content}</span> },
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
