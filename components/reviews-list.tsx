"use client";

import { useState } from "react";
import { Edit3, Eye, RotateCw } from "lucide-react";

import { DeleteButton } from "@/components/forms/delete-button";
import { EmptyState } from "@/components/premium/empty-state";
import { RecordDrawer } from "@/components/ui/record-drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  deleteReviewItemAction,
  markReviewItemReviewedAction,
} from "@/lib/actions/resources";
import type { ReviewItem, Subject, Topic } from "@/lib/db/schema";
import { fmtDate, humanize } from "@/lib/labels";

interface ReviewsListProps {
  reviewItems: ReviewItem[];
  subjects: Subject[];
  topics: Topic[];
  labels: {
    question: string;
    subject: string;
    type: string;
    date: string;
    confidence: string;
    interval: string;
    actions: string;
    open: string;
    edit: string;
    delete: string;
    markReviewed: string;
    emptyTitle: string;
    emptyBody: string;
    active: string;
    inactive: string;
  };
}

export function ReviewsList({ reviewItems, subjects, topics, labels }: ReviewsListProps) {
  const [selected, setSelected] = useState<ReviewItem | null>(null);
  const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));
  const topicById = new Map(topics.map((topic) => [topic.id, topic]));

  const renderActions = (item: ReviewItem) => (
    <div className="flex w-[220px] max-w-full justify-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={labels.open}
        onClick={() => setSelected(item)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <form action={markReviewItemReviewedAction} className="flex items-center gap-1">
        <input type="hidden" name="id" value={item.id} />
        <input
          name="confidence"
          type="number"
          min={0}
          max={10}
          defaultValue={item.confidence}
          className="h-8 w-12 rounded-md border border-border bg-bg-subtle px-2 text-xs text-text-primary"
          aria-label={labels.confidence}
        />
        <Button type="submit" variant="ghost" size="icon" aria-label={labels.markReviewed}>
          <RotateCw className="h-4 w-4" />
        </Button>
      </form>
      <Button asChild variant="ghost" size="icon">
        <a href={`/reviews?edit=${item.id}`} aria-label={labels.edit}>
          <Edit3 className="h-4 w-4" />
        </a>
      </Button>
      <DeleteButton action={deleteReviewItemAction} id={item.id} label={labels.delete} />
    </div>
  );

  return (
    <>
      <div className="grid gap-3 md:hidden">
        {reviewItems.length === 0 ? (
          <EmptyState title={labels.emptyTitle} description={labels.emptyBody} />
        ) : (
          reviewItems.map((item) => (
            <article key={item.id} className="rounded-3xl border border-border bg-bg-subtle p-4 shadow-[var(--ring-soft)]">
              <button
                type="button"
                className="block w-full rounded-2xl text-left transition hover:bg-bg-elevated/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                onClick={() => setSelected(item)}
                aria-label={labels.open}
              >
                <p className="line-clamp-3 text-sm font-semibold text-text-primary">{item.question}</p>
                <p className="mt-2 text-xs text-text-secondary">
                  {subjectById.get(item.subjectId)?.name ?? "-"} / {humanize(item.reviewType)} / {fmtDate(item.dueAt)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge>{item.confidence}/10</Badge>
                  <Badge variant={item.isActive ? "default" : "muted"}>{item.isActive ? labels.active : labels.inactive}</Badge>
                </div>
              </button>
              <div className="mt-4 border-t border-border pt-3">{renderActions(item)}</div>
            </article>
          ))
        )}
      </div>

      <div className="hidden max-w-full overflow-x-auto rounded-2xl border border-border md:block">
        <table className="w-full min-w-[700px] table-fixed border-collapse text-sm">
          <thead className="bg-bg-subtle text-xs uppercase tracking-[0.12em] text-text-secondary">
            <tr>
              <th className="w-[24%] px-3 py-2 text-left font-medium">{labels.question}</th>
              <th className="w-[16%] px-3 py-2 text-left font-medium">{labels.subject}</th>
              <th className="w-[13%] px-3 py-2 text-left font-medium">{labels.type}</th>
              <th className="w-[12%] px-3 py-2 text-left font-medium">{labels.date}</th>
              <th className="w-[11%] px-3 py-2 text-left font-medium">{labels.confidence}</th>
              <th className="w-[8%] px-3 py-2 text-left font-medium">{labels.interval}</th>
              <th className="w-[220px] px-3 py-2 text-right font-medium">{labels.actions}</th>
            </tr>
          </thead>
          <tbody>
            {reviewItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8">
                  <EmptyState title={labels.emptyTitle} description={labels.emptyBody} />
                </td>
              </tr>
            ) : (
              reviewItems.map((item) => (
                <tr key={item.id} className="border-t border-border align-top transition hover:bg-bg-subtle/50">
                  <td className="px-3 py-2 text-text-primary">
                    <button
                      type="button"
                      className="line-clamp-2 max-w-[320px] text-left font-medium transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      onClick={() => setSelected(item)}
                      aria-label={labels.open}
                    >
                      {item.question}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-text-secondary">{subjectById.get(item.subjectId)?.name ?? "-"}</td>
                  <td className="px-3 py-2 text-text-secondary">{humanize(item.reviewType)}</td>
                  <td className="px-3 py-2 text-text-secondary">{fmtDate(item.dueAt)}</td>
                  <td className="px-3 py-2 text-text-secondary"><Badge>{item.confidence}/10</Badge></td>
                  <td className="px-3 py-2 text-text-secondary">{item.intervalDays}d</td>
                  <td className="w-[220px] px-3 py-2">{renderActions(item)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <RecordDrawer
        open={selected !== null}
        onClose={() => setSelected(null)}
        record={selected}
        type="review"
        editBasePath="/reviews"
        context={selected ? {
          subjectName: subjectById.get(selected.subjectId)?.name,
          topicTitle: selected.topicId ? topicById.get(selected.topicId)?.title : undefined,
        } : undefined}
      />
    </>
  );
}
