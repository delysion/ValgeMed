import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { addDays } from "date-fns";
import { describe, expect, it } from "vitest";

const rootDir = path.resolve(import.meta.dirname, "..");
type EliteCommandInput = Parameters<typeof import("@/lib/scoring/elite-performance").buildElitePerformanceCommand>[0];
type BlockerInput = Parameters<typeof import("@/lib/scoring/elite-performance").derivePerformanceBlockers>[0];

function source(...parts: string[]) {
  const filePath = path.join(rootDir, ...parts);
  return existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
}

function migrationsSource() {
  const dir = path.join(rootDir, "drizzle");
  return readdirSync(dir)
    .filter((file) => file.endsWith(".sql"))
    .map((file) => readFileSync(path.join(dir, file), "utf8"))
    .join("\n");
}

const today = new Date("2026-05-27T09:00:00Z");

function baseCommandInput(overrides: Record<string, unknown> = {}) {
  return {
    now: today,
    settings: {
      targetLevel: "top_1",
      weaknessTolerance: "zero",
      examStrategy: "balanced",
    },
    exams: [],
    topics: [],
    studySessions: [],
    reviewItems: [],
    errorLogs: [],
    quizAttempts: [],
    dailyLogs: [
      {
        date: "2026-05-27",
        sleepHours: 7.5,
        energyLevel: 8,
        stressLevel: 2,
        studyMinutes: 90,
        activeRecallMinutes: 70,
        passiveStudyMinutes: 20,
        movementDone: true,
      },
    ],
    healthLogs: [],
    ...overrides,
  } as EliteCommandInput;
}

describe("elite private performance command engine", () => {
  it("lets private Elite Target Mode change the next recommendation", async () => {
    const { buildElitePerformanceCommand } = await import("@/lib/scoring/elite-performance");

    const normal = buildElitePerformanceCommand(baseCommandInput({
      settings: { targetLevel: "pass", weaknessTolerance: "normal", examStrategy: "balanced" },
      dailyLogs: [{ date: "2026-05-27", sleepHours: 8, energyLevel: 8, stressLevel: 2, activeRecallMinutes: 20, passiveStudyMinutes: 140, studyMinutes: 160 }],
    }));
    const elite = buildElitePerformanceCommand(baseCommandInput({
      settings: { targetLevel: "top_1", weaknessTolerance: "zero", examStrategy: "balanced" },
      dailyLogs: [{ date: "2026-05-27", sleepHours: 8, energyLevel: 8, stressLevel: 2, activeRecallMinutes: 20, passiveStudyMinutes: 140, studyMinutes: 160 }],
    }));

    expect(normal.snapshot.readinessTarget).toBeLessThan(elite.snapshot.readinessTarget);
    expect(elite.snapshot.passiveStudyPenalty).toBeGreaterThan(normal.snapshot.passiveStudyPenalty);
    expect(elite.threats.some((threat: { type: string }) => threat.type === "passive_study_overload")).toBe(true);
  });

  it("forces recovery when burnout risk is high even if critical errors exist", async () => {
    const { buildElitePerformanceCommand } = await import("@/lib/scoring/elite-performance");

    const command = buildElitePerformanceCommand(baseCommandInput({
      errorLogs: [{
        id: "error-1",
        title: "Repeated contraindication miss",
        description: "Missed a dangerous contraindication",
        severity: 10,
        recurrenceCount: 3,
        resolved: false,
        createdAt: today,
      }],
      dailyLogs: [{ date: "2026-05-27", sleepHours: 4.5, energyLevel: 2, stressLevel: 9, activeRecallMinutes: 30, passiveStudyMinutes: 260, studyMinutes: 320 }],
    }));

    expect(command.winningMove.kind).toBe("recovery");
    expect(command.recoveryWarning?.message).toContain("More study right now may reduce tomorrow's performance");
    expect(command.winningMove.dangerIfIgnored).toContain("tomorrow");
  });

  it("promotes unresolved critical blockers above passive study when weakness tolerance is zero", async () => {
    const { buildElitePerformanceCommand } = await import("@/lib/scoring/elite-performance");

    const command = buildElitePerformanceCommand(baseCommandInput({
      settings: { targetLevel: "top_1", weaknessTolerance: "zero", examStrategy: "balanced" },
      errorLogs: [{
        id: "error-2",
        title: "Confuses preload and afterload",
        description: "Recurring active recall failure",
        severity: 9,
        recurrenceCount: 2,
        resolved: false,
        retestAt: addDays(today, 1),
        createdAt: today,
      }],
      dailyLogs: [{ date: "2026-05-27", sleepHours: 8, energyLevel: 8, stressLevel: 2, activeRecallMinutes: 15, passiveStudyMinutes: 180, studyMinutes: 195 }],
    }));

    expect(command.winningMove.kind).toBe("error_review");
    expect(command.winningMove.title).toContain("Confuses preload");
    expect(command.blockers[0].status).toBe("open");
  });

  it("forces simulation or retest work near an exam when strategy is simulate", async () => {
    const { buildElitePerformanceCommand } = await import("@/lib/scoring/elite-performance");

    const command = buildElitePerformanceCommand(baseCommandInput({
      settings: { targetLevel: "top_5", weaknessTolerance: "low", examStrategy: "simulate" },
      exams: [{
        id: "exam-1",
        title: "Physiology final",
        examDate: addDays(today, 5),
        readinessScore: 4,
        riskLevel: 6,
      }],
      topics: [{ id: "topic-1", examId: "exam-1", title: "Cardiac output", confidence: 3, priority: 8, difficulty: 8, status: "understood" }],
      quizAttempts: [],
    }));

    expect(command.winningMove.kind).toBe("simulation");
    expect(command.examPlans[0].seventyTwoHourPlan.length).toBeGreaterThan(0);
    expect(command.snapshot.simulationRequirementNearExam).toBeGreaterThan(0);
  });

  it("calculates readiness gap and derives an enemy list from recurring cognitive errors", async () => {
    const { buildElitePerformanceCommand, derivePerformanceBlockers } = await import("@/lib/scoring/elite-performance");

    const blockers = derivePerformanceBlockers({
      errorLogs: [
        { id: "e1", title: "Passive recognition but failed recall", severity: 8, recurrenceCount: 2, resolved: false, createdAt: today },
        { id: "e2", title: "Careless unit conversion", severity: 5, recurrenceCount: 1, resolved: true, createdAt: today },
      ],
      topics: [{ id: "t1", title: "Renal physiology", confidence: 2, priority: 9, difficulty: 7 }],
      exams: [],
      now: today,
    } as BlockerInput);

    const command = buildElitePerformanceCommand(baseCommandInput({
      settings: { targetLevel: "top_1", weaknessTolerance: "zero", examStrategy: "kill_errors" },
      errorLogs: [{ id: "e1", title: "Passive recognition but failed recall", severity: 8, recurrenceCount: 2, resolved: false, createdAt: today }],
      topics: [{ id: "t1", title: "Renal physiology", confidence: 2, priority: 9, difficulty: 7, status: "understood" }],
    }));

    expect(command.snapshot.readinessGap).toBeGreaterThan(0);
    expect(blockers[0]).toMatchObject({
      label: "Passive recognition but failed recall",
      recurrenceCount: 2,
      status: "open",
    });
    expect(blockers[0].requiredAction).toContain("Retest");
  });
});

