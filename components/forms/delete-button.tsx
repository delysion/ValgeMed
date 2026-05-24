"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteButton({ action, id }: { action: (formData: FormData) => void; id: string }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Are you sure you want to delete this item?")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="destructive" size="icon" aria-label="Delete">
        <Trash2 className="h-4 w-4" />
      </Button>
    </form>
  );
}
