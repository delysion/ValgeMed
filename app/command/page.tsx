import Link from "next/link";
import { differenceInCalendarDays, formatISO, startOfToday, subDays } from "date-fns";
import { ArrowRight, BookOpen, Brain, CalendarClock, Flame, Languages, Radar, ShieldCheck, Sparkles, Target, Zap } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { DailyLogForm } from "@/components/forms/entity-forms";
import { AchievementBadge } from "@/components/premium/gamification";
import { CommandGreeting } from "@/components/premium/command-greeting";
import { CollapsiblePanel } from "@/components/premium/collapsible-panel";
import { ExamCountdown } from "@/components/premium/exam-countdown";
import { FocusTimer } from "@/components/premium/focus-timer";
import { GlassCard } from "@/components/premium/glass-card";
import { MetricCard } from "@/components/premium/metric-card";
import { MomentumBar } from "@/components/premium/momentum-bar";
import { QuestItem } from "@/components/premium/quest-grid";
import { RevisionQueue } from "@/components/premium/revision-queue";
import { SectionHeader } from "@/components/premium/section-header";
import { SignalTile } from "@/components/premium/signal-panel";
import { TodayFocusCard } from "@/components/premium/today-focus";
import { WeeklyCommandPanel } from "@/components/premium/weekly-command";
import { Button } from "@/components/ui/button";
import { requireOwnerSession } from "@/lib/auth/session";
import { getCoreData } from "@/lib/data/queries";
import { fmtDate } from "@/lib/labels";
import { getI18n } from "@/lib/i18n/server";
import { buildBurnoutRiskFromLogs, buildEliteIndex, buildExamReadiness } from "@/lib/scoring/engine";
import { getNextBestAction } from "@/lib/scoring/next-best-action";

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

export default async function CommandPage() {
  const session = await requireOwnerSession();
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

  return (
    <AppShell session={session}>
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
        <CommandGreeting
          greeting={t("command.greeting")}
          dateLabel={dateFormatter.format(today)}
          streak={streak}
          eliteScore={elite.eliteIndex.score}
          eliteLabel={elite.eliteIndex.label}
          nextAction={nextAction}
          t={t}
          lowData={lowData}
        />

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

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="flex flex-col gap-5 lg:col-span-2">
            <TodayFocusCard todayLog={todayLog} todaySessions={todaySessions} todayTasks={todayTasks} t={t as (key: string) => string} />

            <WeeklyCommandPanel dailyLogs={data.dailyLogs} studySessions={data.studySessions} t={t as (key: string) => string} />

            <GlassCard>
              <SectionHeader title={t("command.battlePlan")} description={t("command.oneCleanBlock")} icon={Sparkles} />
              <div className="mt-5 flex flex-col gap-4">
                <MomentumBar label={t("gamification.todayMomentum")} value={Math.max(activeRatio, todayLog ? 45 : 0)} tone="cyan" detail={`${t("study.activeRecall")}: ${activeMinutesToday} min`} />
                <MomentumBar label={t("gamification.recoveryBalance")} value={elite.energyIntegrity.score * 10} tone="emerald" detail={t("health.warning")} />
                <MomentumBar label={t("gamification.readinessTrend")} value={elite.examReadiness.score * 10} tone="violet" detail={t("common.strategicSignal")} />
              </div>
            </GlassCard>

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

            <DailyLogForm log={todayLog} compact />
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
