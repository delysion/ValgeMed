import Link from "next/link";
import { differenceInCalendarDays, startOfToday } from "date-fns";
import { ArrowRight, Edit3, ShieldCheck, Calendar } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { DeleteButton } from "@/components/forms/delete-button";
import { ExamForm } from "@/components/forms/entity-forms";
import { GlassCard } from "@/components/premium/glass-card";
import { ScoreRing } from "@/components/premium/score-ring";
import { RiskBadge } from "@/components/premium/gamification";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteExamAction } from "@/lib/actions/resources";
import { requireApprovedUser } from "@/lib/auth/supabase";
import { getExamPageData } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";
import { fmtDate, humanize } from "@/lib/labels";
import { buildExamReadiness } from "@/lib/scoring/engine";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function AnimatedProgress({ value, tone }: { value: number; tone: string }) {
  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-bg-subtle">
      <div
        className={cn("h-full rounded-full transition-all duration-1000 ease-out", tone)}
        style={{ width: `${value * 10}%` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </div>
  );
}

function GlowOrb({ color, className }: { color: string; className?: string }) {
  return (
    <div
      className={cn("absolute -inset-20 rounded-full blur-[80px] opacity-20 pointer-events-none", className)}
      style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }}
    />
  );
}

export default async function ExamsPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const user = await requireApprovedUser();
  const { t } = await getI18n();
  const params = await searchParams;
  const data = await getExamPageData();
  const editing = data.exams.find((exam) => exam.id === params.edit);
  const subjectById = new Map(data.subjects.map((subject) => [subject.id, subject]));
  const today = startOfToday();

  const examRows = data.exams.map((exam) => {
    const readiness = buildExamReadiness({
      topics: data.topics.filter((topic) => topic.examId === exam.id),
      studySessions: data.studySessions.filter((studySession) => studySession.examId === exam.id),
      errorLogs: data.errorLogs.filter((error) => error.examId === exam.id),
      quizAttempts: data.quizAttempts.filter((attempt) => attempt.examId === exam.id),
      dailyLogs: data.dailyLogs,
    });
    const linkedTopics = data.topics.filter((topic) => topic.examId === exam.id);
    const weakTopics = linkedTopics.filter((topic) => topic.confidence <= 4);
    const openErrors = data.errorLogs.filter((error) => error.examId === exam.id && !error.resolved);

    return { ...exam, liveReadiness: readiness.score, linkedTopics, weakTopics, openErrors };
  });

  const avgReadiness = examRows.length > 0
    ? examRows.reduce((sum, exam) => sum + exam.liveReadiness, 0) / examRows.length
    : 0;

  return (
    <AppShell user={user}>
      <PageHeader
        title={t("exams.title")}
        description={t("exams.subtitle")}
        actions={
          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-bg-surface/60 px-4 py-2">
            <span className="text-xs text-text-muted">Avg Readiness</span>
            <span className="font-mono text-lg font-bold text-text-primary">{avgReadiness.toFixed(1)}</span>
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[340px_1fr]">
        <div className="xl:sticky xl:top-24 xl:self-start">
          <GlassCard tone="neutral" padded>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-text-primary">{editing ? "Edit Exam" : "New Exam"}</h3>
              <p className="text-xs text-text-muted">Track your exam readiness</p>
            </div>
            <ExamForm exam={editing} subjects={data.subjects} t={t as (key: string) => string} />
          </GlassCard>
        </div>

        <div className="space-y-4">
          {examRows.length === 0 ? (
            <GlassCard>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-bg-subtle">
                  <Calendar className="h-6 w-6 text-text-muted" />
                </div>
                <p className="mt-4 text-sm font-medium text-text-primary">No exams yet</p>
                <p className="mt-1 text-xs text-text-secondary">Add your first exam to start tracking readiness</p>
              </div>
            </GlassCard>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {examRows.map((exam) => {
                const daysLeft = exam.examDate ? differenceInCalendarDays(exam.examDate, today) : null;
                const isHighRisk = exam.riskLevel >= 7;
                const isLowReadiness = exam.liveReadiness < 5;
                const isUrgent = daysLeft !== null && daysLeft <= 7;
                const isCritical = isHighRisk && isLowReadiness;

                const cardTone = isCritical ? "danger" : isHighRisk ? "rose" : isLowReadiness ? "gold" : "violet";
                const ringTone = isLowReadiness ? "danger" : "cyan";
                const progressTone = isLowReadiness ? "from-rose to-red-400" : "from-cyan to-blue-400";
                const glowColor = isCritical ? "#E07888" : isHighRisk ? "#E07888" : isLowReadiness ? "#E0A848" : "#98A8E8";

                return (
                  <GlassCard
                    key={exam.id}
                    tone={cardTone}
                    hover
                    className="relative flex flex-col gap-4 overflow-hidden"
                  >
                    <GlowOrb color={glowColor} className={cn("opacity-10", isCritical && "opacity-20")} />

                    <div className="relative flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <Badge variant="muted" size="sm">
                          {subjectById.get(exam.subjectId)?.name ?? t("common.subject")}
                        </Badge>
                        <h3 className="mt-2 text-lg font-bold text-text-primary">{exam.title}</h3>
                        <p className="mt-0.5 text-xs text-text-secondary">
                          {humanize(exam.format)} · {fmtDate(exam.examDate)}
                        </p>
                      </div>
                      <RiskBadge value={exam.riskLevel} labels={{ low: t("risk.low"), medium: t("risk.medium"), high: t("risk.high"), critical: t("risk.critical") }} />
                    </div>

                    <div className="relative flex items-center gap-4">
                      <div className="relative">
                        <ScoreRing
                          score={exam.liveReadiness}
                          label={t("exams.readiness")}
                          size="sm"
                          tone={ringTone}
                          glow={exam.liveReadiness >= 7}
                        />
                        {isUrgent && (
                          <div className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose opacity-75" />
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-rose" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-[10px] font-medium text-text-secondary">Readiness</span>
                          <span className="font-mono text-[10px] font-bold text-text-primary">{exam.liveReadiness.toFixed(1)}/10</span>
                        </div>
                        <AnimatedProgress value={exam.liveReadiness} tone={progressTone} />

                        <div className="mt-3 grid grid-cols-3 gap-2">
                          <div className="rounded-lg border border-border/40 bg-bg-elevated/40 px-2 py-2 text-center backdrop-blur-sm">
                            <p className={cn("text-sm font-bold tabular-nums", isUrgent ? "text-rose" : "text-text-primary")}>
                              {daysLeft ?? "-"}
                            </p>
                            <p className="text-[9px] font-medium text-text-secondary">days left</p>
                          </div>
                          <div className="rounded-lg border border-border/40 bg-bg-elevated/40 px-2 py-2 text-center backdrop-blur-sm">
                            <p className={cn("text-sm font-bold tabular-nums", exam.openErrors.length > 0 ? "text-rose" : "text-emerald")}>
                              {exam.openErrors.length}
                            </p>
                            <p className="text-[9px] font-medium text-text-secondary">open errors</p>
                          </div>
                          <div className="rounded-lg border border-border/40 bg-bg-elevated/40 px-2 py-2 text-center backdrop-blur-sm">
                            <p className="text-sm font-bold tabular-nums text-text-primary">{exam.linkedTopics.length}</p>
                            <p className="text-[9px] font-medium text-text-secondary">topics</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {exam.weakTopics.length > 0 && (
                      <div className="relative flex flex-wrap gap-1.5">
                        {exam.weakTopics.slice(0, 3).map((topic) => (
                          <Badge key={topic.id} variant="danger" size="sm" className="animate-pulse-slow">{topic.title}</Badge>
                        ))}
                        {exam.weakTopics.length > 3 && (
                          <Badge variant="ghost" size="sm">+{exam.weakTopics.length - 3}</Badge>
                        )}
                      </div>
                    )}

                    <div className="relative mt-auto flex items-center justify-between gap-3 border-t border-border/40 pt-4">
                      <Button asChild size="sm" className="gap-1.5">
                        <Link href={`/exams/${exam.id}`}>
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {t("exams.cardAction")}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <div className="flex items-center gap-1">
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8" aria-label={t("common.edit")}>
                          <Link href={`/exams?edit=${exam.id}`}>
                            <Edit3 className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DeleteButton action={deleteExamAction} id={exam.id} label={t("common.delete")} />
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
