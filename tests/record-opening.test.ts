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
    const hypothesesList = source("components", "research", "hypotheses-list.tsx");
    const literatureList = source("components", "research", "literature-list.tsx");
    const manuscriptsList = source("components", "research", "manuscripts-list.tsx");

    for (const list of [topicsGrid, hypothesesList, literatureList, manuscriptsList]) {
      expect(list).toContain('aria-label={t("common.open")}');
      expect(list).toContain("setSelected(");
    }
  });
});
