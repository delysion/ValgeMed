import { differenceInCalendarDays, isAfter, subDays } from "date-fns";

import type {
  DailyLog,
  ErrorLog,
  Exam,
  HealthLog,
  QuizAttempt,
  ReviewItem,
  StudySession,
  Topic,
} from "@/lib/db/schema";
import { tallinnDate } from "@/lib/dates";
import { asNumber, clamp } from "@/lib/utils";
import { buildBurnoutRiskFromLogs, buildExamReadiness } from "@/lib/scoring/engine";

export type TargetLevel = "pass" | "strong" | "top_10" | "top_5" | "top_1";
export type WeaknessTolerance = "normal" | "low" | "zero";
export type ExamStrategy = "conserve" | "balanced" | "push" | "kill_errors" | "simulate";

export type EliteTargetSettings = {
  targetLevel: TargetLevel;
  weaknessTolerance: WeaknessTolerance;
  examStrategy: ExamStrategy;
};

export const DEFAULT_ELITE_TARGET_SETTINGS: EliteTargetSettings = {
  targetLevel: "top_5",
  weaknessTolerance: "low",
  examStrategy: "balanced",
};

export const targetLevelLabels: Record<TargetLevel, string> = {
  pass: "Pass safely",
  strong: "Strong exam performance",
  top_10: "Top 10% target",
  top_5: "Top 5% target",
  top_1: "Top 1% target",
};

export const weaknessToleranceLabels: Record<WeaknessTolerance, string> = {
  normal: "Normal tolerance",
  low: "Low tolerance",
  zero: "Zero tolerance",
};

export const examStrategyLabels: Record<ExamStrategy, string> = {
  conserve: "Conserve",
  balanced: "Balanced",
  push: "Push",
  kill_errors: "Kill errors",
  simulate: "Simulate",
};

const readinessTargetByLevel: Record<TargetLevel, number> = {
  pass: 5.5,
  strong: 7,
  top_10: 8,
  top_5: 8.6,
  top_1: 9.2,
};

const passiveMultiplierByTarget: Record<TargetLevel, number> = {
  pass: 0.65,
  strong: 0.85,
  top_10: 1,
  top_5: 1.15,
  top_1: 1.35,
};

const activeMethods = new Set(["active_recall", "quiz", "simulation", "error_review"]);

type EliteCommandInput = {
  now?: Date;
  settings?: Partial<EliteTargetSettings> | null;
  exams: Array<Partial<Exam> & { liveReadiness?: number }>;
  topics: Array<Partial<Topic>>;
  studySessions: Array<Partial<StudySession>>;
  reviewItems: Array<Partial<ReviewItem>>;
  errorLogs: Array<Partial<ErrorLog>>;
  quizAttempts: Array<Partial<QuizAttempt>>;
  dailyLogs: Array<Partial<DailyLog>>;
  healthLogs?: Array<Partial<HealthLog>>;
};

export type EliteScoreExplanation = {
  score: number;
  label: string;
  reasons: string[];
  penalties: string[];
  recommendedAction: string;
};

export type PerformanceBlocker = {
  id: string;
  label: string;
  linkedSubjectId?: string | null;
  linkedTopicId?: string | null;
  linkedExamId?: string | null;
  severity: number;
  recurrenceCount: number;
  lastSeen: Date | null;
  requiredAction: string;
  status: "open" | "under_attack" | "retest_scheduled" | "destroyed";
};

export type PerformanceThreat = {
  type:
    | "open_critical_error"
    | "low_active_recall"
    | "weak_topic_close_to_exam"
    | "declining_accuracy"
    | "excessive_fatigue"
    | "unreviewed_old_mistake"
    | "passive_study_overload"
    | "no_simulation_close_to_exam";
  title: string;
  severity: number;
  detail: string;
  href: string;
};

