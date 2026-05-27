import Link from "next/link";
import { AlertTriangle, ArrowRight, Gauge, ShieldCheck, Target, Zap } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { DailyLogForm } from "@/components/forms/entity-forms";
import { GlassCard } from "@/components/premium/glass-card";
import { MetricCard } from "@/components/premium/metric-card";
import { MomentumBar } from "@/components/premium/momentum-bar";
import { ScoreRing } from "@/components/premium/score-ring";
import { SectionHeader } from "@/components/premium/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

export const dynamic = "force-dynamic";

export function CommandPageSkeleton() {
  return (
    <div className="motion-premium flex flex-col gap-5">
      <Skeleton variant="text" className="h-8 w-64" />
      <Skeleton variant="text" className="h-36 w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} variant="text" className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

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

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow={tt("command.eyebrow")}
        title={tt("command.title")}
        description={tt("command.description")}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/settings">
                {tt("command.eliteTargetMode")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
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

        <GlassCard tone={move.kind === "recovery" ? "danger" : "cyan"} className="overflow-hidden">
          <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={move.kind === "recovery" ? "danger" : "default"}>{tt("command.todaysWinningMove")}</Badge>
                <Badge variant="outline">{tt("command.targetLabel")}: {command.settings.targetLevel.replace("_", " ")}</Badge>
              </div>
              <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
                {localizedMove.title}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-text-secondary">{localizedMove.reason}</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border/70 bg-bg-elevated/60 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-text-muted">{tt("command.time")}</p>
                  <p className="mt-2 text-lg font-semibold text-text-primary">{localizedMove.estimatedMinutes} {tt("command.minutes")}</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-bg-elevated/60 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-text-muted">{tt("command.expectedImpact")}</p>
                  <p className="mt-2 text-sm font-medium leading-5 text-text-primary">{localizedMove.expectedImpact}</p>
                </div>
                <div className="rounded-xl border border-rose/25 bg-rose-bg/20 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-rose">{tt("command.dangerIfIgnored")}</p>
                  <p className="mt-2 text-sm font-medium leading-5 text-text-primary">{localizedMove.dangerIfIgnored}</p>
                </div>
              </div>

              <Button asChild className="mt-5">
                <Link href={move.href}>
                  {localizedMove.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid place-items-center rounded-2xl border border-border/70 bg-bg-page/50 p-6">
              <ScoreRing
                score={snapshot.elitePerformanceIndex.score}
                label={tt("command.eliteIndex")}
                caption={localizeScoreLabel(snapshot.elitePerformanceIndex.label, tt)}
                size="lg"
                tone={snapshot.elitePerformanceIndex.score >= 7 ? "emerald" : snapshot.elitePerformanceIndex.score >= 5 ? "gold" : "danger"}
              />
              <p className="mt-4 text-center text-xs leading-5 text-text-muted">
                {tt("command.score.recommendedAction")}
              </p>
            </div>
          </div>
        </GlassCard>

        {command.recoveryWarning ? (
          <GlassCard tone="danger">
            <SectionHeader title={tt("command.recoveryWarningTitle")} description={tt("command.recoveryWarningMessage")} icon={Zap} />
            <p className="mt-3 text-sm leading-6 text-text-secondary">{tt("command.recoveryWarningAction")}</p>
          </GlassCard>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title={tt("command.examReadiness")}
            value={snapshot.examReadiness.toFixed(1)}
            detail={tt("command.readinessTargetDetail", { target: snapshot.readinessTarget.toFixed(1) })}
            icon={Gauge}
            tone={snapshot.readinessGap > 2 ? "danger" : "violet"}
          />
          <MetricCard
            title={tt("command.readinessGap")}
            value={snapshot.readinessGap.toFixed(1)}
            detail={tt("command.readinessGapDetail")}
            icon={Target}
            tone={snapshot.readinessGap > 2 ? "rose" : "emerald"}
          />
          <MetricCard
            title={tt("command.errorDestruction")}
            value={pct(snapshot.errorDestructionProgress)}
            detail={tt("command.blockersOpen", { count: command.blockers.filter((blocker) => blocker.status !== "destroyed").length })}
            icon={ShieldCheck}
            tone={snapshot.criticalErrorPenalty >= 7 ? "danger" : "emerald"}
          />
          <MetricCard
            title={tt("command.energyIntegrity")}
            value={snapshot.energyIntegrity.toFixed(1)}
            detail={snapshot.burnoutRisk >= 7 ? tt("command.overtrainingRisk") : tt("command.performanceProtection")}
            icon={Zap}
            tone={snapshot.burnoutRisk >= 7 ? "danger" : "gold"}
          />
        </div>

        <GlassCard>
          <SectionHeader title={tt("command.snapshotTitle")} description={tt("command.snapshotDescription")} icon={Gauge} />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <MomentumBar label={tt("command.activeRecallCoverage")} value={snapshot.activeRecallCoverage * 10} tone="cyan" detail={tt("command.activeRecallCoverageDetail")} />
            <MomentumBar label={tt("command.passiveStudyPenalty")} value={snapshot.passiveStudyPenalty * 10} tone={snapshot.passiveStudyPenalty >= 6 ? "rose" : "emerald"} detail={snapshot.passiveStudyPenalty >= 6 ? tt("command.passiveStudyWarning") : tt("command.controlled")} />
            <MomentumBar label={tt("command.criticalErrorPenalty")} value={snapshot.criticalErrorPenalty * 10} tone={snapshot.criticalErrorPenalty >= 7 ? "rose" : "emerald"} detail={tt("command.criticalErrorPenaltyDetail")} />
            <MomentumBar label={tt("command.simulationRequirement")} value={snapshot.simulationRequirementNearExam * 10} tone={snapshot.simulationRequirementNearExam >= 7 ? "gold" : "violet"} detail={tt("command.simulationRequirementDetail")} />
          </div>
        </GlassCard>

        <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
          <GlassCard tone="rose">
            <SectionHeader title={tt("command.topThreats")} description={tt("command.topThreatsDescription")} icon={AlertTriangle} />
            <div className="mt-4 grid gap-3">
              {command.threats.length > 0 ? command.threats.map((threat) => {
                const localizedThreat = localizeThreat(threat, tt);
                return (
                  <Link
                    key={`${threat.type}-${threat.title}`}
                    href={threat.href}
                    className="rounded-xl border border-border/70 bg-bg-elevated/50 p-4 transition hover:border-rose/40 hover:bg-rose-bg/15"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{localizedThreat.title}</p>
                        <p className="mt-1 text-xs leading-5 text-text-secondary">{localizedThreat.detail}</p>
                      </div>
                      <Badge variant={threat.severity >= 7 ? "danger" : "warning"}>{threat.severity.toFixed(1)}</Badge>
                    </div>
                  </Link>
                );
              }) : (
                <p className="rounded-xl border border-border/70 bg-bg-elevated/50 p-4 text-sm text-text-secondary">
                  {tt("command.noThreats")}
                </p>
              )}
            </div>
          </GlassCard>

          <GlassCard tone="violet">
            <SectionHeader title={tt("command.mostDangerousCluster")} description={tt("command.mostDangerousClusterDescription")} icon={ShieldCheck} />
            {command.blockers[0] ? (
              <div className="mt-4 rounded-xl border border-border/70 bg-bg-elevated/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-text-primary">{command.blockers[0].label}</p>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">{localizeBlockerAction(command.blockers[0], tt)}</p>
                  </div>
                  <Badge variant="danger">{command.blockers[0].severity.toFixed(1)}</Badge>
                </div>
                <Button asChild variant="outline" className="mt-4">
                  <Link href="/performance-blockers">{tt("command.openEnemyList")}</Link>
                </Button>
              </div>
            ) : (
              <p className="mt-4 rounded-xl border border-border/70 bg-bg-elevated/50 p-4 text-sm text-text-secondary">
                {tt("command.noBlockerLogged")}
              </p>
            )}
          </GlassCard>
        </div>

        <SmartInputWrapper />
        <QuickActions hasData={!lowData} />

        <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
          <GlassCard>
            <SectionHeader title={tt("command.oneClearNextAction")} description={tt("command.oneClearNextActionDescription")} icon={Target} />
            <div className="mt-4">
              <DailyLogForm log={todayLog} compact t={t as (key: string) => string} />
            </div>
          </GlassCard>

          <GlassCard>
            <SectionHeader title={tt("command.examPlans")} description={tt("command.examPlansDescription")} icon={Gauge} />
            <div className="mt-4 grid gap-3">
              {command.examPlans.slice(0, 2).map((plan) => (
                <Link key={plan.examId} href={`/exams/${plan.examId}`} className="rounded-xl border border-border/70 bg-bg-elevated/50 p-4 transition hover:border-primary/40">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-text-primary">{plan.title}</p>
                      <p className="mt-1 text-xs text-text-secondary">
                        {tt("command.examPlanGap", { gap: plan.eliteReadinessGap.toFixed(1) })}
                      </p>
                    </div>
                    <Badge>{plan.daysRemaining === null ? "--" : `${plan.daysRemaining}d`}</Badge>
                  </div>
                </Link>
              ))}
              {command.examPlans.length === 0 ? (
                <p className="rounded-xl border border-border/70 bg-bg-elevated/50 p-4 text-sm text-text-secondary">
                  {tt("command.noExamPlans")}
                </p>
              ) : null}
            </div>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}
