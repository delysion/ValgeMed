import Link from "next/link";
import { differenceInCalendarDays, formatISO, startOfToday, subDays } from "date-fns";
import { ArrowRight, Brain, CalendarClock, Flame, Languages, Radar, ShieldCheck, Sparkles, Target, Trophy } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { DailyLogForm } from "@/components/forms/entity-forms";
import { AchievementBadge, QuestCard } from "@/components/premium/gamification";
import { GlassCard } from "@/components/premium/glass-card";
import { MetricCard } from "@/components/premium/metric-card";
import { MomentumBar } from "@/components/premium/momentum-bar";
import { ScoreRing } from "@/components/premium/score-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireOwnerSession } from "@/lib/auth/session";
import { getCoreData } from "@/lib/data/queries";
import { fmtDate } from "@/lib/labels";
import type { TranslationKey } from "@/lib/i18n/dictionaries/en";
import { getI18n } from "@/lib/i18n/server";
import { buildBurnoutRiskFromLogs, buildEliteIndex, buildExamReadiness } from "@/lib/scoring/engine";
import { getNextBestAction, type NextBestAction } from "@/lib/scoring/next-best-action";

export const dynamic = "force-dynamic";

function nextActionKey(action: NextBestAction, part: "title" | "reason"): TranslationKey {
  return `nba.${action.kind}.${part}` as TranslationKey;
}

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

  const quests = [
    {
      title: t("quest.destroyError"),
      detail: severeError?.title ?? t("errors.errorDestroyed"),
      complete: destroyedErrors > 0 && recurringErrors === 0,
      tone: "rose" as const,
    },
    {
      title: t("quest.activeRecall"),
      detail: `${activeMinutesToday}/30`,
      complete: activeMinutesToday >= 30,
      tone: "cyan" as const,
    },
    {
      title: t("quest.dueReviews"),
      detail: `${dueReviews.length}`,
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

      <div className="motion-premium grid gap-5 xl:grid-cols-[1.12fr_0.88fr]">
        <GlassCard tone="violet" className="min-h-[430px] p-6 md:p-7">
          <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
            <div className="flex flex-col justify-between gap-8">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="violet">{dateFormatter.format(today)}</Badge>
                  {streak > 0 ? <Badge variant="gold">{t("gamification.commandStreak")} {streak}</Badge> : null}
                  {lowData ? <Badge variant="warning">{t("command.lowDataTitle")}</Badge> : null}
                </div>
                <h3 className="mt-6 max-w-3xl text-balance text-4xl font-semibold tracking-normal text-white md:text-6xl">
                  {t("command.greeting")}
                </h3>
                <p className="mt-4 max-w-2xl text-base leading-7 text-muted md:text-lg">{t("common.nextMoveVisible")}</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan">{t("command.nextBestAction")}</p>
                    <h4 className="mt-2 text-2xl font-semibold text-white">{t(nextActionKey(nextAction, "title"))}</h4>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{t(nextActionKey(nextAction, "reason"))}</p>
                  </div>
                  <Button asChild>
                    <Link href={nextAction.href}>
                      {t("common.open")}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
            <div className="grid place-items-center">
              <ScoreRing
                score={elite.eliteIndex.score}
                label={t("command.eliteIndex")}
                caption={elite.eliteIndex.label}
                tone="violet"
              />
            </div>
          </div>
        </GlassCard>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
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
        </div>
      </div>

      {lowData ? (
        <GlassCard tone="gold" className="mt-5">
          <h3 className="text-lg font-semibold text-white">{t("command.lowDataTitle")}</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{t("command.lowDataBody")}</p>
        </GlassCard>
      ) : null}

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-5">
          <GlassCard>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-white">{t("command.battlePlan")}</h3>
                <p className="mt-1 text-sm text-muted">{t("command.oneCleanBlock")}</p>
              </div>
              <Sparkles className="h-5 w-5 text-cyan" />
            </div>
            <div className="space-y-4">
              <MomentumBar label={t("gamification.todayMomentum")} value={Math.max(activeRatio, todayLog ? 45 : 0)} tone="cyan" detail={`${t("study.activeRecall")}: ${activeMinutesToday} min`} />
              <MomentumBar label={t("gamification.recoveryBalance")} value={elite.energyIntegrity.score * 10} tone="emerald" detail={t("health.warning")} />
              <MomentumBar label={t("gamification.readinessTrend")} value={elite.examReadiness.score * 10} tone="violet" detail={t("common.strategicSignal")} />
            </div>
          </GlassCard>

          <DailyLogForm log={todayLog} compact />
        </div>

        <div className="space-y-5">
          <GlassCard tone="cyan">
            <div className="mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-gold" />
              <h3 className="text-xl font-semibold text-white">{t("command.studyQuests")}</h3>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {quests.map((quest) => (
                <QuestCard key={quest.title} {...quest} />
              ))}
            </div>
          </GlassCard>

          <div className="grid gap-4 md:grid-cols-2">
            <MetricCard
              title={t("command.errorToDestroy")}
              value={severeError ? severeError.title : t("command.noOpenErrors")}
              detail={severeError?.preventionRule ?? t("errors.errorDestroyed")}
              icon={ShieldCheck}
              tone={severeError ? "danger" : "emerald"}
            />
            <MetricCard
              title={t("command.languageSpark")}
              value={data.languageProgress[0]?.title ?? t("command.createLanguage")}
              detail={t("language.weeklySpark")}
              icon={Languages}
              tone="gold"
            />
            <MetricCard
              title={t("command.opportunitySignal")}
              value={opportunitiesActive[0]?.title ?? t("command.noOpportunity")}
              detail={opportunitiesActive[0]?.deadline ? `${t("opportunities.deadline")} ${fmtDate(opportunitiesActive[0].deadline)}` : t("opportunities.subtitle")}
              icon={Radar}
              tone="cyan"
            />
            <MetricCard
              title={t("command.reputationMove")}
              value={data.reputationEvents[0]?.title ?? t("nba.reputation_signal.title")}
              detail={t("reputation.subtitle")}
              icon={Brain}
              tone="violet"
            />
          </div>

          <GlassCard tone="gold">
            <h3 className="text-xl font-semibold text-white">{t("command.eveningReview")}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{t("elite.improveBody")}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <AchievementBadge title={t("achievement.firstError")} unlocked={destroyedErrors > 0} detail={`${destroyedErrors} ${t("errors.destroyed")}`} />
              <AchievementBadge title={t("achievement.languageSpark")} unlocked={languageMinutes >= 30} detail={t("language.weeklySpark")} />
              <AchievementBadge title={t("achievement.reputationSignal")} unlocked={data.reputationEvents.length > 0} detail={t("reputation.trust")} />
              <AchievementBadge title={t("achievement.researchSeed")} unlocked={data.opportunities.some((item) => item.opportunityType === "research")} detail={t("opportunities.title")} />
            </div>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}
