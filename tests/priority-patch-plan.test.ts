import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = path.resolve(import.meta.dirname, "..");

function source(...parts: string[]) {
  const filePath = path.join(rootDir, ...parts);
  return existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
}

describe("priority patch plan", () => {
  it("has an approval-aware auth guard for private server work", () => {
    const dbAuth = source("lib", "db", "auth.ts");
    const supabaseAuth = source("lib", "auth", "supabase.ts");

    expect(dbAuth).toContain("requireApprovedUserId");
    expect(dbAuth).toContain("profiles.approved");
    expect(supabaseAuth).toContain("requireApprovedUser");
    expect(supabaseAuth).toContain("pending-approval");
  });


  it("treats uploads as text extraction only, not file storage", () => {
    const route = source("app", "api", "upload", "route.ts");
    const zone = source("components", "file-upload-zone.tsx");
    const settingsEn = source("lib", "i18n", "dictionaries", "en.ts");

    expect(route).not.toContain("writeFile");
    expect(route).not.toContain("mkdir");
    expect(route).not.toContain("tmpdir");
    expect(route).not.toContain("filePath");
    expect(route).toContain("processed: true");
    expect(route).toContain("PDF text extraction is not enabled");
    expect(zone).toContain(".txt, .md");
    expect(zone).not.toContain(".pdf");
    expect(settingsEn).not.toContain("public/uploads");
  });

  it("uses targeted page queries for command and elite index", () => {
    const queries = source("lib", "data", "queries.ts");
    const commandPage = source("app", "command", "page.tsx");
    const elitePage = source("app", "elite-index", "page.tsx");

    expect(queries).toContain("export type CommandPageData");
    expect(queries).toContain("getCommandPageData");
    expect(queries).toContain("export type EliteIndexPageData");
    expect(queries).toContain("getEliteIndexPageData");
    expect(commandPage).toContain("getCommandPageData(user.id)");
    expect(commandPage).not.toContain("getCoreData");
    expect(elitePage).toContain("getEliteIndexPageData(user.id)");
    expect(elitePage).not.toContain("getCoreData");
  });

  it("turns research into a paper-production pipeline instead of static cards", () => {
    const queries = source("lib", "data", "queries.ts");
    const overview = source("app", "research", "page.tsx");
    const forms = source("components", "forms", "research-forms.tsx");
    const actions = source("lib", "actions", "research.ts");
    const schemas = source("lib", "validators", "schemas.ts");

    expect(queries).toContain("export type ResearchPipelineData");
    expect(queries).toContain("getResearchPipelineData");
    expect(overview).toContain("Next paper action");
    expect(overview).toContain("Publishable gaps");
    expect(forms).toContain("ResearchAreaForm");
    expect(forms).toContain('name="researchAreaId"');
    expect(forms).toContain('name="publishableForStudent"');
    expect(forms).toContain('name="totalScore"');
    expect(forms).toContain('name="hypothesisId"');
    expect(forms).toContain('name="deadline"');
    expect(actions).toContain("createResearchAreaAction");
    expect(schemas).toContain("researchAreaSchema");
  });
});
