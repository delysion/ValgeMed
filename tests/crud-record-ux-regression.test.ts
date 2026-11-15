import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const rootDir = path.resolve(import.meta.dirname, "..");

function source(...parts: string[]) {
  return readFileSync(path.join(rootDir, ...parts), "utf8");
}

describe("CRUD record UX regressions", () => {
  it("redirects form-created records back to their owning page instead of leaving a fragile RSC refresh", () => {
    const resources = source("lib", "actions", "resources.ts");
    const research = source("lib", "actions", "research.ts");
    const entityForms = source("components", "forms", "entity-forms.tsx");
    const lifeForms = source("components", "forms", "life-forms.tsx");
    const researchForms = source("components", "forms", "research-forms.tsx");

    expect(resources).toContain("redirectToReturnPath(formData)");
    expect(research).toContain("redirectToReturnPath(formData)");

    for (const expected of [
      'name="returnTo" value="/errors"',
      'name="returnTo" value="/study"',
      'name="returnTo" value="/reviews"',
    ]) {
      expect(entityForms).toContain(expected);
    }
    expect(entityForms).toContain('cancelHref = "/identity"');
    expect(entityForms).toContain('name="returnTo" value={cancelHref}');

    for (const expected of [
      'name="returnTo" value="/reputation"',
      'name="returnTo" value="/network"',
      'name="returnTo" value="/strategic-review"',
      'name="returnTo" value="/life-admin"',
    ]) {
      expect(lifeForms).toContain(expected);
    }

    for (const expected of [
      'name="returnTo" value="/research/literature"',
      'name="returnTo" value="/research/hypotheses"',
      'name="returnTo" value="/research/manuscripts"',
    ]) {
      expect(researchForms).toContain(expected);
    }
  });

  it("lets study history records be opened and keeps edit submit on the Study page", () => {
    const page = source("app", "study", "page.tsx");
    const history = source("components", "session-history.tsx");
    const forms = source("components", "forms", "entity-forms.tsx");

    expect(page).toContain("<SessionHistory");
    expect(history).toContain("`/study?view=${item.id}`");
    expect(page).toContain("selectedSession");
    expect(page).toContain("StudySessionDetail");
    expect(forms).toContain('name="returnTo" value="/study"');
  });

  it("adds detail views for strategic reviews and reputation records", () => {
    const strategic = source("app", "strategic-review", "page.tsx");
    const reputation = source("app", "reputation", "page.tsx");
    const table = source("components", "tables", "resource-table.tsx");
    const reputationList = source("components", "life", "life-lists.tsx");
    const drawer = source("components", "ui", "record-drawer.tsx");

    expect(table).toContain("viewBasePath");
    expect(table).toContain("Eye");
    expect(strategic).toContain("selectedReview");
    expect(strategic).toContain("StrategicReviewDetail");
    expect(strategic).toContain('viewBasePath="/strategic-review"');
    expect(reputation).toContain("<ReputationEventList");
    expect(reputation).toContain('editBasePath="/reputation"');
    expect(reputationList).toContain("setSelected(event)");
    expect(reputationList).toContain('record={selected} type="reputation-event"');
    expect(drawer).toContain('type === "reputation-event" && <ReputationEventDetail');
  });

  it("makes network contacts openable, editable, and deletable after creation", () => {
    const contactCard = source("components", "premium", "contact-card.tsx");

    expect(contactCard).toContain("RecordDrawer");
    expect(contactCard).toContain("deleteProfessionalContactAction");
    expect(contactCard).toContain("setDetailsOpen(true)");
    expect(contactCard).toContain('href={`/network?edit=${contact.id}`}');
    expect(contactCard).toContain("DeleteButton");
  });

  it("keeps the reviews grid inside the desktop content width", () => {
    const reviewsPage = source("app", "reviews", "page.tsx");
    const reviewsList = source("components", "reviews-list.tsx");

    expect(reviewsPage).toContain("xl:grid-cols-[420px_minmax(0,1fr)]");
    expect(reviewsPage).toContain('<GlassCard tone="default" padded={false} className="min-w-0">');
    expect(reviewsList).toContain("sm:grid-cols-2 lg:grid-cols-3");
    expect(reviewsList).toContain("break-words");
  });
});
