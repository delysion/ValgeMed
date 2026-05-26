import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const rootDir = path.resolve(import.meta.dirname, "..");

function source(...parts: string[]) {
  return readFileSync(path.join(rootDir, ...parts), "utf8");
}

describe("smart input multilingual routing", () => {
  it("understands English, Italian and Estonian commands without spending AI calls", async () => {
    const { parseSmartInputLocally } = await import("@/lib/smart-input/intent");
    const now = new Date("2026-05-26T12:00:00Z");

    expect(parseSmartInputLocally("study biochemistry for 2 hours", now)).toMatchObject({
      action: "study_session",
      subject: "biochemistry",
      durationMinutes: 120,
    });

    expect(parseSmartInputLocally("add exam physiology final on 2026-06-10 for physiology", now)).toMatchObject({
      action: "exam",
      title: "physiology final",
      subject: "physiology",
      examDate: "2026-06-10",
    });

    expect(parseSmartInputLocally("lisa kusimus mitokondrite kohta biokeemias", now)).toMatchObject({
      action: "review_item",
      subject: "biokeemia",
      question: "mitokondrite",
    });

    expect(parseSmartInputLocally("opi biokeemia 2 tundi", now)).toMatchObject({
      action: "study_session",
      subject: "biokeemia",
      durationMinutes: 120,
    });

    expect(parseSmartInputLocally("lisa ulesanne esita anatoomia markmed homme", now)).toMatchObject({
      action: "task",
      title: "esita anatoomia markmed",
      dueAt: "2026-05-27",
    });

    expect(parseSmartInputLocally("logi viga vastunaidustus biokeemias raskus 7", now)).toMatchObject({
      action: "error_log",
      subject: "biokeemia",
      title: "vastunaidustus",
      severity: 7,
    });

    expect(parseSmartInputLocally("harjuta eesti keelt 30 minutit kindlus 6", now)).toMatchObject({
      action: "language_progress",
      language: "estonian",
      minutes: 30,
      confidence: 6,
    });

    expect(parseSmartInputLocally("lisa voimalus teadusstipendium tahtaeg 2026-06-01", now)).toMatchObject({
      action: "opportunity",
      title: "teadusstipendium",
      deadline: "2026-06-01",
      opportunityType: "scholarship",
    });
  });

  it("maps parsed intents into the correct user-scoped tables and fields", () => {
    const actions = source("lib", "actions", "smart-input.ts");

    expect(actions).toMatch(/insert\(studySessions\)[\s\S]*subjectId[\s\S]*topicId[\s\S]*durationMinutes[\s\S]*method: "active_recall"/);
    expect(actions).toMatch(/insert\(reviewItems\)[\s\S]*question: parsed\.question[\s\S]*answer: parsed\.answer[\s\S]*dueAt: nextSchedule\.dueAt/);
    expect(actions).toMatch(/insert\(exams\)[\s\S]*subjectId[\s\S]*title[\s\S]*examDate: toDate\(parsed\.examDate\)/);
    expect(actions).toMatch(/insert\(tasks\)[\s\S]*title[\s\S]*description[\s\S]*dueAt: toDate\(parsed\.dueAt\)[\s\S]*priority/);
    expect(actions).toMatch(/insert\(lifeAdminItems\)[\s\S]*title[\s\S]*category: parsed\.category[\s\S]*dueAt: toDate\(parsed\.dueAt\)/);
    expect(actions).toMatch(/insert\(opportunities\)[\s\S]*opportunityType: parsed\.opportunityType[\s\S]*deadline: parsed\.deadline/);
    expect(actions).toMatch(/insert\(errorLogs\)[\s\S]*subjectId[\s\S]*topicId[\s\S]*title[\s\S]*severity/);
    expect(actions).toMatch(/insert\(languageProgress\)[\s\S]*language: parsed\.language[\s\S]*minutes: parsed\.minutes[\s\S]*confidence: parsed\.confidence/);
    expect(actions).toMatch(/insert\(timeBlocks\)[\s\S]*blockType: parsed\.blockType[\s\S]*plannedMinutes: parsed\.plannedMinutes/);
  });
});

describe("Vercel deployment update refresh", () => {
  it("exposes a no-store app-version endpoint backed by Vercel deployment metadata", () => {
    const routePath = path.join(rootDir, "app", "api", "app-version", "route.ts");

    expect(existsSync(routePath)).toBe(true);

    const route = source("app", "api", "app-version", "route.ts");
    expect(route).toContain('dynamic = "force-dynamic"');
    expect(route).toContain("VERCEL_DEPLOYMENT_ID");
    expect(route).toContain("VERCEL_GIT_COMMIT_SHA");
    expect(route).toContain('"Cache-Control": "no-store, max-age=0"');
  });

  it("mounts a client-side version poller that reloads stale deployed tabs", () => {
    const layout = source("app", "layout.tsx");
    const component = source("components", "app-update-reloader.tsx");

    expect(layout).toContain("AppUpdateReloader");
    expect(component).toContain("/api/app-version");
    expect(component).toContain("setInterval");
    expect(component).toContain("visibilitychange");
    expect(component).toContain("window.location.reload()");
  });
});
