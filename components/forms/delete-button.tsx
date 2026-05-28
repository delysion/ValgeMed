"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteButton({
  action,
  id,
  label = "Delete",
  title = "Delete this item?",
  description = "This action cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onClick,
  returnTo,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  label?: string;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onClick?: (e: React.MouseEvent) => void;
  returnTo?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="destructive" size="icon" aria-label={label} onClick={onClick}>
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[min(92vw,420px)]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="mt-5 flex justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {cancelLabel}
            </Button>
          </DialogClose>
          <form action={action}>
            <input type="hidden" name="id" value={id} />
            {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
            <Button type="submit" variant="destructive">
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {confirmLabel}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
