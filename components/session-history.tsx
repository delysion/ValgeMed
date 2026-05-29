"use client";

import { useState, useCallback } from "react";
import { Edit3, Eye } from "lucide-react";

import { DeleteButton } from "@/components/forms/delete-button";
import { GlassCard } from "@/components/premium/glass-card";
import { SectionHeader } from "@/components/premium/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkOperationsBar } from "@/components/bulk-operations-bar";
import { BulkDeleteDialog } from "@/components/bulk-delete-dialog";
import { BulkEditDialog } from "@/components/bulk-edit-dialog";
import {
  deleteStudySessionAction,
  bulkDeleteResources,
  bulkUpdateResources,
} from "@/lib/actions/resources";
import type { StudySession, Subject } from "@/lib/db/schema";
import { fmtDate, humanize } from "@/lib/labels";

const activeMethods = new Set(["active_recall", "quiz", "simulation", "error_review"]);

interface SessionHistoryProps {
  sessions: StudySession[];
  subjects: Subject[];
  labels: {
    title: string;
    description: string;
    focus: string;
    output: string;
    open: string;
    edit: string;
    delete: string;
    minutes: string;
    noData: string;
  };
}

export function SessionHistory({ sessions, subjects, labels }: SessionHistoryProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const subjectById = new Map(subjects.map((s) => [s.id, s]));

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
      setSelectedIds(new Set(sessions.map((s) => s.id)));
    } else {
      setSelectedIds(new Set());
    }
  }, [sessions]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const handleBulkDelete = async () => {
    setPending(true);
    try {
      const formData = new FormData();
      formData.set("resourceType", "studySessions");
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
      formData.set("resourceType", "studySessions");
      formData.set("ids", JSON.stringify(Array.from(selectedIds)));
      formData.set("patch", JSON.stringify(patch));
      await bulkUpdateResources(formData);
      setSelectedIds(new Set());
      setIsEditOpen(false);
    } finally {
      setPending(false);
    }
  };

  return (
    <GlassCard>
      <SectionHeader title={labels.title} description={labels.description} />
      <BulkOperationsBar
        selectedCount={selectedIds.size}
        totalCount={sessions.length}
        allSelected={selectedIds.size === sessions.length}
        onSelectAll={selectAll}
        onDelete={() => setIsDeleteOpen(true)}
        onEdit={() => setIsEditOpen(true)}
        onClear={clearSelection}
        isLoading={pending}
      />
      <div className="mt-4 divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 bg-bg-page/25">
        {sessions.length > 0 ? (
          sessions.map((item) => {
            const subject = item.subjectId ? subjectById.get(item.subjectId) : null;
            const isSelected = selectedIds.has(item.id);

            return (
              <div
                key={item.id}
                className={`grid gap-3 p-4 transition hover:bg-bg-surface/55 md:grid-cols-[auto_minmax(0,1fr)_auto_auto_auto] md:items-center ${isSelected ? "bg-primary/5" : ""}`}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleId(item.id)}
                />
                <div className="flex min-w-0 items-center gap-3">
                  <span className="h-10 w-1.5 rounded-full" style={{ backgroundColor: subject?.color ?? "#58D0E8" }} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-primary">{subject?.name ?? "Subject"}</p>
                    <p className="mt-0.5 text-xs text-text-secondary">{fmtDate(item.startedAt)} · {humanize(item.method)}</p>
                  </div>
                </div>
                <Badge variant={activeMethods.has(item.method) ? "success" : "muted"} className="w-fit">{item.durationMinutes}m</Badge>
                <div className="flex gap-2 text-xs text-text-secondary">
                  <span>{labels.focus}: {item.focusLevel}/10</span>
                  <span>{labels.output}: {item.outputQuality}/10</span>
                </div>
                <div className="flex justify-end gap-1">
                  <Button asChild variant="ghost" size="icon" aria-label={labels.open}>
                    <a href={`/study?view=${item.id}`}>
                      <Eye className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button asChild variant="ghost" size="icon" aria-label={labels.edit}>
                    <a href={`/study?edit=${item.id}`}>
                      <Edit3 className="h-4 w-4" />
                    </a>
                  </Button>
                  <DeleteButton action={deleteStudySessionAction} id={item.id} label={labels.delete} returnTo="/study" />
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-6 text-sm text-text-muted">{labels.noData}</div>
        )}
      </div>

      <BulkDeleteDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleBulkDelete}
        itemLabel="sessions"
        selectedCount={selectedIds.size}
      />

      <BulkEditDialog
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        onConfirm={handleBulkEdit}
        fields={[
          { key: "focusLevel", label: "Focus Level", type: "number" },
          { key: "outputQuality", label: "Output Quality", type: "number" },
          { key: "energyLevel", label: "Energy Level", type: "number" },
        ]}
        itemLabel="sessions"
        selectedCount={selectedIds.size}
      />
    </GlassCard>
  );
}
