"use client";

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
import { cn } from "@/lib/utils";

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
  className,
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
  className?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={label}
          onClick={onClick}
          className={cn(
            "inline-flex items-center justify-center rounded-lg border border-rose/30 bg-rose-bg/30 h-8 w-8 hover:bg-rose/40 transition-colors duration-150 active:scale-95",
            className
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#E07888"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              {confirmLabel}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}