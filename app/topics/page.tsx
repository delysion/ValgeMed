import { Filter, BookOpen, Target, CheckCircle2, AlertTriangle, Brain } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { TopicForm } from "@/components/forms/entity-forms";
import { TopicsGrid } from "@/components/topics-grid";
import { masteryKey, type MasteryLevel } from "@/components/premium/gamification";
import { GlassCard } from "@/components/premium/glass-card";
import { MetricCard } from "@/components/premium/metric-card";
import { Button } from "@/components/ui/button";
import { requireApprovedUser } from "@/lib/auth/supabase";
import { getErrorLogs, getExams, getSubjects, getTopics } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";
import { humanize } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function TopicsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; subject?: string; status?: string; priority?: string }>;
}) {
  const user = await requireApprovedUser();
  const { t } = await getI18n();
  const tt = t as (key: string) => string;
  const params = await searchParams;
  const [subjects, exams, topics, errorLogs] = await Promise.all([getSubjects(), getExams(), getTopics(), getErrorLogs()]);
  const editing = topics.find((topic) => topic.id === params.edit);
  const filteredTopics = topics.filter((topic) => {
    if (params.subject && topic.subjectId !== params.subject) return false;
    if (params.status && topic.status !== params.status) return false;
    if (params.priority && topic.priority < Number(params.priority)) return false;
    return true;
  });

  const totalTopics = topics.length;
  const examReadyTopics = topics.filter((t) => t.status === "exam_ready" || t.status === "consolidated").length;
  const weakTopics = topics.filter((t) => t.confidence <= 4).length;
  const avgPriority = totalTopics > 0
    ? Math.round(topics.reduce((acc, t) => acc + t.priority, 0) / totalTopics)
    : 0;

  return (
    <AppShell user={user}>
      <PageHeader
        title={tt("topics.title")}
        description={tt("topics.subtitle")}
      />

      <div className="motion-premium flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Total Topics"
            value={totalTopics}
            icon={BookOpen}
            tone="cyan"
            detail={`${subjects.length} subjects`}
          />
          <MetricCard
            label="Exam Ready"
            value={examReadyTopics}
            icon={CheckCircle2}
            tone="emerald"
            detail={`${totalTopics > 0 ? Math.round((examReadyTopics / totalTopics) * 100) : 0}% mastery`}
          />
          <MetricCard
            label="Weak Topics"
            value={weakTopics}
            icon={AlertTriangle}
            tone={weakTopics > 0 ? "rose" : "emerald"}
            detail="conf ≤ 4"
          />
          <MetricCard
            label="Avg Priority"
            value={avgPriority}
            icon={Target}
            tone="violet"
            detail="out of 10"
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
          <div className="xl:sticky xl:top-24 xl:self-start">
            <GlassCard tone="neutral" padded>
              <div className="mb-4 flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-cyan/10">
                  <Brain className="h-4 w-4 text-cyan" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">{editing ? "Edit Topic" : "New Topic"}</h3>
                  <p className="text-xs text-text-muted">Add a topic to master</p>
                </div>
              </div>
              <TopicForm topic={editing} subjects={subjects} exams={exams} t={tt} />
            </GlassCard>
          </div>

          <div className="space-y-4">
            <GlassCard tone="default" padded={false}>
              <form method="GET" className="flex flex-wrap items-center gap-3 p-3 sm:p-4">
                <select
                  name="subject"
                  defaultValue={params.subject ?? ""}
                  className="h-9 flex-1 min-w-[140px] rounded-lg border border-border/60 bg-bg-surface px-3 text-sm text-text-primary focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
                >
                  <option value="">{tt("common.subject")}</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
                </select>
                <select
                  name="status"
                  defaultValue={params.status ?? ""}
                  className="h-9 flex-1 min-w-[140px] rounded-lg border border-border/60 bg-bg-surface px-3 text-sm text-text-primary focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
                >
                  <option value="">{tt("common.status")}</option>
                  {["not_started", "first_exposure", "understood", "recalled", "practiced", "error_corrected", "consolidated", "exam_ready"].map((status) => (
                    <option key={status} value={status}>{humanize(status)}</option>
                  ))}
                </select>
                <input
                  name="priority"
                  type="number"
                  min={0}
                  max={10}
                  defaultValue={params.priority ?? ""}
                  placeholder={tt("common.priority")}
                  className="h-9 w-20 rounded-lg border border-border/60 bg-bg-surface px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
                <Button type="submit" variant="outline" size="sm" className="h-9 gap-1.5">
                  <Filter className="h-3.5 w-3.5" />
                  {tt("common.open")}
                </Button>
              </form>
            </GlassCard>

            <TopicsGrid
              topics={filteredTopics}
              subjects={subjects}
              exams={exams}
              errorLogs={errorLogs}
              labels={{
                subject: tt("common.subject"),
                linkedExam: tt("topics.linkedExam"),
                activeRecall: tt("nba.active_recall.title"),
                errorReview: tt("nba.error_review.title"),
                reviews: tt("reviews.title"),
                confidence: tt("common.confidence"),
                priority: tt("common.priority"),
                nextReview: tt("common.nextReview"),
                unresolved: tt("errors.unresolved"),
                open: tt("common.open"),
                edit: tt("common.edit"),
                delete: tt("common.delete"),
                mastery: {
                  dormant: tt(masteryKey("dormant" satisfies MasteryLevel)),
                  awakening: tt(masteryKey("awakening" satisfies MasteryLevel)),
                  building: tt(masteryKey("building" satisfies MasteryLevel)),
                  dangerous: tt(masteryKey("dangerous" satisfies MasteryLevel)),
                  examReady: tt(masteryKey("examReady" satisfies MasteryLevel)),
                  mastered: tt(masteryKey("mastered" satisfies MasteryLevel)),
                },
              }}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}