export type WinningMove = {
  kind: "recovery" | "simulation" | "error_review" | "active_recall" | "spaced_review" | "priority_topic";
  title: string;
  reason: string;
  href: string;
  linkedLabel?: string;
  estimatedMinutes: number;
  expectedImpact: string;
  dangerIfIgnored: string;
  cta: string;
};

export type ExamPerformancePlan = {
  examId: string;
  title: string;
  daysRemaining: number | null;
  readiness: number;
  eliteReadinessGap: number;
  highRiskTopics: string[];
  unresolvedErrorClusters: string[];
  activeRecallCoverage: number;
  simulationStatus: string;
  seventyTwoHourPlan: string[];
  recoveryConstraints: string[];
  finalRetestChecklist: string[];
};

export type ElitePerformanceSnapshot = {
  examReadiness: number;
  readinessTarget: number;
  readinessGap: number;
  errorDestructionProgress: number;
  energyIntegrity: number;
  burnoutRisk: number;
  passiveStudyPenalty: number;
  criticalErrorPenalty: number;
  activeRecallCoverage: number;
  simulationRequirementNearExam: number;
  fatigueAdjustedReadiness: number;
  elitePerformanceIndex: EliteScoreExplanation;
};

export type ElitePerformanceCommand = {
  settings: EliteTargetSettings;
  winningMove: WinningMove;
  snapshot: ElitePerformanceSnapshot;
  threats: PerformanceThreat[];
  blockers: PerformanceBlocker[];
  examPlans: ExamPerformancePlan[];
  recoveryWarning: { message: string; recommendedAction: string } | null;
};

export function normalizeEliteTargetSettings(
  input?: { targetLevel?: unknown; weaknessTolerance?: unknown; examStrategy?: unknown } | null,
): EliteTargetSettings {
  return {
    targetLevel: isTargetLevel(input?.targetLevel) ? input.targetLevel : DEFAULT_ELITE_TARGET_SETTINGS.targetLevel,
    weaknessTolerance: isWeaknessTolerance(input?.weaknessTolerance)
      ? input.weaknessTolerance
      : DEFAULT_ELITE_TARGET_SETTINGS.weaknessTolerance,
    examStrategy: isExamStrategy(input?.examStrategy) ? input.examStrategy : DEFAULT_ELITE_TARGET_SETTINGS.examStrategy,
  };
}

function isTargetLevel(value: unknown): value is TargetLevel {
  return typeof value === "string" && value in targetLevelLabels;
}

function isWeaknessTolerance(value: unknown): value is WeaknessTolerance {
  return typeof value === "string" && value in weaknessToleranceLabels;
}

function isExamStrategy(value: unknown): value is ExamStrategy {
  return typeof value === "string" && value in examStrategyLabels;
}

function latestDailyLog(logs: Array<Partial<DailyLog>>, now: Date) {
  const todayKey = tallinnDate(now);
  return logs.find((log) => log.date === todayKey) ?? logs[0] ?? null;
}

function average(values: number[], fallback = 0) {
  const finite = values.filter(Number.isFinite);
  if (finite.length === 0) return fallback;
  return finite.reduce((sum, value) => sum + value, 0) / finite.length;
}

function toDate(value: unknown): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function getLiveReadiness(input: EliteCommandInput) {
  if (input.exams.length > 0) {
    const values = input.exams.map((exam) => asNumber(exam.liveReadiness ?? exam.readinessScore));
    const avg = average(values, 0);
    if (avg > 0) return clamp(avg);
  }

  return buildExamReadiness({
    topics: input.topics as Topic[],
    studySessions: input.studySessions as StudySession[],
    errorLogs: input.errorLogs as ErrorLog[],
    quizAttempts: input.quizAttempts as QuizAttempt[],
    dailyLogs: input.dailyLogs as DailyLog[],
  }).score;
}

