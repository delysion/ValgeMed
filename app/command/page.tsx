import Link from "next/link";
import { AlertTriangle, ArrowRight, Gauge, ShieldCheck, Target, Zap, Star, Clock, TrendingUp, AlertCircle } from "lucide-react";

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
import { cn } from "@/lib/utils";

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
  const { t } = await getI18n();
  const tt = t as Translate;
  const [data, settings] = await Promise.all([
    getCommandPageData(user.id),
    getEliteTargetSettings(user.id),
  ]);

  const command = buildElitePerformanceCommand({
    settings,
    exams: data.exams,
    topics: data.topics,
    studySessions: data.studySessions,
    reviewItems: data.reviewItems,
    errorLogs: data.errorLogs,
    quizAttempts: data.quizAttempts,
    dailyLogs: data.dailyLogs,
    healthLogs: data.healthLogs,
  });

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayLog = data.dailyLogs.find((log) => log.date === todayKey) ?? null;
  const lowData = data.subjects.length === 0 || data.topics.length === 0 || data.dailyLogs.length === 0;
  const move = command.winningMove;
  const localizedMove = localizeMove(move, tt);
  const snapshot = command.snapshot;

  const moveTone = move.kind === "recovery" ? "danger" : move.kind === "error_review" ? "rose" : "cyan";

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow={tt("command.eyebrow")}
        title={tt("command.title")}
        description={tt("command.description")}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/settings">
                {tt("command.eliteTargetMode")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/performance-blockers">
                {tt("command.performanceBlockers")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        }
      />

      <div className="motion-premium flex flex-col gap-5">
        {lowData ? (
          <GlassCard tone="gold">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <div>
                <h2 className="text-base font-semibold text-text-primary">{tt("command.lowDataTitle")}</h2>
                <p className="mt-1.5 text-sm leading-6 text-text-secondary">
                  {tt("command.lowDataDescription")}
                </p>
              </div>
            </div>
          </GlassCard>
        ) : null}

        <GlassCard tone={moveTone} className="overflow-hidden p-0">
          <div className="relative overflow-hidden bg-gradient-to-br from-bg-surface via-bg-surface to-bg-elevated p-6 sm:p-8">
            {move.kind === "recovery" && (
              <div className="absolute inset-0 bg-gradient-to-r from-rose-bg/30 via-transparent to-transparent" />
            )}
            <div className="relative grid gap-6 lg:grid-cols-[1fr_280px]">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 rounded-lg bg-bg-elevated/80 px-3 py-1.5">
                    <Star className={cn("h-4 w-4", moveTone === "danger" ? "text-rose" : moveTone === "rose" ? "text-rose" : "text-cyan")} />
                    <span className="text-xs font-semibold uppercase tracking-[0.1em] text-text-primary">{tt("command.todaysWinningMove")}</span>
                  </div>
                  <Badge variant={move.kind === "recovery" ? "danger" : move.kind === "error_review" ? "rose" : "default"} size="sm">
                    {command.settings.targetLevel.replace("_", " ")}
                  </Badge>
                </div>

                <div className={cn("mt-5 text-3xl font-bold tracking-tight sm:text-4xl", moveTone === "danger" ? "text-rose" : "text-text-primary")}>
                  {localizedMove.title}
                </div>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-text-secondary">
                  {localizedMove.reason}
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-bg-page/60 px-4 py-3">
                    <Clock className="h-5 w-5 text-text-muted" />
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.1em] text-text-muted">{tt("command.time")}</p>
                      <p className="mt-0.5 text-lg font-semibold text-text-primary">{localizedMove.estimatedMinutes} {tt("command.minutes")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-bg-page/60 px-4 py-3">
                    <TrendingUp className="h-5 w-5 text-emerald" />
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.1em] text-text-muted">{tt("command.expectedImpact")}</p>
                      <p className="mt-0.5 text-sm font-medium text-text-primary">{localizedMove.expectedImpact}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-rose/20 bg-rose-bg/20 px-4 py-3">
                    <AlertCircle className="h-5 w-5 text-rose" />
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.1em] text-rose">{tt("command.dangerIfIgnored")}</p>
                      <p className="mt-0.5 text-sm font-medium text-text-primary">{localizedMove.dangerIfIgnored}</p>
                    </div>
                  </div>
                </div>

                <Button asChild size="lg" className="mt-6 gap-2">
                  <Link href={move.href}>
                    {localizedMove.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="flex flex-col items-center justify-center">
                <ScoreRing
                  score={snapshot.elitePerformanceIndex.score}
                  label={tt("command.eliteIndex")}
                  caption={localizeScoreLabel(snapshot.elitePerformanceIndex.label, tt)}
                  size="lg"
                  tone={snapshot.elitePerformanceIndex.score >= 7 ? "emerald" : snapshot.elitePerformanceIndex.score >= 5 ? "gold" : "danger"}
                  glow={snapshot.elitePerformanceIndex.score >= 7}
                />
                <p className="mt-4 text-center text-xs leading-5 text-text-muted">
                  {tt("command.score.recommendedAction")}
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        {command.recoveryWarning ? (
          <GlassCard tone="danger" hover>
            <div className="flex items-start gap-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose/20">
                <Zap className="h-5 w-5 text-rose" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-text-primary">{tt("command.recoveryWarningTitle")}</h3>
                <p className="mt-1.5 text-sm leading-6 text-text-secondary">{tt("command.recoveryWarningMessage")}</p>
                <p className="mt-2 text-sm font-medium text-text-primary">{tt("command.recoveryWarningAction")}</p>
              </div>
            </div>
          </GlassCard>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          <div className="mb-5 flex items-center justify-between">
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
                    className="flex items-start gap-3 rounded-xl border border-border/70 bg-bg-elevated/50 p-4 transition hover:border-rose/40 hover:bg-rose-bg/15"
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
              <div className="rounded-xl border border-border/70 bg-bg-elevated/50 p-4">
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

        <SmartInputWrapper />
        <QuickActions hasData={!lowData} />

        <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <GlassCard>
            <div className="mb-4 flex items-center gap-2">
              <Target className="h-4 w-4 text-text-muted" />
              <h3 className="text-base font-semibold text-text-primary">{tt("command.oneClearNextAction")}</h3>
            </div>
            <DailyLogForm log={todayLog} compact t={t as (key: string) => string} />
          </GlassCard>

          <GlassCard>
            <div className="mb-4 flex items-center gap-2">
              <Gauge className="h-4 w-4 text-text-muted" />
              <h3 className="text-base font-semibold text-text-primary">{tt("command.examPlans")}</h3>
            </div>
            <div className="space-y-3">
              {command.examPlans.slice(0, 3).map((plan) => (
                <Link key={plan.examId} href={`/exams/${plan.examId}`} className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-bg-elevated/50 px-4 py-3 transition hover:border-primary/40">
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
      </div>
    </AppShell>
  );
}
