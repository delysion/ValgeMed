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
    <div className={cn("grid gap-3 md:grid-cols-2 xl:grid-cols-4", className)}>
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
        className="flex h-9 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-ice/70 focus:ring-2 focus:ring-ice/15"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#11151c]">
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
}: {
  label: string;
  cancelHref?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button type="submit">{label}</Button>
      {cancelHref ? (
        <Button asChild type="button" variant="ghost">
          <a href={cancelHref}>Annulla</a>
        </Button>
      ) : null}
    </div>
  );
}
