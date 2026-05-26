"use client";

import { useId, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
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
  helper,
  error,
  className,
  required,
  requiredLabel = "Required",
  id,
}: {
  label: string;
  children: ReactNode;
  description?: string;
  helper?: string;
  error?: string;
  className?: string;
  required?: boolean;
  requiredLabel?: string;
  id?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={id} className="text-sm font-medium text-text-secondary">
        {label}
        {required ? <span className="ml-1 text-rose" title={requiredLabel}>*</span> : null}
      </Label>
      {helper ? <p className="text-xs text-text-muted">{helper}</p> : null}
      {children}
      {description ? <p className="text-xs leading-relaxed text-text-muted">{description}</p> : null}
      {error ? <p className="text-xs leading-relaxed text-rose" role="alert">{error}</p> : null}
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
    <div className={cn("grid gap-5 grid-cols-1 md:grid-cols-2", className)}>
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
  helper,
  error,
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
  helper?: string;
  error?: string;
  type?: string;
  min?: number;
  max?: number;
  required?: boolean;
}) {
  const id = useId();

  return (
    <Field label={label} description={description} helper={helper} error={error} required={required} id={id}>
      <Input
        id={id}
        name={name}
        type={type}
        min={min}
        max={max}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ""}
        aria-invalid={error ? true : undefined}
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
  helper,
  error,
  className,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  description?: string;
  helper?: string;
  error?: string;
  className?: string;
}) {
  const id = useId();

  return (
    <Field label={label} description={description} helper={helper} error={error} className={className} id={id}>
      <Textarea
        id={id}
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ""}
        aria-invalid={error ? true : undefined}
      />
    </Field>
  );
}

export function NativeSelectField({
  label,
  name,
  options,
  defaultValue,
  description,
  helper,
  error,
}: {
  label: string;
  name: string;
  options: Array<{ label: string; value: string }>;
  defaultValue?: string | null;
  description?: string;
  helper?: string;
  error?: string;
}) {
  const id = useId();

  return (
    <Field label={label} description={description} helper={helper} error={error} id={id}>
      <div className="relative">
        <select
          id={id}
          name={name}
          defaultValue={defaultValue ?? ""}
          aria-invalid={error ? true : undefined}
          className="flex h-12 w-full appearance-none rounded-xl border border-border bg-bg-elevated px-4 pr-10 text-sm text-text-primary shadow-[var(--shadow-inner)] outline-none transition-all duration-150 focus:border-primary/50 focus:bg-bg-surface focus:shadow-[0_0_0_3px_var(--primary-glow),var(--shadow-inner)] focus:ring-0 truncate"
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
  pendingLabel,
  cancelHref,
  cancelLabel = "Cancel",
}: {
  label: string;
  pendingLabel?: string;
  cancelHref?: string;
  cancelLabel?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <div className="flex flex-wrap items-center gap-3 pt-6">
      <Button type="submit" className="min-h-[44px] min-w-[140px] rounded-xl" disabled={pending}>
        {pending && pendingLabel ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            {pendingLabel}
          </span>
        ) : (
          label
        )}
      </Button>
      {cancelHref ? (
        <Button asChild type="button" variant="ghost" className="min-h-[44px] rounded-xl">
          <a href={cancelHref}>{cancelLabel}</a>
        </Button>
      ) : null}
    </div>
  );
}
