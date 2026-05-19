import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

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
  required,
}: {
  label: string;
  children: ReactNode;
  description?: string;
  className?: string;
  required?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label className="text-sm font-medium text-text-secondary">
        {label}
        {required ? <span className="ml-1 text-rose" title="Required">*</span> : null}
      </Label>
      {children}
      {description ? <p className="text-xs leading-relaxed text-text-muted">{description}</p> : null}
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
    <div className={cn("grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", className)}>
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
    <Field label={label} description={description} required={required}>
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
      <div className="relative">
        <select
          name={name}
          defaultValue={defaultValue ?? ""}
          className="flex h-11 w-full appearance-none rounded-xl border border-border bg-bg-elevated px-4 pr-10 text-sm text-text-primary shadow-[var(--shadow-inner)] outline-none transition-all duration-150 focus:border-primary/50 focus:bg-bg-surface focus:shadow-[0_0_0_3px_var(--primary-glow),var(--shadow-inner)] focus:ring-0"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-bg-surface text-text-primary">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
      </div>
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
    <div className="flex flex-wrap items-center gap-3 pt-6">
      <Button type="submit" className="min-h-[44px] min-w-[140px] rounded-xl">{label}</Button>
      {cancelHref ? (
        <Button asChild type="button" variant="ghost" className="min-h-[44px] rounded-xl">
          <a href={cancelHref}>{cancelLabel}</a>
        </Button>
      ) : null}
    </div>
  );
}
