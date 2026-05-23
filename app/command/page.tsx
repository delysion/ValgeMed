import Link from "next/link";
import { differenceInCalendarDays, formatISO, startOfToday, subDays } from "date-fns";
import {
  ArrowRight, BookOpen, Brain, CalendarClock, Clock, Compass,
  Flame, Languages, Lightbulb, Radar, ShieldCheck, Target, Zap,
} from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { DailyLogForm } from "@/components/forms/entity-forms";
import { AchievementBadge, GamificationDashboard } from "@/components/premium/gamification";
import { CollapsiblePanel } from "@/components/premium/collapsible-panel";
import { ExamCountdown } from "@/components/premium/exam-countdown";
import { FocusTimer } from "@/components/premium/focus-timer";
import { GlassCard } from "@/components/premium/glass-card";
import { MetricCard } from "@/components/premium/metric-card";
import { MomentumBar } from "@/components/premium/momentum-bar";
import { QuestItem } from "@/components/premium/quest-grid";
import { RevisionQueue } from "@/components/premium/revision-queue";
import { ScoreRing } from "@/components/premium/score-ring";
import { SectionHeader } from "@/components/premium/section-header";
import { SignalTile } from "@/components/premium/signal-panel";
import { TodayFocusCard } from "@/components/premium/today-focus";
import { WeeklyCommandPanel } from "@/components/premium/weekly-command";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { requireUser } from "@/lib/auth/supabase";
import { getCoreData } from "@/lib/data/queries";
import { fmtDate } from "@/lib/labels";
import type { TranslationKey } from "@/lib/i18n/dictionaries/en";
import { getI18n } from "@/lib/i18n/server";
import { buildBurnoutRiskFromLogs, buildEliteIndex, buildExamReadiness } from "@/lib/scoring/engine";
import { getNextBestAction } from "@/lib/scoring/next-best-action";
import { SmartInputWrapper } from "@/components/smart-input-wrapper";
import { OnboardingWrapper } from "@/components/onboarding-wrapper";
import { QuickActions } from "@/components/quick-actions";

export const dynamic = "force-dynamic";

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

