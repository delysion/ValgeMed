import Link from "next/link";
import { addDays, differenceInCalendarDays } from "date-fns";
import { ArrowLeft, Brain, Clock, ShieldCheck, Target, AlertTriangle, CheckCircle2 } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { QuizAttemptForm } from "@/components/forms/entity-forms";
import { DeleteButton } from "@/components/forms/delete-button";
import { getMasteryLevel, MasteryBadge } from "@/components/premium/gamification";
import { GlassCard } from "@/components/premium/glass-card";
import { MomentumBar } from "@/components/premium/momentum-bar";
import { ScoreRing } from "@/components/premium/score-ring";
import { ScoreBreakdown } from "@/components/score-breakdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteQuizAttemptAction } from "@/lib/actions/resources";
import { requireApprovedUser } from "@/lib/auth/supabase";
import { getEliteTargetSettings, getExamPageData } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";
import { fmtDate, humanize } from "@/lib/labels";
import { buildExamReadiness } from "@/lib/scoring/engine";
import { buildElitePerformanceCommand } from "@/lib/scoring/elite-performance";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function InlineProgress({ value, tone, className }: { value: number; tone: string; className?: string }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-bg-subtle", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-500", tone)}
        style={{ width: `${value * 10}%` }}
      />
    </div>
  );
}

