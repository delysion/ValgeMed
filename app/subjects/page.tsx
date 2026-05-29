import Link from "next/link";

import { AppShell, PageHeader } from "@/components/app-shell";
import { SubjectForm } from "@/components/forms/entity-forms";
import { GlassCard } from "@/components/premium/glass-card";
import { MetricCard } from "@/components/premium/metric-card";
import { SectionHeader } from "@/components/premium/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireApprovedUser } from "@/lib/auth/supabase";
import { getSubjects as fetchSubjects, getTopics } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";
import { BookOpen, Target, TrendingUp, CheckCircle2, ChevronRight, Plus, ArrowUpRight, BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SubjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const user = await requireApprovedUser();
  const { t } = await getI18n();
  const tt = t as (key: string) => string;
  const params = await searchParams;
  const [subjects, topics] = await Promise.all([fetchSubjects(), getTopics()]);
  const editing = subjects.find((subject) => subject.id === params.edit);

  const safeTopics = topics || [];

  const totalTopics = safeTopics.length;
  const examReadyTopics = safeTopics.filter(
    (topic) => topic.status === "exam_ready" || topic.status === "consolidated"
  ).length;
  const avgDifficulty = subjects.length > 0
    ? Math.round(subjects.reduce((acc, s) => acc + s.difficulty, 0) / subjects.length)
    : 0;
  const avgImportance = subjects.length > 0
    ? Math.round(subjects.reduce((acc, s) => acc + s.importance, 0) / subjects.length)
    : 0;

  return (
    <AppShell user={user}>
      <PageHeader
        title={tt("nav.subjects")}
        description={tt("topics.subtitle")}
        actions={
          <Button asChild variant="outline">
            <Link href="/topics">
              <ArrowUpRight className="mr-2 h-4 w-4" />
              View Topics
            </Link>
          </Button>
        }
      />

      <div className="motion-premium flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Total Subjects"
            value={subjects.length}
            icon={BookOpen}
            tone="cyan"
            detail={`${totalTopics} topics`}
          />
          <MetricCard
            label="Topics Covered"
            value={examReadyTopics}
            icon={CheckCircle2}
            tone="emerald"
            detail={`${totalTopics > 0 ? Math.round((examReadyTopics / totalTopics) * 100) : 0}% mastery`}
          />
          <MetricCard
            label="Avg Difficulty"
            value={avgDifficulty}
            icon={Target}
            tone="gold"
            detail="out of 10"
          />
          <MetricCard
            label="Avg Importance"
            value={avgImportance}
            icon={TrendingUp}
            tone="violet"
            detail="out of 10"
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
          <GlassCard tone="neutral" padded>
            <SectionHeader
              title={editing ? "Edit Subject" : "New Subject"}
              description={editing ? "Update subject details" : "Add a new subject to track"}
              icon={BookOpen}
            />
            <div className="mt-4">
              <SubjectForm subject={editing} t={tt} />
            </div>
          </GlassCard>

          <GlassCard tone="default" padded={false}>
            <div className="flex items-center justify-between p-5 pb-3">
              <SectionHeader
                title={tt("nav.subjects")}
                description={`${subjects.length} subjects`}
                icon={BarChart3}
              />
            </div>

            {subjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/10 mb-4">
                  <BookOpen className="h-8 w-8 text-muted" />
                </div>
                <p className="text-muted text-center mb-4">No subjects yet</p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/subjects?newSubject=true">
                    <Plus className="mr-2 h-4 w-4" />
                    Add your first subject
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {subjects.map((subject) => {
                  const subjectTopics = safeTopics.filter((topic) => topic.subjectId === subject.id);
                  const ready = subjectTopics.filter(
                    (topic) => topic.status === "exam_ready" || topic.status === "consolidated"
                  ).length;
                  const progress = subjectTopics.length === 0
                    ? 0
                    : Math.round((ready / subjectTopics.length) * 100);
                  const color = subject.color ?? "#58D0E8";

                  return (
                    <Link
                      key={subject.id}
                      href={`/subjects/${subject.id}`}
                      className="group flex items-center gap-4 p-5 transition-all duration-200 hover:bg-muted/5"
                    >
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-text-primary truncate group-hover:text-cyan transition-colors">
                            {subject.name}
                          </h3>
                          {subject.code && (
                            <Badge variant="muted" className="text-[10px]">
                              {subject.code}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted">
                          <span>{subjectTopics.length} topics</span>
                          {progress > 0 && (
                            <span className="flex items-center gap-1">
                              <div className="h-1.5 w-16 rounded-full bg-muted/20 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-cyan to-emerald"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              {progress}%
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-xs">
                          <Badge variant="muted" className="hidden sm:inline-flex">
                            Diff: {subject.difficulty}
                          </Badge>
                          <Badge className="hidden sm:inline-flex">
                            Imp: {subject.importance}
                          </Badge>
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
      </div>
    </AppShell>
  );
}
