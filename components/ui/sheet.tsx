"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/useTranslation";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const { t } = useTranslation();
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-overlay" />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-[min(90vw,320px)] overflow-y-auto overscroll-contain border-l border-border bg-bg-surface p-panel text-text-primary shadow-dialog",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close aria-label={t("common.closeDialog")} className="absolute right-3 top-3 grid size-9 place-items-center rounded-control text-text-secondary transition-colors hover:bg-bg-subtle hover:text-text-primary">
          <X aria-hidden="true" className="size-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});
SheetContent.displayName = DialogPrimitive.Content.displayName;

export const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-left", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

export const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold text-text-primary", className)} {...props} />
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;
