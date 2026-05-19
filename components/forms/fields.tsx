import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function Field({
  label,
  children,
  description,
  className,
}: {
  label: string;
  children: ReactNode;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label className="text-xs font-semibold text-text-secondary">{label}</Label>
      {children}
      {description ? <p className="text-xs text-text-muted">{description}</p> : null}
    </div>
  );
}

export function FieldGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {children}
    </div>
  );
}

export function TextField({
  label,
  name,
  defaultValue,
  placeholder,
  description,
  type = "text",
  min,
  max,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  placeholder?: string;
  description?: string;
  type?: string;
  min?: number;
  max?: number;
  required?: boolean;
}) {
  return (
    <Field label={label} description={description}>
      <Input
        name={name}
        type={type}
        min={min}
        max={max}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ""}
      />
    </Field>
  );
}

export function TextAreaField({
  label,
  name,
  defaultValue,
  placeholder,
  description,
  className,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  description?: string;
  className?: string;
}) {
  return (
    <Field label={label} description={description} className={className}>
      <Textarea name={name} placeholder={placeholder} defaultValue={defaultValue ?? ""} />
    </Field>
  );
}

export function NativeSelectField({
  label,
  name,
  options,
  defaultValue,
  description,
}: {
  label: string;
  name: string;
  options: Array<{ label: string; value: string }>;
  defaultValue?: string | null;
  description?: string;
}) {
  return (
    <Field label={label} description={description}>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        className="flex h-10 w-full rounded-lg border border-border bg-bg-surface px-3 text-sm text-text-primary outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-bg-surface text-text-primary">
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function SubmitBar({
  label,
  cancelHref,
  cancelLabel = "Cancel",
}: {
  label: string;
  cancelHref?: string;
  cancelLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 pt-4">
      <Button type="submit" className="min-h-[44px] min-w-[120px]">{label}</Button>
      {cancelHref ? (
        <Button asChild type="button" variant="ghost" className="min-h-[44px]">
          <a href={cancelHref}>{cancelLabel}</a>
        </Button>
      ) : null}
    </div>
  );
}
