import { differenceInCalendarDays, isBefore, startOfToday } from "date-fns";

import type {
  DailyLog,
  ErrorLog,
  Exam,
  LanguageProgress,
  LifeAdminItem,
  Opportunity,
  ReputationEvent,
  ReviewItem,
  Topic,
} from "@/lib/db/schema";

export type NextBestAction = {
  kind:
    | "recovery"
    | "simulation"
    | "error_review"
    | "spaced_review"
    | "active_recall"
    | "quiz"
    | "light_consolidation"
    | "priority_topic"
    | "language_move"
    | "opportunity_capture"
    | "reputation_signal"
    | "life_admin";
  title: string;
  reason: string;
  href: string;
};

export function getNextBestAction(input: {
  burnoutRisk: number;
  exams: Array<Exam & { liveReadiness?: number }>;
  reviewItems: ReviewItem[];
  errorLogs: ErrorLog[];
  topics: Topic[];
  todayLog?: DailyLog | null;
  energyIntegrity?: number;
  languageProgress?: LanguageProgress[];
  opportunities?: Opportunity[];
  reputationEvents?: ReputationEvent[];
  lifeAdminItems?: LifeAdminItem[];
}): NextBestAction {
  const today = startOfToday();

  if (input.burnoutRisk >= 8 || (input.energyIntegrity !== undefined && input.energyIntegrity < 4)) {
    return {
      kind: "recovery",
      title: "Recovery + light review",
      reason:
        input.energyIntegrity !== undefined && input.energyIntegrity < 4
          ? "Energy Integrity below 4/10: protect sleep, recovery and light consolidation today."
          : "Burnout risk is high: consolidate without forcing intensity today.",
      href: "/health",
    };
  }

  const examByRisk = input.exams
    .filter((exam) => exam.riskLevel >= 8)
    .sort((a, b) => b.riskLevel - a.riskLevel)[0];

  if (examByRisk) {
    return {
      kind: "simulation",
      title: "Exam battle plan",
      reason: `${examByRisk.title} has risk level ${examByRisk.riskLevel}/10: needs simulation or battle plan.`,
      href: `/exams/${examByRisk.id}`,
    };
  }

  const riskyExam = input.exams
    .filter((exam) => exam.examDate)
    .map((exam) => ({
      exam,
      days: differenceInCalendarDays(exam.examDate as Date, today),
      readiness: exam.liveReadiness ?? exam.readinessScore,
    }))
    .filter((item) => item.days >= 0 && item.days <= 21 && item.readiness < 6)
    .sort((a, b) => a.days - b.days)[0];

  if (riskyExam) {
    return {
      kind: "simulation",
      title: "Exam simulation",
      reason: `${riskyExam.exam.title} is close and readiness is below 6/10.`,
      href: `/exams/${riskyExam.exam.id}`,
    };
  }

  const severeOpenError = input.errorLogs
    .filter((error) => !error.resolved && error.severity >= 7)
    .sort((a, b) => b.severity - a.severity)[0];

  if (severeOpenError) {
    return {
      kind: "error_review",
      title: "Targeted error review",
      reason: `High-severity open error: ${severeOpenError.title}.`,
      href: "/errors",
    };
  }

  const dueReview = input.reviewItems.find(
    (item) =>
      item.isActive &&
      (isBefore(item.dueAt, today) ||
        differenceInCalendarDays(item.dueAt, today) === 0),
  );

  if (dueReview) {
    return {
      kind: "spaced_review",
      title: "Spaced review due",
      reason: "Items are due today or overdue.",
      href: "/reviews",
    };
  }

  const fragileTopic = input.topics
    .filter((topic) => topic.confidence <= 3)
    .sort((a, b) => b.priority + b.difficulty - (a.priority + a.difficulty))[0];

  if (fragileTopic) {
    return {
      kind: "active_recall",
      title: "Active recall on fragile topic",
      reason: `${fragileTopic.title} has confidence <= 3.`,
      href: "/topics",
    };
  }

  if (
    input.todayLog &&
    input.todayLog.passiveStudyMinutes > 90 &&
    input.todayLog.passiveStudyMinutes > input.todayLog.activeRecallMinutes
  ) {
    return {
      kind: "quiz",
      title: "Convert passive into quiz",
      reason: "Passive study is exceeding active recall today.",
      href: "/study-sessions",
    };
  }

  if (input.todayLog?.energyLevel !== null && input.todayLog?.energyLevel !== undefined) {
    if (input.todayLog.energyLevel <= 3) {
      return {
        kind: "light_consolidation",
        title: "Light consolidation",
        reason: "Low energy: light review and clean closure today.",
        href: "/reviews",
      };
    }
  }

  const neglectedLanguage = input.languageProgress
    ?.filter((item) => {
      if (!item.nextPracticeAt) {
        return item.language === "estonian" && item.minutes < 60;
      }

      return differenceInCalendarDays(item.nextPracticeAt, today) <= 0;
    })
    .sort((a, b) => a.confidence - b.confidence)[0];

  if (neglectedLanguage) {
    return {
      kind: "language_move",
      title: "Language move",
      reason: `${neglectedLanguage.title} needs a micro-session: Estonia integration should not stay theoretical.`,
      href: "/language",
    };
  }

  const deadlineOpportunity = input.opportunities
    ?.filter((item) => item.deadline && !["passed", "archived"].includes(item.status))
    .map((item) => ({ item, days: differenceInCalendarDays(item.deadline as string, today) }))
    .filter(({ days }) => days >= 0 && days <= 14)
    .sort((a, b) => a.days - b.days || b.item.strategicUpside - a.item.strategicUpside)[0];

  if (deadlineOpportunity) {
    return {
      kind: "opportunity_capture",
      title: "Opportunity capture",
      reason: `${deadlineOpportunity.item.title} expires in ${deadlineOpportunity.days} days: define or complete the next action.`,
      href: "/opportunities",
    };
  }

  const recentReputationSignals =
    input.reputationEvents?.filter(
      (event) => differenceInCalendarDays(today, new Date(event.eventDate)) <= 14,
    ).length ?? 0;

  if (input.reputationEvents && recentReputationSignals === 0) {
    return {
      kind: "reputation_signal",
      title: "Quiet reputation signal",
      reason: "No recent signals: choose a precise question, a useful contribution, or a reliability proof.",
      href: "/reputation",
    };
  }

  const overdueLifeAdmin = input.lifeAdminItems
    ?.filter((item) => item.dueAt && item.status !== "done" && differenceInCalendarDays(item.dueAt, today) <= 0)
    .sort((a, b) => b.priority - a.priority)[0];

  if (overdueLifeAdmin) {
    return {
      kind: "life_admin",
      title: "Life admin closure",
      reason: `${overdueLifeAdmin.title} is open or due: remove friction before it becomes mental noise.`,
      href: "/life-admin",
    };
  }

  const priorityTopic = input.topics
    .slice()
    .sort((a, b) => b.priority + b.difficulty - (a.priority + a.difficulty))[0];

  return {
    kind: "priority_topic",
    title: priorityTopic ? `Priority topic: ${priorityTopic.title}` : "Plan your first topic",
    reason: priorityTopic
      ? "No immediate alarm: choose the topic with highest priority and difficulty."
      : "Add subjects and topics to activate the study operating system.",
    href: priorityTopic ? "/topics" : "/subjects",
  };
}
