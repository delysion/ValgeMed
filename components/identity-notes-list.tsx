"use client";

import { useState, useCallback } from "react";
import { Edit3, Eye } from "lucide-react";

import { DeleteButton } from "@/components/forms/delete-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkOperationsBar } from "@/components/bulk-operations-bar";
import { BulkDeleteDialog } from "@/components/bulk-delete-dialog";
import { BulkEditDialog } from "@/components/bulk-edit-dialog";
import { bulkDeleteResources, bulkUpdateResources } from "@/lib/actions/resources";
import type { IdentityNote } from "@/lib/db/schema";
import { humanize } from "@/lib/labels";

interface IdentityNotesListProps {
  identityNotes: IdentityNote[];
  editBasePath: string;
  editParam: string;
  deleteAction: (formData: FormData) => void | Promise<void>;
  labels: {
    title: string;
    category: string;
    content: string;
    edit: string;
    delete: string;
    open: string;
    empty: string;
  };
  viewBasePath?: string;
  viewParam?: string;
  selectedNote?: IdentityNote | null;
}

export function IdentityNotesList({
  identityNotes,
  editBasePath,
  editParam,
  deleteAction,
  labels,
  viewBasePath,
  viewParam,
  selectedNote,
}: IdentityNotesListProps) {
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
      setSelectedIds(new Set(identityNotes.map((n) => n.id)));
    } else {
      setSelectedIds(new Set());
    }
  }, [identityNotes]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const handleBulkDelete = async () => {
    setPending(true);
    try {
      const formData = new FormData();
      formData.set("resourceType", "identityNotes");
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
      formData.set("resourceType", "identityNotes");
      formData.set("ids", JSON.stringify(Array.from(selectedIds)));
      formData.set("patch", JSON.stringify(patch));
      await bulkUpdateResources(formData);
      setSelectedIds(new Set());
      setIsEditOpen(false);
    } finally {
      setPending(false);
    }
  };

  if (identityNotes.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-bg-subtle p-6 text-center text-sm text-text-secondary">
        {labels.empty}
      </div>
    );
  }

  return (
    <>
      <BulkOperationsBar
        selectedCount={selectedIds.size}
        totalCount={identityNotes.length}
        allSelected={selectedIds.size === identityNotes.length}
        onSelectAll={selectAll}
        onDelete={() => setIsDeleteOpen(true)}
        onEdit={() => setIsEditOpen(true)}
        onClear={clearSelection}
        isLoading={pending}
      />

      {selectedNote ? (
        <div className="mb-4 rounded-2xl border border-violet/20 bg-violet-bg/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
            {humanize(selectedNote.category)}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-text-primary">
            {selectedNote.title}
          </h3>
          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-text-secondary">
            {selectedNote.content}
          </p>
        </div>
      ) : null}

      <div className="grid gap-3 md:hidden">
        {identityNotes.map((note) => {
          const isSelected = selectedIds.has(note.id);
          return (
            <article
              key={note.id}
              className={`relative rounded-3xl border border-border bg-bg-subtle p-4 shadow-[var(--ring-soft)] ${
                isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-bg-page" : ""
              }`}
            >
              <div className="absolute right-3 top-3 z-10">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleId(note.id)}
                />
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-text-muted">
                    {labels.title}
                  </p>
                  <div className="mt-1 text-sm font-medium text-text-primary">
                    {note.title}
                  </div>
                </div>
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-text-muted">
                    {labels.category}
                  </p>
                  <div className="mt-1 text-sm">
                    <Badge variant="muted" size="sm">
                      {humanize(note.category)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-text-muted">
                    {labels.content}
                  </p>
                  <div className="mt-1 text-sm text-text-secondary line-clamp-2">
                    {note.content}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-1 border-t border-border pt-3">
                {viewBasePath ? (
                  <Button asChild variant="ghost" size="icon">
                    <a
                      href={`${viewBasePath}?${viewParam}=${note.id}`}
                      aria-label={labels.open}
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                  </Button>
                ) : null}
                <Button asChild variant="ghost" size="icon">
                  <a
                    href={`${editBasePath}?${editParam}=${note.id}`}
                    aria-label={labels.edit}
                  >
                    <Edit3 className="h-4 w-4" />
                  </a>
                </Button>
                <DeleteButton action={deleteAction} id={note.id} label={labels.delete} />
              </div>
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-border md:block">
        <table className="w-full min-w-[600px] border-collapse text-sm">
          <thead className="bg-bg-subtle text-xs uppercase tracking-[0.12em] text-text-secondary">
            <tr>
              <th className="w-10 px-3 py-2 text-left">
                <Checkbox
                  checked={selectedIds.size === identityNotes.length && identityNotes.length > 0}
                  onCheckedChange={(checked) => selectAll(!!checked)}
                />
              </th>
              <th className="px-3 py-2 text-left font-medium">{labels.title}</th>
              <th className="px-3 py-2 text-left font-medium">{labels.category}</th>
              <th className="px-3 py-2 text-left font-medium">{labels.content}</th>
              <th className="px-3 py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {identityNotes.map((note) => {
              const isSelected = selectedIds.has(note.id);
              return (
                <tr
                  key={note.id}
                  className={`border-t border-border align-top ${
                    isSelected ? "bg-primary/5" : ""
                  }`}
                >
                  <td className="w-10 px-3 py-2">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleId(note.id)}
                    />
                  </td>
                  <td className="px-3 py-2 font-medium text-text-primary">
                    {note.title}
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant="muted" size="sm">
                      {humanize(note.category)}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-text-secondary line-clamp-2 max-w-xs">
                    {note.content}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1">
                      {viewBasePath ? (
                        <Button asChild variant="ghost" size="icon">
                          <a
                            href={`${viewBasePath}?${viewParam}=${note.id}`}
                            aria-label={labels.open}
                          >
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                      ) : null}
                      <Button asChild variant="ghost" size="icon">
                        <a
                          href={`${editBasePath}?${editParam}=${note.id}`}
                          aria-label={labels.edit}
                        >
                          <Edit3 className="h-4 w-4" />
                        </a>
                      </Button>
                      <DeleteButton
                        action={deleteAction}
                        id={note.id}
                        label={labels.delete}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <BulkDeleteDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleBulkDelete}
        itemLabel="notes"
        selectedCount={selectedIds.size}
      />

      <BulkEditDialog
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        onConfirm={handleBulkEdit}
        fields={[
          { key: "title", label: "Title", type: "text" },
          { key: "content", label: "Content", type: "text" },
          { key: "category", label: "Category", type: "text" },
        ]}
        itemLabel="notes"
        selectedCount={selectedIds.size}
      />
    </>
  );
}