function activeRecallCoverage(studySessions: Array<Partial<StudySession>>, todayLog: Partial<DailyLog> | null) {
  const recent = studySessions.filter((session) => {
    const startedAt = toDate(session.startedAt);
    return startedAt ? isAfter(startedAt, subDays(new Date(), 21)) : true;
  });
  const activeSessionMinutes = recent
    .filter((session) => activeMethods.has(String(session.method)))
    .reduce((sum, session) => sum + asNumber(session.durationMinutes), 0);
  const totalSessionMinutes = recent.reduce((sum, session) => sum + asNumber(session.durationMinutes), 0);
  const active = activeSessionMinutes + asNumber(todayLog?.activeRecallMinutes);
  const total = totalSessionMinutes + asNumber(todayLog?.studyMinutes || (asNumber(todayLog?.activeRecallMinutes) + asNumber(todayLog?.passiveStudyMinutes)));

  return total === 0 ? 0 : clamp((active / total) * 10);
}

function passiveStudyPenalty(todayLog: Partial<DailyLog> | null, settings: EliteTargetSettings) {
  const active = asNumber(todayLog?.activeRecallMinutes);
  const passive = asNumber(todayLog?.passiveStudyMinutes);
  const total = active + passive;
  if (total === 0) return 0;
  return clamp((passive / total) * 10 * passiveMultiplierByTarget[settings.targetLevel]);
}

function criticalErrorPenalty(errorLogs: Array<Partial<ErrorLog>>, settings: EliteTargetSettings) {
  const openErrors = errorLogs.filter((error) => !error.resolved);
  const maxSeverity = Math.max(0, ...openErrors.map((error) => asNumber(error.severity)));
  const recurrence = average(openErrors.map((error) => asNumber(error.recurrenceCount)), 0);
  const toleranceMultiplier = settings.weaknessTolerance === "zero" ? 1.35 : settings.weaknessTolerance === "low" ? 1.1 : 0.85;
  return clamp((maxSeverity + recurrence) * toleranceMultiplier);
}

function simulationRequirementNearExam(input: EliteCommandInput, now: Date) {
  const nearExam = input.exams
    .map((exam) => ({ exam, date: toDate(exam.examDate) }))
    .filter((item): item is { exam: Partial<Exam> & { liveReadiness?: number }; date: Date } => !!item.date)
    .map((item) => ({ ...item, days: differenceInCalendarDays(item.date, now) }))
    .filter((item) => item.days >= 0 && item.days <= 14)
    .sort((a, b) => a.days - b.days)[0];

  if (!nearExam) return 0;

  const hasSimulation = input.studySessions.some((session) => session.examId === nearExam.exam.id && session.method === "simulation") ||
    input.quizAttempts.some((attempt) => attempt.examId === nearExam.exam.id);

  return hasSimulation ? 2 : clamp(10 - nearExam.days / 2);
}

function errorDestructionProgress(errorLogs: Array<Partial<ErrorLog>>) {
  if (errorLogs.length === 0) return 6;
  const resolved = errorLogs.filter((error) => error.resolved).length;
  return clamp((resolved / errorLogs.length) * 10);
}

function energyIntegrityFromLogs(dailyLogs: Array<Partial<DailyLog>>, burnoutRisk: number) {
  const energy = average(dailyLogs.map((log) => asNumber(log.energyLevel)).filter((value) => value > 0), 7);
  return clamp((energy * 0.65) + ((10 - burnoutRisk) * 0.35));
}

