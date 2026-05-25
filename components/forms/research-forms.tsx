"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";
import { createLiteratureGapAction, createHypothesisAction, createManuscriptAction } from "@/lib/actions/research";
import { FieldGrid, TextField, TextAreaField, NativeSelectField, SubmitBar } from "@/components/forms/fields";
import { literatureGapStatuses, manuscriptStatuses } from "@/lib/validators/schemas";

const gapStatusOptions = literatureGapStatuses.map((s) => ({ label: s.replace(/_/g, " "), value: s }));
const stageOptions = manuscriptStatuses.map((s) => ({ label: s.replace(/_/g, " "), value: s }));

export function LiteratureGapForm() {
  const { t } = useTranslation();
  return (
    <form action={createLiteratureGapAction} className="space-y-5">
      <FieldGrid>
        <TextField name="title" label={t("common.title")} required />
        <NativeSelectField name="status" label={t("common.status")} options={gapStatusOptions} defaultValue="identified" />
        <TextField name="priority" label={t("common.priority")} type="number" min={0} max={10} defaultValue={0} />
      </FieldGrid>
      <TextAreaField name="description" label="Description" />
      <SubmitBar label={t("common.create")} />
    </form>
  );
}

export function HypothesisForm() {
  const { t } = useTranslation();
  return (
    <form action={createHypothesisAction} className="space-y-5">
      <FieldGrid>
        <TextField name="question" label="Research question" required />
        <NativeSelectField name="status" label={t("common.status")} options={[{ label: "Draft", value: "draft" }, { label: "Active", value: "active" }, { label: "Tested", value: "tested" }, { label: "Archived", value: "archived" }]} defaultValue="draft" />
      </FieldGrid>
      <TextAreaField name="notes" label="Notes" />
      <SubmitBar label={t("common.create")} />
    </form>
  );
}

export function ManuscriptForm() {
  const { t } = useTranslation();
  return (
    <form action={createManuscriptAction} className="space-y-5">
      <FieldGrid>
        <TextField name="title" label={t("common.title")} required />
        <NativeSelectField name="stage" label="Stage" options={stageOptions} defaultValue="idea" />
        <TextField name="journal" label="Journal" />
      </FieldGrid>
      <TextAreaField name="notes" label="Notes" />
      <SubmitBar label={t("common.create")} />
    </form>
  );
}
