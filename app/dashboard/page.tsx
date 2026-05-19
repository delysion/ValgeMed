import Link from "next/link";
import { differenceInCalendarDays, formatISO, startOfToday, subDays } from "date-fns";
import {
  AlertTriangle, ArrowRight, BookOpen, Brain, Clock, Flame,
  Focus, ListChecks, RotateCw, ShieldCheck, TimerReset, TrendingUp, Zap,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { ActivityAreaChart } from "@/components/charts/premium-charts";
import { MetricBarChart, MethodPieChart } from "@/components/charts/study-charts";
import { EmptyState } from "@/components/premium/empty-state";
import {
  computeLevel, DailyStreakCard, LevelCard, MissionCard, MomentumCard,
  SystemHealthCard,
} from "@/components/premium/gamification";
import { GlassCard } from "@/components/premium/glass-card";
import { MetricCard } from "@/components/premium/metric-card";
import { MomentumBar } from "@/components/premium/momentum-bar";
import { SectionHeader } from "@/components/premium/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireOwnerSession } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server";
import { fmtDate } from "@/lib/labels";
import { buildBurnoutRiskFromLogs, buildExamReadiness, buildStudyEfficiency } from "@/lib/scoring/engine";
import { cn } from "@/lib/utils";

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

function longestStreak(dates: string[]) {
  const dateSet = new Set(dates);
  let best = 0;
  let current = 0;
  let cursor = startOfToday();
  for (let i = 0; i < 365; i++) {
    if (dateSet.has(formatISO(cursor, { representation: "date" }))) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
    cursor = subDays(cursor, 1);
  }
  return best;
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
  const streak = commandStreak(data.dailyLogs.map((log) => log.date));
  const longest = longestStreak(data.dailyLogs.map((log) => log.date));
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

  const todayLog = data.todayLog;
  const energyLevel = todayLog?.energyLevel ?? null;
  const sleepHours = todayLog?.sleepHours ?? null;
  const stressLevel = todayLog?.stressLevel ?? null;
  const systemMomentum = Math.min(10, studyMinutesThisWeek / 60);

  return (
    <AppShell session={session}>
      <div className="space-y-6">
        {/* ─── HERO SECTION ─── */}
        <section className="relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-primary-soft via-white to-cyan-bg/50 p-6 shadow-[var(--shadow-hero)] md:p-8 lg:p-10">
          <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-cyan/5 blur-3xl" />
          <div className="pointer-events-none absolute left-1/3 top-1/2 h-48 w-48 rounded-full bg-violet/5 blur-3xl" />

          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto]">
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="violet" className="px-2.5 py-1 text-[10px] tracking-wide">
                  {fmtDate(new Date())}
                </Badge>
                {streak > 0 ? (
                  <Badge variant="gold" className="gap-1.5 px-2.5 py-1 text-[10px]">
                    <Zap className="h-3 w-3" /> {streak}-day streak
                  </Badge>
                ) : null}
                {lowData ? (
                  <Badge variant="warning" className="px-2.5 py-1 text-[10px]">
                    Getting started
                  </Badge>
                ) : null}
              </div>

              <div>
                <h2 className="text-balance text-[28px] font-semibold tracking-tight text-text-primary sm:text-4xl md:text-5xl">
                  Command Center
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary sm:text-base">
                  {lowData
                    ? "Your system is quiet. Add subjects, topics, and sessions to bring the dashboard alive."
                    : "Weekly trajectory, readiness, errors, reviews and energy infrastructure."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <LevelCard
                  level={level}
                  levelLabel={levelLabel}
                  xp={xp}
                  xpToNext={xpToNext}
                  streak={streak}
                  className="min-w-[220px] flex-1 border-primary/10 bg-white/70 backdrop-blur-sm"
                />
                {dueReviews > 0 ? (
                  <div className="flex items-center gap-2 rounded-lg border border-violet/20 bg-violet-bg/50 px-3.5 py-2.5">
                    <RotateCw className="h-4 w-4 text-violet" />
                    <span className="text-xs font-medium text-text-primary">{dueReviews} due reviews</span>
                  </div>
                ) : null}
                {openErrors.length > 0 ? (
                  <div className="flex items-center gap-2 rounded-lg border border-rose/20 bg-rose-bg/50 px-3.5 py-2.5">
                    <ShieldCheck className="h-4 w-4 text-rose" />
                    <span className="text-xs font-medium text-text-primary">{openErrors.length} open errors</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* ─── STAT ROW ─── */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          <MetricCard
            title={t("dashboard.studyThisWeek")}
            value={studyMinutesThisWeek}
            detail={t("common.minutes")}
            icon={Clock}
            tone="cyan"
            trend={`${activeRatio.toFixed(0)}% active`}
          />
          <MetricCard
            title={t("dashboard.dueReviews")}
            value={dueReviews}
            detail={t("reviews.subtitle")}
            icon={RotateCw}
            tone="violet"
          />
          <MetricCard
            title={t("dashboard.openErrors")}
            value={openErrors.length}
            detail={t("errors.subtitle")}
            icon={ShieldCheck}
            tone={openErrors.length > 0 ? "rose" : "emerald"}
            trend={openErrors.length === 0 ? "Clear" : undefined}
          />
          <MetricCard
            title={t("dashboard.burnoutRisk")}
            value={burnoutRisk.score.toFixed(1)}
            detail={t("health.warning")}
            icon={Flame}
            tone={burnoutRisk.score >= 7 ? "rose" : burnoutRisk.score >= 4 ? "gold" : "emerald"}
          />
          <MetricCard
            title="Energy"
            value={energyLevel !== null ? `${energyLevel}/10` : "--"}
            detail={energyLevel !== null && energyLevel >= 7 ? "High" : energyLevel !== null && energyLevel >= 4 ? "Moderate" : energyLevel !== null ? "Low" : "Log today"}
            icon={Zap}
            tone={energyLevel !== null && energyLevel >= 7 ? "emerald" : energyLevel !== null && energyLevel >= 4 ? "gold" : "rose"}
          />
        </div>

        {/* ─── MAIN GRID ─── */}
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          {/* ─── LEFT COLUMN ─── */}
          <div className="space-y-6">
            {/* Weekly Activity Chart */}
            <GlassCard tone="cyan">
              <SectionHeader
                title="Weekly Activity"
                description="Study minutes over the last days"
                icon={TrendingUp}
              />
              <div className="mt-5">
                {minutesChart.length > 0 ? (
                  <ActivityAreaChart data={minutesChart} dataKey="minutes" color="#7C3AED" height={220} />
                ) : (
                  <EmptyState
                    title="No study data yet"
                    description="Log a study session to see your activity chart light up."
                    tone="cyan"
                  />
                )}
              </div>
            </GlassCard>

            {/* Charts Row: Readiness + Method */}
            <div className="grid gap-6 sm:grid-cols-2">
              <GlassCard>
                <SectionHeader title={t("dashboard.examReadiness")} description={t("common.strategicSignal")} />
                <div className="mt-4">
                  {readinessChart.length > 0 ? (
                    <MetricBarChart data={readinessChart} dataKey="readiness" domain={[0, 10]} />
                  ) : (
                    <EmptyState title="No exams tracked" description="Add an exam to see readiness." tone="violet" />
                  )}
                </div>
              </GlassCard>
              <GlassCard>
                <SectionHeader title={t("dashboard.activeVsPassive")} description={`${activeMinutes}a / ${passiveMinutes}p min`} />
                <div className="mt-4">
                  {methodChart.length ? (
                    <MethodPieChart data={methodChart} />
                  ) : (
                    <EmptyState title="No study methods" description="Start studying to see the split." tone="emerald" />
                  )}
                </div>
              </GlassCard>
            </div>

            {/* Next Actions / Weak Topics */}
            <GlassCard>
              <SectionHeader title="Focus Areas" description="Weak topics need attention" icon={Focus} />
              <div className="mt-4 space-y-2">
                {weakTopics.length > 0 ? (
                  weakTopics.slice(0, 4).map((topic) => (
                    <Link
                      key={topic.id}
                      href="/topics"
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white p-3.5 shadow-sm transition-all duration-200 hover:shadow-md motion-safe:animate-fade-in"
                      style={{ animationDelay: `${Math.random() * 200}ms` }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-rose-bg text-rose">
                          <Brain className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-text-primary">{topic.title}</p>
                          <p className="mt-0.5 text-xs text-text-secondary">
                            {t("common.confidence")} {topic.confidence}/10
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-bg-subtle">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-rose to-gold"
                            style={{ width: `${(topic.confidence / 10) * 100}%` }}
                          />
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-text-muted" />
                      </div>
                    </Link>
                  ))
                ) : (
                  <EmptyState title="All topics strong" description="No weak topics to surface." tone="emerald" />
                )}
              </div>
            </GlassCard>
          </div>

          {/* ─── RIGHT SIDEBAR ─── */}
          <div className="space-y-6">
            {/* Daily Streak */}
            <DailyStreakCard streak={streak} longestStreak={longest} />

            {/* System Health */}
            <SystemHealthCard
              energy={energyLevel ?? 5}
              sleep={sleepHours ?? 6.5}
              stress={stressLevel ?? 5}
              momentum={systemMomentum}
            />

            {/* Momentum */}
            <MomentumCard
              score={eliteScore}
              label="Momentum Score"
              subtitle={eliteScore >= 7 ? "Strong momentum" : eliteScore >= 4 ? "Building" : "Low momentum"}
              tone={eliteScore >= 7 ? "emerald" : eliteScore >= 4 ? "violet" : "gold"}
            />

            {/* Upcoming Exams */}
            <GlassCard tone="gold">
              <SectionHeader title={t("dashboard.upcomingRisks")} />
              <div className="mt-4 space-y-2">
                {examsWithReadiness.slice(0, 4).map((exam) => (
                  <Link
                    key={exam.id}
                    href={`/exams/${exam.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white p-3.5 shadow-sm transition-all duration-200 hover:shadow-md motion-safe:animate-fade-in"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text-primary">{exam.title}</p>
                      <p className="mt-0.5 text-xs text-text-secondary">
                        {fmtDate(exam.examDate)} {exam.examDate ? `· ${differenceInCalendarDays(exam.examDate, startOfToday())}d` : ""}
                      </p>
                    </div>
                    <Badge
                      variant={exam.liveReadiness < 5 ? "danger" : "gold"}
                      className="shrink-0 text-[10px]"
                    >
                      {exam.liveReadiness.toFixed(1)}
                    </Badge>
                  </Link>
                ))}
                {examsWithReadiness.length === 0 ? (
                  <p className="py-4 text-center text-sm text-text-secondary">{t("common.empty")}</p>
                ) : null}
              </div>
            </GlassCard>

            {/* Quick Actions */}
            <GlassCard>
              <SectionHeader title="Quick Actions" />
              <div className="mt-4 grid grid-cols-2 gap-2">
                <QuickActionButton href="/study" icon={BookOpen} label="Study" tone="violet" />
                <QuickActionButton href="/reviews" icon={ListChecks} label="Reviews" tone="cyan" />
                <QuickActionButton href="/errors" icon={ShieldCheck} label="Errors" tone="rose" />
                <QuickActionButton href="/daily-log" icon={Focus} label="Daily Log" tone="emerald" />
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function QuickActionButton({
  href,
  icon: Icon,
  label,
  tone,
}: {
  href: string;
  icon: typeof BookOpen;
  label: string;
  tone: "violet" | "cyan" | "rose" | "emerald";
}) {
  const toneClasses = {
    violet: "border-violet/20 hover:bg-violet-bg hover:border-violet/30 text-violet",
    cyan: "border-cyan/20 hover:bg-cyan-bg hover:border-cyan/30 text-cyan",
    rose: "border-rose/20 hover:bg-rose-bg hover:border-rose/30 text-rose",
    emerald: "border-emerald/20 hover:bg-emerald-bg hover:border-emerald/30 text-emerald",
  };
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-3 text-xs font-medium transition-all duration-200 hover:shadow-md",
        toneClasses[tone],
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </Link>
  );
}


