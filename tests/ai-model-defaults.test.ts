import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  DEPRECATED_GROQ_MODELS,
  GROQ_DEFAULT_MODEL,
  GROQ_FALLBACK_MODEL,
  OPENAI_DEFAULT_MODEL,
  getCloudModelSelection,
  getDefaultCloudModel,
  getDeprecatedGroqModelWarning,
  isDeprecatedGroqModel,
} from "@/lib/ai/models";

const rootDir = path.resolve(import.meta.dirname, "..");

function source(...parts: string[]) {
  return readFileSync(path.join(rootDir, ...parts), "utf8");
}

function repoFiles(dir = rootDir): string[] {
  const ignoredDirs = new Set([".git", ".next", "node_modules"]);
  return readdirSync(dir).flatMap((entry) => {
    if (ignoredDirs.has(entry)) return [];
    const fullPath = path.join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) return repoFiles(fullPath);
    if (!stats.isFile()) return [];
    return [path.relative(rootDir, fullPath).replaceAll("\\", "/")];
  });
}

describe("AI model defaults", () => {
  it("uses Groq's replacement model instead of any deprecated default", () => {
    expect(GROQ_DEFAULT_MODEL).toBe("openai/gpt-oss-120b");
    expect(GROQ_FALLBACK_MODEL).toBe("qwen/qwen3.6-27b");
    expect(DEPRECATED_GROQ_MODELS).toEqual(["llama-3.3-70b-versatile"]);
    expect(DEPRECATED_GROQ_MODELS).not.toContain(GROQ_DEFAULT_MODEL);
    expect(getDefaultCloudModel("groq")).toBe(GROQ_DEFAULT_MODEL);
  });

  it("keeps non-Groq cloud providers on the OpenAI default", () => {
    expect(OPENAI_DEFAULT_MODEL).toBe("gpt-4o-mini");
    expect(getDefaultCloudModel("openai")).toBe(OPENAI_DEFAULT_MODEL);
  });

  it("detects deprecated Groq env overrides without replacing the explicit model", () => {
    const deprecatedModel = DEPRECATED_GROQ_MODELS[0];
    const selection = getCloudModelSelection("groq", deprecatedModel);

    expect(selection).toMatchObject({
      model: deprecatedModel,
      modelSource: "env",
      isDeprecated: true,
      recommendedModel: GROQ_DEFAULT_MODEL,
      fallbackModel: GROQ_FALLBACK_MODEL,
    });
    expect(isDeprecatedGroqModel(deprecatedModel)).toBe(true);
    expect(getDeprecatedGroqModelWarning(selection)).toContain("AI_MODEL");
    expect(getDeprecatedGroqModelWarning(selection)).toContain(GROQ_DEFAULT_MODEL);
  });

  it("does not mark default Groq selection as deprecated", () => {
    expect(getCloudModelSelection("groq")).toMatchObject({
      model: GROQ_DEFAULT_MODEL,
      modelSource: "default",
      isDeprecated: false,
    });
  });

  it("keeps status and canary logic wired to shared model selection constants", () => {
    const statusRoute = source("app", "api", "ai", "status", "route.ts");
    const canary = source("tests", "curriculum-import-canary.test.ts");

    expect(statusRoute).toContain("getCloudModelSelection");
    expect(statusRoute).toContain("modelWarning");
    expect(statusRoute).toContain("isDeprecated");
    expect(canary).toContain("getCloudModelSelection");
    expect(canary).toContain("getDeprecatedGroqModelWarning");
  });

  it("contains deprecated Groq model ids only in the central guard and this regression test", () => {
    const allowedFiles = new Set(["lib/ai/models.ts", "tests/ai-model-defaults.test.ts"]);
    const offenders = repoFiles().filter((file) => {
      if (allowedFiles.has(file)) return false;
      const contents = source(...file.split("/"));
      return DEPRECATED_GROQ_MODELS.some((model) => contents.includes(model));
    });

    expect(offenders).toEqual([]);
  });
});
