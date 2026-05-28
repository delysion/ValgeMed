"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/premium/empty-state";
import { FlashcardCard } from "./flashcard-card";
import { StudyMode } from "./study-mode";
import type { FlashcardItem } from "@/lib/data/queries";
import type { Subject } from "@/lib/db/schema";

interface FlashcardGridProps {
  initialCards: FlashcardItem[];
  subjects: Subject[];
  labels: {
    searchPlaceholder: string;
    filterSubject: string;
    filterConfidence: string;
    filterDue: string;
    allSubjects: string;
    allConfidence: string;
    allDue: string;
    overdue: string;
    today: string;
    thisWeek: string;
    empty: string;
    emptyDesc: string;
    newFlashcard: string;
    study: string;
    edit: string;
    delete: string;
    tapToFlip: string;
    due: string;
    cardOf: string;
    again: string;
    hard: string;
    good: string;
    easy: string;
    exitStudy: string;
    completed: string;
    completedDesc: string;
  };
}

type ConfidenceLevel = 1 | 2 | 3;

export function FlashcardGrid({ initialCards, subjects, labels }: FlashcardGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [cards] = useState(initialCards);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [subjectId, setSubjectId] = useState(searchParams.get("subject") ?? "");
  const [confidence, setConfidence] = useState<ConfidenceLevel | "">(() => {
    const val = searchParams.get("confidence");
    if (val === "1" || val === "2" || val === "3") return parseInt(val, 10) as ConfidenceLevel;
    return "";
  });
  const [dueStatus, setDueStatus] = useState<"overdue" | "today" | "week" | "all">(
    () => {
      const val = searchParams.get("due");
      if (val === "overdue" || val === "today" || val === "week") return val;
      return "all";
    }
  );
  const [studyCard, setStudyCard] = useState<FlashcardItem | null>(null);
  const [studyQueue, setStudyQueue] = useState<FlashcardItem[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (subjectId) params.set("subject", subjectId);
      if (confidence) params.set("confidence", String(confidence));
      if (dueStatus !== "all") params.set("due", dueStatus);

      startTransition(() => {
        router.push(`/flashcards?${params.toString()}`, { scroll: false });
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [search, subjectId, confidence, dueStatus, router]);

  const handleFilterChange = useCallback((key: string, value: string) => {
    if (key === "subject") setSubjectId(value);
    else if (key === "confidence") setConfidence(value as ConfidenceLevel | "");
    else if (key === "due") setDueStatus(value as "overdue" | "today" | "week" | "all");
  }, []);

  const handleStudy = useCallback((card: FlashcardItem) => {
    setStudyQueue([card]);
    setStudyCard(card);
  }, []);

  const handleStudyAll = useCallback(() => {
    setStudyQueue(cards);
    if (cards.length > 0) {
      setStudyCard(cards[0]);
    }
  }, [cards]);

  const handleStudyModeComplete = useCallback(() => {
    setStudyCard(null);
    setStudyQueue([]);
    router.refresh();
  }, [router]);

  const handleStudyModeExit = useCallback(() => {
    setStudyCard(null);
    setStudyQueue([]);
  }, []);

  const confidenceOptions: Array<{ value: ConfidenceLevel | ""; label: string }> = [
    { value: "", label: labels.allConfidence },
    { value: 1, label: "★☆☆" },
    { value: 2, label: "★★☆" },
    { value: 3, label: "★★★" },
  ];

  const dueOptions = [
    { value: "all", label: labels.allDue },
    { value: "overdue", label: labels.overdue },
    { value: "today", label: labels.today },
    { value: "week", label: labels.thisWeek },
  ];

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={labels.searchPlaceholder}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-bg-elevated text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <a href="/ai">
                <Plus className="h-4 w-4" />
                {labels.newFlashcard}
              </a>
            </Button>
            <Button type="button" variant="cyan" size="sm" onClick={handleStudyAll} disabled={cards.length === 0}>
              {labels.study}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={subjectId}
            onChange={(e) => handleFilterChange("subject", e.target.value)}
            className="h-9 rounded-lg border border-border bg-bg-subtle px-3 text-xs text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">{labels.allSubjects}</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <select
            value={confidence}
            onChange={(e) => handleFilterChange("confidence", e.target.value)}
            className="h-9 rounded-lg border border-border bg-bg-subtle px-3 text-xs text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {confidenceOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <select
            value={dueStatus}
            onChange={(e) => handleFilterChange("due", e.target.value)}
            className="h-9 rounded-lg border border-border bg-bg-subtle px-3 text-xs text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {dueOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {isPending && (
          <div className="h-1 rounded-full bg-primary/20 overflow-hidden">
            <div className="h-full w-1/3 bg-primary animate-pulse rounded-full" />
          </div>
        )}
      </div>

      {cards.length === 0 ? (
        <EmptyState
          icon={Search}
          title={labels.empty}
          description={labels.emptyDesc}
          tone="cyan"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <FlashcardCard
              key={card.id}
              card={card}
              onStudy={handleStudy}
              labels={{
                edit: labels.edit,
                delete: labels.delete,
                tapToFlip: labels.tapToFlip,
                due: labels.due,
              }}
            />
          ))}
        </div>
      )}

      {studyCard && studyQueue.length > 0 && (
        <StudyMode
          cards={studyQueue}
          initialIndex={studyQueue.findIndex((c) => c.id === studyCard.id)}
          onComplete={handleStudyModeComplete}
          onExit={handleStudyModeExit}
          labels={{
            cardOf: labels.cardOf,
            tapToFlip: labels.tapToFlip,
            again: labels.again,
            hard: labels.hard,
            good: labels.good,
            easy: labels.easy,
            exitStudy: labels.exitStudy,
            completed: labels.completed,
            completedDesc: labels.completedDesc,
          }}
        />
      )}
    </>
  );
}