"use client";

import { useState } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface EditField {
  key: string;
  label: string;
  type: "text" | "number" | "boolean";
}

export function BulkEditDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  fields,
  itemLabel = "items",
  selectedCount = 0,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (patch: Record<string, unknown>) => Promise<void>;
  fields: EditField[];
  itemLabel?: string;
  selectedCount?: number;
}) {
  const [pending, setPending] = useState(false);
  const [values, setValues] = useState<Record<string, string | boolean>>({});

  const handleConfirm = async () => {
    const patch: Record<string, unknown> = {};
    for (const field of fields) {
      const val = values[field.key];
      if (val === undefined || val === "") continue;
      patch[field.key] = field.type === "number" ? Number(val) : val;
    }
    if (Object.keys(patch).length === 0) return;
    setPending(true);
    try {
      await onConfirm(patch);
      setValues({});
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) setValues({});
        onOpenChange(open);
      }}
    >
      <DialogContent className="w-[min(92vw,420px)]">
        <DialogHeader>
          <DialogTitle>Edit {selectedCount} {itemLabel}</DialogTitle>
          <DialogDescription>
            Set new values for the selected {itemLabel}. Leave blank to keep unchanged.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="mb-1 block text-sm font-medium text-text-primary">
                {field.label}
              </label>
              {field.type === "boolean" ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!values[field.key]}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [field.key]: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-border"
                  />
                  <span className="text-sm text-text-secondary">
                    {values[field.key] ? "Yes" : "No"}
                  </span>
                </label>
              ) : (
                <input
                  type={field.type}
                  value={(values[field.key] as string) ?? ""}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                  placeholder={field.label}
                  className="h-9 w-full rounded-lg border border-border/60 bg-bg-surface px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={pending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="default"
            onClick={handleConfirm}
            disabled={pending}
          >
            {pending ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
