"use client";

import { Trash2, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";

export function BulkOperationsBar({
  selectedCount,
  totalCount,
  onSelectAll,
  allSelected,
  onDelete,
  onEdit,
  onClear,
  isLoading,
}: {
  selectedCount: number;
  totalCount: number;
  onSelectAll: (checked: boolean) => void;
  allSelected: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onClear: () => void;
  isLoading?: boolean;
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-bg-surface px-4 py-3 shadow-sm">
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={(e) => onSelectAll(e.target.checked)}
          className="h-4 w-4 rounded border-border"
        />
        <span className="text-text-primary font-medium">{selectedCount} selected</span>
        <span className="text-text-muted text-xs">of {totalCount}</span>
      </label>

      <div className="ml-auto flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClear}
          disabled={isLoading}
        >
          Clear
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onEdit}
          disabled={isLoading}
          className="gap-1.5"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={onDelete}
          disabled={isLoading}
          className="gap-1.5"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </div>
    </div>
  );
}
