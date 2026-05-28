import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  dailyLogSchema,
  errorLogSchema,
  lifeAdminItemSchema,
  opportunitySchema,
  portfolioItemSchema,
  quizAttemptSchema,
  reputationEventSchema,
  subjectSchema,
  topicSchema,
} from "@/lib/validators/schemas";

const rootDir = path.resolve(import.meta.dirname, "..");

function readFormSource(...parts: string[]) {
  return readFileSync(path.join(rootDir, ...parts), "utf8");
}

describe("validators", () => {
  it("marks required relation selects as required in forms", () => {
    const fields = readFormSource("components", "forms", "fields.tsx");
    const entityForms = readFormSource("components", "forms", "entity-forms.tsx");

    expect(fields).toContain("required?: boolean");
    expect(fields).toContain("required={required}");
    expect(entityForms).toContain('name="subjectId" options={relationOptions(subjects, t("form.reviewItem.subjectEmpty"))} defaultValue={item?.subjectId} required');
    expect(entityForms).toContain('name="subjectId" options={relationOptions(subjects, t("form.exam.subjectEmpty"))} defaultValue={exam?.subjectId} description={t("form.exam.subjectDescription")} required');
  });

  it("accepts a valid subject and coerces scores", () => {
    const parsed = subjectSchema.parse({
      name: "Anatomy",
      code: "",
      description: "",
      color: "#a8d8ff",
      difficulty: "8",
      importance: "10",
    });

    expect(parsed.code).toBeNull();
    expect(parsed.difficulty).toBe(8);
  });

  it("rejects confidence outside 0-10", () => {
    expect(() =>
      topicSchema.parse({
        subjectId: "3bda6b33-d9f6-45b0-8628-73305f2a85c0",
        examId: "",
        title: "Skull base",
        confidence: 12,
      }),
    ).toThrow();
  });

  it("computes quiz score percent and rejects impossible results", () => {
    const parsed = quizAttemptSchema.parse({
      subjectId: "3bda6b33-d9f6-45b0-8628-73305f2a85c0",
      topicId: "",
      examId: "",
      date: "2026-05-19",
      totalQuestions: "20",
      correctAnswers: "15",
      notes: "",
    });

    expect(parsed.scorePercent).toBe(75);
    expect(() =>
      quizAttemptSchema.parse({
        subjectId: "3bda6b33-d9f6-45b0-8628-73305f2a85c0",
        topicId: "",
        examId: "",
        date: "2026-05-19",
        totalQuestions: 10,
        correctAnswers: 11,
      }),
    ).toThrow();
  });

  it("normalizes nullable daily log fields", () => {
    const parsed = dailyLogSchema.parse({
      date: "2026-05-19",
      sleepHours: "",
      energyLevel: "",
      stressLevel: "5",
      moodLevel: "",
      studyMinutes: "90",
      activeRecallMinutes: "45",
      passiveStudyMinutes: "45",
      movementDone: "on",
      notes: "",
    });

    expect(parsed.sleepHours).toBeNull();
    expect(parsed.energyLevel).toBeNull();
    expect(parsed.stressLevel).toBe(5);
    expect(parsed.movementDone).toBe(true);
  });

  it("validates error recurrence and opportunity radar fields", () => {
    const error = errorLogSchema.parse({
      subjectId: "3bda6b33-d9f6-45b0-8628-73305f2a85c0",
      topicId: "",
      examId: "",
      title: "Recurring interpretation error",
      description: "Misread the stem twice.",
      recurrenceCount: "2",
      severity: "7",
      resolved: "false",
    });
    const opportunity = opportunitySchema.parse({
      title: "Research shadowing",
      opportunityType: "research",
      deadline: "2026-06-10",
      valueScore: "8",
      effortScore: "5",
      strategicUpside: "9",
      status: "watching",
      description: "",
      nextAction: "Ask advisor.",
    });

    expect(error.recurrenceCount).toBe(2);
    expect(opportunity.description).toBeNull();
    expect(opportunity.strategicUpside).toBe(9);
  });

  it("only keeps http(s) URLs for user-provided link fields", () => {
    const lifeAdmin = lifeAdminItemSchema.parse({
      title: "Residence permit",
      description: "",
      category: "documents",
      dueAt: "",
      status: "todo",
      priority: "5",
      fileUrl: "javascript:alert(1)",
      fileName: "permit",
    });
    const portfolio = portfolioItemSchema.parse({
      title: "Research evidence",
      description: "",
      itemType: "research",
      date: "",
      evidenceUrl: "https://drive.google.com/file/d/example/view",
      strategicValue: "7",
      status: "active",
    });
    const reputation = reputationEventSchema.parse({
      title: "Presentation",
      description: "",
      eventType: "presentation",
      eventDate: "2026-05-27",
      impact: "6",
      evidenceUrl: "data:text/html,phish",
      followUpAt: "",
      status: "done",
    });

    expect(lifeAdmin.fileUrl).toBeNull();
    expect(portfolio.evidenceUrl).toBe("https://drive.google.com/file/d/example/view");
    expect(reputation.evidenceUrl).toBeNull();
  });
});
