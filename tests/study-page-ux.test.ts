import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = join(__dirname, "..");

function source(...parts: string[]) {
  return readFileSync(join(rootDir, ...parts), "utf-8");
}

describe("study page UX", () => {
  it("uses a purpose-built cockpit layout instead of a generic metric-card wall", () => {
    const page = source("app", "study", "page.tsx");

    expect(page).toContain("StudyCommandPanel");
    expect(page).toContain("WeeklyStudyPulse");
    expect(page).toContain("MethodMixPanel");
    expect(page).not.toContain("MetricCard");
    expect(page).not.toContain("MethodPieChart");
  });

  it("keeps the right rail compact and avoids nested form cards", () => {
    const page = source("app", "study", "page.tsx");
    const forms = source("components", "forms", "entity-forms.tsx");
    const timer = source("components", "premium", "focus-timer.tsx");

    expect(page).toContain("<StudySessionForm");
    expect(page).toContain("compact");
    expect(page).toContain("<FocusTimer compact");
    expect(forms).toContain("compact?: boolean");
    expect(forms).toContain("hideDescriptions");
    expect(timer).toContain("compact?: boolean");
  });

  it("lets study session history records be edited and deleted", () => {
    const page = source("app", "study", "page.tsx");
    const history = source("components", "session-history.tsx");

    expect(page).toContain("<SessionHistory");
    expect(history).toContain("action={deleteStudySessionAction}");
    expect(history).toContain("<DeleteButton");
    expect(history).toContain("`/study?edit=${item.id}`");
  });
});
