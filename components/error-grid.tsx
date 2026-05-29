"use client";

import { useState, useCallback } from "react";
import { isBefore, startOfToday } from "date-fns";
import { CheckCircle2, Flame, Skull } from "lucide-react";
import Link from "next/link";

import { DeleteButton } from "@/components/forms/delete-button";
import { GlassCard } from "@/components/premium/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkOperationsBar } from "@/components/bulk-operations-bar";
import { BulkDeleteDialog } from "@/components/bulk-delete-dialog";
import { BulkEditDialog } from "@/components/bulk-edit-dialog";
import {
  deleteErrorLogAction,
  toggleErrorResolvedAction,
  bulkDeleteResources,
  bulkUpdateResources,
} from "@/lib/actions/resources";
import type { ErrorLog, Subject } from "@/lib/db/schema";
import { fmtDate, humanize } from "@/lib/labels";

interface ErrorGridProps {
  errorLogs: ErrorLog[];
  subjects: Subject[];
  labels: {
    open: string;
    destroyed: string;
    critical: string;
    severity: string;
    recurrence: string;
    retest: string;
    preventionRule: string;
    edit: string;
    delete: string;
    emptyTitle: string;
    emptyDesc: string;
  };
}

export function ErrorGrid({ errorLogs, subjects, labels }: ErrorGridProps) {
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
      setSelectedIds(new Set(errorLogs.map((e) => e.id)));
    } else {
      setSelectedIds(new Set());
    }
  }, [errorLogs]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const handleBulkDelete = async () => {
    setPending(true);
    try {
      const formData = new FormData();
      formData.set("resourceType", "errorLogs");
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
      formData.set("resourceType", "errorLogs");
      formData.set("ids", JSON.stringify(Array.from(selectedIds)));
      formData.set("patch", JSON.stringify(patch));
      await bulkUpdateResources(formData);
      setSelectedIds(new Set());
      setIsEditOpen(false);
    } finally {
      setPending(false);
    }
  };

  if (errorLogs.length === 0) {
    return (
      <GlassCard tone="emerald">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald/10 mb-4">
            <CheckCircle2 className="h-8 w-8 text-emerald" />
          </div>
          <p className="text-muted mb-2">{labels.emptyTitle}</p>
          <p className="text-xs text-muted-2">{labels.emptyDesc}</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <>
      <BulkOperationsBar
        selectedCount={selectedIds.size}
        totalCount={errorLogs.length}
        allSelected={selectedIds.size === errorLogs.length}
        onSelectAll={selectAll}
        onDelete={() => setIsDeleteOpen(true)}
        onEdit={() => setIsEditOpen(true)}
        onClear={clearSelection}
        isLoading={pending}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {errorLogs.map((error) => {
          const subject = subjectById.get(error.subjectId);
          const isCritical = error.severity >= 8 && !error.resolved;
          const isSelected = selectedIds.has(error.id);

          return (
            <GlassCard
              key={error.id}
              tone={error.resolved ? "emerald" : isCritical ? "danger" : "rose"}
              className={`relative overflow-hidden ${isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-bg-page" : ""}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-muted/5" />

              <div className="absolute right-3 top-3 z-10">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleId(error.id)}
                />
              </div>

              <div className="relative">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={error.resolved ? "success" : "danger"}>
                      {error.resolved ? labels.destroyed : labels.open}
                    </Badge>
                    {isCritical && (
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-rose/10 text-rose">
                        <Flame className="mr-0.5 h-2.5 w-2.5" />
                        {labels.critical}
                      </span>
                    )}
                  </div>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    error.resolved ? "bg-emerald/10" : "bg-rose/10"
                  }`}>
                    <Skull className={`h-5 w-5 ${error.resolved ? "text-emerald" : "text-rose"}`} />
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-text-primary mb-1">{error.title}</h3>
                <p className="text-sm text-muted mb-4">
                  {subject?.name ?? "No subject"} - {humanize(error.errorType)}
                </p>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className={`rounded-xl p-3 text-center ${
                    error.resolved ? "bg-emerald/5" : "bg-rose/5"
                  }`}>
                    <p className="text-xs text-muted uppercase tracking-wider">{labels.severity}</p>
                    <p className={`font-mono text-xl font-semibold mt-1 ${
                      error.severity >= 8 ? "text-rose" : error.severity >= 5 ? "text-amber" : "text-text-primary"
                    }`}>
                      {error.severity}
                    </p>
                  </div>
                  <div className={`rounded-xl p-3 text-center ${
                    error.resolved ? "bg-emerald/5" : "bg-rose/5"
                  }`}>
                    <p className="text-xs text-muted uppercase tracking-wider">{labels.recurrence}</p>
                    <p className={`font-mono text-xl font-semibold mt-1 ${
                      error.recurrenceCount > 0 ? "text-amber" : "text-text-primary"
                    }`}>
                      {error.recurrenceCount}
                    </p>
                  </div>
                  <div className={`rounded-xl p-3 text-center ${
                    error.resolved ? "bg-emerald/5" : "bg-rose/5"
                  }`}>
                    <p className="text-xs text-muted uppercase tracking-wider">{labels.retest}</p>
                    <p className={`font-mono text-sm font-semibold mt-1 ${
                      error.retestAt && isBefore(error.retestAt, startOfToday()) && !error.resolved ? "text-rose" : "text-text-primary"
                    }`}>
                      {error.retestAt ? fmtDate(error.retestAt) : "-"}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-border/60 bg-bg-page/35 p-3 mb-4">
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">{labels.preventionRule}</p>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {error.preventionRule ?? error.correction ?? error.description}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/50">
                  <form action={toggleErrorResolvedAction} className="flex-1">
                    <input type="hidden" name="id" value={error.id} />
                    <Button
                      type="submit"
                      variant={error.resolved ? "outline" : "default"}
                      size="sm"
                      className="w-full"
                    >
                      <CheckCircle2 className="mr-1.5 h-4 w-4" />
                      {error.resolved ? "Reopen" : "Mark Destroyed"}
                    </Button>
                  </form>
                  <Button asChild variant="ghost" size="icon" className="shrink-0">
                    <Link href={`/errors?edit=${error.id}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.844a.5.5 0 0 1-.62-.62l.844-2.872a2 2 0 0 1 .506-.855z"/>
                      </svg>
                    </Link>
                  </Button>
                  <DeleteButton action={deleteErrorLogAction} id={error.id} />
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <BulkDeleteDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleBulkDelete}
        itemLabel="errors"
        selectedCount={selectedIds.size}
      />

      <BulkEditDialog
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        onConfirm={handleBulkEdit}
        fields={[
          { key: "severity", label: "Severity", type: "number" },
          { key: "resolved", label: "Resolved", type: "boolean" },
        ]}
        itemLabel="errors"
        selectedCount={selectedIds.size}
      />
    </>
  );
}
