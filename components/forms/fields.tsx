import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("space-y-1.5", className)}>
      <Label>{label}</Label>
      {children}
    </label>
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
  type = "text",
  min,
  max,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  placeholder?: string;
  type?: string;
  min?: number;
  max?: number;
  required?: boolean;
}) {
  return (
    <Field label={label}>
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
  className,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  className?: string;
}) {
  return (
    <Field label={label} className={className}>
      <Textarea name={name} placeholder={placeholder} defaultValue={defaultValue ?? ""} />
    </Field>
  );
}

export function NativeSelectField({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: Array<{ label: string; value: string }>;
  defaultValue?: string | null;
}) {
  return (
    <Field label={label}>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        className="flex h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-white outline-none transition focus:border-estonian-blue/50 focus:ring-2 focus:ring-estonian-blue/15"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#0B1F33]">
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
    <div className="flex flex-wrap items-center gap-2">
      <Button type="submit" className="min-h-[44px]">{label}</Button>
      {cancelHref ? (
        <Button asChild type="button" variant="ghost" className="min-h-[44px]">
          <a href={cancelHref}>{cancelLabel}</a>
        </Button>
      ) : null}
    </div>
  );
}
