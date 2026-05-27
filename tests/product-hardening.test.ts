import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = path.resolve(import.meta.dirname, "..");

function source(...parts: string[]) {
  const filePath = path.join(rootDir, ...parts);
  return existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
}

describe("product hardening flows", () => {
  it("parses smart input into the right product section before falling back to AI", async () => {
    const intentPath = path.join(rootDir, "lib", "smart-input", "intent.ts");

    expect(existsSync(intentPath)).toBe(true);

    const { parseSmartInputLocally } = await import("@/lib/smart-input/intent");
    const now = new Date("2026-05-26T12:00:00Z");

    expect(parseSmartInputLocally("life admin renew residence permit due 2026-06-10", now)).toMatchObject({
      action: "life_admin",
      title: "renew residence permit",
      dueAt: "2026-06-10",
    });
    expect(parseSmartInputLocally("add task submit anatomy notes tomorrow", now)).toMatchObject({
      action: "task",
      title: "submit anatomy notes",
      dueAt: "2026-05-27",
    });
    expect(parseSmartInputLocally("practice Estonian 30 minutes confidence 6", now)).toMatchObject({
      action: "language_progress",
      title: "Estonian",
      minutes: 30,
      confidence: 6,
    });
    expect(parseSmartInputLocally("log error missed contraindication in biochemistry", now)).toMatchObject({
      action: "error_log",
      subject: "biochemistry",
      title: "missed contraindication",
    });
    expect(parseSmartInputLocally("add opportunity research scholarship deadline 2026-06-01", now)).toMatchObject({
      action: "opportunity",
      title: "research scholarship",
      deadline: "2026-06-01",
    });

    const actionSource = source("lib", "actions", "smart-input.ts");
    expect(actionSource).toContain("parseSmartInputLocally");
    expect(actionSource).toContain('case "life_admin"');
    expect(actionSource).toContain('case "task"');
    expect(actionSource).toContain('case "opportunity"');
    expect(actionSource).toContain('case "error_log"');
  });

  it("uses one confirmation dialog for destructive deletes across shared and custom lists", () => {
    const deleteButton = source("components", "forms", "delete-button.tsx");
    const resourceTable = source("components", "tables", "resource-table.tsx");
    const topicsList = source("components", "topics-grid.tsx");
    const literatureList = source("components", "research", "literature-list.tsx");
    const examDetailPage = source("app", "exams", "[id]", "page.tsx");

    expect(deleteButton).toContain("Dialog");
    expect(deleteButton).toContain("DialogTitle");
    expect(deleteButton).not.toContain("confirm(");
    expect(resourceTable).toContain("DeleteButton");
    expect(resourceTable).not.toContain("<form action={deleteAction}>");
    expect(topicsList).toContain("DeleteButton");
    expect(literatureList).toContain("DeleteButton");
    expect(examDetailPage).toContain("DeleteButton");
  });

  it("has a complete reset-password flow after Supabase recovery callback", () => {
    const loginForm = source("app", "login", "form.tsx");
    const callback = source("app", "auth", "callback", "route.ts");
    const proxy = source("proxy.ts");
    const resetPage = source("app", "reset-password", "page.tsx");
    const resetForm = source("components", "reset-password-form.tsx");

    expect(loginForm).toContain("/auth/callback?next=/reset-password");
    expect(callback).toContain('"/reset-password"');
    expect(proxy).toContain('"/reset-password"');
    expect(resetPage).toContain("ResetPasswordForm");
    expect(resetForm).toContain("updateUser");
    expect(resetForm).toContain("confirmPassword");
    expect(resetForm).toContain("minLength={8}");
  });

  it("exports calendar deadlines as an iCal file from timeline data", async () => {
    const icalPath = path.join(rootDir, "lib", "calendar", "ical.ts");

    expect(existsSync(icalPath)).toBe(true);

    const { buildIcsCalendar } = await import("@/lib/calendar/ical");
    const ics = buildIcsCalendar({
      productId: "ValgeMed",
      events: [
        {
          id: "exam-1",
          title: "Biochemistry final",
          date: new Date("2026-06-10T09:00:00Z"),
          type: "exam",
          description: "Written exam",
        },
        {
          id: "task-1",
          title: "Submit notes, chapter 2",
          date: new Date("2026-06-01T00:00:00Z"),
          type: "task",
        },
      ],
    });

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("VERSION:2.0");
    expect(ics).toContain("UID:exam-1@valgemed");
    expect(ics).toContain("SUMMARY:Biochemistry final");
    expect(ics).toContain("SUMMARY:Submit notes\\, chapter 2");
    expect(ics).toContain("END:VCALENDAR");

    const route = source("app", "api", "export", "ical", "route.ts");
    const settings = source("app", "settings", "import-export", "page.tsx");
    expect(route).toContain("getTimelinePageData");
    expect(route).toContain("text/calendar");
    expect(settings).toContain("/api/export/ical");
  });

  it("keeps the Elite Index ring number visually balanced", () => {
    const ring = source("components", "premium", "score-ring.tsx");

    expect(ring).toContain("tabular-nums");
    expect(ring).toContain("leading-none");
    expect(ring).toContain("scoreTextSize");
    expect(ring).not.toContain('"lg": "text-4xl"');
  });

  it("keeps lint focused on application code instead of local agent assets", () => {
    const eslintConfig = source("eslint.config.mjs");

    expect(eslintConfig).toContain('".agents/**"');
    expect(eslintConfig).toContain('"scripts/**"');
  });
});
