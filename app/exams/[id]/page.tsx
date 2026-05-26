import Link from "next/link";
import { addDays, differenceInCalendarDays, format } from "date-fns";
import { ArrowLeft, Brain, Clock, ShieldCheck, Target } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { QuizAttemptForm } from "@/components/forms/entity-forms";
import { DeleteButton } from "@/components/forms/delete-button";
import { getMasteryLevel, masteryKey, MasteryBadge } from "@/components/premium/gamification";
import { GlassCard } from "@/components/premium/glass-card";
import { MetricCard } from "@/components/premium/metric-card";
import { MomentumBar } from "@/components/premium/momentum-bar";
import { ScoreRing } from "@/components/premium/score-ring";
import { ScoreBreakdown } from "@/components/score-breakdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteQuizAttemptAction } from "@/lib/actions/resources";
import { requireUser } from "@/lib/auth/supabase";
import { getExamPageData } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";
import { fmtDate, humanize } from "@/lib/labels";
import { buildExamReadiness } from "@/lib/scoring/engine";

export const dynamic = "force-dynamic";

export default async function ExamCommandCenter({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ editQuiz?: string }> }) {
  const user = await requireUser();
  const { t } = await getI18n();
  const { id } = await params;
  const sp = await searchParams;
  const data = await getExamPageData();
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

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow={t("examRoom.title")}
        title={exam.title}
        description={`${subject?.name ?? t("common.subject")} - ${humanize(exam.format)} - ${fmtDate(exam.examDate)}`}
        actions={
          <Button asChild variant="outline">
            <Link href="/exams">
              <ArrowLeft className="h-4 w-4" />
              {t("exams.title")}
            </Link>
          </Button>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <GlassCard tone={readiness.score < 5 ? "danger" : "violet"} className="grid place-items-center p-8">
          <ScoreRing score={readiness.score} label={t("exams.readiness")} caption={t("common.strategicSignal")} tone={readiness.score < 5 ? "danger" : "violet"} />
          <div className="mt-6 grid w-full gap-3 sm:grid-cols-3">
            <MetricCard title={t("examRoom.countdown")} value={daysLeft ?? "-"} detail={fmtDate(exam.examDate)} icon={Clock} tone="gold" />
            <MetricCard title={t("common.confidence")} value={confidenceAverage.toFixed(1)} detail={t("examRoom.warning")} icon={Brain} tone="cyan" />
            <MetricCard title={t("examRoom.simulation")} value={`${quizAverage.toFixed(0)}%`} detail={`${examQuiz.length} ${t("reviews.title")}`} icon={ShieldCheck} tone="emerald" />
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-xl font-semibold text-text-primary">{t("examRoom.readinessRing")}</h3>
          <div className="mt-5">
            <ScoreBreakdown result={readiness} compact />
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <MomentumBar label={t("exams.readiness")} value={readiness.score * 10} tone="violet" />
            <MomentumBar label={t("common.confidence")} value={confidenceAverage * 10} tone={confidenceAverage > readiness.score + 1 ? "danger" : "cyan"} detail={t("examRoom.warning")} />
          </div>
        </GlassCard>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.86fr]">
        <div className="space-y-5">
          <GlassCard tone="gold">
            <h3 className="text-xl font-semibold text-text-primary">{t("examRoom.last7")}</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {plan.map((item) => (
                <div key={item.date.toISOString()} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                  <div className="text-xs uppercase tracking-[0.14em] text-text-secondary">{format(item.date, "EEE dd")}</div>
                  <div className="mt-3 text-sm font-medium text-text-primary">{item.action}</div>
                </div>
              ))}
            </div>
          </GlassCard>

          <div className="grid gap-5 md:grid-cols-2">
            <GlassCard tone="rose">
              <h3 className="text-xl font-semibold text-text-primary">{t("examRoom.mustDestroy")}</h3>
              <div className="mt-4 space-y-3">
                {mustDestroy.map((error) => (
                  <div key={error.id} className="rounded-2xl border border-danger/20 bg-danger/10 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-text-primary">{error.title}</p>
                      <Badge variant="danger">{error.severity}/10</Badge>
                    </div>
                    <p className="mt-2 text-sm text-text-secondary">{error.preventionRule ?? error.correction ?? error.description}</p>
                  </div>
                ))}
                {mustDestroy.length === 0 ? <p className="text-sm text-text-secondary">{t("command.noOpenErrors")}</p> : null}
              </div>
            </GlassCard>

            <GlassCard tone="cyan">
              <h3 className="text-xl font-semibold text-text-primary">{t("examRoom.last48")}</h3>
              <div className="mt-4 space-y-3">
                {(last48.length ? last48 : [t("topics.suggestedAction")]).map((action) => (
                  <div key={action} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                    <Target className="h-4 w-4 text-cyan" />
                    <p className="text-sm font-medium text-text-primary">{action}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          <GlassCard>
            <h3 className="text-xl font-semibold text-text-primary">{t("topics.title")}</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {examTopics.map((topic) => {
                const level = getMasteryLevel({ confidence: topic.confidence, status: topic.status, openErrors: examErrors.filter((error) => error.topicId === topic.id && !error.resolved).length });
                return (
                  <div key={topic.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-text-primary">{topic.title}</p>
                        <p className="mt-1 text-xs text-text-secondary">{humanize(topic.status)}</p>
                      </div>
                      <MasteryBadge level={level} label={t(masteryKey(level))} />
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
            <h3 className="text-xl font-semibold text-text-primary">{t("examRoom.simulation")}</h3>
            <div className="mt-4 space-y-3">
{examQuiz.map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                  <div>
                    <p className="font-medium text-text-primary">{fmtDate(attempt.date)}</p>
                    <p className="text-xs text-text-secondary">{attempt.correctAnswers}/{attempt.totalQuestions}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{attempt.scorePercent.toFixed(1)}%</Badge>
                    <a
                      href={`/exams/${exam.id}?editQuiz=${attempt.id}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-text-muted hover:bg-bg-subtle hover:text-text-primary transition-colors"
                      aria-label={t("common.edit")}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.844a.5.5 0 0 1-.62-.62l.844-2.872a2 2 0 0 1 .506-.855z"/></svg>
                    </a>
                    <DeleteButton action={deleteQuizAttemptAction} id={attempt.id} label={t("common.delete")} />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-xl font-semibold text-text-primary">{t("study.sessionHistory")}</h3>
            <div className="mt-4 space-y-3">
              {examSessions.slice(0, 6).map((studySession) => (
                <div key={studySession.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                  <div>
                    <p className="font-medium text-text-primary">{humanize(studySession.method)}</p>
                    <p className="text-xs text-text-secondary">{fmtDate(studySession.startedAt)}</p>
                  </div>
                  <Badge variant="violet">{studySession.durationMinutes} {t("common.minutes")}</Badge>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}
