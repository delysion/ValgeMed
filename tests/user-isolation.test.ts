import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const rootDir = path.resolve(import.meta.dirname, "..");

function source(...parts: string[]) {
  return readFileSync(path.join(rootDir, ...parts), "utf8");
}

describe("user data isolation guards", () => {
  it("keeps smart-input find-or-create lookups scoped to the current user", () => {
    const smartInput = source("lib", "actions", "smart-input.ts");

    expect(smartInput).toMatch(
      /where\(\s*and\(\s*eq\(subjects\.userId,\s*userId\),\s*eq\(subjects\.name,\s*normalizedName\)\s*\)\s*\)/,
    );
    expect(smartInput).toMatch(
      /where\(\s*and\(\s*eq\(topics\.userId,\s*userId\),\s*eq\(topics\.subjectId,\s*subjectId\),\s*eq\(topics\.title,\s*normalizedName\),?\s*\),?\s*\)/,
    );
  });

  it("checks sample data only for the current user before seeding", () => {
    const seed = source("lib", "actions", "seed.ts");

    expect(seed).toMatch(/from\(subjects\)\s*\.where\(eq\(subjects\.userId,\s*userId\)\)/);
  });

  it("does not let the zip export fall back to dumping global tables", () => {
    const route = source("app", "api", "export", "zip", "route.ts");

    expect(route).toContain("exportableTables");
    expect(route).not.toContain("Object.entries(schema)");
    expect(route).not.toMatch(/db\.select\(\)\.from\(table as any\)/);
  });

  it("requires admin access before sending push notifications to all users", () => {
    const route = source("app", "api", "push", "send", "route.ts");

    expect(route).toContain("requireAdmin");
    expect(route).not.toContain("requireUser");
  });

  it("uses cached AI status before calling the status API again", () => {
    const status = source("components", "ollama-status.tsx");

    expect(status).toMatch(
      /const cached = getCachedStatus\(\);[\s\S]*if \(cached\) \{[\s\S]*setStatus\(cached\)[^;]*;[\s\S]*return;[\s\S]*\}/,
    );
  });

  it("bounds AI prompt size before calling cloud or local providers", () => {
    const ollama = source("lib", "ai", "ollama.ts");
    const limits = source("lib", "ai", "prompt-limits.ts");

    expect(limits).toContain("MAX_AI_PROMPT_LIMIT_CHARS");
    expect(ollama).toContain("boundedPrompt");
    expect(ollama).not.toMatch(/content:\s*prompt\b/);
  });

  it("keeps daily and health log upserts unique per user and date", () => {
    const resources = source("lib", "actions", "resources.ts");
    const schema = source("lib", "db", "schema.ts");

    expect(resources).toMatch(/target:\s*\[\s*dailyLogs\.userId,\s*dailyLogs\.date\s*\]/);
    expect(resources).toMatch(/target:\s*\[\s*healthLogs\.userId,\s*healthLogs\.date\s*\]/);
    expect(schema).not.toMatch(/date:\s*date\("date"\)\.notNull\(\)\.unique\(\)/);
    expect(schema).toContain('uniqueIndex("daily_logs_user_id_date_unique").on(table.userId, table.date)');
    expect(schema).toContain('uniqueIndex("health_logs_user_id_date_unique").on(table.userId, table.date)');
  });

  it("checks Research relation ids before linking records", () => {
    const researchActions = source("lib", "actions", "research.ts");
    const ownership = source("lib", "db", "ownership.ts");

    expect(ownership).toContain('"researchArea"');
    expect(ownership).toContain('"hypothesis"');
    expect(researchActions).toContain("assertOwnedRelations");
    expect(researchActions).toMatch(/createLiteratureGapAction[\s\S]*await assertOwnedRelations\(db,\s*userId,\s*data\)/);
    expect(researchActions).toMatch(/updateLiteratureGapAction[\s\S]*await assertOwnedRelations\(db,\s*userId,\s*data\)/);
    expect(researchActions).toMatch(/createManuscriptAction[\s\S]*await assertOwnedRelations\(db,\s*userId,\s*data\)/);
    expect(researchActions).toMatch(/updateManuscriptAction[\s\S]*await assertOwnedRelations\(db,\s*userId,\s*data\)/);
  });
});
