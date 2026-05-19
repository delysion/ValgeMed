import { describe, expect, it } from "vitest";

import {
  calculateEliteIndexScore,
  calculateBurnoutRisk,
  calculateExamReadinessScore,
  calculateStudyEfficiencyScore,
} from "@/lib/scoring/engine";

describe("scoring engine", () => {
  it("normalizes exam readiness to a 0-10 range and exposes factors", () => {
    const result = calculateExamReadinessScore({
      topicCompletion: 8,
      activeRecallScore: 7,
      quizScore: 6,
      errorResolution: 5,
      consistencyScore: 8,
      burnoutRisk: 3,
    });

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(10);
    expect(result.factors).toHaveLength(6);
    expect(result.factors.some((factor) => factor.direction === "negative")).toBe(true);
  });

  it("penalizes passive study and fatigue in efficiency", () => {
    const high = calculateStudyEfficiencyScore({
      outputQuality: 8,
      focusLevel: 8,
      activeRecallRatio: 8,
      quizAccuracy: 8,
      passiveStudyPenalty: 1,
      fatiguePenalty: 1,
    });
    const low = calculateStudyEfficiencyScore({
      outputQuality: 8,
      focusLevel: 8,
      activeRecallRatio: 8,
      quizAccuracy: 8,
      passiveStudyPenalty: 8,
      fatiguePenalty: 8,
    });

    expect(high.score).toBeGreaterThan(low.score);
  });

  it("calculates burnout as a weighted risk score", () => {
    const result = calculateBurnoutRisk({
      lowSleepScore: 9,
      stressScore: 8,
      decliningAccuracyScore: 6,
      excessiveMinutesScore: 5,
      lowEnergyScore: 7,
    });

    expect(result.score).toBeCloseTo(7.35);
    expect(result.note).toContain("0-10");
  });

  it("builds the elite index with the required strategic label", () => {
    const result = calculateEliteIndexScore({
      medicalMastery: 7,
      examReadiness: 6,
      timeLeverage: 8,
      errorDestruction: 6,
      energyIntegrity: 7,
      estoniaIntegration: 5,
      reputationCapital: 4,
      opportunityCapture: 5,
    });

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(10);
    expect(result.factors).toHaveLength(8);
    expect(result.note).toContain("Strategic signal");
  });
});
