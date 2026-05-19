import Link from "next/link";
import { differenceInCalendarDays, formatISO, startOfToday, subDays } from "date-fns";
import { AlertTriangle, ArrowRight, Flame, RotateCw, ShieldCheck, TimerReset, Zap } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { MetricBarChart, MethodPieChart, MinutesBarChart } from "@/components/charts/study-charts";
import { LevelBadge, computeLevel } from "@/components/premium/gamification";
import { GlassCard } from "@/components/premium/glass-card";
import { MetricCard } from "@/components/premium/metric-card";
import { MomentumBar } from "@/components/premium/momentum-bar";
import { ScoreRing } from "@/components/premium/score-ring";
import { SectionHeader } from "@/components/premium/section-header";
import { Badge } from "@/components/ui/badge";
import { requireOwnerSession } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server";
import { fmtDate } from "@/lib/labels";
import { buildBurnoutRiskFromLogs, buildExamReadiness, buildStudyEfficiency } from "@/lib/scoring/engine";

function commandStreak(dates: string[]) {
  const dateSet = new Set(dates);
  let streak = 0;
  let cursor = startOfToday();
  while (dateSet.has(formatISO(cursor, { representation: "date" }))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }
  return streak;
}

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireOwnerSession();
  const { t } = await getI18n();
  const data = await getDashboardData();

  const burnoutRisk = buildBurnoutRiskFromLogs(data.dailyLogs, data.quizAttempts);
  buildStudyEfficiency({
    sessions: data.studySessions,
    dailyLogs: data.dailyLogs,
    quizAttempts: data.quizAttempts,
  });
  const examsWithReadiness = data.exams.map((exam) => ({
    ...exam,
    liveReadiness: buildExamReadiness({
      topics: data.topics.filter((topic) => topic.examId === exam.id),
      studySessions: data.studySessions.filter((session) => session.examId === exam.id),
      errorLogs: data.errorLogs.filter((error) => error.examId === exam.id),
      quizAttempts: data.quizAttempts.filter((attempt) => attempt.examId === exam.id),
      dailyLogs: data.dailyLogs,
    }).score,
  }));
  const studyMinutesThisWeek = data.studySessions.reduce((sum, session) => sum + session.durationMinutes, 0);
  const activeMethods = new Set(["active_recall", "quiz", "simulation", "error_review"]);
  const activeMinutes = data.studySessions.filter((session) => activeMethods.has(session.method)).reduce((sum, session) => sum + session.durationMinutes, 0);
  const passiveMinutes = data.studySessions.filter((session) => ["reading", "notes"].includes(session.method)).reduce((sum, session) => sum + session.durationMinutes, 0);
  const activeRatio = activeMinutes + passiveMinutes === 0 ? 0 : (activeMinutes / (activeMinutes + passiveMinutes)) * 100;
  const readinessChart = examsWithReadiness.slice(0, 6).map((exam) => ({
    name: exam.title.slice(0, 16),
    readiness: Number(exam.liveReadiness.toFixed(1)),
  }));
  const dayTotals = data.studySessions
    .slice()
    .reverse()
    .reduce<Record<string, number>>((acc, session) => {
      const key = session.startedAt.toISOString().slice(5, 10);
      acc[key] = (acc[key] ?? 0) + session.durationMinutes;
      return acc;
    }, {});
  const minutesChart = Object.entries(dayTotals).map(([name, minutes]) => ({ name, minutes })).slice(-10);
  const methodChart = [
    { name: t("study.activeRecall"), value: activeMinutes },
    { name: t("study.passive"), value: passiveMinutes },
  ].filter((item) => item.value > 0);
  const weakTopics = data.topics.slice().sort((a, b) => a.confidence - b.confidence || b.priority - a.priority).slice(0, 5);
  const openErrors = data.errorLogs.filter((error) => !error.resolved);
  const recentWins = [
    data.quizAttempts[0] ? `${data.quizAttempts[0].scorePercent.toFixed(0)}% quiz` : null,
    activeMinutes > passiveMinutes ? t("achievement.activeRecallShift") : null,
    openErrors.length === 0 && data.errorLogs.length > 0 ? t("errors.errorDestroyed") : null,
  ].filter(Boolean);
  const streak = commandStreak(data.dailyLogs.map((log) => log.date));
  const dueReviews = data.reviewItems.filter((item) => item.isActive && item.dueAt <= new Date()).length;
  const lowData = data.subjects.length === 0 || data.topics.length === 0;

  const avgConfidence = data.topics.length > 0
    ? data.topics.reduce((sum, t) => sum + t.confidence, 0) / data.topics.length
    : 0;
  const examAvgReadiness = examsWithReadiness.length > 0
    ? examsWithReadiness.reduce((sum, e) => sum + e.liveReadiness, 0) / examsWithReadiness.length
    : 0;
  const eliteScore = Math.min(10, Math.max(0, (avgConfidence * 0.4 + examAvgReadiness * 0.3 + Math.min(10, studyMinutesThisWeek / 60) * 0.3)));
  const { level, xp, xpToNext, levelLabel } = computeLevel(eliteScore);
  const xpPct = Math.round((xp / xpToNext) * 100);

  return (
    <AppShell session={session}>
      <div className="space-y-5">
        {/* Hero: Level + Elite Score + Summary */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-primary-soft via-white to-cyan-bg/50 p-6 shadow-[var(--shadow-hero)] md:p-8 lg:p-10">
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-cyan/5 blur-3xl" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_200px]">
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="violet">{fmtDate(new Date())}</Badge>
                {streak > 0 ? (
                  <Badge variant="gold" className="gap-1">
                    <Zap className="h-3 w-3" />
                    {streak}-day streak
                  </Badge>
                ) : null}
                {lowData ? <Badge variant="warning">Getting started</Badge> : null}
              </div>
              <h2 className="text-balance text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl md:text-4xl">
                {t("dashboard.title")}
              </h2>
              <p className="max-w-xl text-base leading-7 text-text-secondary">{t("dashboard.subtitle")}</p>
              <LevelBadge eliteScore={eliteScore} streak={streak} className="max-w-xs" />
            </div>
            <div className="grid place-items-center">
              <ScoreRing
                score={eliteScore}
                label="Elite"
                caption={eliteScore >= 7 ? "Strong" : eliteScore >= 4 ? "Building" : "Starting"}
                tone={eliteScore >= 7 ? "emerald" : eliteScore >= 4 ? "violet" : "gold"}
                size="xl"
                animated
              />
            </div>
          </div>
        </div>

        {/* Today Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard title={t("dashboard.studyThisWeek")} value={studyMinutesThisWeek} detail={t("common.minutes")} icon={TimerReset} tone="cyan" trend={`${activeRatio.toFixed(0)}% active`} />
          <MetricCard title={t("dashboard.dueReviews")} value={dueReviews} detail={t("reviews.subtitle")} icon={RotateCw} tone="violet" />
          <MetricCard title={t("dashboard.openErrors")} value={openErrors.length} detail={t("errors.subtitle")} icon={ShieldCheck} tone={openErrors.length > 0 ? "rose" : "emerald"} />
          <MetricCard title={t("dashboard.burnoutRisk")} value={burnoutRisk.score.toFixed(1)} detail={t("health.warning")} icon={Flame} tone={burnoutRisk.score >= 7 ? "rose" : "emerald"} />
        </div>

        {/* Main Content: Charts + Progress + Sidebar */}
        <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            {/* Weekly Momentum */}
            <GlassCard tone="cyan">
              <SectionHeader title={t("dashboard.weeklyTrajectory")} description={t("common.protectEnergy")} />
              <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_280px]">
                <div>
                  {minutesChart.length > 0 ? (
                    <MinutesBarChart data={minutesChart} />
                  ) : (
                    <div className="flex h-[220px] items-center justify-center rounded-xl border border-dashed border-border bg-bg-subtle">
                      <p className="text-sm text-text-muted">{t("common.noData")}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-5">
                  <MomentumBar label={t("gamification.weeklyMomentum")} value={Math.min(100, studyMinutesThisWeek / 6)} tone="cyan" detail={`${studyMinutesThisWeek} min this week`} />
                  <MomentumBar label={t("dashboard.activeVsPassive")} value={activeRatio} tone="violet" detail={`${activeMinutes} active / ${passiveMinutes} passive`} />
                  <MomentumBar label={t("dashboard.energyIntegrity")} value={Math.max(0, 100 - burnoutRisk.score * 10)} tone="emerald" />
                </div>
              </div>
            </GlassCard>

            {/* Charts Row */}
            <div className="grid gap-5 sm:grid-cols-2">
              <GlassCard>
                <SectionHeader title={t("dashboard.examReadiness")} description={t("common.strategicSignal")} />
                <div className="mt-4">
                  {readinessChart.length > 0 ? (
                    <MetricBarChart data={readinessChart} dataKey="readiness" domain={[0, 10]} />
                  ) : (
                    <div className="flex h-[200px] items-center justify-center rounded-xl border border-dashed border-border bg-bg-subtle">
                      <p className="text-sm text-text-muted">{t("common.noData")}</p>
                    </div>
                  )}
                </div>
              </GlassCard>
              <GlassCard>
                <SectionHeader title={t("dashboard.activeVsPassive")} description={`${activeMinutes} / ${passiveMinutes} min`} />
                <div className="mt-4">
                  {methodChart.length ? (
                    <MethodPieChart data={methodChart} />
                  ) : (
                    <div className="flex h-[200px] items-center justify-center rounded-xl border border-dashed border-border bg-bg-subtle">
                      <p className="text-sm text-text-muted">{t("common.noData")}</p>
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-5">
            {/* Upcoming Risks */}
            <GlassCard tone="gold">
              <SectionHeader title={t("dashboard.upcomingRisks")} />
              <div className="mt-4 space-y-2">
                {examsWithReadiness.slice(0, 4).map((exam) => (
                  <Link key={exam.id} href={`/exams/${exam.id}`} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white p-3.5 shadow-sm transition-all duration-200 hover:shadow-md">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-sm text-text-primary">{exam.title}</p>
                      <p className="mt-0.5 text-xs text-text-secondary">
                        {fmtDate(exam.examDate)} {exam.examDate ? `· ${differenceInCalendarDays(exam.examDate, startOfToday())}d` : ""}
                      </p>
                    </div>
                    <Badge variant={exam.liveReadiness < 5 ? "danger" : "gold"} className="shrink-0 text-[10px]">{exam.liveReadiness.toFixed(1)}</Badge>
                  </Link>
                ))}
                {examsWithReadiness.length === 0 ? (
                  <p className="py-4 text-center text-sm text-text-secondary">{t("common.empty")}</p>
                ) : null}
              </div>
            </GlassCard>

            {/* Weak Topics */}
            <GlassCard>
              <SectionHeader title={t("dashboard.weakTopics")} />
              <div className="mt-4 space-y-2">
                {weakTopics.map((topic) => (
                  <Link key={topic.id} href="/topics" className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white p-3.5 shadow-sm transition-all duration-200 hover:shadow-md">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-text-primary">{topic.title}</p>
                      <p className="mt-0.5 text-xs text-text-secondary">{t("common.confidence")} {topic.confidence}/10</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-text-muted" />
                  </Link>
                ))}
              </div>
            </GlassCard>

            {/* Recent Wins */}
            <GlassCard tone="emerald">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-emerald" />
                <h3 className="text-base font-semibold text-text-primary">{t("dashboard.recentWins")}</h3>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {recentWins.length ? recentWins.map((win) => <Badge key={win} variant="success">{win}</Badge>) : <Badge variant="muted">{t("common.noData")}</Badge>}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
