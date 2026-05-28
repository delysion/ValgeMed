"use client";

import { cn } from "@/lib/utils";
import { fmtDate } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit3, Trash2, RotateCw, AlertCircle } from "lucide-react";
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
  index?: number;
}

const subjectColors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  Biochemistry: { bg: "bg-violet/8", border: "border-violet/20", text: "text-violet", dot: "bg-violet" },
  Anatomy: { bg: "bg-cyan/8", border: "border-cyan/20", text: "text-cyan", dot: "bg-cyan" },
  Physiology: { bg: "bg-emerald/8", border: "border-emerald/20", text: "text-emerald", dot: "bg-emerald" },
};

function getSubjectColor(subjectName: string | null) {
  if (!subjectName) return { bg: "bg-border/10", border: "border-border/20", text: "text-text-muted", dot: "bg-text-muted" };
  return subjectColors[subjectName] ?? { bg: "bg-border/10", border: "border-border/20", text: "text-text-muted", dot: "bg-text-muted" };
}

function ConfidenceBar({ confidence }: { confidence: number }) {
  const pct = Math.round((confidence / 3) * 100);
  const color = pct <= 33 ? "bg-rose" : pct <= 66 ? "bg-gold" : "bg-emerald";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-bg-subtle overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-text-muted tabular-nums">{pct}%</span>
    </div>
  );
}

function DueBadge({ dueAt, isActive }: { dueAt: Date; isActive: boolean }) {
  const now = new Date();
  const due = new Date(dueAt);
  const isOverdue = isActive && due <= now;
  const isToday = isActive && !isOverdue && due.toDateString() === now.toDateString();
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (isOverdue) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose">
        <AlertCircle className="h-3.5 w-3.5 ping-dot" />
        Overdue
      </span>
    );
  }

  if (isToday) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gold">
        Due today
      </span>
    );
  }

  if (diffDays <= 3) {
    return (
      <span className="text-xs text-text-secondary">
        {diffDays}d
      </span>
    );
  }

  return (
    <span className="text-xs text-text-muted">
      {fmtDate(dueAt)}
    </span>
  );
}

export function FlashcardCard({ card, onStudy, onEdit, labels, index = 0 }: FlashcardCardProps) {
  const questionPreview = card.question.length > 120
    ? card.question.slice(0, 120) + "…"
    : card.question;

  const answerPreview = card.answer
    ? card.answer.length > 80
      ? card.answer.slice(0, 80) + "…"
      : card.answer
    : null;

  const colors = getSubjectColor(card.subjectName);
  const motionDelay = index < 10 ? `${index * 40}ms` : "0ms";

  return (
    <article
      className={cn(
        "group relative rounded-2xl border bg-bg-surface/60 backdrop-blur-sm overflow-hidden",
        "transition-all duration-300 card-lift",
        "motion-premium motion-stagger-1",
      )}
      style={{ animationDelay: motionDelay }}
    >
      {/* Subject accent stripe */}
      <div className={cn("absolute top-0 left-0 right-0 h-0.5", colors.dot)} />

      <button
        type="button"
        className="block w-full text-left p-5"
        onClick={() => onStudy(card)}
        aria-label={labels.tapToFlip}
      >
        {/* Question */}
        <p className="text-sm font-semibold text-text-primary leading-snug line-clamp-3">
          {questionPreview}
        </p>

        {/* Answer preview on hover */}
        {answerPreview && (
          <p className="mt-2 text-xs text-text-muted line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {answerPreview}
          </p>
        )}

        {/* Meta row */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="muted" className={cn("text-[10px]", colors.text)}>
              <span className={cn("h-1.5 w-1.5 rounded-full", colors.dot)} />
              {card.subjectName ?? "Unknown"}
            </Badge>
            {card.topicTitle && (
              <Badge variant="muted" className="text-[10px]">
                {card.topicTitle}
              </Badge>
            )}
          </div>
        </div>

        {/* Bottom row: confidence + due */}
        <div className="mt-3 flex items-center justify-between">
          <ConfidenceBar confidence={card.confidence} />
          <DueBadge dueAt={card.dueAt} isActive={card.isActive} />
        </div>
      </button>

      {/* Action bar */}
      <div className="flex items-center gap-1 border-t border-border/50 px-4 py-2.5 bg-bg-subtle/30">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onStudy(card)}
          aria-label={labels.tapToFlip}
        >
          <RotateCw className="h-3.5 w-3.5" />
        </Button>
        {onEdit && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onEdit(card)}
            aria-label={labels.edit}
          >
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
        )}
        <form action={deleteReviewItemAction} className="ml-auto">
          <input type="hidden" name="id" value={card.id} />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-rose/60 hover:text-rose hover:bg-rose/10"
            aria-label={labels.delete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </form>
      </div>
    </article>
  );
}
