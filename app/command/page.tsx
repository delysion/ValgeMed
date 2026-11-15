import Link from "next/link";
import { AlertTriangle, ArrowRight, ChevronDown, Gauge, ShieldCheck, Target, Zap } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { DailyLogForm } from "@/components/forms/entity-forms";
import { GlassCard } from "@/components/premium/glass-card";
import { MetricCard } from "@/components/premium/metric-card";
import { MomentumBar } from "@/components/premium/momentum-bar";
import { ScoreRing } from "@/components/premium/score-ring";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { requireApprovedUser } from "@/lib/auth/supabase";
import { getCommandPageData, getEliteTargetSettings } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";
import {
  buildElitePerformanceCommand,
  type PerformanceBlocker,
  type PerformanceThreat,
  type WinningMove,
} from "@/lib/scoring/elite-performance";
import { SmartInputWrapper } from "@/components/smart-input-wrapper";
import { QuickActions } from "@/components/quick-actions";
import { tallinnDate } from "@/lib/dates";

export const dynamic = "force-dynamic";

function pct(score: number) {
  return `${Math.round(score * 10)}%`;
}

type Translate = (key: string, params?: Record<string, string | number>) => string;

function localizeMove(move: WinningMove, t: Translate) {
  const label = move.linkedLabel ?? "";
  switch (move.kind) {
    case "recovery":
      return {
        ...move,
        title: t("command.move.recovery.title"),
        reason: t("command.move.recovery.reason"),
        expectedImpact: t("command.move.recovery.expectedImpact"),
        dangerIfIgnored: t("command.move.recovery.danger"),
        cta: t("command.move.recovery.cta"),
      };
    case "error_review":
      return {
        ...move,
        title: t("command.move.errorReview.title", { label }),
        reason: t("command.move.errorReview.reason"),
        expectedImpact: t("command.move.errorReview.expectedImpact"),
        dangerIfIgnored: t("command.move.errorReview.danger"),
        cta: t("command.move.errorReview.cta"),
      };
    case "simulation":
      return {
        ...move,
        title: t("command.move.simulation.title", { label }),
        reason: t("command.move.simulation.reason"),
        expectedImpact: t("command.move.simulation.expectedImpact"),
        dangerIfIgnored: t("command.move.simulation.danger"),
        cta: t("command.move.simulation.cta"),
      };
    case "spaced_review":
      return {
        ...move,
        title: t("command.move.spacedReview.title"),
        reason: t("command.move.spacedReview.reason"),
        expectedImpact: t("command.move.spacedReview.expectedImpact"),
        dangerIfIgnored: t("command.move.spacedReview.danger"),
        cta: t("command.move.spacedReview.cta"),
      };
    case "priority_topic":
    case "active_recall":
    default:
      return {
        ...move,
        title: label ? t("command.move.activeRecall.titleWithLabel", { label }) : t("command.move.activeRecall.title"),
        reason: label ? t("command.move.activeRecall.reasonWithLabel") : t("command.move.activeRecall.reason"),
        expectedImpact: t("command.move.activeRecall.expectedImpact"),
        dangerIfIgnored: t("command.move.activeRecall.danger"),
        cta: t("command.move.activeRecall.cta"),
      };
  }
}

function localizeScoreLabel(label: string, t: Translate) {
  if (label === "Top Performance Mode") return t("command.score.topPerformance");
  if (label === "Elite trajectory") return t("command.score.eliteTrajectory");
  if (label === "Fragile but workable") return t("command.score.fragile");
  return t("command.score.performanceLeak");
}

function localizeThreat(threat: PerformanceThreat, t: Translate) {
  if (threat.type === "open_critical_error") {
    return { title: threat.title, detail: t("command.threat.openCritical.detail") };
  }
  if (threat.type === "low_active_recall") {
    return { title: t("command.threat.lowActiveRecall.title"), detail: t("command.threat.lowActiveRecall.detail") };
  }
  if (threat.type === "passive_study_overload") {
    return { title: t("command.threat.passiveStudy.title"), detail: t("command.threat.passiveStudy.detail") };
  }
  if (threat.type === "excessive_fatigue") {
    return { title: t("command.threat.fatigue.title"), detail: t("command.threat.fatigue.detail") };
  }
  if (threat.type === "no_simulation_close_to_exam") {
    const exam = threat.title.replace("No simulation close to ", "");
    return { title: t("command.threat.noSimulation.title", { exam }), detail: t("command.threat.noSimulation.detail") };
  }
  return { title: threat.title, detail: threat.detail };
}

function localizeBlockerAction(blocker: PerformanceBlocker, t: Translate) {
  if (blocker.status === "destroyed") return t("blockers.action.destroyed");
  return blocker.recurrenceCount > 0 ? t("blockers.action.error") : t("blockers.action.topic");
}

