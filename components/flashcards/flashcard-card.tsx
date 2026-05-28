"use client";

import { cn } from "@/lib/utils";
import { fmtDate } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit3, Trash2 } from "lucide-react";
import { deleteReviewItemAction } from "@/lib/actions/resources";
import type { FlashcardItem } from "@/lib/data/queries";

interface FlashcardCardProps {
  card: FlashcardItem;
  onStudy: (card: FlashcardItem) => void;
  onEdit?: (card: FlashcardItem) => void;
  labels: {
    edit: string;
    delete: string;
    tapToFlip: string;
    due: string;
  };
}

function ConfidenceStars({ confidence }: { confidence: number }) {
  const stars = Math.round(confidence / 3);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={cn(
            "h-2 w-2 rounded-full",
            s <= stars ? "bg-cyan" : "bg-border",
          )}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export function FlashcardCard({ card, onStudy, onEdit, labels }: FlashcardCardProps) {
  const questionPreview = card.question.length > 100
    ? card.question.slice(0, 100) + "..."
    : card.question;

  const isOverdue = card.isActive && new Date(card.dueAt) <= new Date();

  return (
    <article
      className={cn(
        "group relative rounded-2xl border bg-gradient-to-br from-bg-subtle to-bg-elevated p-4 shadow-[var(--ring-soft)] transition-all duration-200",
        "hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5",
      )}
    >
      <button
        type="button"
        className="block w-full text-left"
        onClick={() => onStudy(card)}
        aria-label={labels.tapToFlip}
      >
        <p className="line-clamp-3 text-sm font-semibold text-text-primary">
          {questionPreview}
        </p>

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <Badge variant="muted" className="text-[10px]">
            {card.subjectName}
          </Badge>
          {card.topicTitle && (
            <Badge variant="muted" className="text-[10px]">
              {card.topicTitle}
            </Badge>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <ConfidenceStars confidence={card.confidence} />
          <span
            className={cn(
              "text-xs",
              isOverdue ? "text-rose font-medium" : "text-text-secondary",
            )}
          >
            {labels.due} {fmtDate(card.dueAt)}
          </span>
        </div>
      </button>

      <div className="mt-3 flex items-center gap-1 border-t border-border pt-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onStudy(card)}
          aria-label={labels.tapToFlip}
        >
          <Edit3 className="h-4 w-4" />
        </Button>
        {onEdit && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(card)}
            aria-label={labels.edit}
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        )}
        <form action={deleteReviewItemAction} className="ml-auto">
          <input type="hidden" name="id" value={card.id} />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-rose hover:bg-rose/10"
            aria-label={labels.delete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </article>
  );
}