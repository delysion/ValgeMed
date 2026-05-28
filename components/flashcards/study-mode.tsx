"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StudyButtons } from "./study-buttons";
import type { FlashcardItem } from "@/lib/data/queries";
import { updateFlashcardSRSFromStudyAction } from "@/lib/actions/resources";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface StudyModeProps {
  cards: FlashcardItem[];
  initialIndex?: number;
  onComplete: () => void;
  onExit: () => void;
  labels: {
    cardOf: string;
    tapToFlip: string;
    again: string;
    hard: string;
    good: string;
    easy: string;
    exitStudy: string;
    completed: string;
    completedDesc: string;
  };
}

export function StudyMode({ cards, initialIndex = 0, onComplete, onExit, labels }: StudyModeProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentCard = cards[currentIndex];
  const isLastCard = currentIndex === cards.length - 1;
  const isFirstCard = currentIndex === 0;

  const goNext = useCallback(() => {
    if (isLastCard) {
      onComplete();
    } else {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((i) => i + 1);
        setIsFlipped(false);
        setIsTransitioning(false);
      }, 200);
    }
  }, [isLastCard, onComplete]);

  const goPrev = useCallback(() => {
    if (!isFirstCard) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((i) => i - 1);
        setIsFlipped(false);
        setIsTransitioning(false);
      }, 200);
    }
  }, [isFirstCard]);

  const handleResponse = useCallback(
    async (quality: 0 | 1 | 2 | 3) => {
      const form = new FormData();
      form.set("id", currentCard.id);
      form.set("quality", String(quality));
      await updateFlashcardSRSFromStudyAction(form);
      goNext();
    },
    [currentCard.id, goNext],
  );

  const handleFlip = useCallback(() => {
    setIsFlipped((f) => !f);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onExit();
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (!isFlipped) {
          handleFlip();
        }
      } else if (e.key === "ArrowRight" && isFlipped) {
        handleResponse(2);
      } else if (e.key === "ArrowLeft" && isFlipped && !isFirstCard) {
        goPrev();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleFlip, handleResponse, goPrev, isFirstCard, isFlipped, onExit]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg-page/95 backdrop-blur-sm">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <Button type="button" variant="ghost" size="icon" onClick={onExit} aria-label={labels.exitStudy}>
          <X className="h-5 w-5" />
        </Button>
        <span className="text-sm text-text-secondary">
          {labels.cardOf.replace("{current}", String(currentIndex + 1)).replace("{total}", String(cards.length))}
        </span>
        <div className="w-10" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
        <div className="w-full max-w-lg">
          <button
            type="button"
            onClick={handleFlip}
            className={cn(
              "relative w-full min-h-[280px] rounded-3xl border-2 bg-gradient-to-br from-bg-elevated to-bg-subtle p-8 text-center shadow-[var(--ring-soft)] transition-all duration-300 cursor-pointer",
              isFlipped
                ? "border-primary/50 from-primary/5 to-primary/10"
                : "border-border hover:border-primary/30",
              isTransitioning && "opacity-0 scale-95",
            )}
            aria-label={isFlipped ? currentCard.answer ?? "" : labels.tapToFlip}
          >
            <div className={cn("transition-all duration-300", !isFlipped && "block", isFlipped && "hidden")}>
              <p className="text-xl font-semibold text-text-primary leading-relaxed">
                {currentCard.question}
              </p>
            </div>
            <div className={cn("transition-all duration-300", isFlipped ? "block" : "hidden")}>
              <p className="text-lg text-text-secondary leading-relaxed">
                {currentCard.answer ?? "-"}
              </p>
            </div>
          </button>

          {!isFlipped && (
            <p className="mt-4 text-center text-sm text-text-muted">{labels.tapToFlip}</p>
          )}
        </div>
      </main>

      {isFlipped && (
        <footer className="border-t border-border p-4">
          <StudyButtons onResponse={handleResponse} labels={labels} />
          <div className="mt-3 flex justify-center gap-4">
            <button
              type="button"
              onClick={goPrev}
              disabled={isFirstCard}
              className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
            >
              Skip
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}