describe("elite performance product integration", () => {
  it("stores private Elite Target Mode settings on the user profile", () => {
    const schema = source("lib", "db", "schema.ts");
    const migration = migrationsSource();
    const settingsPage = source("app", "settings", "page.tsx");
    const settingsAction = source("lib", "actions", "settings.ts");

    expect(schema).toContain("targetLevel");
    expect(schema).toContain("weaknessTolerance");
    expect(schema).toContain("examStrategy");
    expect(migration).toContain("target_level");
    expect(settingsPage).toContain("EliteTargetSettingsForm");
    expect(settingsAction).toContain("saveEliteTargetSettingsAction");
  });

  it("makes Command the cockpit center instead of a generic dashboard", () => {
    const commandPage = source("app", "command", "page.tsx");

    expect(commandPage).toContain("command.todaysWinningMove");
    expect(commandPage).toContain("command.snapshotTitle");
    expect(commandPage).toContain("command.topThreats");
    expect(commandPage).toContain("command.recoveryWarningTitle");
    expect(commandPage).toContain("buildElitePerformanceCommand");
    expect(commandPage).not.toContain("GamificationDashboard");
  });

  it("adds a Performance Blockers page reachable from navigation", () => {
    const page = source("app", "performance-blockers", "page.tsx");
    const nav = source("components", "navigation-config.tsx");

    expect(page).toContain("blockers.title");
    expect(page).toContain("derivePerformanceBlockers");
    expect(nav).toContain("/performance-blockers");
  });

  it("hardens cross-user relation writes and avoids plaintext AI key storage", () => {
    const resources = source("lib", "actions", "resources.ts");
    const settings = source("lib", "actions", "settings.ts");
    const aiOptions = source("lib", "ai", "user-options.ts");
    const crypto = source("lib", "security", "crypto.ts");

    expect(resources).toContain("assertOwnedRelations");
    expect(resources).toContain("verifyOwnedId");
    expect(resources).toContain("Forbidden relation");
    expect(settings).toContain("encryptSecret");
    expect(settings).not.toContain("aiApiKey: apiKey || null");
    expect(aiOptions).toContain("decryptSecret");
    expect(crypto).toContain("aes-256-gcm");
  });
});
