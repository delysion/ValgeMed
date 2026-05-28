import { AppShell, PageHeader } from "@/components/app-shell";
import { FlashcardGrid } from "@/components/flashcards/flashcard-grid";
import { requireApprovedUser } from "@/lib/auth/supabase";
import { getI18n } from "@/lib/i18n/server-i18n";
import { getFlashcards, getSubjects } from "@/lib/data/queries";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Flashcards",
};

interface FlashcardsPageProps {
  searchParams: Promise<{
    search?: string;
    subject?: string;
    confidence?: string;
    due?: string;
  }>;
}

export default async function FlashcardsPage({ searchParams }: FlashcardsPageProps) {
  const user = await requireApprovedUser();
  const { t } = await getI18n();
  const params = await searchParams;

  const filters = {
    search: params.search,
    subjectId: params.subject,
    confidence: params.confidence ? parseInt(params.confidence, 10) : undefined,
    dueStatus: params.due as "overdue" | "today" | "week" | undefined,
  };

  const [cards, subjects] = await Promise.all([
    getFlashcards(filters),
    getSubjects(),
  ]);

  return (
    <AppShell user={user}>
      <PageHeader
        title={t("flashcards.title")}
        description={t("flashcards.subtitle")}
      />
      <FlashcardGrid
        initialCards={cards}
        subjects={subjects}
        labels={{
          searchPlaceholder: t("flashcards.searchPlaceholder"),
          filterSubject: t("flashcards.filterSubject"),
          filterConfidence: t("flashcards.filterConfidence"),
          filterDue: t("flashcards.filterDue"),
          allSubjects: t("flashcards.allSubjects"),
          allConfidence: t("flashcards.allConfidence"),
          allDue: t("flashcards.allDue"),
          overdue: t("flashcards.overdue"),
          today: t("flashcards.today"),
          thisWeek: t("flashcards.thisWeek"),
          empty: t("flashcards.empty"),
          emptyDesc: t("flashcards.emptyDesc"),
          newFlashcard: t("flashcards.newFlashcard"),
          study: t("flashcards.study"),
          edit: t("common.edit"),
          delete: t("common.delete"),
          tapToFlip: t("flashcards.tapToFlip"),
          due: t("flashcards.due") ?? "Due",
          cardOf: t("flashcards.cardOf"),
          again: t("flashcards.again"),
          hard: t("flashcards.hard"),
          good: t("flashcards.good"),
          easy: t("flashcards.easy"),
          exitStudy: t("flashcards.exitStudy"),
          completed: t("flashcards.completed"),
          completedDesc: t("flashcards.completedDesc"),
          showing: t("flashcards.showing"),
          mastery: t("flashcards.mastery"),
        }}
      />
    </AppShell>
  );
}