"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Plus, Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/premium/empty-state";
import { FlashcardCard } from "./flashcard-card";
import { StudyMode } from "./study-mode";
import type { FlashcardItem } from "@/lib/data/queries";
import type { Subject } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

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

function StatPill({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl bg-bg-subtle/50 border border-border/50">
      <span className={cn("text-lg font-bold tabular-nums", color)}>{value}</span>
      <span className="text-[10px] text-text-muted uppercase tracking-wider">{label}</span>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (val: string) => void;
  options: Array<{ value: string; label: string }>;
  label: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none h-9 pl-3 pr-8 rounded-xl border border-border/50 bg-bg-subtle/50 text-xs text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer hover:border-border transition-colors"
        aria-label={label}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted pointer-events-none" />
    </div>
  );
}

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
  const [showFilters, setShowFilters] = useState(false);

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

  // Compute stats
  const now = new Date();
  const overdueCount = cards.filter((c) => c.isActive && new Date(c.dueAt) <= now).length;
  const dueTodayCount = cards.filter((c) => {
    const due = new Date(c.dueAt);
    return c.isActive && due > now && due.toDateString() === now.toDateString();
  }).length;
  const masteredCount = cards.filter((c) => c.confidence >= 3).length;
  const masteryRate = cards.length > 0 ? Math.round((masteredCount / cards.length) * 100) : 0;

  const hasActiveFilters = subjectId || confidence || dueStatus !== "all";

  const confidenceOptions: Array<{ value: ConfidenceLevel | ""; label: string }> = [
    { value: "", label: labels.allConfidence },
    { value: 1, label: "★ Low" },
    { value: 2, label: "★★ Medium" },
    { value: 3, label: "★★★ High" },
  ];

  const dueOptions = [
    { value: "all", label: labels.allDue },
    { value: "overdue", label: labels.overdue },
    { value: "today", label: labels.today },
    { value: "week", label: labels.thisWeek },
  ];

  return (
    <div className="pt-2">
      {/* Stats bar */}
      {cards.length > 0 && (
        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-1">
          <StatPill label="Total" value={cards.length} color="text-text-primary" />
          <StatPill label="Overdue" value={overdueCount} color={overdueCount > 0 ? "text-rose" : "text-text-muted"} />
          <StatPill label="Today" value={dueTodayCount} color={dueTodayCount > 0 ? "text-gold" : "text-text-muted"} />
          <StatPill label="Mastery" value={`${masteryRate}%`} color="text-emerald" />
        </div>
      )}

      <div className="space-y-4">
        {/* Search + Actions row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={labels.searchPlaceholder}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-border/50 bg-bg-subtle/50 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn("h-9", showFilters && "bg-bg-subtle")}
              onClick={() => setShowFilters((f) => !f)}
            >
              <Filter className="h-3.5 w-3.5" />
              {hasActiveFilters && (
                <span className="h-1.5 w-1.5 rounded-full bg-primary ml-1" />
              )}
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href="/ai">
                <Plus className="h-3.5 w-3.5" />
                {labels.newFlashcard}
              </a>
            </Button>
            <Button type="button" variant="cyan" size="sm" onClick={handleStudyAll} disabled={cards.length === 0}>
              {labels.study}
            </Button>
          </div>
        </div>

        {/* Filters row (collapsible) */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 motion-fade-in">
            <FilterSelect
              value={subjectId}
              onChange={(v) => handleFilterChange("subject", v)}
              options={[
                { value: "", label: labels.allSubjects },
                ...subjects.map((s) => ({ value: s.id, label: s.name })),
              ]}
              label={labels.filterSubject}
            />
            <FilterSelect
              value={String(confidence)}
              onChange={(v) => handleFilterChange("confidence", v)}
              options={confidenceOptions.map((o) => ({ value: String(o.value), label: o.label }))}
              label={labels.filterConfidence}
            />
            <FilterSelect
              value={dueStatus}
              onChange={(v) => handleFilterChange("due", v)}
              options={dueOptions}
              label={labels.filterDue}
            />
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setSubjectId("");
                  setConfidence("");
                  setDueStatus("all");
                }}
                className="h-9 px-3 rounded-xl text-xs text-text-muted hover:text-text-primary hover:bg-bg-subtle transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        )}

        {isPending && (
          <div className="h-0.5 rounded-full bg-primary/20 overflow-hidden">
            <div className="h-full w-1/3 bg-primary animate-pulse rounded-full" />
          </div>
        )}
      </div>

      {/* Cards grid */}
      {cards.length === 0 ? (
        <EmptyState
          icon={Search}
          title={labels.empty}
          description={labels.emptyDesc}
          tone="cyan"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {cards.map((card, i) => (
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
              index={i}
            />
          ))}
        </div>
      )}

      {/* Study mode overlay */}
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
    </div>
  );
}
