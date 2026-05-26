"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";
import {
  createLiteratureGapAction,
  updateLiteratureGapAction,
  createHypothesisAction,
  updateHypothesisAction,
  createManuscriptAction,
  updateManuscriptAction,
} from "@/lib/actions/research";
import {
  FieldGrid,
  TextField,
  TextAreaField,
  NativeSelectField,
  SubmitBar,
} from "@/components/forms/fields";
import { FormCard } from "@/components/forms/entity-forms";
import { literatureGapStatuses, manuscriptStatuses } from "@/lib/validators/schemas";
import type { LiteratureGap, Hypothesis, Manuscript } from "@/lib/db/schema";

const gapStatusOptions = literatureGapStatuses.map((s) => ({ label: s.replace(/_/g, " "), value: s }));
const stageOptions = manuscriptStatuses.map((s) => ({ label: s.replace(/_/g, " "), value: s }));
const hypothesisStatusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Active", value: "active" },
  { label: "Tested", value: "tested" },
  { label: "Archived", value: "archived" },
];

export function LiteratureGapForm({ gap }: { gap?: LiteratureGap }) {
  const { t } = useTranslation();
  return (
    <FormCard
      title={gap ? t("common.edit") : t("common.create")}
      description=""
    >
      <form action={gap ? updateLiteratureGapAction : createLiteratureGapAction} className="space-y-5">
        {gap ? <input type="hidden" name="id" value={gap.id} /> : null}
        <FieldGrid>
          <TextField name="title" label={t("common.title")} required defaultValue={gap?.title} />
          <NativeSelectField name="status" label={t("common.status")} options={gapStatusOptions} defaultValue={gap?.status ?? "identified"} />
          <TextField name="priority" label={t("common.priority")} type="number" min={0} max={10} defaultValue={gap?.priority ?? 0} />
        </FieldGrid>
        <TextAreaField name="description" label="Description" defaultValue={gap?.description} />
        <SubmitBar label={gap ? t("common.edit") : t("common.create")} cancelHref={gap ? "/research/literature" : undefined} cancelLabel={t("common.cancel")} />
      </form>
    </FormCard>
  );
}

export function HypothesisForm({ hypothesis }: { hypothesis?: Hypothesis }) {
  const { t } = useTranslation();
  return (
    <FormCard
      title={hypothesis ? t("common.edit") : t("common.create")}
      description=""
    >
      <form action={hypothesis ? updateHypothesisAction : createHypothesisAction} className="space-y-5">
        {hypothesis ? <input type="hidden" name="id" value={hypothesis.id} /> : null}
        <FieldGrid>
          <TextField name="question" label="Research question" required defaultValue={hypothesis?.question} />
          <NativeSelectField name="status" label={t("common.status")} options={hypothesisStatusOptions} defaultValue={hypothesis?.status ?? "draft"} />
        </FieldGrid>
        <TextAreaField name="notes" label="Notes" defaultValue={hypothesis?.notes} />
        <SubmitBar label={hypothesis ? t("common.edit") : t("common.create")} cancelHref={hypothesis ? "/research/hypotheses" : undefined} cancelLabel={t("common.cancel")} />
      </form>
    </FormCard>
  );
}

export function ManuscriptForm({ manuscript }: { manuscript?: Manuscript }) {
  const { t } = useTranslation();
  return (
    <FormCard
      title={manuscript ? t("common.edit") : t("common.create")}
      description=""
    >
      <form action={manuscript ? updateManuscriptAction : createManuscriptAction} className="space-y-5">
        {manuscript ? <input type="hidden" name="id" value={manuscript.id} /> : null}
        <FieldGrid>
          <TextField name="title" label={t("common.title")} required defaultValue={manuscript?.title} />
          <NativeSelectField name="stage" label="Stage" options={stageOptions} defaultValue={manuscript?.stage ?? "idea"} />
          <TextField name="journal" label="Journal" defaultValue={manuscript?.journal} />
        </FieldGrid>
        <TextAreaField name="notes" label="Notes" defaultValue={manuscript?.notes} />
        <SubmitBar label={manuscript ? t("common.edit") : t("common.create")} cancelHref={manuscript ? "/research/manuscripts" : undefined} cancelLabel={t("common.cancel")} />
      </form>
    </FormCard>
  );
}