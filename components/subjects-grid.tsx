"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkOperationsBar } from "@/components/bulk-operations-bar";
import { BulkDeleteDialog } from "@/components/bulk-delete-dialog";
import { BulkEditDialog } from "@/components/bulk-edit-dialog";
import { bulkDeleteResources, bulkUpdateResources } from "@/lib/actions/resources";
import type { Subject, Topic } from "@/lib/db/schema";

interface SubjectsGridProps {
  subjects: Subject[];
  topics: Topic[];
}

export function SubjectsGrid({ subjects, topics }: SubjectsGridProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const safeTopics = topics || [];

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
      setSelectedIds(new Set(subjects.map((s) => s.id)));
    } else {
      setSelectedIds(new Set());
    }
  }, [subjects]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const handleBulkDelete = async () => {
    setPending(true);
    try {
      const formData = new FormData();
      formData.set("resourceType", "subjects");
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
      formData.set("resourceType", "subjects");
      formData.set("ids", JSON.stringify(Array.from(selectedIds)));
      formData.set("patch", JSON.stringify(patch));
      await bulkUpdateResources(formData);
      setSelectedIds(new Set());
      setIsEditOpen(false);
    } finally {
      setPending(false);
    }
  };

  if (subjects.length === 0) {
    return null;
  }

  return (
    <>
      <BulkOperationsBar
        selectedCount={selectedIds.size}
        totalCount={subjects.length}
        allSelected={selectedIds.size === subjects.length}
        onSelectAll={selectAll}
        onDelete={() => setIsDeleteOpen(true)}
        onEdit={() => setIsEditOpen(true)}
        onClear={clearSelection}
        isLoading={pending}
      />

      <div className="divide-y divide-border/50">
        {subjects.map((subject) => {
          const subjectTopics = safeTopics.filter((topic) => topic.subjectId === subject.id);
          const ready = subjectTopics.filter(
            (topic) => topic.status === "exam_ready" || topic.status === "consolidated"
          ).length;
          const progress = subjectTopics.length === 0
            ? 0
            : Math.round((ready / subjectTopics.length) * 100);
          const color = subject.color ?? "#58D0E8";
          const isSelected = selectedIds.has(subject.id);

          return (
            <div
              key={subject.id}
              className={`group flex items-center gap-3 p-5 transition-all duration-200 hover:bg-muted/5 ${
                isSelected ? "bg-primary/5" : ""
              }`}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleId(subject.id)}
              />

              <Link
                href={`/subjects/${subject.id}`}
                className="flex min-w-0 flex-1 items-center gap-4"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-text-primary truncate group-hover:text-cyan transition-colors">
                      {subject.name}
                    </h3>
                    {subject.code && (
                      <Badge variant="muted" className="text-[10px]">
                        {subject.code}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span>{subjectTopics.length} topics</span>
                    {progress > 0 && (
                      <span className="flex items-center gap-1">
                        <div className="h-1.5 w-16 rounded-full bg-muted/20 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan to-emerald"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        {progress}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="muted" className="hidden sm:inline-flex">
                      Diff: {subject.difficulty}
                    </Badge>
                    <Badge className="hidden sm:inline-flex">
                      Imp: {subject.importance}
                    </Badge>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      <BulkDeleteDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleBulkDelete}
        itemLabel="subjects"
        selectedCount={selectedIds.size}
      />

      <BulkEditDialog
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        onConfirm={handleBulkEdit}
        fields={[
          { key: "name", label: "Name", type: "text" },
          { key: "code", label: "Code", type: "text" },
          { key: "description", label: "Description", type: "text" },
          { key: "color", label: "Color", type: "text" },
          { key: "difficulty", label: "Difficulty (0-10)", type: "number" },
          { key: "importance", label: "Importance (0-10)", type: "number" },
        ]}
        itemLabel="subjects"
        selectedCount={selectedIds.size}
      />
    </>
  );
}