export function calculateEliteReadinessMetrics(input: EliteCommandInput): ElitePerformanceSnapshot {
  const now = input.now ?? new Date();
  const settings = normalizeEliteTargetSettings(input.settings);
  const todayLog = latestDailyLog(input.dailyLogs, now);
  const burnoutRisk = buildBurnoutRiskFromLogs(input.dailyLogs as DailyLog[], input.quizAttempts as QuizAttempt[], now).score;
  const examReadiness = getLiveReadiness(input);
  const readinessTarget = readinessTargetByLevel[settings.targetLevel];
  const activeCoverage = activeRecallCoverage(input.studySessions, todayLog);
  const passivePenalty = passiveStudyPenalty(todayLog, settings);
  const errorPenalty = criticalErrorPenalty(input.errorLogs, settings);
  const simulationRequirement = simulationRequirementNearExam(input, now);
  const energyIntegrity = energyIntegrityFromLogs(input.dailyLogs, burnoutRisk);
  const fatigueAdjustedReadiness = clamp(examReadiness - burnoutRisk * 0.35);
  const readinessGap = Math.max(0, Number((readinessTarget - fatigueAdjustedReadiness).toFixed(1)));
  const errorProgress = errorDestructionProgress(input.errorLogs);
  const score = clamp(
    fatigueAdjustedReadiness * 0.35 +
    activeCoverage * 0.2 +
    errorProgress * 0.18 +
    energyIntegrity * 0.15 -
    passivePenalty * 0.08 -
    errorPenalty * 0.08 -
    simulationRequirement * 0.06 +
    1.2,
  );
  const penalties = [
    passivePenalty >= 6 ? "Passive study is crowding out active recall." : null,
    errorPenalty >= 7 ? "Critical unresolved errors are too dangerous for the selected target." : null,
    burnoutRisk >= 7 ? "Fatigue is reducing useful readiness." : null,
    simulationRequirement >= 7 ? "A near exam lacks enough simulation evidence." : null,
  ].filter(Boolean) as string[];
  const reasons = [
    `Target: ${targetLevelLabels[settings.targetLevel]}.`,
    `Fatigue-adjusted readiness: ${fatigueAdjustedReadiness.toFixed(1)}/10.`,
    `Active recall coverage: ${activeCoverage.toFixed(1)}/10.`,
  ];

  return {
    examReadiness,
    readinessTarget,
    readinessGap,
    errorDestructionProgress: errorProgress,
    energyIntegrity,
    burnoutRisk,
    passiveStudyPenalty: passivePenalty,
    criticalErrorPenalty: errorPenalty,
    activeRecallCoverage: activeCoverage,
    simulationRequirementNearExam: simulationRequirement,
    fatigueAdjustedReadiness,
    elitePerformanceIndex: {
      score,
      label: score >= 8.6 ? "Top Performance Mode" : score >= 7 ? "Elite trajectory" : score >= 5 ? "Fragile but workable" : "Performance leak",
      reasons,
      penalties,
      recommendedAction: penalties[0] ?? "Keep converting effort into active recall, retest evidence, and recovery protection.",
    },
  };
}

export function derivePerformanceBlockers(input: {
  errorLogs: Array<Partial<ErrorLog>>;
  topics: Array<Partial<Topic>>;
  exams: Array<Partial<Exam>>;
  now?: Date;
}): PerformanceBlocker[] {
  const errorBlockers = input.errorLogs.map((error) => {
    const resolved = !!error.resolved;
    const severity = asNumber(error.severity);
    const recurrenceCount = asNumber(error.recurrenceCount);
    const lastSeen = toDate(error.updatedAt) ?? toDate(error.createdAt);
    return {
      id: String(error.id ?? error.title ?? "error"),
      label: String(error.title ?? "Unlabeled error cluster"),
      linkedSubjectId: error.subjectId ?? null,
      linkedTopicId: error.topicId ?? null,
      linkedExamId: error.examId ?? null,
      severity,
      recurrenceCount,
      lastSeen,
      requiredAction: resolved
        ? "Keep as destroyed unless it reappears."
        : `Retest with active recall, write the prevention rule, then schedule a closed-book check.`,
      status: resolved ? "destroyed" as const : "open" as const,
    };
  });

  const topicBlockers = input.topics
    .filter((topic) => asNumber(topic.confidence) <= 3 || asNumber(topic.priority) >= 8)
    .map((topic) => ({
      id: String(topic.id ?? topic.title ?? "topic"),
      label: String(topic.title ?? "Avoided topic"),
      linkedSubjectId: topic.subjectId ?? null,
      linkedTopicId: topic.id ?? null,
      linkedExamId: topic.examId ?? null,
      severity: clamp(10 - asNumber(topic.confidence) + asNumber(topic.priority) / 3),
      recurrenceCount: 0,
      lastSeen: toDate(topic.lastStudiedAt) ?? toDate(topic.updatedAt) ?? null,
      requiredAction: "Run a short active-recall block and convert misses into explicit errors.",
      status: "open" as const,
    }));

  return [...errorBlockers, ...topicBlockers]
    .sort((a, b) => (b.severity + b.recurrenceCount * 1.5) - (a.severity + a.recurrenceCount * 1.5))
    .slice(0, 12);
}

