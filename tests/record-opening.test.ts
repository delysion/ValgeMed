import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const rootDir = path.resolve(import.meta.dirname, "..");

function source(...parts: string[]) {
  return readFileSync(path.join(rootDir, ...parts), "utf8");
}

describe("record opening UX", () => {
  it("gives review rows a real detail drawer instead of edit/delete only", () => {
    const reviewsListPath = path.join(rootDir, "components", "reviews-list.tsx");
    expect(existsSync(reviewsListPath)).toBe(true);

    const reviewsList = readFileSync(reviewsListPath, "utf8");
    const reviewsPage = source("app", "reviews", "page.tsx");
    const drawer = source("components", "ui", "record-drawer.tsx");

    expect(reviewsPage).toContain("ReviewsList");
    expect(reviewsList).toContain("setSelected(item)");
    expect(reviewsList).toContain("aria-label={labels.open}");
    expect(reviewsList).toContain('type="review"');
    expect(drawer).toContain('type === "review"');
  });

  it("makes topic and research records explicitly openable, not only implicitly clickable", () => {
    const topicsGrid = source("components", "topics-grid.tsx");
    const topicsPage = source("app", "topics", "page.tsx");
    const hypothesesList = source("components", "research", "hypotheses-list.tsx");
    const literatureList = source("components", "research", "literature-list.tsx");
    const manuscriptsList = source("components", "research", "manuscripts-list.tsx");

    expect(topicsPage).not.toContain("errorLogs={errorLogs}\n            t=");
    expect(topicsPage).toContain("labels={{");
    expect(topicsGrid).not.toContain("TFunction");
    expect(topicsGrid).toContain("aria-label={labels.open}");
    for (const list of [hypothesesList, literatureList, manuscriptsList]) {
      expect(list).toContain("aria-label={labels.open}");
    }
    for (const list of [topicsGrid, hypothesesList, literatureList, manuscriptsList]) {
      expect(list).toContain("setSelected(");
    }
  });

  it("makes exam records editable and deletable from the exam list", () => {
    const examsPage = source("app", "exams", "page.tsx");

    expect(examsPage).toContain("deleteExamAction");
    expect(examsPage).toContain("DeleteButton");
    expect(examsPage).toContain("`/exams?edit=${exam.id}`");
    expect(examsPage).toContain('action={deleteExamAction}');
  });

  it("does not pass server-only translation functions or Map objects into research client lists", () => {
    const hypothesesPage = source("app", "research", "hypotheses", "page.tsx");
    const literaturePage = source("app", "research", "literature", "page.tsx");
    const manuscriptsPage = source("app", "research", "manuscripts", "page.tsx");

    for (const page of [hypothesesPage, literaturePage, manuscriptsPage]) {
      expect(page).not.toContain(" t={t}");
      expect(page).toContain("labels={{");
    }

    expect(literaturePage).not.toContain("new Map(");
    expect(manuscriptsPage).not.toContain("new Map(");
  });
});
