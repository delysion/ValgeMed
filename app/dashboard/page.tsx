import Link from "next/link";
import { differenceInCalendarDays, startOfToday } from "date-fns";
import { AlertTriangle, ArrowRight, Flame, RotateCw, ShieldCheck, TimerReset } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { MetricBarChart, MethodPieChart, MinutesBarChart } from "@/components/charts/study-charts";
import { GlassCard } from "@/components/premium/glass-card";
import { MetricCard } from "@/components/premium/metric-card";
import { MomentumBar } from "@/components/premium/momentum-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOwnerSession } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server";
import { fmtDate } from "@/lib/labels";
import { buildBurnoutRiskFromLogs, buildExamReadiness, buildStudyEfficiency } from "@/lib/scoring/engine";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireOwnerSession();
  const { t } = await getI18n();
  const data = await getDashboardData();
  const burnoutRisk = buildBurnoutRiskFromLogs(data.dailyLogs, data.quizAttempts);
  const efficiency = buildStudyEfficiency({
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

  return (
    <AppShell session={session}>
      <PageHeader title={t("dashboard.title")} description={t("dashboard.subtitle")} eyebrow={t("common.quietProgress")} />

      <div className="grid gap-4 lg:grid-cols-4">
        <MetricCard title={t("dashboard.studyThisWeek")} value={studyMinutesThisWeek} detail={t("common.minutes")} icon={TimerReset} tone="cyan" />
        <MetricCard title={t("dashboard.dueReviews")} value={data.reviewItems.length} detail={t("reviews.subtitle")} icon={RotateCw} tone="violet" />
        <MetricCard title={t("dashboard.openErrors")} value={openErrors.length} detail={t("errors.subtitle")} icon={ShieldCheck} tone={openErrors.length > 0 ? "danger" : "emerald"} />
        <MetricCard title={t("dashboard.burnoutRisk")} value={burnoutRisk.score.toFixed(1)} detail={t("health.warning")} icon={Flame} tone={burnoutRisk.score >= 7 ? "danger" : "emerald"} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <GlassCard tone="cyan">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-white">{t("dashboard.weeklyTrajectory")}</h3>
                <p className="mt-1 text-sm text-muted">{t("common.protectEnergy")}</p>
              </div>
              <Badge>{efficiency.score.toFixed(1)}/10</Badge>
            </div>
            <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
              <MinutesBarChart data={minutesChart} />
              <div className="space-y-4">
                <MomentumBar label={t("gamification.weeklyMomentum")} value={Math.min(100, studyMinutesThisWeek / 6)} tone="cyan" />
                <MomentumBar label={t("dashboard.activeVsPassive")} value={activeRatio} tone="violet" />
                <MomentumBar label={t("dashboard.energyIntegrity")} value={Math.max(0, 100 - burnoutRisk.score * 10)} tone="emerald" />
              </div>
            </div>
          </GlassCard>

          <div className="grid gap-5 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.examReadiness")}</CardTitle>
                <CardDescription>{t("common.strategicSignal")}</CardDescription>
              </CardHeader>
              <CardContent>
                <MetricBarChart data={readinessChart} dataKey="readiness" domain={[0, 10]} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.activeVsPassive")}</CardTitle>
                <CardDescription>{`${activeMinutes} / ${passiveMinutes}`}</CardDescription>
              </CardHeader>
              <CardContent>
                {methodChart.length ? <MethodPieChart data={methodChart} /> : <p className="text-sm text-muted">{t("common.noData")}</p>}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-5">
          <GlassCard tone="gold">
            <h3 className="text-xl font-semibold text-white">{t("dashboard.upcomingRisks")}</h3>
            <div className="mt-4 space-y-3">
              {examsWithReadiness.slice(0, 4).map((exam) => (
                <Link key={exam.id} href={`/exams/${exam.id}`} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-4 transition hover:bg-white/[0.07]">
                  <div>
                    <p className="font-medium text-white">{exam.title}</p>
                    <p className="mt-1 text-xs text-muted">
                      {fmtDate(exam.examDate)} {exam.examDate ? `(${differenceInCalendarDays(exam.examDate, startOfToday())})` : ""}
                    </p>
                  </div>
                  <Badge variant={exam.liveReadiness < 5 ? "danger" : "gold"}>{exam.liveReadiness.toFixed(1)}</Badge>
                </Link>
              ))}
              {examsWithReadiness.length === 0 ? <p className="text-sm text-muted">{t("common.empty")}</p> : null}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-xl font-semibold text-white">{t("dashboard.weakTopics")}</h3>
            <div className="mt-4 space-y-3">
              {weakTopics.map((topic) => (
                <Link key={topic.id} href="/topics" className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.07]">
                  <div>
                    <p className="font-medium text-white">{topic.title}</p>
                    <p className="mt-1 text-xs text-muted">{t("common.confidence")} {topic.confidence}/10</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted" />
                </Link>
              ))}
            </div>
          </GlassCard>

          <GlassCard tone="emerald">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-emerald" />
              <h3 className="text-xl font-semibold text-white">{t("dashboard.recentWins")}</h3>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {recentWins.length ? recentWins.map((win) => <Badge key={win} variant="success">{win}</Badge>) : <Badge variant="muted">{t("common.noData")}</Badge>}
            </div>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}