function buildThreats(input: EliteCommandInput, snapshot: ElitePerformanceSnapshot, blockers: PerformanceBlocker[]): PerformanceThreat[] {
  const now = input.now ?? new Date();
  const threats: PerformanceThreat[] = [];
  const critical = blockers.find((blocker) => blocker.status !== "destroyed" && blocker.severity >= 7);
  if (critical) {
    threats.push({
      type: "open_critical_error",
      title: critical.label,
      severity: critical.severity,
      detail: critical.requiredAction,
      href: "/performance-blockers",
    });
  }

  if (snapshot.activeRecallCoverage < 4) {
    threats.push({
      type: "low_active_recall",
      title: "Active Recall Required",
      severity: 7,
      detail: "Current effort is not producing enough retrieval evidence.",
      href: "/study",
    });
  }

  if (snapshot.passiveStudyPenalty >= 6) {
    threats.push({
      type: "passive_study_overload",
      title: "Passive Study Warning",
      severity: snapshot.passiveStudyPenalty,
      detail: "Reading or notes are dominating the day. Convert the next block into questions.",
      href: "/study-sessions",
    });
  }

  if (snapshot.burnoutRisk >= 7 || snapshot.energyIntegrity < 4) {
    threats.push({
      type: "excessive_fatigue",
      title: "Recovery Required",
      severity: snapshot.burnoutRisk,
      detail: "More intensity is likely to lower tomorrow's useful output.",
      href: "/health",
    });
  }

  const nearExamWithoutSimulation = input.exams
    .map((exam) => ({ exam, date: toDate(exam.examDate) }))
    .filter((item): item is { exam: Partial<Exam> & { liveReadiness?: number }; date: Date } => !!item.date)
    .map((item) => ({ ...item, days: differenceInCalendarDays(item.date, now) }))
    .filter((item) => item.days >= 0 && item.days <= 14)
    .find((item) => !input.quizAttempts.some((attempt) => attempt.examId === item.exam.id));

  if (nearExamWithoutSimulation) {
    threats.push({
      type: "no_simulation_close_to_exam",
      title: `No simulation close to ${nearExamWithoutSimulation.exam.title ?? "exam"}`,
      severity: snapshot.simulationRequirementNearExam,
      detail: "Near exams need simulation evidence, not just topic confidence.",
      href: `/exams/${nearExamWithoutSimulation.exam.id}`,
    });
  }

  return threats.sort((a, b) => b.severity - a.severity).slice(0, 3);
}

