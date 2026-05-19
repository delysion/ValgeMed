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
import { requireOwnerSession } from "@/lib/auth/session";
import { getCoreData } from "@/lib/data/queries";
import { fmtDate, humanize } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function GoalsPage({
  searchParams,
}: {
  searchParams: Promise<{ editGoal?: string; editTask?: string; editNote?: string }>;
}) {
  const session = await requireOwnerSession();
  const params = await searchParams;
  const data = await getCoreData();
  const editingGoal = data.goals.find((goal) => goal.id === params.editGoal);
  const editingTask = data.tasks.find((task) => task.id === params.editTask);
  const editingNote = data.identityNotes.find((note) => note.id === params.editNote);

  return (
    <AppShell session={session}>
      <PageHeader title="Goals" description="Obiettivi, task e identita professionale." />
      <Tabs defaultValue="goals">
        <TabsList>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="identity">Identity</TabsTrigger>
        </TabsList>

        <TabsContent value="goals">
          <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
            <GoalForm goal={editingGoal} />
            <Card>
              <CardHeader>
                <CardTitle>Goal list</CardTitle>
              </CardHeader>
              <CardContent>
                <ResourceTable
                  rows={data.goals}
                  editBasePath="/goals"
                  editParam="editGoal"
                  deleteAction={deleteGoalAction}
                  columns={[
                    { header: "Goal", render: (goal) => <span className="font-medium text-white">{goal.title}</span> },
                    { header: "Tipo", render: (goal) => humanize(goal.goalType) },
                    { header: "Target", render: (goal) => fmtDate(goal.targetDate) },
                    { header: "Status", render: (goal) => <Badge variant={goal.status === "completed" ? "success" : "muted"}>{humanize(goal.status)}</Badge> },
                    { header: "Priorita", render: (goal) => `${goal.priority}/10` },
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
            <TaskForm task={editingTask} subjects={data.subjects} exams={data.exams} topics={data.topics} />
            <Card>
              <CardHeader>
                <CardTitle>Task list</CardTitle>
              </CardHeader>
              <CardContent>
                <ResourceTable
                  rows={data.tasks}
                  editBasePath="/goals"
                  editParam="editTask"
                  deleteAction={deleteTaskAction}
                  columns={[
                    { header: "Task", render: (task) => <span className="font-medium text-white">{task.title}</span> },
                    { header: "Due", render: (task) => fmtDate(task.dueAt) },
                    { header: "Status", render: (task) => humanize(task.status) },
                    { header: "Priorita", render: (task) => <Badge>{task.priority}/10</Badge> },
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="identity">
          <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
            <IdentityNoteForm note={editingNote} cancelHref="/goals" />
            <Card>
              <CardHeader>
                <CardTitle>Identity notes</CardTitle>
              </CardHeader>
              <CardContent>
                <ResourceTable
                  rows={data.identityNotes}
                  editBasePath="/goals"
                  editParam="editNote"
                  deleteAction={deleteIdentityNoteAction}
                  columns={[
                    { header: "Titolo", render: (note) => <span className="font-medium text-white">{note.title}</span> },
                    { header: "Categoria", render: (note) => humanize(note.category) },
                    { header: "Contenuto", render: (note) => <span className="line-clamp-2">{note.content}</span> },
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
