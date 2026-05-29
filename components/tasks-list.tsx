"use client";

import { useState, useCallback } from "react";
import { Calendar, CheckCircle2, Clock, Flag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkOperationsBar } from "@/components/bulk-operations-bar";
import { BulkDeleteDialog } from "@/components/bulk-delete-dialog";
import { BulkEditDialog } from "@/components/bulk-edit-dialog";
import {
  bulkDeleteResources,
  bulkUpdateResources,
} from "@/lib/actions/resources";
import type { Task } from "@/lib/db/schema";
import { humanize } from "@/lib/labels";

interface TasksListProps {
  tasks: Task[];
  labels: {
    statusTodo: string;
    statusDoing: string;
    statusDone: string;
    statusArchived: string;
    overdue: string;
    today: string;
    daysLeft: string;
    subjectLinked: string;
    noTasks: string;
    noTasksDesc: string;
  };
}

export function TasksList({ tasks, labels }: TasksListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [pending, setPending] = useState(false);

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
      setSelectedIds(new Set(tasks.map((t) => t.id)));
    } else {
      setSelectedIds(new Set());
    }
  }, [tasks]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const handleBulkDelete = async () => {
    setPending(true);
    try {
      const formData = new FormData();
      formData.set("resourceType", "tasks");
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
      formData.set("resourceType", "tasks");
      formData.set("ids", JSON.stringify(Array.from(selectedIds)));
      formData.set("patch", JSON.stringify(patch));
      await bulkUpdateResources(formData);
      setSelectedIds(new Set());
      setIsEditOpen(false);
    } finally {
      setPending(false);
    }
  };

  if (tasks.length === 0) {
    return null;
  }

  return (
    <>
      <BulkOperationsBar
        selectedCount={selectedIds.size}
        totalCount={tasks.length}
        allSelected={selectedIds.size === tasks.length}
        onSelectAll={selectAll}
        onDelete={() => setIsDeleteOpen(true)}
        onEdit={() => setIsEditOpen(true)}
        onClear={clearSelection}
        isLoading={pending}
      />

      <div className="divide-y divide-border/50">
        {tasks.map((task) => {
          const isOverdue = task.dueAt && new Date(task.dueAt) < new Date() && task.status !== "done";
          const daysRemaining = task.dueAt
            ? Math.ceil((new Date(task.dueAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            : null;
          const isSelected = selectedIds.has(task.id);

          return (
            <div
              key={task.id}
              className={`group flex items-center gap-4 p-5 transition-all duration-200 hover:bg-muted/5 ${isSelected ? "bg-primary/5" : ""}`}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleId(task.id)}
              />
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                task.status === "done"
                  ? "bg-emerald/10"
                  : isOverdue
                  ? "bg-rose/10"
                  : "bg-amber/10"
              }`}>
                {task.status === "done" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald" />
                ) : isOverdue ? (
                  <Clock className="h-5 w-5 text-rose" />
                ) : (
                  <Clock className="h-5 w-5 text-amber" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-text-primary truncate group-hover:text-cyan transition-colors">
                  {task.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-muted mt-1">
                  {task.dueAt && (
                    <span className={`flex items-center gap-1 ${isOverdue ? "text-rose" : ""}`}>
                      <Calendar className="h-3 w-3" />
                      {isOverdue
                        ? `${Math.abs(daysRemaining!)}d ${labels.overdue}`
                        : daysRemaining === 0
                        ? labels.today
                        : `${daysRemaining}d ${labels.daysLeft}`}
                    </span>
                  )}
                  {task.relatedSubjectId && (
                    <Badge variant="outline" className="text-[10px]">
                      {labels.subjectLinked}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  variant={task.status === "done" ? "success" : "muted"}
                  className="hidden sm:inline-flex"
                >
                  {task.status === "todo" ? labels.statusTodo
                    : task.status === "doing" ? labels.statusDoing
                    : task.status === "done" ? labels.statusDone
                    : labels.statusArchived}
                </Badge>
                <div className="flex items-center gap-1 text-xs font-medium">
                  <Flag className={`h-3 w-3 ${task.priority >= 7 ? "text-amber" : "text-muted"}`} />
                  {task.priority}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <BulkDeleteDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleBulkDelete}
        itemLabel="tasks"
        selectedCount={selectedIds.size}
      />

      <BulkEditDialog
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        onConfirm={handleBulkEdit}
        fields={[
          { key: "status", label: "Status", type: "text" },
          { key: "priority", label: "Priority", type: "number" },
        ]}
        itemLabel="tasks"
        selectedCount={selectedIds.size}
      />
    </>
  );
}