export function buildExamPerformancePlan(input: EliteCommandInput, snapshot: ElitePerformanceSnapshot): ExamPerformancePlan[] {
  const now = input.now ?? new Date();
  const settings = normalizeEliteTargetSettings(input.settings);
  return input.exams
    .map((exam) => {
      const examId = String(exam.id ?? "");
      const examDate = toDate(exam.examDate);
      const examTopics = input.topics.filter((topic) => topic.examId === exam.id);
      const examErrors = input.errorLogs.filter((error) => error.examId === exam.id);
      const readiness = exam.liveReadiness ?? exam.readinessScore ?? buildExamReadiness({
        topics: examTopics as Topic[],
        studySessions: input.studySessions.filter((session) => session.examId === exam.id) as StudySession[],
        errorLogs: examErrors as ErrorLog[],
        quizAttempts: input.quizAttempts.filter((attempt) => attempt.examId === exam.id) as QuizAttempt[],
        dailyLogs: input.dailyLogs as DailyLog[],
      }).score;
      const highRiskTopics = examTopics
        .filter((topic) => asNumber(topic.confidence) <= 5 || asNumber(topic.priority) >= 8)
        .sort((a, b) => asNumber(a.confidence) - asNumber(b.confidence))
        .slice(0, 5)
        .map((topic) => String(topic.title ?? "Untitled topic"));
      const unresolvedErrorClusters = examErrors
        .filter((error) => !error.resolved)
        .sort((a, b) => asNumber(b.severity) - asNumber(a.severity))
        .slice(0, 5)
        .map((error) => String(error.title ?? "Open error"));
      const examSessions = input.studySessions.filter((session) => session.examId === exam.id);
      const activeMinutes = examSessions
        .filter((session) => activeMethods.has(String(session.method)))
        .reduce((sum, session) => sum + asNumber(session.durationMinutes), 0);
      const totalMinutes = examSessions.reduce((sum, session) => sum + asNumber(session.durationMinutes), 0);
      const hasSimulation = input.quizAttempts.some((attempt) => attempt.examId === exam.id) ||
        examSessions.some((session) => session.method === "simulation");
      return {
        examId,
        title: String(exam.title ?? "Exam"),
        daysRemaining: examDate ? differenceInCalendarDays(examDate, now) : null,
        readiness: clamp(asNumber(readiness)),
        eliteReadinessGap: Math.max(0, Number((readinessTargetByLevel[settings.targetLevel] - asNumber(readiness)).toFixed(1))),
        highRiskTopics,
        unresolvedErrorClusters,
        activeRecallCoverage: totalMinutes === 0 ? snapshot.activeRecallCoverage : clamp((activeMinutes / totalMinutes) * 10),
        simulationStatus: hasSimulation ? "Simulation evidence exists" : "Simulation required",
        seventyTwoHourPlan: [
          "Retest the most dangerous open error cluster.",
          highRiskTopics[0] ? `Closed-book recall: ${highRiskTopics[0]}.` : "Run one closed-book active recall block.",
          hasSimulation ? "Review simulation misses and prevention rules." : "Run a timed simulation or mixed quiz.",
        ],
        recoveryConstraints: snapshot.burnoutRisk >= 7
          ? ["Protect sleep and use short recall blocks only.", "Stop before accuracy degrades."]
          : ["Do not add passive hours without a retest.", "Keep recovery strong enough to preserve tomorrow's recall."],
        finalRetestChecklist: [
          ...unresolvedErrorClusters.slice(0, 3).map((title) => `Retest: ${title}`),
          "Confirm active recall without notes.",
          "Check one exam-format simulation.",
        ],
      };
    })
    .sort((a, b) => (a.daysRemaining ?? 999) - (b.daysRemaining ?? 999))
    .slice(0, 4);
}