export function CommandPageSkeleton() {
  return (
    <div className="motion-premium flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-6">
        <Skeleton variant="circular" className="h-40 w-40" />
        <div className="flex-1 space-y-3">
          <Skeleton variant="text" className="h-8 w-56" />
          <Skeleton variant="text" className="h-4 w-40" />
          <Skeleton variant="text" className="h-4 w-32" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
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

export default async function CommandPage() {
  const user = await requireUser();
  const { t, locale } = await getI18n();
  const data = await getCoreData();
  const today = startOfToday();
  const todayDate = formatISO(today, { representation: "date" });
  const todayLog = data.dailyLogs.find((log) => log.date === todayDate) ?? null;
  const elite = buildEliteIndex(data);
  const burnout = buildBurnoutRiskFromLogs(data.dailyLogs, data.quizAttempts);
  const examsWithReadiness = data.exams.map((exam) => ({
    ...exam,
    liveReadiness: buildExamReadiness({
      topics: data.topics.filter((topic) => topic.examId === exam.id),
      studySessions: data.studySessions.filter((studySession) => studySession.examId === exam.id),
      errorLogs: data.errorLogs.filter((error) => error.examId === exam.id),
      quizAttempts: data.quizAttempts.filter((attempt) => attempt.examId === exam.id),
      dailyLogs: data.dailyLogs,
    }).score,
  }));
  const nextAction = getNextBestAction({
    burnoutRisk: burnout.score,
    energyIntegrity: elite.energyIntegrity.score,
    exams: examsWithReadiness,
    reviewItems: data.reviewItems,
    errorLogs: data.errorLogs,
    topics: data.topics,
    todayLog,
    languageProgress: data.languageProgress,
    opportunities: data.opportunities,
    reputationEvents: data.reputationEvents,
    lifeAdminItems: data.lifeAdminItems,
  });
  const riskyExam = examsWithReadiness
    .filter((exam) => exam.examDate)
    .sort((a, b) => a.liveReadiness - b.liveReadiness || differenceInCalendarDays(a.examDate as Date, today) - differenceInCalendarDays(b.examDate as Date, today))[0];
  const weakTopic = data.topics.slice().sort((a, b) => a.confidence - b.confidence || b.priority - a.priority)[0];
  const severeError = data.errorLogs
    .filter((error) => !error.resolved)
    .sort((a, b) => b.severity + b.recurrenceCount - (a.severity + a.recurrenceCount))[0];
  const activeMinutesToday = todayLog?.activeRecallMinutes ?? 0;
  const passiveMinutesToday = todayLog?.passiveStudyMinutes ?? 0;
  const activeRatio = activeMinutesToday + passiveMinutesToday === 0 ? 0 : (activeMinutesToday / (activeMinutesToday + passiveMinutesToday)) * 100;
  const dueReviews = data.reviewItems.filter((item) => item.isActive && item.dueAt <= today);
  const destroyedErrors = data.errorLogs.filter((error) => error.resolved).length;
  const recurringErrors = data.errorLogs.filter((error) => !error.resolved && error.recurrenceCount > 0).length;
  const languageMinutes = data.languageProgress.reduce((sum, item) => sum + item.minutes, 0);
  const opportunitiesActive = data.opportunities.filter((item) => !["passed", "archived"].includes(item.status));
  const streak = commandStreak(data.dailyLogs.map((log) => log.date));
  const dateFormatter = new Intl.DateTimeFormat(locale === "et" ? "et-EE" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const lowData = data.subjects.length === 0 || data.topics.length === 0 || data.dailyLogs.length === 0 || data.studySessions.length === 0;

  const upcomingExams = data.exams
    .filter((exam) => exam.examDate && exam.examDate >= today)
    .sort((a, b) => differenceInCalendarDays(a.examDate as Date, today) - differenceInCalendarDays(b.examDate as Date, today))
    .slice(0, 3);

  const todaySessions = data.studySessions.filter((s) => s.startedAt >= today);
  const todayTasks = data.tasks.filter((task) => task.dueAt && task.dueAt >= today && task.status !== "done").slice(0, 5);

  const quests = [
    {
      title: t("quest.destroyError"),
      detail: severeError?.title ?? t("errors.errorDestroyed"),
      complete: destroyedErrors > 0 && recurringErrors === 0,
      tone: "rose" as const,
    },
    {
      title: t("quest.activeRecall"),
      detail: `${activeMinutesToday}/30 min`,
      complete: activeMinutesToday >= 30,
      tone: "cyan" as const,
    },
    {
      title: t("quest.dueReviews"),
      detail: dueReviews.length === 0 ? t("status.done") : `${dueReviews.length} ${t("reviews.dueToday").toLowerCase()}`,
      complete: dueReviews.length === 0,
      tone: "violet" as const,
    },
    {
      title: t("quest.protectEnergy"),
      detail: `${elite.energyIntegrity.score.toFixed(1)}/10`,
      complete: elite.energyIntegrity.score >= 6,
      tone: "emerald" as const,
    },
    {
      title: t("quest.languageBlock"),
      detail: `${languageMinutes} min`,
      complete: languageMinutes >= 30,
      tone: "gold" as const,
    },
  ];

  const completedQuests = quests.filter((q) => q.complete).length;

  const timeLeverage = Math.round(activeRatio);

  const gamificationBadges = [
    { id: "error-destroyer", name: "Error Destroyer", description: "Destroy your first recurring error", icon: ShieldCheck, unlocked: destroyedErrors > 0 },
    { id: "language-learner", name: "Polyglot Spark", description: "30+ min language study today", icon: Languages, unlocked: languageMinutes >= 30 },
    { id: "active-recalls", name: "Recall Engine", description: "30+ min active recall today", icon: Brain, unlocked: activeMinutesToday >= 30 },
    { id: "review-clear", name: "Zero Inbox", description: "All due reviews completed", icon: BookOpen, unlocked: dueReviews.length === 0 },
    { id: "energy-guardian", name: "Energy Guardian", description: "Energy integrity score 6+", icon: Zap, unlocked: elite.energyIntegrity.score >= 6 },
    { id: "streak-starter", name: "Streak Ignited", description: "3-day command streak", icon: Flame, unlocked: streak >= 3 },
  ];

  const gamificationMissions = [
    { id: "active-recall", name: "Hit 30 min active recall today", current: Math.min(activeMinutesToday, 30), target: 30 },
    { id: "clear-reviews", name: "Clear all due reviews", current: dueReviews.length === 0 ? 1 : 0, target: 1 },
    { id: "destroy-errors", name: "Resolve open errors", current: destroyedErrors, target: destroyedErrors + recurringErrors > 0 ? destroyedErrors + recurringErrors : 1 },
    { id: "language-block", name: "30 min language immersion", current: Math.min(languageMinutes, 30), target: 30 },
  ];

  const strategicRules = [
    "One focused block beats scattered hours.",
    "Review before adding. Master before moving.",
    "Energy is your primary weapon. Protect it.",
    "Patterns over memorization. Errors are patterns.",
    "Quality sleep repairs more than last-minute cramming.",
    "Active recall creates durable memories. Passive reading does not.",
    "The exam is not the enemy. Unpreparedness is.",
  ];
  const ruleOfTheDay = strategicRules[new Date().getDay()];

  const eliteScore = elite.eliteIndex.score;
  const scoreTone = eliteScore >= 7 ? "emerald" : eliteScore >= 5 ? "violet" : eliteScore >= 3 ? "gold" : "rose";

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow={t("common.systemAwake")}
        title={t("command.title")}
        description={t("command.subtitle")}
        actions={
          <Button asChild variant="outline">
            <Link href="/elite-index">
              {t("command.eliteIndex")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="motion-premium flex flex-col gap-5">
        {/* ─── (1) Greeting + ScoreRing at top ─── */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8">
          <ScoreRing
            score={eliteScore}
            label={t("command.eliteIndex")}
            caption={elite.eliteIndex.label}
            size="lg"
            tone={scoreTone as "emerald" | "violet" | "gold" | "rose"}
            animated
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-balance text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              {t("command.greeting")}
            </h2>
            <p className="mt-1.5 text-sm text-text-secondary">{dateFormatter.format(today)}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {streak > 0 ? (
                <Badge variant="gold" className="gap-1">
                  <Flame className="h-3 w-3" /> {streak}-day streak
                </Badge>
              ) : null}
              {lowData ? (
                <Badge variant="warning">{t("command.lowDataTitle")}</Badge>
              ) : null}
            </div>
          </div>
        </div>

        {/* Low data warning */}
        {lowData ? (
          <GlassCard tone="gold">
            <div className="flex items-start gap-3">
              <Zap className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <div>
                <h3 className="text-base font-semibold text-text-primary">{t("command.lowDataTitle")}</h3>
                <p className="mt-1.5 text-sm leading-6 text-text-secondary">{t("command.lowDataBody")}</p>
              </div>
            </div>
          </GlassCard>
        ) : null}

        {/* Smart Input - New AI-powered input */}
        <SmartInputWrapper />

        {/* Quick Actions for users with data */}
        <QuickActions hasData={!lowData} />

        {/* Onboarding for new users */}
        {lowData ? <OnboardingWrapper /> : null}

        {/* ─── (2) Today's Command card ─── */}
        <GlassCard tone="primary">
          <SectionHeader title={t("command.battlePlan")} description={t("command.oneCleanBlock")} icon={Target} />
          <div className="mt-4">
            <MomentumBar label={t("gamification.todayMomentum")} value={Math.max(activeRatio, todayLog ? 45 : 0)} tone="cyan" detail={`${t("study.activeRecall")}: ${activeMinutesToday} min`} />
            <div className="mt-3">
              <MomentumBar label={t("gamification.recoveryBalance")} value={elite.energyIntegrity.score * 10} tone="emerald" detail={t("health.warning")} />
            </div>
            <div className="mt-3">
              <MomentumBar label={t("gamification.readinessTrend")} value={elite.examReadiness.score * 10} tone="violet" detail={t("common.strategicSignal")} />
            </div>
          </div>
        </GlassCard>

        {/* ─── (3) Next Best Action card ─── */}
        <GlassCard tone="cyan">
          <SectionHeader title={t("command.nextBestAction")} description="Highest-leverage move right now" icon={Compass} />
          <div className="mt-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-lg font-bold text-text-primary">{t(`nba.${nextAction.kind}.title` as TranslationKey)}</p>
                <p className="mt-1 text-sm text-text-secondary">{t(`nba.${nextAction.kind}.reason` as TranslationKey)}</p>
              </div>
              <Button asChild className="shrink-0 rounded-xl">
                <Link href={nextAction.href}>
                  {t("common.open")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </GlassCard>

        {/* ─── (4) Signal grid (3-col on desktop) ─── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title={t("command.examAtRisk")}
            value={riskyExam ? riskyExam.title : t("command.noCriticalExam")}
            detail={riskyExam
              ? `${t("exams.readiness")} ${riskyExam.liveReadiness.toFixed(1)}/10 · ${differenceInCalendarDays(riskyExam.examDate as Date, today)}d`
              : t("common.quietProgress")}
            icon={CalendarClock}
            tone={riskyExam && riskyExam.liveReadiness < 5 ? "danger" : "gold"}
          />
          <MetricCard
            title={t("command.energySignal")}
            value={elite.energyIntegrity.score.toFixed(1)}
            detail={elite.energyIntegrity.score < 4 ? "Critical — recover today" : elite.energyIntegrity.score < 6 ? "Moderate — guard it" : "Strong — deploy it"}
            icon={Zap}
            tone={elite.energyIntegrity.score < 4 ? "danger" : elite.energyIntegrity.score < 6 ? "gold" : "emerald"}
          />
          <MetricCard
            title="Time Leverage"
            value={`${timeLeverage}%`}
            detail={`${activeMinutesToday}m active / ${passiveMinutesToday}m passive`}
            icon={Clock}
            tone={timeLeverage >= 70 ? "emerald" : timeLeverage >= 40 ? "gold" : "rose"}
          />
        </div>

        {/* ─── (5) Gamification section ─── */}
        <GamificationDashboard
          eliteIndex={eliteScore}
          level={1}
          xp={0}
          xpToNextLevel={100}
          streak={streak}
          badges={gamificationBadges}
          missions={gamificationMissions}
        />

        {/* ─── (6) Strategic Rule of the Day ─── */}
        <GlassCard tone="emerald">
          <SectionHeader title="Strategic Rule of the Day" icon={Lightbulb} />
          <p className="mt-4 text-base font-medium italic text-text-primary leading-relaxed">
            &ldquo;{ruleOfTheDay}&rdquo;
          </p>
        </GlassCard>

        {/* ─── Existing content: 2-col layout ─── */}
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="flex flex-col gap-5 lg:col-span-2">
            <TodayFocusCard todayLog={todayLog} todaySessions={todaySessions} todayTasks={todayTasks} t={t as (key: string) => string} />

            <WeeklyCommandPanel dailyLogs={data.dailyLogs} studySessions={data.studySessions} t={t as (key: string) => string} />

            <CollapsiblePanel title={t("command.studyQuests")} defaultOpen badge={<span className="rounded-md bg-bg-subtle px-1.5 py-0.5 font-mono text-xs text-text-secondary">{completedQuests}/{quests.length}</span>}>
              <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2">
                {quests.map((quest) => (
                  <QuestItem key={quest.title} {...quest} />
                ))}
              </div>
            </CollapsiblePanel>

            <CollapsiblePanel title={t("reviews.title")} icon={<BookOpen className="h-4 w-4 text-violet" />} badge={dueReviews.length > 0 ? <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet/20 text-xs font-semibold text-violet">{dueReviews.length}</span> : undefined}>
              <RevisionQueue items={data.reviewItems} />
            </CollapsiblePanel>

            <CollapsiblePanel title={t("command.focusTimer")} icon={<Flame className="h-4 w-4 text-cyan" />}>
              <FocusTimer />
            </CollapsiblePanel>

            <DailyLogForm log={todayLog} compact t={t as (key: string) => string} />
          </div>

          <div className="flex flex-col gap-5">
            <GlassCard tone="cyan">
              <SectionHeader title={t("command.signals")} description={t("common.strategicSignal")} />
              <div className="mt-4 flex flex-col gap-3">
                <MetricCard
                  title={t("command.mainBottleneck")}
                  value={weakTopic ? weakTopic.title : t("command.addWeakTopic")}
                  detail={t("command.weakTopicTarget")}
                  icon={Target}
                  tone="rose"
                />
                <MetricCard
                  title={t("command.energySignal")}
                  value={elite.energyIntegrity.score.toFixed(1)}
                  detail={t("common.protectEnergy")}
                  icon={Flame}
                  tone={elite.energyIntegrity.score < 4 ? "danger" : "emerald"}
                />
                <MetricCard
                  title={t("command.examAtRisk")}
                  value={riskyExam ? riskyExam.title : t("command.noCriticalExam")}
                  detail={riskyExam ? `${t("exams.readiness")} ${riskyExam.liveReadiness.toFixed(1)}/10` : t("common.quietProgress")}
                  icon={CalendarClock}
                  tone="gold"
                />
                <MetricCard
                  title={t("command.errorToDestroy")}
                  value={severeError ? severeError.title : t("command.noOpenErrors")}
                  detail={severeError?.preventionRule ?? t("errors.errorDestroyed")}
                  icon={ShieldCheck}
                  tone={severeError ? "danger" : "emerald"}
                />
              </div>
            </GlassCard>

            <GlassCard>
              <SectionHeader title={t("command.examCountdown")} icon={CalendarClock} />
              <div className="mt-4 flex flex-col gap-3">
                {upcomingExams.length > 0 ? upcomingExams.map((exam) => (
                  <ExamCountdown key={exam.id} exam={exam} />
                )) : (
                  <p className="text-sm text-text-secondary">{t("command.noCriticalExam")}</p>
                )}
              </div>
            </GlassCard>

            <GlassCard tone="gold">
              <SectionHeader title={t("command.intelligence")} icon={Radar} />
              <div className="mt-4 flex flex-col gap-3">
                <SignalTile
                  label={t("command.languageSpark")}
                  value={data.languageProgress[0]?.title ?? t("command.createLanguage")}
                  icon={Languages}
                  tone="gold"
                  status={t("language.weeklySpark")}
                />
                <SignalTile
                  label={t("command.opportunitySignal")}
                  value={opportunitiesActive[0]?.title ?? t("command.noOpportunity")}
                  icon={Radar}
                  tone="cyan"
                  status={opportunitiesActive[0]?.deadline ? `${t("opportunities.deadline")} ${fmtDate(opportunitiesActive[0].deadline)}` : t("opportunities.subtitle")}
                />
                <SignalTile
                  label={t("command.reputationMove")}
                  value={data.reputationEvents[0]?.title ?? t("nba.reputation_signal.title")}
                  icon={Brain}
                  tone="violet"
                  status={t("reputation.trust")}
                />
              </div>
            </GlassCard>

            <GlassCard tone="violet">
              <SectionHeader title={t("command.eveningReview")} />
              <p className="mt-2 text-sm leading-6 text-text-secondary">{t("elite.improveBody")}</p>
              <div className="mt-4 grid gap-2.5">
                <AchievementBadge title={t("achievement.firstError")} unlocked={destroyedErrors > 0} detail={`${destroyedErrors} ${t("errors.destroyed")}`} />
                <AchievementBadge title={t("achievement.languageSpark")} unlocked={languageMinutes >= 30} detail={t("language.weeklySpark")} />
                <AchievementBadge title={t("achievement.reputationSignal")} unlocked={data.reputationEvents.length > 0} detail={t("reputation.trust")} />
                <AchievementBadge title={t("achievement.researchSeed")} unlocked={data.opportunities.some((item) => item.opportunityType === "research")} detail={t("opportunities.title")} />
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
