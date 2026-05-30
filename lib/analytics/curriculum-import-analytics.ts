import "server-only";

import { getDb } from "@/lib/db";
import { aiUsageEvents } from "@/lib/db/schema";

export interface CurriculumImportParseEvent {
  promptMode: "v1" | "v2";
  parseSuccess: boolean;
  recordCount?: number;
  countByType?: {
    subjects: number;
    topics: number;
    exams: number;
    tasks: number;
  };
  warningCount?: number;
  warningsByType?: string[];
  v2FieldPresence?: {
    difficultyCount: number;
    confidenceCount: number;
    importanceCount: number;
    riskLevelCount: number;
    readinessScoreCount: number;
    formatCount: number;
    ectsCount: number;
    statusCount: number;
    taskStatusCount: number;
    estimatedMinutesCount: number;
  };
  numericCoercionCount?: number;
  error?: string;
}

export interface CurriculumImportConfirmEvent {
  promptMode: "v1" | "v2";
  confirmClicked: boolean;
  importConfirmed: boolean;
  recordCount?: number;
  countByType?: {
    subjects: number;
    topics: number;
    exams: number;
    tasks: number;
  };
  error?: string;
}

type PreviewSubject = { difficulty?: number; importance?: number };
type PreviewTopic = { difficulty?: number; confidence?: number; status?: string; estimatedMinutes?: number };
type PreviewExam = { difficulty?: number; importance?: number; riskLevel?: number; readinessScore?: number; format?: string; ects?: number };
type PreviewTask = { status?: string; estimatedMinutes?: number };

interface PreviewShape {
  subjects: PreviewSubject[];
  topics: PreviewTopic[];
  exams: PreviewExam[];
  tasks: PreviewTask[];
}

export function computeV2FieldPresence(preview: PreviewShape): CurriculumImportParseEvent["v2FieldPresence"] {
  let difficultyCount = 0;
  let confidenceCount = 0;
  let importanceCount = 0;
  let riskLevelCount = 0;
  let readinessScoreCount = 0;
  let formatCount = 0;
  let ectsCount = 0;
  let statusCount = 0;
  let taskStatusCount = 0;
  let estimatedMinutesCount = 0;

  for (const s of preview.subjects) {
    if (s.difficulty !== undefined) difficultyCount++;
    if (s.importance !== undefined) importanceCount++;
  }
  for (const t of preview.topics) {
    if (t.difficulty !== undefined) difficultyCount++;
    if (t.confidence !== undefined) confidenceCount++;
    if (t.status !== undefined) statusCount++;
    if (t.estimatedMinutes !== undefined) estimatedMinutesCount++;
  }
  for (const e of preview.exams) {
    if (e.difficulty !== undefined) difficultyCount++;
    if (e.importance !== undefined) importanceCount++;
    if (e.riskLevel !== undefined) riskLevelCount++;
    if (e.readinessScore !== undefined) readinessScoreCount++;
    if (e.format !== undefined) formatCount++;
    if (e.ects !== undefined) ectsCount++;
  }
  for (const t of preview.tasks) {
    if (t.status !== undefined) taskStatusCount++;
    if (t.estimatedMinutes !== undefined) estimatedMinutesCount++;
  }

  return {
    difficultyCount,
    confidenceCount,
    importanceCount,
    riskLevelCount,
    readinessScoreCount,
    formatCount,
    ectsCount,
    statusCount,
    taskStatusCount,
    estimatedMinutesCount,
  };
}

export function categorizeWarningType(warning: string): string {
  if (warning.startsWith("Unrecognized topic status")) return "unrecognized_topic_status";
  if (warning.startsWith("Estimated minutes") && warning.includes("topic")) return "estimated_minutes_appended_to_topic";
  if (warning.startsWith("Unrecognized exam format")) return "unrecognized_exam_format";
  if (warning.startsWith("Unrecognized task status")) return "unrecognized_task_status";
  if (warning.startsWith("Estimated minutes") && warning.includes("task")) return "estimated_minutes_appended_to_task";
  return "unknown_warning";
}

export function computeWarningTypes(warnings: string[]): string[] {
  const seen = new Set<string>();
  for (const w of warnings) {
    seen.add(categorizeWarningType(w));
  }
  return [...seen];
}

export async function trackCurriculumImportParse(
  userId: string,
  event: CurriculumImportParseEvent
): Promise<void> {
  await getDb().insert(aiUsageEvents).values({
    userId,
    feature: "curriculum_import_parse",
    provider: "local",
    promptChars: 0,
    responseChars: 0,
    metadata: event as unknown as Record<string, unknown>,
  });
}

export async function trackCurriculumImportConfirm(
  userId: string,
  event: CurriculumImportConfirmEvent
): Promise<void> {
  await getDb().insert(aiUsageEvents).values({
    userId,
    feature: "curriculum_import_confirm",
    provider: "local",
    promptChars: 0,
    responseChars: 0,
    metadata: event as unknown as Record<string, unknown>,
  });
}
