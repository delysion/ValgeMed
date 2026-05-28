"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StudyButtons } from "./study-buttons";
import type { FlashcardItem } from "@/lib/data/queries";
import { updateFlashcardSRSFromStudyAction } from "@/lib/actions/resources";
import { X, ChevronLeft, ChevronRight, RotateCw } from "lucide-react";

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
  const progress = ((currentIndex + (isFlipped ? 1 : 0)) / cards.length) * 100;

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
      } else if (e.key === "1" && isFlipped) {
        handleResponse(0);
      } else if (e.key === "2" && isFlipped) {
        handleResponse(1);
      } else if (e.key === "3" && isFlipped) {
        handleResponse(2);
      } else if (e.key === "4" && isFlipped) {
        handleResponse(3);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleFlip, handleResponse, goPrev, isFirstCard, isFlipped, onExit]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg-page/95 backdrop-blur-md">
      {/* Progress bar */}
      <div className="h-0.5 bg-bg-subtle">
        <div
          className="h-full bg-gradient-to-r from-primary to-cyan transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <Button type="button" variant="ghost" size="icon" onClick={onExit} aria-label={labels.exitStudy}>
          <X className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-secondary tabular-nums">
            {currentIndex + 1} / {cards.length}
          </span>
          {currentCard.subjectName && (
            <span className="text-xs text-text-muted px-2 py-0.5 rounded-md bg-bg-subtle">
              {currentCard.subjectName}
            </span>
          )}
        </div>
        <div className="w-10" />
      </header>

      {/* Card area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
        <div className="w-full max-w-lg">
          {/* Flip card with 3D perspective */}
          <div className="perspective-1000">
            <button
              type="button"
              onClick={handleFlip}
              className={cn(
                "relative w-full min-h-[300px] rounded-3xl border-2 p-8 text-center shadow-[var(--shadow-elevated)] transition-all duration-500 cursor-pointer",
                "bg-gradient-to-br from-bg-elevated to-bg-subtle",
                isFlipped
                  ? "border-primary/40 from-primary/5 to-primary/10"
                  : "border-border/50 hover:border-primary/30",
                isTransitioning && "opacity-0 scale-95",
              )}
              aria-label={isFlipped ? currentCard.answer ?? "" : labels.tapToFlip}
            >
              {/* Front: Question */}
              <div className={cn(
                "transition-all duration-300",
                !isFlipped ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 absolute inset-0 pointer-events-none"
              )}>
                <p className="text-xl font-semibold text-text-primary leading-relaxed">
                  {currentCard.question}
                </p>
                {currentCard.topicTitle && (
                  <p className="mt-4 text-xs text-text-muted">
                    {currentCard.topicTitle}
                  </p>
                )}
              </div>

              {/* Back: Answer */}
              <div className={cn(
                "transition-all duration-300",
                isFlipped ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 absolute inset-0 pointer-events-none"
              )}>
                <p className="text-lg text-text-secondary leading-relaxed">
                  {currentCard.answer ?? "-"}
                </p>
              </div>

              {/* Flip hint */}
              {!isFlipped && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs text-text-muted">
                  <RotateCw className="h-3 w-3" />
                  {labels.tapToFlip}
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Keyboard hints */}
        <div className="mt-6 flex items-center gap-4 text-[10px] text-text-muted">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-bg-subtle border border-border text-text-secondary font-mono">Space</kbd>
            flip
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-bg-subtle border border-border text-text-secondary font-mono">1-4</kbd>
            rate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-bg-subtle border border-border text-text-secondary font-mono">Esc</kbd>
            exit
          </span>
        </div>
      </main>

      {/* Response buttons */}
      {isFlipped && (
        <footer className="border-t border-border/50 p-4">
          <StudyButtons onResponse={handleResponse} labels={labels} />
          <div className="mt-3 flex justify-center gap-6">
            <button
              type="button"
              onClick={goPrev}
              disabled={isFirstCard}
              className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev
            </button>
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              Skip
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
