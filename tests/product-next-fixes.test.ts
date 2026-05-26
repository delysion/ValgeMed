import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const rootDir = path.resolve(import.meta.dirname, "..");

function source(...parts: string[]) {
  return readFileSync(path.join(rootDir, ...parts), "utf8");
}

describe("next product hardening pass", () => {
  it("parses common Italian smart-input commands without spending AI calls", async () => {
    const { parseSmartInputLocally } = await import("@/lib/smart-input/intent");
    const now = new Date("2026-05-26T12:00:00Z");

    expect(parseSmartInputLocally("studia biochimica per 2 ore", now)).toMatchObject({
      action: "study_session",
      subject: "biochimica",
      durationMinutes: 120,
    });

    expect(parseSmartInputLocally("aggiungi domanda sui mitocondri in biochimica", now)).toMatchObject({
      action: "review_item",
      subject: "biochimica",
      question: "mitocondri",
    });

    expect(parseSmartInputLocally("life admin rinnova permesso di soggiorno entro 10/06/2026", now)).toMatchObject({
      action: "life_admin",
      title: "rinnova permesso di soggiorno",
      dueAt: "2026-06-10",
      category: "documents",
    });

    expect(parseSmartInputLocally("aggiungi opportunità borsa di ricerca deadline 2026-06-01", now)).toMatchObject({
      action: "opportunity",
      title: "borsa di ricerca",
      deadline: "2026-06-01",
    });
  });

  it("guards third-party AI usage with per-user daily budgets and usage logs", () => {
    const schema = source("lib", "db", "schema.ts");
    const usage = source("lib", "ai", "usage.ts");
    const chatRoute = source("app", "api", "ai", "chat", "route.ts");
    const executeRoute = source("app", "api", "ai", "execute", "route.ts");
    const smartInput = source("lib", "actions", "smart-input.ts");
    const adminAction = source("lib", "actions", "admin.ts");
    const adminRow = source("app", "admin", "users", "user-row.tsx");

    expect(schema).toContain("aiUsageEvents");
    expect(schema).toContain('aiDailyRequestLimit: integer("ai_daily_request_limit")');
    expect(schema).toContain('aiDailyCharLimit: integer("ai_daily_char_limit")');
    expect(usage).toContain("assertAiUsageAllowed");
    expect(usage).toContain("recordAiUsage");
    expect(usage).toContain("runAiChatWithUsage");
    expect(chatRoute).toContain("runAiChatWithUsage");
    expect(executeRoute).toContain("runAiChatWithUsage");
    expect(smartInput).toContain("runAiChatWithUsage");
    expect(adminAction).toContain("updateUserAiUsageLimitsAction");
    expect(adminRow).toContain("aiDailyRequestLimit");
    expect(adminRow).toContain("aiDailyCharLimit");
  });

  it("moves Elite Index away from generic cards toward a compact cockpit layout", () => {
    const page = source("app", "elite-index", "page.tsx");

    expect(page).toContain("EliteCommandPanel");
    expect(page).toContain("EliteSignalGrid");
    expect(page).toContain("EliteSignalCard");
    expect(page).not.toContain("MetricCard");
  });
});
