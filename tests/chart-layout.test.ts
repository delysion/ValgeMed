import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { normalizeChartNumber } from "@/lib/charts/data";

const rootDir = join(__dirname, "..");

describe("chart layout guards", () => {
  it("keeps responsive Chart.js canvases inside a stable fixed-height frame", () => {
    const source = readFileSync(join(rootDir, "components/charts/study-charts.tsx"), "utf-8");

    expect(source).toContain("function ChartFrame");
    expect(source).toContain("position: \"relative\"");
    expect(source).toContain("overflow: \"hidden\"");
    expect(source.match(/<ChartFrame/g)?.length).toBeGreaterThanOrEqual(3);
  });

  it("normalizes chart values before they reach Chart.js datasets", () => {
    expect(normalizeChartNumber(11, { min: 0, max: 10 })).toBe(10);
    expect(normalizeChartNumber(-1, { min: 0, max: 10 })).toBe(0);
    expect(normalizeChartNumber("4.5", { min: 0, max: 10 })).toBe(4.5);
    expect(normalizeChartNumber(null, { min: 0, max: 10 })).toBeNull();
    expect(normalizeChartNumber(undefined, { min: 0, max: 10 })).toBeNull();
    expect(normalizeChartNumber("nope", { min: 0, max: 10 })).toBeNull();
  });
});
