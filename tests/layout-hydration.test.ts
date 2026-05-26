import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("root layout hydration", () => {
  it("allows browser extensions to add body attributes before hydration", () => {
    const layout = readFileSync(
      path.join(import.meta.dirname, "..", "app", "layout.tsx"),
      "utf8",
    );

    expect(layout).toMatch(/<body\s+className="min-h-full"\s+suppressHydrationWarning>/);
  });
});