function buildWinningMove(
  input: EliteCommandInput,
  snapshot: ElitePerformanceSnapshot,
  blockers: PerformanceBlocker[],
  examPlans: ExamPerformancePlan[],
): WinningMove {
  const settings = normalizeEliteTargetSettings(input.settings);

  if (snapshot.burnoutRisk >= 8 || snapshot.energyIntegrity < 4) {
    return {
      kind: "recovery",
      title: "Recovery Required",
      reason: "Burnout risk is high enough that harder pushing is likely to reduce future performance.",
      href: "/health",
      estimatedMinutes: 35,
      expectedImpact: "Preserve tomorrow's recall and decision quality.",
      dangerIfIgnored: "You may trade one more tired hour today for worse recall tomorrow.",
      cta: "Protect Performance",
    };
  }

  const criticalBlocker = blockers.find((blocker) => blocker.status !== "destroyed" && blocker.severity >= (settings.weaknessTolerance === "zero" ? 6 : 8));
  if (criticalBlocker && (settings.weaknessTolerance === "zero" || settings.examStrategy === "kill_errors")) {
    return {
      kind: "error_review",
      title: `Destroy: ${criticalBlocker.label}`,
      reason: "This is the most dangerous open error cluster for the selected target.",
      href: "/performance-blockers",
      linkedLabel: criticalBlocker.label,
      estimatedMinutes: 45,
      expectedImpact: "Reduce repeat-mistake risk and raise exam reliability.",
      dangerIfIgnored: "The same mistake can survive until the exam.",
      cta: "Open Blocker",
    };
  }

  const nearPlan = examPlans.find((plan) => plan.daysRemaining !== null && plan.daysRemaining >= 0 && plan.daysRemaining <= 14);
  if (nearPlan && (settings.examStrategy === "simulate" || nearPlan.eliteReadinessGap >= 2.5 || nearPlan.simulationStatus === "Simulation required")) {
    return {
      kind: "simulation",
      title: `Simulation: ${nearPlan.title}`,
      reason: "The exam is close and readiness needs evidence under exam conditions.",
      href: `/exams/${nearPlan.examId}`,
      linkedLabel: nearPlan.title,
      estimatedMinutes: 60,
      expectedImpact: "Expose hidden gaps before the exam does.",
      dangerIfIgnored: "You may feel productive while remaining untested.",
      cta: "Open Exam Plan",
    };
  }

  const dueReview = input.reviewItems.find((item) => item.isActive && toDate(item.dueAt) && differenceInCalendarDays(toDate(item.dueAt) as Date, input.now ?? new Date()) <= 0);
  if (dueReview) {
    return {
      kind: "spaced_review",
      title: "Retest due items",
      reason: "Old material is due for retrieval before it decays.",
      href: "/reviews",
      estimatedMinutes: 30,
      expectedImpact: "Stabilize recall with minimal new load.",
      dangerIfIgnored: "Weak memory traces stay invisible.",
      cta: "Open Reviews",
    };
  }

  const weakTopic = input.topics
    .slice()
    .sort((a, b) => asNumber(a.confidence) - asNumber(b.confidence) || asNumber(b.priority) - asNumber(a.priority))[0];

  return {
    kind: "active_recall",
    title: weakTopic?.title ? `Active Recall Required: ${weakTopic.title}` : "Define the first active recall block",
    reason: weakTopic?.title ? "Lowest-confidence high-leverage topic should become retrieval work." : "Add topics and start measuring recall.",
    href: weakTopic?.id ? "/topics" : "/subjects",
    linkedLabel: weakTopic?.title ? String(weakTopic.title) : undefined,
    estimatedMinutes: 40,
    expectedImpact: "Turn study effort into measurable readiness.",
    dangerIfIgnored: "Effort may stay disconnected from exam performance.",
    cta: "Start Block",
  };
}

export function buildElitePerformanceCommand(input: EliteCommandInput): ElitePerformanceCommand {
  const normalized = { ...input, settings: normalizeEliteTargetSettings(input.settings) };
  const snapshot = calculateEliteReadinessMetrics(normalized);
  const blockers = derivePerformanceBlockers({
    errorLogs: normalized.errorLogs,
    topics: normalized.topics,
    exams: normalized.exams,
    now: normalized.now,
  });
  const examPlans = buildExamPerformancePlan(normalized, snapshot);
  const threats = buildThreats(normalized, snapshot, blockers);
  const winningMove = buildWinningMove(normalized, snapshot, blockers, examPlans);

  return {
    settings: normalized.settings,
    winningMove,
    snapshot,
    threats,
    blockers,
    examPlans,
    recoveryWarning: winningMove.kind === "recovery"
      ? {
          message: "More study right now may reduce tomorrow's performance.",
          recommendedAction: "Recover, then do a short light review only if attention returns.",
        }
      : null,
  };
}
