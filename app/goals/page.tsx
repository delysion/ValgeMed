import { AppShell, PageHeader } from "@/components/app-shell";
import { GoalForm, IdentityNoteForm, TaskForm } from "@/components/forms/entity-forms";
import { GlassCard } from "@/components/premium/glass-card";
import { MetricCard } from "@/components/premium/metric-card";
import { SectionHeader } from "@/components/premium/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireApprovedUser } from "@/lib/auth/supabase";
import { getGoalPageData } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";
import { TasksList } from "@/components/tasks-list";
import { humanize } from "@/lib/labels";
import {
  Target,
  CheckCircle2,
  Clock,
  Flame,
  Plus,
  ArrowUpRight,
  Calendar,
  Flag,
  ChevronRight,
  BookOpen,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function GoalsPage({
  searchParams,
}: {
  searchParams: Promise<{ editGoal?: string; editTask?: string; editNote?: string }>;
}) {
  const user = await requireApprovedUser();
  const { t } = await getI18n();
  const tt = t as (key: string) => string;
  const params = await searchParams;
  const data = await getGoalPageData();
  const editingGoal = data.goals.find((goal) => goal.id === params.editGoal);
  const editingTask = data.tasks.find((task) => task.id === params.editTask);
  const editingNote = data.identityNotes.find((note) => note.id === params.editNote);

  const totalGoals = data.goals.length;
  const activeGoals = data.goals.filter((g) => g.status === "active").length;
  const completedGoals = data.goals.filter((g) => g.status === "completed").length;
  const overdueGoals = data.goals.filter((g) => {
    if (!g.targetDate || g.status === "completed") return false;
    return new Date(g.targetDate) < new Date();
  }).length;
  const avgPriority = totalGoals > 0
    ? Math.round(data.goals.reduce((acc, g) => acc + g.priority, 0) / totalGoals)
    : 0;

  return (
    <AppShell user={user}>
      <PageHeader
        title={tt("nav.goals")}
        description={tt("strategic.subtitle")}
        actions={
          <Button asChild variant="outline">
            <Link href="/command">
              <ArrowUpRight className="mr-2 h-4 w-4" />
              {tt("command.title")}
            </Link>
          </Button>
        }
      />

      <div className="motion-premium flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Total Goals"
            value={totalGoals}
            icon={Target}
            tone="cyan"
            detail={`${activeGoals} active`}
          />
          <MetricCard
            label="Active"
            value={activeGoals}
            icon={Flame}
            tone="gold"
            detail={`${overdueGoals} overdue`}
          />
          <MetricCard
            label="Completed"
            value={completedGoals}
            icon={CheckCircle2}
            tone="emerald"
            detail={`${totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0}% rate`}
          />
          <MetricCard
            label="Avg Priority"
            value={avgPriority}
            icon={Flag}
            tone="violet"
            detail="out of 10"
          />
        </div>

        <Tabs defaultValue="goals">
          <TabsList>
            <TabsTrigger value="goals">
              <Target className="mr-2 h-4 w-4" />
              {tt("nav.goals")}
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <Clock className="mr-2 h-4 w-4" />
              {tt("common.nextAction")}
            </TabsTrigger>
            <TabsTrigger value="identity">
              <Sparkles className="mr-2 h-4 w-4" />
              {tt("nav.identity")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="goals" className="mt-5">
            <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
              <GlassCard tone="neutral" padded>
                <SectionHeader
                  title={params.editGoal ? "Edit Goal" : "New Goal"}
                  description={params.editGoal ? "Update your goal details" : "Set a new target to chase"}
                  icon={Target}
                />
                <div className="mt-4">
                  <GoalForm goal={editingGoal} t={tt} />
                </div>
              </GlassCard>

              <GlassCard tone="default" padded={false}>
                <div className="flex items-center justify-between p-5 pb-3">
                  <SectionHeader
                    title={tt("nav.goals")}
                    description={`${totalGoals} total`}
                    icon={BookOpen}
                  />
                </div>

                {data.goals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/10 mb-4">
                      <Target className="h-8 w-8 text-muted" />
                    </div>
                    <p className="text-muted text-center mb-4">No goals yet</p>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/goals?newGoal=true">
                        <Plus className="mr-2 h-4 w-4" />
                        Create your first goal
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {data.goals.map((goal) => {
                      const isOverdue = goal.targetDate && new Date(goal.targetDate) < new Date() && goal.status !== "completed";
                      const daysRemaining = goal.targetDate
                        ? Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                        : null;

                      return (
                        <Link
                          key={goal.id}
                          href={`/goals/${goal.id}`}
                          className="group flex items-center gap-4 p-5 transition-all duration-200 hover:bg-muted/5"
                        >
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            goal.status === "completed"
                              ? "bg-emerald/10"
                              : isOverdue
                              ? "bg-rose/10"
                              : "bg-cyan/10"
                          }`}>
                            {goal.status === "completed" ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald" />
                            ) : isOverdue ? (
                              <Clock className="h-5 w-5 text-rose" />
                            ) : (
                              <Target className="h-5 w-5 text-cyan" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-text-primary truncate group-hover:text-cyan transition-colors">
                                {goal.title}
                              </h3>
                              {goal.priority >= 8 && (
                                <span className="shrink-0 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium bg-rose/10 text-rose">
                                  <Flame className="mr-0.5 h-2.5 w-2.5" />
                                  Critical
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted">
                              <span className="uppercase tracking-wider">{humanize(goal.goalType)}</span>
                              {goal.targetDate && (
                                <span className={`flex items-center gap-1 ${isOverdue ? "text-rose" : ""}`}>
                                  <Calendar className="h-3 w-3" />
                                  {isOverdue
                                    ? `${Math.abs(daysRemaining!)}d overdue`
                                    : daysRemaining === 0
                                    ? "Today"
                                    : `${daysRemaining}d left`}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Badge
                              variant={goal.status === "completed" ? "success" : goal.status === "active" ? "default" : "muted"}
                              className="hidden sm:inline-flex"
                            >
                              {humanize(goal.status)}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs font-medium">
                              <Flag className={`h-3 w-3 ${goal.priority >= 7 ? "text-amber" : "text-muted"}`} />
                              {goal.priority}
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </GlassCard>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="mt-5">
            <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
              <GlassCard tone="neutral" padded>
                <SectionHeader
                  title={params.editTask ? "Edit Task" : "New Task"}
                  description={params.editTask ? "Update task details" : "Add an action step"}
                  icon={Clock}
                />
                <div className="mt-4">
                  <TaskForm
                    task={editingTask}
                    subjects={data.subjects}
                    exams={data.exams}
                    topics={data.topics}
                    t={tt}
                  />
                </div>
              </GlassCard>

              <GlassCard tone="default" padded={false}>
                <div className="flex items-center justify-between p-5 pb-3">
                  <SectionHeader
                    title={tt("common.nextAction")}
                    description={`${data.tasks.length} tasks`}
                    icon={Clock}
                  />
                </div>

                {data.tasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/10 mb-4">
                      <CheckCircle2 className="h-8 w-8 text-muted" />
                    </div>
                    <p className="text-muted text-center mb-4">No tasks yet</p>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/goals?newTask=true">
                        <Plus className="mr-2 h-4 w-4" />
                        Create your first task
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <TasksList
                    tasks={data.tasks}
                    labels={{
                      statusTodo: "Todo",
                      statusDoing: "Doing",
                      statusDone: "Done",
                      statusArchived: "Archived",
                      overdue: "overdue",
                      today: "Today",
                      daysLeft: "left",
                      subjectLinked: "Subject linked",
                      noTasks: "No tasks yet",
                      noTasksDesc: "Create your first task",
                    }}
                  />
                )}
              </GlassCard>
            </div>
          </TabsContent>

          <TabsContent value="identity" className="mt-5">
            <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
              <GlassCard tone="neutral" padded>
                <SectionHeader
                  title={params.editNote ? "Edit Note" : "New Identity Note"}
                  description={params.editNote ? "Update your note" : "Capture a piece of who you are"}
                  icon={Sparkles}
                />
                <div className="mt-4">
                  <IdentityNoteForm note={editingNote} cancelHref="/goals" t={tt} />
                </div>
              </GlassCard>

              <GlassCard tone="default" padded={false}>
                <div className="flex items-center justify-between p-5 pb-3">
                  <SectionHeader
                    title={tt("nav.identity")}
                    description={`${data.identityNotes.length} notes`}
                    icon={Sparkles}
                  />
                </div>

                {data.identityNotes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/10 mb-4">
                      <BookOpen className="h-8 w-8 text-muted" />
                    </div>
                    <p className="text-muted text-center mb-4">No identity notes yet</p>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/goals?newNote=true">
                        <Plus className="mr-2 h-4 w-4" />
                        Create your first note
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {data.identityNotes.map((note) => (
                      <Link
                        key={note.id}
                        href={`/memory/${note.id}`}
                        className="group flex items-start gap-4 p-5 transition-all duration-200 hover:bg-muted/5"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet/10">
                          <Sparkles className="h-5 w-5 text-violet" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-text-primary truncate group-hover:text-cyan transition-colors">
                            {note.title}
                          </h3>
                          <p className="text-xs text-muted line-clamp-2 mt-1">{note.content}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="muted" className="text-[10px]">
                              {humanize(note.category)}
                            </Badge>
                          </div>
                        </div>

                        <ChevronRight className="h-4 w-4 text-muted opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all mt-3" />
                      </Link>
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
