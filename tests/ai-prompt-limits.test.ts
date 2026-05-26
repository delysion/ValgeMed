import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const rootDir = path.resolve(import.meta.dirname, "..");

function source(...parts: string[]) {
  const filePath = path.join(rootDir, ...parts);
  return existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
}

describe("per-user AI prompt limits", () => {
  it("stores an admin-controlled prompt limit on profiles", () => {
    const schema = source("lib", "db", "schema.ts");
    const adminPage = source("app", "admin", "users", "user-row.tsx");
    const adminActions = source("lib", "actions", "admin.ts");

    expect(schema).toContain('aiPromptLimitChars: integer("ai_prompt_limit_chars")');
    expect(adminActions).toContain("updateUserAiPromptLimitAction");
    expect(adminActions).toContain("normalizeAiPromptLimit");
    expect(adminPage).toContain("aiPromptLimitChars");
    expect(adminPage).toContain("updateUserAiPromptLimitAction");
    expect(adminPage).toContain("max={500000}");
  });

  it("passes each user's prompt limit into every authenticated AI entrypoint", () => {
    const executeRoute = source("app", "api", "ai", "execute", "route.ts");
    const smartInput = source("lib", "actions", "smart-input.ts");
    const userOptions = source("lib", "ai", "user-options.ts");

    expect(userOptions).toContain("getUserAiOptions");
    expect(userOptions).toContain("aiPromptLimitChars");
    expect(executeRoute).toContain("getUserAiOptions(user.id)");
    expect(smartInput).toContain("getUserAiOptions(user.id)");
    expect(smartInput).toContain("runAiChatWithUsage");
    expect(smartInput).toContain("parseUserIntent(");
    expect(smartInput).toContain("generateReviewItemsFromText(");
  });

  it("normalizes custom prompt limits with a bounded default range", () => {
    const limits = source("lib", "ai", "prompt-limits.ts");

    expect(limits).toContain("DEFAULT_AI_PROMPT_LIMIT_CHARS = 24_000");
    expect(limits).toContain("MAX_AI_PROMPT_LIMIT_CHARS = 500_000");
    expect(limits).toContain("normalizeAiPromptLimit");
    expect(limits).toContain("boundPrompt");
  });
});