export default async function ExamCommandCenter({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ editQuiz?: string }> }) {
  const user = await requireApprovedUser();
  const { t } = await getI18n();
  const { id } = await params;
  const sp = await searchParams;
  const [data, settings] = await Promise.all([getExamPageData(), getEliteTargetSettings(user.id)]);
  const exam = data.exams.find((item) => item.id === id);

  if (!exam) {
    return (
      <AppShell user={user}>
        <PageHeader title={t("examRoom.notFound")} />
        <Button asChild variant="outline">
          <Link href="/exams">{t("common.back")}</Link>
        </Button>
      </AppShell>
    );
  }

  const subject = data.subjects.find((item) => item.id === exam.subjectId);
  const examTopics = data.topics.filter((topic) => topic.examId === exam.id);
  const examErrors = data.errorLogs.filter((error) => error.examId === exam.id);
  const openErrors = examErrors.filter((error) => !error.resolved);
  const examQuiz = data.quizAttempts.filter((attempt) => attempt.examId === exam.id);
  const editingQuiz = examQuiz.find((attempt) => attempt.id === sp.editQuiz);
  const examSessions = data.studySessions.filter((studySession) => studySession.examId === exam.id);
  const readiness = buildExamReadiness({
    topics: examTopics,
    studySessions: examSessions,
    errorLogs: examErrors,
    quizAttempts: examQuiz,
    dailyLogs: data.dailyLogs,
  });
  const weakTopics = examTopics.slice().sort((a, b) => a.confidence - b.confidence || b.priority - a.priority).slice(0, 6);
  const mustDestroy = openErrors.slice().sort((a, b) => b.severity + b.recurrenceCount - (a.severity + a.recurrenceCount)).slice(0, 4);
  const daysLeft = exam.examDate ? differenceInCalendarDays(exam.examDate, new Date()) : null;
  const plan = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(new Date(), index);
    const weakTopic = weakTopics[index % Math.max(weakTopics.length, 1)];
    const action = index >= 5 ? t("quest.simulateExam") : weakTopic ? `${t("study.activeRecall")}: ${weakTopic.title}` : t("topics.suggestedAction");
    return { date, action };
  });
  const last48 = weakTopics.slice(0, 3).map((topic) => `${t("study.activeRecall")}: ${topic.title}`);
  const quizAverage = examQuiz.length === 0 ? 0 : examQuiz.reduce((sum, attempt) => sum + attempt.scorePercent, 0) / examQuiz.length;
  const confidenceAverage = examTopics.length === 0 ? 0 : examTopics.reduce((sum, topic) => sum + topic.confidence, 0) / examTopics.length;
  const command = buildElitePerformanceCommand({
    settings,
    exams: data.exams.map((item) => ({
      ...item,
      liveReadiness: item.id === exam.id ? readiness.score : item.readinessScore,
    })),
    topics: data.topics,
    studySessions: data.studySessions,
    reviewItems: [],
    errorLogs: data.errorLogs,
    quizAttempts: data.quizAttempts,
    dailyLogs: data.dailyLogs,
  });
  const examPlan = command.examPlans.find((item) => item.examId === exam.id);

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow={t("examRoom.title")}
        title={exam.title}
        description={`${subject?.name ?? t("common.subject")} · ${humanize(exam.format)} · ${fmtDate(exam.examDate)}`}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/exams">
              <ArrowLeft className="h-4 w-4" />
              {t("exams.title")}
            </Link>
          </Button>
        }
      />

      <div className="space-y-5">
        <div className="grid gap-5 xl:grid-cols-[1fr_1.15fr]">
          <GlassCard tone={readiness.score < 5 ? "danger" : "violet"} className="flex flex-col items-center justify-center p-8">
            <ScoreRing
              score={readiness.score}
              label={t("exams.readiness")}
              caption={t("common.strategicSignal")}
              size="xl"
              tone={readiness.score < 5 ? "danger" : "violet"}
              glow={readiness.score >= 7}
            />
            <div className="mt-6 grid w-full grid-cols-3 gap-3">
              <div className="rounded-xl border border-border/50 bg-bg-elevated/40 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <Clock className="h-4 w-4 text-gold" />
                  <span className="font-mono text-xl font-bold text-text-primary">{daysLeft ?? "-"}</span>
                </div>
                <p className="mt-1 text-[10px] text-text-muted">{t("examRoom.countdown")}</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-bg-elevated/40 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <Brain className="h-4 w-4 text-cyan" />
                  <span className="font-mono text-xl font-bold text-text-primary">{confidenceAverage.toFixed(1)}</span>
                </div>
                <p className="mt-1 text-[10px] text-text-muted">{t("common.confidence")}</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-bg-elevated/40 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald" />
                  <span className="font-mono text-xl font-bold text-text-primary">{quizAverage.toFixed(0)}%</span>
                </div>
                <p className="mt-1 text-[10px] text-text-muted">{t("examRoom.simulation")}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-text-primary">{t("examRoom.readinessRing")}</h3>
              <Badge variant="muted" size="sm">{examTopics.length} topics</Badge>
            </div>
            <ScoreBreakdown result={readiness} compact />
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <MomentumBar label={t("exams.readiness")} value={readiness.score * 10} tone="violet" />
              <MomentumBar label={t("common.confidence")} value={confidenceAverage * 10} tone={confidenceAverage > readiness.score + 1 ? "danger" : "cyan"} detail={t("examRoom.warning")} />
            </div>
          </GlassCard>
        </div>

        <GlassCard tone="gold">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Exam Performance Plan</h3>
              <p className="text-xs text-text-muted">Deterministic plan for selected elite target</p>
            </div>
            {examPlan && (
              <Badge variant="gold" size="sm">Gap: {examPlan.eliteReadinessGap.toFixed(1)}</Badge>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border/50 bg-bg-elevated/40 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-text-muted">Readiness gap</p>
              <p className="mt-2 font-mono text-2xl font-bold text-text-primary">{examPlan?.eliteReadinessGap.toFixed(1) ?? "0.0"}</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-bg-elevated/40 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-text-muted">Active recall</p>
              <p className="mt-2 font-mono text-2xl font-bold text-text-primary">{examPlan?.activeRecallCoverage.toFixed(1) ?? "0.0"}</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-bg-elevated/40 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-text-muted">Simulation</p>
              <p className="mt-2 text-sm font-medium text-text-primary">{examPlan?.simulationStatus ?? "Required"}</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-bg-elevated/40 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-text-muted">Recovery</p>
              <p className="mt-2 text-sm font-medium text-text-primary">{examPlan?.recoveryConstraints[0] ?? "Protect recall"}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-border/50 bg-bg-elevated/40 p-4">
              <h4 className="text-xs font-semibold text-text-primary">High-risk topics</h4>
              <ul className="mt-2 space-y-1">
                {(examPlan?.highRiskTopics.length ? examPlan.highRiskTopics : weakTopics.slice(0, 3).map((topic) => topic.title)).map((item) => (
                  <li key={item} className="text-xs text-text-secondary">{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-border/50 bg-bg-elevated/40 p-4">
              <h4 className="text-xs font-semibold text-text-primary">72h pre-exam plan</h4>
              <ul className="mt-2 space-y-1">
                {(examPlan?.seventyTwoHourPlan ?? plan.slice(0, 3).map((item) => item.action)).map((item) => (
                  <li key={item} className="text-xs text-text-secondary">{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-border/50 bg-bg-elevated/40 p-4">
              <h4 className="text-xs font-semibold text-text-primary">Final retest checklist</h4>
              <ul className="mt-2 space-y-1">
                {(examPlan?.finalRetestChecklist ?? last48).map((item) => (
                  <li key={item} className="text-xs text-text-secondary">{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </GlassCard>

        <div className="grid gap-5 lg:grid-cols-2">
          <GlassCard tone="rose">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose" />
              <h3 className="text-base font-semibold text-text-primary">{t("examRoom.mustDestroy")}</h3>
            </div>
            <div className="space-y-3">
              {mustDestroy.length > 0 ? mustDestroy.map((error) => (
                <div key={error.id} className="flex items-start gap-3 rounded-xl border border-rose/20 bg-rose-bg/20 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-text-primary">{error.title}</p>
                      <Badge variant="danger" size="sm">{error.severity}/10</Badge>
                    </div>
                    <p className="mt-1.5 text-xs text-text-secondary line-clamp-2">
                      {error.preventionRule ?? error.correction ?? error.description}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald" />
                  <p className="mt-2 text-sm text-text-secondary">No open errors</p>
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard tone="cyan">
            <div className="mb-4 flex items-center gap-2">
              <Target className="h-4 w-4 text-cyan" />
              <h3 className="text-base font-semibold text-text-primary">{t("examRoom.last48")}</h3>
            </div>
            <div className="space-y-2">
              {(last48.length ? last48 : [t("topics.suggestedAction")]).map((action, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-cyan/20 bg-cyan-bg/20 p-3">
                  <div className="grid h-6 w-6 place-items-center rounded-md bg-cyan/20 text-cyan">
                    <span className="text-xs font-bold">{i + 1}</span>
                  </div>
                  <p className="text-sm font-medium text-text-primary">{action}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_0.86fr]">
          <div className="space-y-5">
            <GlassCard>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-text-primary">{t("topics.title")}</h3>
                <Badge variant="muted" size="sm">{examTopics.length} total</Badge>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {examTopics.map((topic) => {
                  const topicErrors = examErrors.filter((error) => error.topicId === topic.id && !error.resolved).length;
                  const level = getMasteryLevel({ confidence: topic.confidence, status: topic.status, openErrors: topicErrors });
                  return (
                    <div key={topic.id} className="flex items-center justify-between rounded-xl border border-border/50 bg-bg-elevated/40 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-text-primary">{topic.title}</p>
                        <p className="text-xs text-text-muted">{humanize(topic.status)}</p>
                      </div>
                      <div className="ml-3 flex items-center gap-2">
                        <InlineProgress value={topic.confidence} tone="from-cyan to-blue-400" className="w-12" />
                        <MasteryBadge level={level} label={t(`mastery.${level}`)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </div>

          <div className="space-y-5">
            <QuizAttemptForm attempt={editingQuiz} subjects={data.subjects} topics={data.topics} exams={data.exams} examId={exam.id} t={t as (key: string) => string} />

            <GlassCard tone="emerald">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-text-primary">{t("examRoom.simulation")}</h3>
                <Badge variant="muted" size="sm">{examQuiz.length} attempts</Badge>
              </div>
              <div className="space-y-3">
                {examQuiz.map((attempt) => (
                  <div key={attempt.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-bg-elevated/40 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{fmtDate(attempt.date)}</p>
                      <p className="text-xs text-text-muted">{attempt.correctAnswers}/{attempt.totalQuestions}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={attempt.scorePercent >= 70 ? "success" : attempt.scorePercent >= 50 ? "warning" : "danger"}>
                        {attempt.scorePercent.toFixed(1)}%
                      </Badge>
                      <Button asChild variant="ghost" size="icon" className="h-7 w-7">
                        <a href={`/exams/${exam.id}?editQuiz=${attempt.id}`} aria-label={t("common.edit")}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.844a.5.5 0 0 1-.62-.62l.844-2.872a2 2 0 0 1 .506-.855z"/></svg>
                        </a>
                      </Button>
                      <DeleteButton action={deleteQuizAttemptAction} id={attempt.id} label={t("common.delete")} />
                    </div>
                  </div>
                ))}
                {examQuiz.length === 0 && (
                  <p className="py-4 text-center text-sm text-text-muted">No simulation attempts yet</p>
                )}
              </div>
            </GlassCard>

            <GlassCard>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-text-primary">{t("study.sessionHistory")}</h3>
                <Badge variant="muted" size="sm">{examSessions.length} sessions</Badge>
              </div>
              <div className="space-y-2">
                {examSessions.slice(0, 6).map((studySession) => (
                  <div key={studySession.id} className="flex items-center justify-between rounded-xl border border-border/50 bg-bg-elevated/40 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{humanize(studySession.method)}</p>
                      <p className="text-xs text-text-muted">{fmtDate(studySession.startedAt)}</p>
                    </div>
                    <Badge variant="violet" size="sm">{studySession.durationMinutes}m</Badge>
                  </div>
                ))}
                {examSessions.length === 0 && (
                  <p className="py-4 text-center text-sm text-text-muted">No study sessions recorded</p>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}