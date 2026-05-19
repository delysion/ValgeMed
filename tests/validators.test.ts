import { describe, expect, it } from "vitest";

import {
  dailyLogSchema,
  errorLogSchema,
  opportunitySchema,
  quizAttemptSchema,
  subjectSchema,
  topicSchema,
} from "@/lib/validators/schemas";

describe("validators", () => {
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
});
