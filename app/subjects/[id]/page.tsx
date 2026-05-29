import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell, PageHeader } from "@/components/app-shell";
import { ScoreBreakdown } from "@/components/score-breakdown";
import { GlassCard } from "@/components/premium/glass-card";
import { MetricCard } from "@/components/premium/metric-card";
import { MomentumBar } from "@/components/premium/momentum-bar";
import { SectionHeader } from "@/components/premium/section-header";
import { MasteryBadge, getMasteryLevel } from "@/components/premium/gamification";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireApprovedUser } from "@/lib/auth/supabase";
import { getSubjectDetailData } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";
import { fmtDate, humanize } from "@/lib/labels";
import { buildMedicalMasteryScore } from "@/lib/scoring/engine";
import { ArrowLeft, BookOpen, Brain, Target, ShieldAlert, TrendingUp, CheckCircle2, AlertTriangle, Calendar, BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SubjectCommandCenterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireApprovedUser();
  const { t } = await getI18n();
  const tt = t as (key: string) => string;
  const { id } = await params;
  const data = await getSubjectDetailData();
  const subject = data.subjects.find((item) => item.id === id);

  if (!subject) {
    notFound();
  }

  const subjectTopics = data.topics.filter((topic) => topic.subjectId === id);
  const subjectSessions = data.studySessions.filter((studySession) => studySession.subjectId === id);
  const subjectReviews = data.reviewItems.filter((review) => review.subjectId === id && review.isActive);
  const subjectErrors = data.errorLogs.filter((error) => error.subjectId === id && !error.resolved);
  const subjectQuizzes = data.quizAttempts.filter((attempt) => attempt.subjectId === id);
  const mastery = buildMedicalMasteryScore({
    topics: subjectTopics,
    studySessions: subjectSessions,
    quizAttempts: subjectQuizzes,
    errorLogs: subjectErrors,
  });
  const weakTopics = subjectTopics
    .slice()
    .sort((a, b) => a.confidence - b.confidence || b.priority - a.priority)
    .slice(0, 8);
  const nextTopic = weakTopics[0];
  const quizAverage =
    subjectQuizzes.length === 0
      ? 0
      : subjectQuizzes.reduce((sum, quiz) => sum + quiz.scorePercent, 0) / subjectQuizzes.length;
  const lastRecall = subjectSessions
    .filter((studySession) => ["active_recall", "quiz", "simulation", "error_review"].includes(studySession.method))
    .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())[0];

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow={subject.code || "Subject"}
        title={subject.name}
        description={tt("subjectCmd.description")}
        actions={
          <Button asChild variant="outline">
            <Link href="/subjects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {tt("subjectCmd.back")}
            </Link>
          </Button>
        }
      />

      <div className="motion-premium flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Topics"
            value={subjectTopics.length}
            icon={BookOpen}
            tone="cyan"
            detail={`${subjectTopics.filter(t => t.status === "exam_ready" || t.status === "consolidated").length} exam-ready`}
          />
          <MetricCard
            label="Reviews Due"
            value={subjectReviews.length}
            icon={Brain}
            tone="gold"
            detail="active cards"
          />
          <MetricCard
            label="Open Errors"
            value={subjectErrors.length}
            icon={ShieldAlert}
            tone={subjectErrors.length > 0 ? "rose" : "emerald"}
            detail={subjectErrors.length > 0 ? "need attention" : "all clear"}
          />
          <MetricCard
            label="Quiz Average"
            value={`${quizAverage.toFixed(0)}%`}
            icon={Target}
            tone="violet"
            detail={`${subjectQuizzes.length} attempts`}
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
          <div className="space-y-5">
            <GlassCard tone="default" padded={false}>
              <div className="p-5 pb-3">
                <SectionHeader
                  title="Weak Topics"
                  description={nextTopic ? `Next: ${nextTopic.title}` : "Add topics to track progress"}
                  icon={AlertTriangle}
                />
              </div>

              {weakTopics.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/10 mb-4">
                    <CheckCircle2 className="h-7 w-7 text-muted" />
                  </div>
                  <p className="text-muted text-center mb-4">No topics yet</p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/topics">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Add Topics
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {weakTopics.map((topic) => {
                    const level = getMasteryLevel({
                      confidence: topic.confidence,
                      status: topic.status,
                      openErrors: subjectErrors.filter((error) => error.topicId === topic.id && !error.resolved).length,
                    });

                    return (
                      <div
                        key={topic.id}
                        className="group flex items-center gap-4 p-5 transition-all duration-200 hover:bg-muted/5"
                      >
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          level === "mastered" || level === "examReady"
                            ? "bg-emerald/10"
                            : level === "dangerous"
                            ? "bg-rose/10"
                            : level === "building"
                            ? "bg-amber/10"
                            : "bg-muted/10"
                        }`}>
                          {level === "mastered" || level === "examReady" ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald" />
                          ) : level === "dangerous" ? (
                            <AlertTriangle className="h-5 w-5 text-rose" />
                          ) : level === "building" ? (
                            <TrendingUp className="h-5 w-5 text-amber" />
                          ) : (
                            <Brain className="h-5 w-5 text-muted" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-text-primary truncate group-hover:text-cyan transition-colors">
                              {topic.title}
                            </h3>
                            <MasteryBadge level={level} label={tt(`mastery.${level}`)} />
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted">
                            <span className="capitalize">{humanize(topic.status)}</span>
                            {topic.nextReviewAt && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {fmtDate(topic.nextReviewAt)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-muted">Conf:</span>
                              <span className={`font-medium ${topic.confidence >= 7 ? "text-emerald" : topic.confidence >= 4 ? "text-amber" : "text-rose"}`}>
                                {topic.confidence}/10
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs mt-1">
                              <span className="text-muted">Prio:</span>
                              <span className={`font-medium ${topic.priority >= 7 ? "text-amber" : "text-muted"}`}>
                                {topic.priority}/10
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>

            {subjectErrors.length > 0 && (
              <GlassCard tone="rose">
                <SectionHeader
                  title="Open Errors"
                  description={`${subjectErrors.length} unresolved`}
                  icon={ShieldAlert}
                />
                <div className="mt-4 space-y-3">
                  {subjectErrors.slice(0, 6).map((error) => (
                    <div key={error.id} className="rounded-xl border border-rose/20 bg-rose/10 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-text-primary">{error.title}</p>
                        <Badge variant="danger">{error.severity}/10</Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted">{error.preventionRule ?? error.correction ?? error.description}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>

          <div className="space-y-5">
            <GlassCard tone="violet">
              <SectionHeader
                title="Mastery Score"
                description="Composite performance indicator"
                icon={BarChart3}
              />
              <div className="mt-4">
                <ScoreBreakdown result={mastery} compact />
              </div>
              <div className="mt-4 grid gap-3">
                {mastery.factors.slice(0, 3).map((factor) => (
                  <MomentumBar
                    key={factor.label}
                    label={factor.label}
                    value={factor.value * 10}
                    tone={factor.direction === "negative" ? "rose" : "cyan"}
                  />
                ))}
              </div>
            </GlassCard>

            <GlassCard tone="neutral">
              <SectionHeader
                title="Subject Info"
                description="Details and stats"
                icon={BookOpen}
              />
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-border/60 bg-bg-page/35 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/10">
                      <TrendingUp className="h-4 w-4 text-muted" />
                    </div>
                    <div>
                      <p className="text-xs text-muted uppercase tracking-wider">Difficulty</p>
                      <p className="font-semibold text-text-primary">{subject.difficulty}/10</p>
                    </div>
                  </div>
                  <div className="h-2 w-20 rounded-full bg-muted/20 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan to-amber"
                      style={{ width: `${subject.difficulty * 10}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border/60 bg-bg-page/35 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/10">
                      <Target className="h-4 w-4 text-muted" />
                    </div>
                    <div>
                      <p className="text-xs text-muted uppercase tracking-wider">Importance</p>
                      <p className="font-semibold text-text-primary">{subject.importance}/10</p>
                    </div>
                  </div>
                  <div className="h-2 w-20 rounded-full bg-muted/20 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet to-emerald"
                      style={{ width: `${subject.importance * 10}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-border/60 bg-bg-page/35 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="h-4 w-4 text-muted" />
                    <p className="text-xs text-muted uppercase tracking-wider">Last Active Recall</p>
                  </div>
                  <p className="font-medium text-text-primary">
                    {lastRecall ? fmtDate(lastRecall.startedAt) : "No sessions yet"}
                  </p>
                </div>

                {subject.description && (
                  <div className="rounded-xl border border-border/60 bg-bg-page/35 p-4">
                    <p className="text-xs text-muted uppercase tracking-wider mb-2">Description</p>
                    <p className="text-sm text-text-secondary leading-relaxed">{subject.description}</p>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
