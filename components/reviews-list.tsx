"use client";

import { useState, useCallback } from "react";
import { Edit3, Eye, RotateCw } from "lucide-react";

import { DeleteButton } from "@/components/forms/delete-button";
import { EmptyState } from "@/components/premium/empty-state";
import { RecordDrawer } from "@/components/ui/record-drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkOperationsBar } from "@/components/bulk-operations-bar";
import { BulkDeleteDialog } from "@/components/bulk-delete-dialog";
import { BulkEditDialog } from "@/components/bulk-edit-dialog";
import {
  deleteReviewItemAction,
  markReviewItemReviewedAction,
  bulkDeleteResources,
  bulkUpdateResources,
} from "@/lib/actions/resources";
import type { ReviewItem, Subject, Topic } from "@/lib/db/schema";
import { fmtDate, humanize } from "@/lib/labels";
import { cn } from "@/lib/utils";

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

function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round((value / 10) * 100);
  const variant = pct >= 70 ? "success" : pct >= 40 ? "warning" : "danger";
  return (
    <Badge variant={variant as "success" | "warning" | "danger"} className="tabular-nums">
      {value}/10
    </Badge>
  );
}

function DueBadge({ dueAt, isActive }: { dueAt: Date; isActive: boolean }) {
  const now = new Date();
  const due = new Date(dueAt);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (!isActive) {
    return <Badge variant="muted">Inactive</Badge>;
  }

  if (diffDays < 0) {
    return <Badge variant="danger">Overdue {Math.abs(diffDays)}d</Badge>;
  }
  if (diffDays === 0) {
    return <Badge variant="warning">Today</Badge>;
  }
  if (diffDays <= 3) {
    return <Badge variant="warning">{diffDays}d</Badge>;
  }
  return <Badge variant="muted">{fmtDate(dueAt)}</Badge>;
}

export function ReviewsList({ reviewItems, subjects, topics, labels }: ReviewsListProps) {
  const [selected, setSelected] = useState<ReviewItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));
  const topicById = new Map(topics.map((topic) => [topic.id, topic]));

  const toggleId = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(reviewItems.map((r) => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  }, [reviewItems]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const handleBulkDelete = async () => {
    setPending(true);
    try {
      const formData = new FormData();
      formData.set("resourceType", "reviews");
      formData.set("ids", JSON.stringify(Array.from(selectedIds)));
      await bulkDeleteResources(formData);
      setSelectedIds(new Set());
      setIsDeleteOpen(false);
    } finally {
      setPending(false);
    }
  };

  const handleBulkEdit = async (patch: Record<string, unknown>) => {
    setPending(true);
    try {
      const formData = new FormData();
      formData.set("resourceType", "reviews");
      formData.set("ids", JSON.stringify(Array.from(selectedIds)));
      formData.set("patch", JSON.stringify(patch));
      await bulkUpdateResources(formData);
      setSelectedIds(new Set());
      setIsEditOpen(false);
    } finally {
      setPending(false);
    }
  };

  if (reviewItems.length === 0) {
    return (
      <EmptyState title={labels.emptyTitle} description={labels.emptyBody} />
    );
  }

  return (
    <>
      <BulkOperationsBar
        selectedCount={selectedIds.size}
        totalCount={reviewItems.length}
        allSelected={selectedIds.size === reviewItems.length}
        onSelectAll={selectAll}
        onDelete={() => setIsDeleteOpen(true)}
        onEdit={() => setIsEditOpen(true)}
        onClear={clearSelection}
        isLoading={pending}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {reviewItems.map((item) => {
          const isOverdue = item.isActive && new Date(item.dueAt) <= new Date();
          const isSelected = selectedIds.has(item.id);

          return (
            <article
              key={item.id}
              className={cn(
                "group relative rounded-2xl border bg-gradient-to-br from-bg-subtle to-bg-elevated p-4 shadow-[var(--ring-soft)] transition-all duration-200",
                "hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5",
                isOverdue && "border-rose/30 from-rose-bg/30 to-bg-elevated",
                isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-bg-page"
              )}
            >
              <div className="absolute right-3 top-3 z-10">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleId(item.id)}
                />
              </div>

              <button
                type="button"
                className="block w-full text-left"
                onClick={() => setSelected(item)}
                aria-label={labels.open}
              >
                <p className="line-clamp-2 text-sm font-semibold text-text-primary">
                  {item.question}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <Badge variant="muted" className="text-[10px]">
                    {subjectById.get(item.subjectId)?.name ?? "-"}
                  </Badge>
                  <Badge variant="muted" className="text-[10px]">
                    {humanize(item.reviewType)}
                  </Badge>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ConfidenceBadge value={item.confidence} />
                    <span className="text-xs text-text-secondary">{item.intervalDays}d</span>
                  </div>
                  <DueBadge dueAt={item.dueAt} isActive={item.isActive} />
                </div>
              </button>

              <div className="mt-3 flex items-center justify-end gap-1 border-t border-border pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setSelected(item)}
                  aria-label={labels.open}
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
                    className="h-7 w-11 rounded-md border border-border bg-bg-subtle px-1.5 text-center text-xs text-text-primary"
                    aria-label={labels.confidence}
                  />
                  <Button type="submit" variant="ghost" size="icon" className="h-8 w-8" aria-label={labels.markReviewed}>
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </form>
                <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                  <a href={`/reviews?edit=${item.id}`} aria-label={labels.edit}>
                    <Edit3 className="h-4 w-4" />
                  </a>
                </Button>
                <DeleteButton action={deleteReviewItemAction} id={item.id} label={labels.delete} />
              </div>
            </article>
          );
        })}
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

      <BulkDeleteDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleBulkDelete}
        itemLabel="review cards"
        selectedCount={selectedIds.size}
      />

      <BulkEditDialog
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        onConfirm={handleBulkEdit}
        fields={[
          { key: "confidence", label: "Confidence", type: "number" },
          { key: "isActive", label: "Active", type: "boolean" },
        ]}
        itemLabel="review cards"
        selectedCount={selectedIds.size}
      />
    </>
  );
}
