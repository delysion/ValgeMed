import Link from "next/link";
import { differenceInCalendarDays, formatISO, startOfToday, subDays } from "date-fns";
import {
  ArrowRight, BookOpen, Brain, Clock, Flame,
  Focus, ListChecks, RotateCw, ShieldCheck, TrendingUp, Zap,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { ActivityAreaChart } from "@/components/charts/premium-charts";
import { MetricBarChart, MethodPieChart } from "@/components/charts/study-charts";
import { EmptyState } from "@/components/premium/empty-state";
import {
  computeLevel, DailyStreakCard, GamificationDashboard, LevelCard, MissionCard, MomentumCard,
  SystemHealthCard,
} from "@/components/premium/gamification";
import { GlassCard } from "@/components/premium/glass-card";
import { MetricCard } from "@/components/premium/metric-card";
import { ScoreRing } from "@/components/premium/score-ring";
import { SectionHeader } from "@/components/premium/section-header";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { requireUser } from "@/lib/auth/supabase";
import { getDashboardData } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";
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

export function DashboardPageSkeleton() {
  return (
    <div className="motion-premium flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary-soft/80 via-bg-surface to-cyan-bg/40 p-5 sm:p-7 md:p-8">
        <div className="flex flex-wrap items-center gap-6">
          <Skeleton variant="circular" className="h-36 w-36" />
          <div className="flex-1 space-y-3">
            <Skeleton variant="text" className="h-8 w-56" />
            <Skeleton variant="text" className="h-4 w-40" />
            <Skeleton variant="text" className="h-4 w-32" />
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Skeleton variant="text" className="h-14 w-full rounded-xl" />
          <Skeleton variant="text" className="h-14 w-full rounded-xl" />
          <Skeleton variant="text" className="h-14 w-full rounded-xl" />
        </div>
      </div>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-bg-surface p-5">
            <Skeleton variant="text" className="h-3 w-24" />
            <Skeleton variant="text" className="mt-3 h-6 w-36" />
            <Skeleton variant="text" className="mt-2 h-3 w-44" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();
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

  const scoreTone = eliteScore >= 7 ? "emerald" : eliteScore >= 5 ? "violet" : eliteScore >= 3 ? "gold" : "rose";
  const dashboardBadges = [
    { id: "study-machine", name: "Study Machine", description: "10+ hours studied this week", icon: "book", unlocked: studyMinutesThisWeek >= 600 },
    { id: "active-learner", name: "Active Learner", description: "70%+ active study ratio", icon: "brain", unlocked: activeRatio >= 70 },
    { id: "error-free", name: "Error Free", description: "Zero open errors", icon: "shield", unlocked: openErrors.length === 0 },
    { id: "streak-warrior", name: "Streak Warrior", description: "7-day command streak", icon: "flame", unlocked: streak >= 7 },
    { id: "balanced", name: "Balanced", description: "Low burnout risk", icon: "zap", unlocked: burnoutRisk.score < 4 },
  ];
  const dashboardMissions = [
    { id: "study-hours", name: "Reach 10h study this week", current: Math.min(studyMinutesThisWeek, 600), target: 600 },
    { id: "clear-reviews", name: "Clear all due reviews", current: dueReviews === 0 ? 1 : 0, target: 1 },
    { id: "fix-errors", name: "Resolve open errors", current: openErrors.length === 0 ? 1 : 0, target: 1 },
    { id: "build-streak", name: "Build a 7-day streak", current: Math.min(streak, 7), target: 7 },
  ];

  return (
    <AppShell user={user}>
      <div className="flex flex-col gap-6">
        {/* ─── HERO SECTION ─── */}
        <section className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary-soft/80 via-bg-surface to-cyan-bg/40 p-5 shadow-[var(--shadow-hero)] sm:p-7 md:p-8">
          <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary/8 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-violet/6 blur-[80px]" />
          <div className="pointer-events-none absolute left-1/3 top-1/2 h-48 w-48 rounded-full bg-cyan/6 blur-[60px]" />

          <div className="relative flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="violet">{fmtDate(new Date())}</Badge>
              {streak > 0 ? (
                <Badge variant="gold" className="gap-1">
                  <Zap className="h-3 w-3" /> {t("dashboard.streakBadge", { streak })}
                </Badge>
              ) : null}
              {lowData ? (
                <Badge variant="warning">{t("dashboard.gettingStarted")}</Badge>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8">
              <ScoreRing
                score={eliteScore}
                label={t("elite.title")}
                size="lg"
                tone={scoreTone as "emerald" | "violet" | "gold" | "rose"}
                animated
              />
              <div className="min-w-0 flex-1">
                <h2 className="text-balance text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                  {t("dashboard.heroTitle")}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary sm:text-base">
                  {t("dashboard.heroDescription")}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <LevelCard
                level={level}
                levelLabel={levelLabel}
                xp={xp}
                xpToNext={xpToNext}
                streak={streak}
                t={t as (key: string) => string}
                className="min-w-[200px] flex-1 border-primary/15 bg-bg-surface/70 backdrop-blur-sm shadow-sm"
              />
              {dueReviews > 0 ? (
                <div className="flex items-center gap-2 rounded-xl border border-violet/20 bg-violet-bg/60 px-3.5 py-2.5 shadow-sm">
                  <RotateCw className="h-4 w-4 text-violet" />
                  <span className="text-xs font-semibold text-text-primary">{t("dashboard.dueReviewsCount", { count: dueReviews })}</span>
                </div>
              ) : null}
              {openErrors.length > 0 ? (
                <div className="flex items-center gap-2 rounded-xl border border-rose/20 bg-rose-bg/60 px-3.5 py-2.5 shadow-sm">
                  <ShieldCheck className="h-4 w-4 text-rose" />
                  <span className="text-xs font-semibold text-text-primary">{t("dashboard.openErrorsCount", { count: openErrors.length })}</span>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* ─── GAMIFICATION DASHBOARD ─── */}
        <GamificationDashboard
          eliteIndex={eliteScore}
          level={level}
          xp={xp}
          xpToNextLevel={xpToNext}
          streak={streak}
          badges={dashboardBadges}
          missions={dashboardMissions}
          t={t as (key: string) => string}
        />

        {/* ─── STAT ROW — responsive grid ─── */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
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
            title={t("dashboard.energyLabel")}
            value={energyLevel !== null ? `${energyLevel}/10` : "--"}
            detail={energyLevel !== null && energyLevel >= 7 ? t("dashboard.energyHigh") : energyLevel !== null && energyLevel >= 4 ? t("dashboard.energyModerate") : energyLevel !== null ? t("dashboard.energyLow") : t("dashboard.energyLogToday")}
            icon={Zap}
            tone={energyLevel !== null && energyLevel >= 7 ? "emerald" : energyLevel !== null && energyLevel >= 4 ? "gold" : "rose"}
          />
        </div>

        {/* ─── MAIN GRID ─── */}
        <div className="grid gap-6 lg:grid-cols-[1fr_380px] xl:grid-cols-[1.15fr_0.85fr]">
          {/* ─── LEFT COLUMN ─── */}
          <div className="flex flex-col gap-6">
            {/* Weekly Activity Chart */}
            <GlassCard tone="cyan" padded={false}>
              <div className="p-5 sm:p-6">
                <SectionHeader
                  title={t("dashboard.weeklyActivity")}
                  description={t("dashboard.weeklyActivityDesc")}
                  icon={TrendingUp}
                />
                <div className="mt-5">
                  {minutesChart.length > 0 ? (
                    <ActivityAreaChart data={minutesChart} dataKey="minutes" color="#7C3AED" height={220} />
                  ) : (
                    <EmptyState
                      title={t("dashboard.noStudyDataTitle")}
                      description={t("dashboard.noStudyDataDesc")}
                      tone="cyan"
                    />
                  )}
                </div>
              </div>
            </GlassCard>

            {/* Charts Row: Readiness + Method */}
            <div className="grid gap-4 sm:grid-cols-2">
              <GlassCard padded={false}>
                <div className="p-5 sm:p-6">
                  <SectionHeader title={t("dashboard.examReadiness")} description={t("common.strategicSignal")} />
                  <div className="mt-4">
                    {readinessChart.length > 0 ? (
                      <MetricBarChart data={readinessChart} dataKey="readiness" domain={[0, 10]} />
                    ) : (
                      <EmptyState title={t("dashboard.noExamsTitle")} description={t("dashboard.noExamsDesc")} tone="violet" />
                    )}
                  </div>
                </div>
              </GlassCard>
              <GlassCard padded={false}>
                <div className="p-5 sm:p-6">
                  <SectionHeader title={t("dashboard.activeVsPassive")} description={`${activeMinutes}a / ${passiveMinutes}p min`} />
                  <div className="mt-4">
                    {methodChart.length ? (
                      <MethodPieChart data={methodChart} />
                    ) : (
                      <EmptyState title={t("dashboard.noMethodsTitle")} description={t("dashboard.noMethodsDesc")} tone="emerald" />
                    )}
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Next Actions / Weak Topics */}
            <GlassCard padded={false}>
              <div className="p-5 sm:p-6">
                <SectionHeader title={t("dashboard.focusAreas")} description={t("dashboard.focusAreasDesc")} icon={Focus} />
                <div className="mt-4 flex flex-col gap-2">
                  {weakTopics.length > 0 ? (
                    weakTopics.slice(0, 4).map((topic, i) => (
                      <Link
                        key={topic.id}
                        href="/topics"
                        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-gradient-to-r from-bg-surface to-bg-subtle/30 p-3.5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] motion-safe:fade-in"
                        style={{ animationDelay: `${i * 80}ms` }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-rose-bg to-rose/10 text-rose">
                            <Brain className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-text-primary">{topic.title}</p>
                            <p className="mt-0.5 text-xs text-text-secondary">
                              {t("common.confidence")} {topic.confidence}/10
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="h-2.5 w-20 overflow-hidden rounded-full bg-bg-subtle sm:w-24">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-rose to-gold"
                              style={{ width: `${(topic.confidence / 10) * 100}%` }}
                            />
                          </div>
                          <ArrowRight className="h-4 w-4 shrink-0 text-text-muted" />
                        </div>
                      </Link>
                    ))
                  ) : (
                    <EmptyState title={t("dashboard.topicsStrongTitle")} description={t("dashboard.topicsStrongDesc")} tone="emerald" />
                  )}
                </div>
              </div>
            </GlassCard>

            {/* Recent Activity */}
            <GlassCard padded={false}>
              <div className="p-5 sm:p-6">
                <SectionHeader title={t("dashboard.recentActivity")} description={t("dashboard.recentActivityDesc")} icon={Clock} />
                <div className="mt-4 flex flex-col gap-2">
                  {data.studySessions.slice(0, 5).map((session, i) => (
                    <div
                      key={`${session.id}-${i}`}
                      className="flex items-center gap-3 rounded-xl border border-border bg-gradient-to-r from-bg-surface to-bg-subtle/30 p-3 shadow-sm transition-all duration-200 motion-safe:fade-in"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", {
                        "bg-gradient-to-br from-cyan-bg to-cyan/10 text-cyan": session.method === "active_recall",
                        "bg-gradient-to-br from-violet-bg to-violet/10 text-violet": session.method === "quiz",
                        "bg-gradient-to-br from-emerald-bg to-emerald/10 text-emerald": session.method === "simulation",
                        "bg-gradient-to-br from-rose-bg to-rose/10 text-rose": session.method === "error_review",
                        "bg-gradient-to-br from-gold-bg to-gold/10 text-gold": session.method === "reading" || session.method === "notes",
                      })}>
                        <Brain className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-text-primary">{session.method.replace(/_/g, " ")}</p>
                        <p className="text-xs text-text-muted">{session.durationMinutes} min</p>
                      </div>
                    </div>
                  ))}
                  {data.studySessions.length === 0 ? (
                    <p className="py-6 text-center text-sm text-text-muted">{t("dashboard.noSessions")}</p>
                  ) : null}
                </div>
              </div>
            </GlassCard>
          </div>

          {/* ─── RIGHT SIDEBAR ─── */}
          <div className="flex flex-col gap-5">
            {/* Daily Streak */}
            <DailyStreakCard streak={streak} longestStreak={longest} t={t as (key: string) => string} />

            {/* System Health */}
            <SystemHealthCard
              energy={energyLevel ?? 5}
              sleep={sleepHours ?? 6.5}
              stress={stressLevel ?? 5}
              momentum={systemMomentum}
              t={t as (key: string) => string}
            />

            {/* Momentum */}
            <MomentumCard
              score={eliteScore}
              label={t("dashboard.momentumScore")}
              subtitle={eliteScore >= 7 ? t("dashboard.momentumStrong") : eliteScore >= 4 ? t("dashboard.momentumBuilding") : t("dashboard.momentumLow")}
              tone={eliteScore >= 7 ? "emerald" : eliteScore >= 4 ? "violet" : "gold"}
            />

            {/* Upcoming Exams */}
            <GlassCard tone="gold" padded={false}>
              <div className="p-5 sm:p-6">
                <SectionHeader title={t("dashboard.upcomingRisks")} />
                <div className="mt-4 flex flex-col gap-2">
                  {examsWithReadiness.slice(0, 4).map((exam) => (
                    <Link
                      key={exam.id}
                      href={`/exams/${exam.id}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-gradient-to-r from-bg-surface to-gold-bg/20 p-3.5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] motion-safe:fade-in"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-text-primary">{exam.title}</p>
                        <p className="mt-0.5 text-xs text-text-secondary">
                          {fmtDate(exam.examDate)} {exam.examDate ? `· ${differenceInCalendarDays(exam.examDate, startOfToday())}d` : ""}
                        </p>
                      </div>
                      <Badge
                        variant={exam.liveReadiness < 5 ? "danger" : "gold"}
                        className="shrink-0"
                      >
                        {exam.liveReadiness.toFixed(1)}
                      </Badge>
                    </Link>
                  ))}
                  {examsWithReadiness.length === 0 ? (
                    <p className="py-6 text-center text-sm text-text-secondary">{t("common.empty")}</p>
                  ) : null}
                </div>
              </div>
            </GlassCard>

            {/* Missions */}
            {weakTopics.length > 0 || openErrors.length > 0 ? (
              <GlassCard tone="violet" padded={false}>
                <div className="p-5 sm:p-6">
                  <SectionHeader title={t("dashboard.activeMissions")} description={t("dashboard.missionsDesc")} />
                  <div className="mt-4 flex flex-col gap-2">
                    {weakTopics.slice(0, 2).map((topic) => (
                      <MissionCard
                        key={topic.id}
                        title={t("dashboard.masterMission", { title: topic.title })}
                        detail={t("dashboard.confidenceDetail", { confidence: topic.confidence })}
                        progress={(topic.confidence / 10) * 100}
                        completed={topic.confidence >= 8}
                        tone="violet"
                      />
                    ))}
                    {openErrors.length > 0 ? (
                      <MissionCard
                        title={t("dashboard.destroyErrorsMission")}
                        detail={t("dashboard.errorsToResolve", { count: openErrors.length })}
                        progress={openErrors.length > 0 ? Math.min(100, (1 - openErrors.length / (openErrors.length + 3)) * 100) : 100}
                        completed={false}
                        tone="rose"
                      />
                    ) : null}
                  </div>
                </div>
              </GlassCard>
            ) : null}

            {/* Quick Actions */}
            <GlassCard padded={false}>
              <div className="p-5 sm:p-6">
                <SectionHeader title={t("dashboard.quickActions")} />
                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  <QuickActionButton href="/study" icon={BookOpen} label={t("dashboard.quickActionStudy")} tone="violet" />
                  <QuickActionButton href="/reviews" icon={ListChecks} label={t("dashboard.quickActionReviews")} tone="cyan" />
                  <QuickActionButton href="/errors" icon={ShieldCheck} label={t("dashboard.quickActionErrors")} tone="rose" />
                  <QuickActionButton href="/daily-log" icon={Focus} label={t("dashboard.quickActionDailyLog")} tone="emerald" />
                </div>
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
    violet: "border-violet/25 hover:bg-gradient-to-br hover:from-violet-bg hover:to-violet/8 hover:border-violet/40 text-violet",
    cyan: "border-cyan/25 hover:bg-gradient-to-br hover:from-cyan-bg hover:to-cyan/8 hover:border-cyan/40 text-cyan",
    rose: "border-rose/25 hover:bg-gradient-to-br hover:from-rose-bg hover:to-rose/8 hover:border-rose/40 text-rose",
    emerald: "border-emerald/25 hover:bg-gradient-to-br hover:from-emerald-bg hover:to-emerald/8 hover:border-emerald/40 text-emerald",
  };
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-xl border border-border bg-gradient-to-br from-bg-surface to-bg-subtle/30 px-3.5 py-3 text-xs font-semibold transition-all duration-200 hover:shadow-md hover:-translate-y-[1px]",
        toneClasses[tone],
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}