export default async function CommandPage() {
  const user = await requireApprovedUser();
  const { t, locale } = await getI18n();
  const now = new Date();
  const tt = t as Translate;
  const [data, settings] = await Promise.all([
    getCommandPageData(user.id),
    getEliteTargetSettings(user.id),
  ]);

  const command = buildElitePerformanceCommand({
    settings,
    now,
    exams: data.exams,
    topics: data.topics,
    studySessions: data.studySessions,
    reviewItems: data.reviewItems,
    errorLogs: data.errorLogs,
    quizAttempts: data.quizAttempts,
    dailyLogs: data.dailyLogs,
    healthLogs: data.healthLogs,
  });

  const todayKey = tallinnDate(now);
  const todayLog = data.dailyLogs.find((log) => log.date === todayKey) ?? null;
  const setupSteps = [
    { href: "/subjects", label: "command.setupFirstSubject", help: "command.setupSubjectHelp", done: data.subjects.length > 0 },
    { href: "/exams", label: "command.setupFirstExam", help: "command.setupExamHelp", done: data.exams.length > 0 },
    { href: "/study", label: "command.setupFirstSession", help: "command.setupSessionHelp", done: data.studySessions.length > 0 },
  ];
  const nextStep = setupSteps.find((step) => !step.done);
  const lowData = !data.subjects.length || !data.topics.length || !data.studySessions.length;
  const move = command.winningMove;
  const showSetup = nextStep && data.studySessions.length === 0 && move.kind !== "recovery";
  const localizedMove = localizeMove(move, tt);
  const snapshot = command.snapshot;
  const nextExam = data.exams
    .filter((exam) => exam.examDate && tallinnDate(exam.examDate) >= todayKey)
    .sort((a, b) => a.examDate!.getTime() - b.examDate!.getTime())[0];
  const nextExamPlan = command.examPlans.find((plan) => plan.examId === nextExam?.id);
  const examDateLabel = nextExam?.examDate && new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: "Europe/Tallinn",
  }).format(nextExam.examDate);
  const dueReviews = data.reviewItems.filter((item) => item.isActive && item.dueAt <= now).length;

  return (
    <AppShell user={user}>
      <PageHeader title={tt("command.title")} />
      <div className="flex min-w-0 flex-col gap-4">
        <div className="grid min-w-0 gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <section className="min-w-0 rounded-panel border border-border border-t-2 border-t-primary bg-bg-surface px-5 py-5 shadow-panel sm:px-7 sm:py-6" aria-labelledby="command-priority">
            <p className="text-ui-label font-semibold text-primary">{tt("command.todaysWinningMove")}</p>
            <h2 id="command-priority" className="mt-2 text-balance text-2xl font-semibold leading-tight tracking-tight text-text-primary sm:text-4xl">
              {showSetup ? tt(nextStep.label) : localizedMove.title}
            </h2>
            <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-text-secondary sm:text-base">
              {showSetup ? tt(nextStep.help) : localizedMove.reason}
            </p>
            {command.recoveryWarning && (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-rose">
                <strong>{tt("command.recoveryWarningTitle")}.</strong>{" "}{tt("command.recoveryWarningMessage")}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <Button asChild size="lg" className="h-auto min-h-control-lg max-w-full gap-2 whitespace-normal py-2 text-left">
                <Link href={showSetup ? nextStep.href : move.href}>
                  {showSetup ? tt(nextStep.label) : localizedMove.cta}
                  <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
                </Link>
              </Button>
              {!showSetup && <span className="text-sm text-text-secondary">{localizedMove.estimatedMinutes} {tt("command.minutes")}</span>}
            </div>
            {!showSetup && (
              <details className="mt-3 max-w-xl text-ui-label text-text-secondary">
                <summary className="w-fit cursor-pointer rounded-chip px-0.5 py-1.5 font-medium">{tt("command.recommendationDetails")}</summary>
                <p className="mt-2 leading-relaxed">{localizedMove.expectedImpact}</p>
                <p className="mt-1 leading-relaxed">{localizedMove.dangerIfIgnored}</p>
              </details>
            )}
          </section>

          <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <Link href={nextExam ? `/exams/${nextExam.id}` : "/exams"} className="block min-w-0 rounded-panel border border-border bg-bg-surface p-4 transition-colors hover:border-border-strong hover:bg-bg-subtle">
              <h2 className="text-ui-label font-medium text-text-secondary">{tt("command.nextExam")}</h2>
              <p className="mt-1 break-words text-lg font-semibold text-text-primary">{nextExam?.title ?? tt("command.noUpcomingExam")}</p>
              {nextExam && <p className="mt-1 text-sm text-text-secondary">{examDateLabel}{!lowData && nextExamPlan && <> · {tt("command.examReadinessValue", { score: nextExamPlan.readiness.toFixed(1) })}</>}</p>}
            </Link>
            <Link href="/reviews" className="block min-w-0 rounded-panel border border-border bg-bg-surface p-4 transition-colors hover:border-border-strong hover:bg-bg-subtle">
              <h2 className="text-ui-label font-medium text-text-secondary">{tt("nav.reviews")}</h2>
              <p className="mt-1 text-lg font-semibold text-text-primary">{dueReviews > 0 ? tt("command.dueReviewCount", { count: dueReviews }) : tt("command.noDueReviews")}</p>
            </Link>
          </div>
        </div>

        {nextStep && (
          <section className="rounded-panel border border-border bg-bg-surface p-4 sm:p-5" aria-labelledby="command-setup">
            <h2 id="command-setup" className="text-base font-semibold">{tt("command.setupHeading")}</h2>
            <ol className="mt-3 divide-y divide-border">
              {setupSteps.map((step) => (
                <li key={step.href} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <Link href={step.href} className="rounded py-1 font-medium text-primary underline-offset-4 hover:underline">{tt(step.label)}</Link>
                  {step.done && <span className="shrink-0 text-emerald">{tt("command.setupDone")}</span>}
                </li>
              ))}
            </ol>
          </section>
        )}

        <details className="group rounded-panel border border-border bg-bg-surface">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-panel px-4 py-3.5 text-ui-body font-semibold hover:bg-bg-subtle marker:hidden [&::-webkit-details-marker]:hidden">
            {tt("command.studyTools")}
            <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 group-open:rotate-180" />
          </summary>
          <div className="space-y-4 border-t border-border p-panel">
            <SmartInputWrapper />
            <QuickActions />
            <GlassCard>
              <DailyLogForm log={todayLog} defaultDate={todayKey} compact t={tt} />
            </GlassCard>
          </div>
        </details>

        <details className="group rounded-panel border border-border bg-bg-surface">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-panel px-4 py-3.5 text-ui-body font-semibold hover:bg-bg-subtle marker:hidden [&::-webkit-details-marker]:hidden">
            {tt("command.performanceDetails")}
            <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 group-open:rotate-180" />
          </summary>
          <div className="space-y-4 border-t border-border p-panel">
            <div className="flex flex-wrap gap-3 text-sm">
              <Link href="/settings" className="text-primary underline underline-offset-4">{tt("command.eliteTargetMode")}</Link>
              <Link href="/performance-blockers" className="text-primary underline underline-offset-4">{tt("command.performanceBlockers")}</Link>
            </div>
            {lowData ? (
              <p className="text-sm text-text-secondary">{tt("command.insufficientData")}</p>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-4">
                  <ScoreRing score={snapshot.elitePerformanceIndex.score} label={tt("command.eliteIndex")}
                    caption={localizeScoreLabel(snapshot.elitePerformanceIndex.label, tt)} size="md" />
                  <p className="max-w-sm text-sm text-text-secondary">{tt("command.score.recommendedAction")}</p>
                </div>
                <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricCard
                    label={tt("command.examReadiness")}
                    value={snapshot.examReadiness.toFixed(1)}
                    detail={tt("command.readinessTargetDetail", { target: snapshot.readinessTarget.toFixed(1) })}
                    icon={Gauge}
                    tone={snapshot.readinessGap > 2 ? "danger" : "violet"}
                  />
                  <MetricCard
                    label={tt("command.readinessGap")}
                    value={snapshot.readinessGap.toFixed(1)}
                    detail={tt("command.readinessGapDetail")}
                    icon={Target}
                    tone={snapshot.readinessGap > 2 ? "rose" : "emerald"}
                  />
                  <MetricCard
                    label={tt("command.errorDestruction")}
                    value={pct(snapshot.errorDestructionProgress)}
                    detail={tt("command.blockersOpen", { count: command.blockers.filter((blocker) => blocker.status !== "destroyed").length })}
                    icon={ShieldCheck}
                    tone={snapshot.criticalErrorPenalty >= 7 ? "danger" : "emerald"}
                  />
                  <MetricCard
                    label={tt("command.energyIntegrity")}
                    value={snapshot.energyIntegrity.toFixed(1)}
                    detail={snapshot.burnoutRisk >= 7 ? tt("command.overtrainingRisk") : tt("command.performanceProtection")}
                    icon={Zap}
                    tone={snapshot.burnoutRisk >= 7 ? "danger" : "gold"}
                  />
                </div>

                <GlassCard>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-text-muted" />
                      <h3 className="text-base font-semibold text-text-primary">{tt("command.snapshotTitle")}</h3>
                    </div>
                    <p className="text-xs text-text-muted">{tt("command.snapshotDescription")}</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <MomentumBar label={tt("command.activeRecallCoverage")} value={snapshot.activeRecallCoverage * 10} tone="cyan" detail={tt("command.activeRecallCoverageDetail")} />
                    <MomentumBar label={tt("command.passiveStudyPenalty")} value={snapshot.passiveStudyPenalty * 10} tone={snapshot.passiveStudyPenalty >= 6 ? "rose" : "emerald"} detail={snapshot.passiveStudyPenalty >= 6 ? tt("command.passiveStudyWarning") : tt("command.controlled")} />
                    <MomentumBar label={tt("command.criticalErrorPenalty")} value={snapshot.criticalErrorPenalty * 10} tone={snapshot.criticalErrorPenalty >= 7 ? "rose" : "emerald"} detail={tt("command.criticalErrorPenaltyDetail")} />
                    <MomentumBar label={tt("command.simulationRequirement")} value={snapshot.simulationRequirementNearExam * 10} tone={snapshot.simulationRequirementNearExam >= 7 ? "gold" : "violet"} detail={tt("command.simulationRequirementDetail")} />
                  </div>
                </GlassCard>

                <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
                  <GlassCard tone="rose" hover>
                    <div className="mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-rose" />
                      <h3 className="text-base font-semibold text-text-primary">{tt("command.topThreats")}</h3>
                    </div>
                    <div className="space-y-3">
                      {command.threats.length > 0 ? command.threats.map((threat) => {
                        const localizedThreat = localizeThreat(threat, tt);
                        return (
                          <Link
                            key={`${threat.type}-${threat.title}`}
                            href={threat.href}
                            className="flex items-start gap-3 rounded-control border border-border bg-bg-surface p-3 transition-colors hover:border-border-strong hover:bg-bg-subtle"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-text-primary">{localizedThreat.title}</p>
                              <p className="mt-1 text-xs leading-5 text-text-secondary">{localizedThreat.detail}</p>
                            </div>
                            <Badge variant={threat.severity >= 7 ? "danger" : "warning"} size="sm">{threat.severity.toFixed(1)}</Badge>
                          </Link>
                        );
                      }) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <ShieldCheck className="h-8 w-8 text-emerald" />
                          <p className="mt-2 text-sm text-text-secondary">{tt("command.noThreats")}</p>
                        </div>
                      )}
                    </div>
                  </GlassCard>

                  <GlassCard tone="violet" hover>
                    <div className="mb-4 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-violet" />
                      <h3 className="text-base font-semibold text-text-primary">{tt("command.mostDangerousCluster")}</h3>
                    </div>
                    {command.blockers[0] ? (
                      <div className="rounded-control border border-border bg-bg-subtle p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-base font-semibold text-text-primary">{command.blockers[0].label}</p>
                            <p className="mt-2 text-sm leading-6 text-text-secondary">{localizeBlockerAction(command.blockers[0], tt)}</p>
                          </div>
                          <Badge variant="danger">{command.blockers[0].severity.toFixed(1)}</Badge>
                        </div>
                        <Button asChild variant="outline" size="sm" className="mt-4">
                          <Link href="/performance-blockers">{tt("command.openEnemyList")}</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <ShieldCheck className="h-8 w-8 text-emerald" />
                        <p className="mt-2 text-sm text-text-secondary">{tt("command.noBlockerLogged")}</p>
                      </div>
                    )}
                  </GlassCard>
                </div>

              </>
            )}
            <GlassCard>
              <div className="mb-4 flex items-center gap-2">
                <Gauge className="h-4 w-4 text-text-muted" />
                <h3 className="text-base font-semibold text-text-primary">{tt("command.examPlans")}</h3>
              </div>
              <div className="space-y-3">
                {command.examPlans.slice(0, 3).map((plan) => (
                  <Link key={plan.examId} href={`/exams/${plan.examId}`} className="flex items-center justify-between gap-3 rounded-control border border-border bg-bg-surface px-4 py-3 transition-colors hover:border-border-strong hover:bg-bg-subtle">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-text-primary">{plan.title}</p>
                      <p className="mt-1 text-xs text-text-secondary">
                        {tt("command.examPlanGap", { gap: plan.eliteReadinessGap.toFixed(1) })}
                      </p>
                    </div>
                    <Badge variant="muted" size="sm">{plan.daysRemaining === null ? "--" : `${plan.daysRemaining}d`}</Badge>
                  </Link>
                ))}
                {command.examPlans.length === 0 && (
                  <p className="py-4 text-center text-sm text-text-muted">{tt("command.noExamPlans")}</p>
                )}
              </div>
            </GlassCard>
          </div>
        </details>
      </div>
    </AppShell>
  );
}
