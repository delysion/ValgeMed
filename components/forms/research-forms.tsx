"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";
import {
  createResearchAreaAction,
  updateResearchAreaAction,
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
import { Input } from "@/components/ui/input";
import { literatureGapStatuses, manuscriptStatuses } from "@/lib/validators/schemas";
import type { LiteratureGap, Hypothesis, Manuscript, ResearchArea } from "@/lib/db/schema";

const gapStatusOptions = literatureGapStatuses.map((s) => ({ label: s.replace(/_/g, " "), value: s }));
const stageOptions = manuscriptStatuses.map((s) => ({ label: s.replace(/_/g, " "), value: s }));
const hypothesisStatusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Active", value: "active" },
  { label: "Tested", value: "tested" },
  { label: "Archived", value: "archived" },
];

export function ResearchAreaForm({ area }: { area?: ResearchArea }) {
  const { t } = useTranslation();
  return (
    <FormCard
      title={area ? "Edit research area" : "Create research area"}
      description="Turn a broad interest into a paper pipeline."
    >
      <form action={area ? updateResearchAreaAction : createResearchAreaAction} className="space-y-5">
        {area ? <input type="hidden" name="id" value={area.id} /> : null}
        <input type="hidden" name="returnTo" value="/research" />
        <TextField name="name" label="Research area" required defaultValue={area?.name} placeholder="e.g. Medical education feedback loops" />
        <TextAreaField name="description" label="Why this area matters" defaultValue={area?.description} />
        <FieldGrid>
          <TextAreaField name="whatIsKnown" label="What is known" defaultValue={area?.whatIsKnown} />
          <TextAreaField name="whatIsUnknown" label="What is unknown" defaultValue={area?.whatIsUnknown} />
          <TextAreaField name="isControversial" label="Controversial points" defaultValue={area?.isControversial} />
          <TextAreaField name="methodologicallyWeak" label="Method weaknesses" defaultValue={area?.methodologicallyWeak} />
        </FieldGrid>
        <SubmitBar label={area ? t("common.edit") : t("common.create")} cancelHref={area ? "/research" : undefined} cancelLabel={t("common.cancel")} />
      </form>
    </FormCard>
  );
}

export function LiteratureGapForm({ gap, researchAreas = [] }: { gap?: LiteratureGap; researchAreas?: ResearchArea[] }) {
  const { t } = useTranslation();
  const areaOptions = [
    { label: "No area", value: "" },
    ...researchAreas.map((area) => ({ label: area.name, value: area.id })),
  ];

  return (
    <FormCard
      title={gap ? t("common.edit") : t("common.create")}
      description=""
    >
      <form action={gap ? updateLiteratureGapAction : createLiteratureGapAction} className="space-y-5">
        {gap ? <input type="hidden" name="id" value={gap.id} /> : null}
        <input type="hidden" name="returnTo" value="/research/literature" />
        <FieldGrid>
          <TextField name="title" label={t("common.title")} required defaultValue={gap?.title} />
          <NativeSelectField name="researchAreaId" label="Research area" options={areaOptions} defaultValue={gap?.researchAreaId ?? ""} />
          <NativeSelectField name="status" label={t("common.status")} options={gapStatusOptions} defaultValue={gap?.status ?? "identified"} />
          <TextField name="priority" label={t("common.priority")} type="number" min={0} max={10} defaultValue={gap?.priority ?? 0} />
        </FieldGrid>
        <label className="flex items-start gap-3 rounded-xl border border-border bg-bg-subtle/40 p-3 text-sm text-text-secondary">
          <Input type="checkbox" name="publishableForStudent" defaultChecked={gap?.publishableForStudent ?? false} className="mt-0.5 h-4 w-4" />
          <span>
            <span className="block font-medium text-text-primary">Publishable for student</span>
            <span className="text-xs text-text-muted">Small enough to execute, serious enough to become an output.</span>
          </span>
        </label>
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
        <input type="hidden" name="returnTo" value="/research/hypotheses" />
        <FieldGrid>
          <TextField name="question" label="Research question" required defaultValue={hypothesis?.question} />
          <NativeSelectField name="status" label={t("common.status")} options={hypothesisStatusOptions} defaultValue={hypothesis?.status ?? "draft"} />
          <TextField name="totalScore" label="Paper potential (0-10)" type="number" min={0} max={10} defaultValue={hypothesis?.totalScore ?? ""} />
          <TextField name="output" label="Target output" defaultValue={hypothesis?.output} placeholder="poster, short paper, letter, review..." />
        </FieldGrid>
        <TextAreaField name="notes" label="Notes" defaultValue={hypothesis?.notes} />
        <SubmitBar label={hypothesis ? t("common.edit") : t("common.create")} cancelHref={hypothesis ? "/research/hypotheses" : undefined} cancelLabel={t("common.cancel")} />
      </form>
    </FormCard>
  );
}

export function ManuscriptForm({ manuscript, hypotheses = [] }: { manuscript?: Manuscript; hypotheses?: Hypothesis[] }) {
  const { t } = useTranslation();
  const hypothesisOptions = [
    { label: "No hypothesis", value: "" },
    ...hypotheses.map((hypothesis) => ({ label: hypothesis.question, value: hypothesis.id })),
  ];

  return (
    <FormCard
      title={manuscript ? t("common.edit") : t("common.create")}
      description=""
    >
      <form action={manuscript ? updateManuscriptAction : createManuscriptAction} className="space-y-5">
        {manuscript ? <input type="hidden" name="id" value={manuscript.id} /> : null}
        <input type="hidden" name="returnTo" value="/research/manuscripts" />
        <FieldGrid>
          <TextField name="title" label={t("common.title")} required defaultValue={manuscript?.title} />
          <NativeSelectField name="hypothesisId" label="Hypothesis" options={hypothesisOptions} defaultValue={manuscript?.hypothesisId ?? ""} />
          <NativeSelectField name="stage" label="Stage" options={stageOptions} defaultValue={manuscript?.stage ?? "idea"} />
          <TextField name="journal" label="Journal" defaultValue={manuscript?.journal} />
          <TextField name="deadline" label="Next deadline" type="datetime-local" defaultValue={manuscript?.deadline ? new Date(manuscript.deadline).toISOString().slice(0, 16) : ""} />
        </FieldGrid>
        <TextAreaField name="notes" label="Notes" defaultValue={manuscript?.notes} />
        <SubmitBar label={manuscript ? t("common.edit") : t("common.create")} cancelHref={manuscript ? "/research/manuscripts" : undefined} cancelLabel={t("common.cancel")} />
      </form>
    </FormCard>
  );
}
