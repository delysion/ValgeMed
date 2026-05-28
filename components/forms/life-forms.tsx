"use client";

import { formatISO } from "date-fns";
import type React from "react";
import { useState } from "react";

import { useTranslation } from "@/lib/i18n/useTranslation";
import { GoogleDrivePicker } from "@/components/google-drive-picker";

import {
  createHealthLogAction,
  createLanguageProgressAction,
  createLifeAdminItemAction,
  createOpportunityAction,
  createPortfolioItemAction,
  createProfessionalContactAction,
  createReputationEventAction,
  createStrategicReviewAction,
  createTartuNoteAction,
  createTimeBlockAction,
  updateHealthLogAction,
  updateLanguageProgressAction,
  updateLifeAdminItemAction,
  updateOpportunityAction,
  updatePortfolioItemAction,
  updateProfessionalContactAction,
  updateReputationEventAction,
  updateStrategicReviewAction,
  updateTartuNoteAction,
  updateTimeBlockAction,
} from "@/lib/actions/resources";
import type {
  HealthLog,
  LanguageProgress,
  LifeAdminItem,
  Opportunity,
  PortfolioItem,
  ProfessionalContact,
  ReputationEvent,
  StrategicReview,
  TartuNote,
  TimeBlock,
} from "@/lib/db/schema";
import { dateValue, optionize } from "@/lib/labels";
import {
  languages,
  lifeAdminCategories,
  opportunityStatuses,
  opportunityTypes,
  portfolioItemTypes,
  portfolioStatuses,
  reputationEventTypes,
  strategicReviewTypes,
  tartuNoteCategories,
  taskStatuses,
  timeBlockTypes,
} from "@/lib/validators/schemas";
import {
  Field,
  FieldGrid,
  NativeSelectField,
  SubmitBar,
  TextAreaField,
  TextField,
} from "@/components/forms/fields";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function FormCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function TartuNoteForm({ note }: { note?: TartuNote }) {
  const { t } = useTranslation();
  return (
    <FormCard title={note ? t("lifeForm.tartuNote.editTitle") : t("lifeForm.tartuNote.title")} description={t("lifeForm.tartuNote.desc")}>
  <form action={note ? updateTartuNoteAction : createTartuNoteAction} className="space-y-5">
    {note ? <input type="hidden" name="id" value={note.id} /> : null}
    <input type="hidden" name="returnTo" value="/tartu" />
    <FieldGrid>
          <TextField label={t("lifeForm.tartuNote.titleLabel")} name="title" defaultValue={note?.title} required />
          <NativeSelectField label={t("lifeForm.tartuNote.categoryLabel")} name="category" options={optionize(tartuNoteCategories)} defaultValue={note?.category ?? "tartu_life"} />
          <NativeSelectField label={t("lifeForm.tartuNote.statusLabel")} name="status" options={optionize(taskStatuses)} defaultValue={note?.status ?? "todo"} />
          <TextField label={t("lifeForm.tartuNote.priorityLabel")} name="priority" type="number" min={0} max={10} defaultValue={note?.priority ?? 0} />
        </FieldGrid>
        <TextAreaField label={t("lifeForm.tartuNote.contentLabel")} name="content" defaultValue={note?.content} required />
        <SubmitBar label={note ? t("lifeForm.tartuNote.submitEdit") : t("lifeForm.tartuNote.submitCreate")} cancelHref={note ? "/tartu" : undefined} />
      </form>
    </FormCard>
  );
}

export function TimeBlockForm({ block }: { block?: TimeBlock }) {
  const { t } = useTranslation();
  return (
    <FormCard title={block ? t("lifeForm.timeBlock.editTitle") : t("lifeForm.timeBlock.title")} description={t("lifeForm.timeBlock.desc")}>
      <form action={block ? updateTimeBlockAction : createTimeBlockAction} className="space-y-5">
        {block ? <input type="hidden" name="id" value={block.id} /> : null}
        <input type="hidden" name="returnTo" value="/time" />
        <FieldGrid>
          <TextField label={t("lifeForm.timeBlock.dateLabel")} name="date" type="date" defaultValue={block?.date ?? formatISO(new Date(), { representation: "date" })} required />
          <TextField label={t("lifeForm.timeBlock.titleLabel")} name="title" defaultValue={block?.title} required />
          <NativeSelectField label={t("lifeForm.timeBlock.typeLabel")} name="blockType" options={optionize(timeBlockTypes)} defaultValue={block?.blockType ?? "study"} />
          <TextField label={t("lifeForm.timeBlock.plannedLabel")} name="plannedMinutes" type="number" defaultValue={block?.plannedMinutes ?? 50} />
          <TextField label={t("lifeForm.timeBlock.actualLabel")} name="actualMinutes" type="number" defaultValue={block?.actualMinutes ?? 0} />
          <TextField label={t("lifeForm.timeBlock.energyCostLabel")} name="energyCost" type="number" min={0} max={10} defaultValue={block?.energyCost ?? 4} />
          <TextField label={t("lifeForm.timeBlock.leverageLabel")} name="leverageScore" type="number" min={0} max={10} defaultValue={block?.leverageScore ?? 6} />
        </FieldGrid>
        <TextAreaField label={t("lifeForm.timeBlock.notesLabel")} name="notes" defaultValue={block?.notes} />
        <SubmitBar label={block ? t("lifeForm.timeBlock.submitEdit") : t("lifeForm.timeBlock.submitCreate")} cancelHref={block ? "/time" : undefined} />
      </form>
    </FormCard>
  );
}

export function HealthLogForm({ log }: { log?: HealthLog }) {
  const { t } = useTranslation();
  return (
    <FormCard title={log ? t("lifeForm.healthLog.editTitle") : t("lifeForm.healthLog.title")} description={t("lifeForm.healthLog.desc")}>
      <form action={log ? updateHealthLogAction : createHealthLogAction} className="space-y-5">
        {log ? <input type="hidden" name="id" value={log.id} /> : null}
        <input type="hidden" name="returnTo" value="/health" />
        <input type="hidden" name="movementDone" value="false" />
        <FieldGrid>
          <TextField label={t("lifeForm.healthLog.dateLabel")} name="date" type="date" defaultValue={log?.date ?? formatISO(new Date(), { representation: "date" })} required />
          <TextField label={t("lifeForm.healthLog.sleepQualityLabel")} name="sleepQuality" type="number" min={0} max={10} defaultValue={log?.sleepQuality ?? ""} />
          <TextField label={t("lifeForm.healthLog.cognitiveFatigueLabel")} name="cognitiveFatigue" type="number" min={0} max={10} defaultValue={log?.cognitiveFatigue ?? ""} />
          <TextField label={t("lifeForm.healthLog.recoveryLabel")} name="recoveryQuality" type="number" min={0} max={10} defaultValue={log?.recoveryQuality ?? ""} />
          <TextField label={t("lifeForm.healthLog.foodQualityLabel")} name="foodQuality" type="number" min={0} max={10} defaultValue={log?.foodQuality ?? ""} />
          <TextField label={t("lifeForm.healthLog.energyIntegrityLabel")} name="energyIntegrityScore" type="number" min={0} max={10} defaultValue={log?.energyIntegrityScore ?? 0} />
        </FieldGrid>
        <Field label={t("lifeForm.healthLog.movementLabel")}>
          <Input type="checkbox" name="movementDone" defaultChecked={log?.movementDone ?? false} className="h-4 w-4" />
        </Field>
        <TextAreaField label={t("lifeForm.healthLog.notesLabel")} name="notes" defaultValue={log?.notes} />
        <SubmitBar label={log ? t("lifeForm.healthLog.submitEdit") : t("lifeForm.healthLog.submitCreate")} cancelHref={log ? "/health" : undefined} />
      </form>
    </FormCard>
  );
}

export function LanguageProgressForm({ item }: { item?: LanguageProgress }) {
  const { t } = useTranslation();
  return (
    <FormCard title={item ? t("lifeForm.languageProgress.editTitle") : t("lifeForm.languageProgress.title")} description={t("lifeForm.languageProgress.desc")}>
      <form action={item ? updateLanguageProgressAction : createLanguageProgressAction} className="space-y-5">
        {item ? <input type="hidden" name="id" value={item.id} /> : null}
        <input type="hidden" name="returnTo" value="/language" />
        <FieldGrid>
          <NativeSelectField label={t("lifeForm.languageProgress.languageLabel")} name="language" options={optionize(languages)} defaultValue={item?.language ?? "estonian"} />
          <TextField label={t("lifeForm.languageProgress.titleLabel")} name="title" defaultValue={item?.title} required />
          <TextField label={t("lifeForm.languageProgress.categoryLabel")} name="category" defaultValue={item?.category} />
          <TextField label={t("lifeForm.languageProgress.minutesLabel")} name="minutes" type="number" defaultValue={item?.minutes ?? 20} />
          <TextField label={t("lifeForm.languageProgress.confidenceLabel")} name="confidence" type="number" min={0} max={10} defaultValue={item?.confidence ?? 0} />
          <TextField label={t("lifeForm.languageProgress.lastPracticeLabel")} name="lastPracticedAt" type="date" defaultValue={dateValue(item?.lastPracticedAt)} />
          <TextField label={t("lifeForm.languageProgress.nextPracticeLabel")} name="nextPracticeAt" type="date" defaultValue={dateValue(item?.nextPracticeAt)} />
        </FieldGrid>
        <TextAreaField label={t("lifeForm.languageProgress.notesLabel")} name="notes" defaultValue={item?.notes} />
        <SubmitBar label={item ? t("lifeForm.languageProgress.submitEdit") : t("lifeForm.languageProgress.submitCreate")} cancelHref={item ? "/language" : undefined} />
      </form>
    </FormCard>
  );
}

export function ReputationEventForm({ event }: { event?: ReputationEvent }) {
  const { t } = useTranslation();
  return (
    <FormCard title={event ? t("lifeForm.reputationEvent.editTitle") : t("lifeForm.reputationEvent.title")} description={t("lifeForm.reputationEvent.desc")}>
      <form action={event ? updateReputationEventAction : createReputationEventAction} className="space-y-5">
        {event ? <input type="hidden" name="id" value={event.id} /> : null}
        <input type="hidden" name="returnTo" value="/reputation" />
        <FieldGrid>
          <TextField label={t("lifeForm.reputationEvent.titleLabel")} name="title" defaultValue={event?.title} required />
          <NativeSelectField label={t("lifeForm.reputationEvent.typeLabel")} name="eventType" options={optionize(reputationEventTypes)} defaultValue={event?.eventType ?? "reliability_signal"} />
          <TextField label={t("lifeForm.reputationEvent.dateLabel")} name="eventDate" type="date" defaultValue={event?.eventDate ?? formatISO(new Date(), { representation: "date" })} required />
          <TextField label={t("lifeForm.reputationEvent.impactLabel")} name="impact" type="number" min={0} max={10} defaultValue={event?.impact ?? 5} />
          <TextField label={t("lifeForm.reputationEvent.evidenceUrlLabel")} name="evidenceUrl" defaultValue={event?.evidenceUrl} />
          <TextField label={t("lifeForm.reputationEvent.followUpLabel")} name="followUpAt" type="date" defaultValue={dateValue(event?.followUpAt)} />
          <NativeSelectField label={t("lifeForm.reputationEvent.statusLabel")} name="status" options={optionize(taskStatuses)} defaultValue={event?.status ?? "done"} />
        </FieldGrid>
        <TextAreaField label={t("lifeForm.reputationEvent.descriptionLabel")} name="description" defaultValue={event?.description} />
        <SubmitBar label={event ? t("lifeForm.reputationEvent.submitEdit") : t("lifeForm.reputationEvent.submitCreate")} cancelHref={event ? "/reputation" : undefined} />
      </form>
    </FormCard>
  );
}

export function OpportunityForm({ opportunity }: { opportunity?: Opportunity }) {
  const { t } = useTranslation();
  return (
    <FormCard title={opportunity ? t("lifeForm.opportunity.editTitle") : t("lifeForm.opportunity.title")} description={t("lifeForm.opportunity.desc")}>
      <form action={opportunity ? updateOpportunityAction : createOpportunityAction} className="space-y-5">
        {opportunity ? <input type="hidden" name="id" value={opportunity.id} /> : null}
        <input type="hidden" name="returnTo" value="/opportunities" />
        <FieldGrid>
          <TextField label={t("lifeForm.opportunity.titleLabel")} name="title" defaultValue={opportunity?.title} required />
          <NativeSelectField label={t("lifeForm.opportunity.typeLabel")} name="opportunityType" options={optionize(opportunityTypes)} defaultValue={opportunity?.opportunityType ?? "other"} />
          <TextField label={t("lifeForm.opportunity.deadlineLabel")} name="deadline" type="date" defaultValue={opportunity?.deadline ?? ""} />
          <TextField label={t("lifeForm.opportunity.valueLabel")} name="valueScore" type="number" min={0} max={10} defaultValue={opportunity?.valueScore ?? 5} />
          <TextField label={t("lifeForm.opportunity.effortLabel")} name="effortScore" type="number" min={0} max={10} defaultValue={opportunity?.effortScore ?? 5} />
          <TextField label={t("lifeForm.opportunity.upsideLabel")} name="strategicUpside" type="number" min={0} max={10} defaultValue={opportunity?.strategicUpside ?? 5} />
          <NativeSelectField label={t("lifeForm.opportunity.statusLabel")} name="status" options={optionize(opportunityStatuses)} defaultValue={opportunity?.status ?? "watching"} />
        </FieldGrid>
        <TextAreaField label={t("lifeForm.opportunity.descriptionLabel")} name="description" defaultValue={opportunity?.description} />
        <TextAreaField label={t("lifeForm.opportunity.nextActionLabel")} name="nextAction" defaultValue={opportunity?.nextAction} />
        <SubmitBar label={opportunity ? t("lifeForm.opportunity.submitEdit") : t("lifeForm.opportunity.submitCreate")} cancelHref={opportunity ? "/opportunities" : undefined} />
      </form>
    </FormCard>
  );
}

export function ProfessionalContactForm({ contact }: { contact?: ProfessionalContact }) {
  const { t } = useTranslation();
  return (
    <FormCard title={contact ? t("lifeForm.professionalContact.editTitle") : t("lifeForm.professionalContact.title")} description={t("lifeForm.professionalContact.desc")}>
      <form action={contact ? updateProfessionalContactAction : createProfessionalContactAction} className="space-y-5">
        {contact ? <input type="hidden" name="id" value={contact.id} /> : null}
        <input type="hidden" name="returnTo" value="/network" />
        <FieldGrid>
          <TextField label={t("lifeForm.professionalContact.nameLabel")} name="name" defaultValue={contact?.name} required />
          <TextField label={t("lifeForm.professionalContact.roleLabel")} name="role" defaultValue={contact?.role} />
          <TextField label={t("lifeForm.professionalContact.institutionLabel")} name="institution" defaultValue={contact?.institution} />
          <TextField label={t("lifeForm.professionalContact.strengthLabel")} name="relationshipStrength" type="number" min={0} max={10} defaultValue={contact?.relationshipStrength ?? 0} />
          <TextField label={t("lifeForm.professionalContact.lastContactLabel")} name="lastContactedAt" type="date" defaultValue={dateValue(contact?.lastContactedAt)} />
          <TextField label={t("lifeForm.professionalContact.nextFollowUpLabel")} name="nextFollowUpAt" type="date" defaultValue={dateValue(contact?.nextFollowUpAt)} />
        </FieldGrid>
        <TextAreaField label={t("lifeForm.professionalContact.notesLabel")} name="notes" defaultValue={contact?.notes} />
        <SubmitBar label={contact ? t("lifeForm.professionalContact.submitEdit") : t("lifeForm.professionalContact.submitCreate")} cancelHref={contact ? "/network" : undefined} />
      </form>
    </FormCard>
  );
}

export function LifeAdminItemForm({ item }: { item?: LifeAdminItem }) {
  const { t } = useTranslation();
  const [fileUrl, setFileUrl] = useState(item?.fileUrl ?? "");
  const [fileName, setFileName] = useState(item?.fileName ?? "");

  return (
    <FormCard title={item ? t("lifeForm.lifeAdmin.editTitle") : t("lifeForm.lifeAdmin.title")} description={t("lifeForm.lifeAdmin.desc")}>
      <form action={item ? updateLifeAdminItemAction : createLifeAdminItemAction} className="space-y-5">
        {item ? <input type="hidden" name="id" value={item.id} /> : null}
        <input type="hidden" name="returnTo" value="/life-admin" />
        <input type="hidden" name="fileUrl" value={fileUrl} />
        <input type="hidden" name="fileName" value={fileName} />
        <FieldGrid>
          <TextField label={t("lifeForm.lifeAdmin.titleLabel")} name="title" defaultValue={item?.title} required />
          <NativeSelectField label={t("lifeForm.lifeAdmin.categoryLabel")} name="category" options={optionize(lifeAdminCategories)} defaultValue={item?.category ?? "other"} />
          <TextField label={t("lifeForm.lifeAdmin.dueLabel")} name="dueAt" type="date" defaultValue={dateValue(item?.dueAt)} />
          <NativeSelectField label={t("lifeForm.lifeAdmin.statusLabel")} name="status" options={optionize(taskStatuses)} defaultValue={item?.status ?? "todo"} />
          <TextField label={t("lifeForm.lifeAdmin.priorityLabel")} name="priority" type="number" min={0} max={10} defaultValue={item?.priority ?? 0} />
        </FieldGrid>
        <TextAreaField label={t("lifeForm.lifeAdmin.descriptionLabel")} name="description" defaultValue={item?.description} />
        <Field label={t("lifeForm.lifeAdmin.documentLabel")}>
          <GoogleDrivePicker
            value={fileUrl}
            fileName={fileName}
            onPick={(file) => {
              setFileUrl(file.url);
              setFileName(file.name);
            }}
            onClear={() => {
              setFileUrl("");
              setFileName("");
            }}
          />
        </Field>
        <SubmitBar label={item ? t("lifeForm.lifeAdmin.submitEdit") : t("lifeForm.lifeAdmin.submitCreate")} cancelHref={item ? "/life-admin" : undefined} />
      </form>
    </FormCard>
  );
}

export function PortfolioItemForm({ item }: { item?: PortfolioItem }) {
  const { t } = useTranslation();
  return (
    <FormCard title={item ? t("lifeForm.portfolioItem.editTitle") : t("lifeForm.portfolioItem.title")} description={t("lifeForm.portfolioItem.desc")}>
      <form action={item ? updatePortfolioItemAction : createPortfolioItemAction} className="space-y-5">
        {item ? <input type="hidden" name="id" value={item.id} /> : null}
        <input type="hidden" name="returnTo" value="/portfolio" />
        <FieldGrid>
          <TextField label={t("lifeForm.portfolioItem.titleLabel")} name="title" defaultValue={item?.title} required />
          <NativeSelectField label={t("lifeForm.portfolioItem.typeLabel")} name="itemType" options={optionize(portfolioItemTypes)} defaultValue={item?.itemType ?? "other"} />
          <TextField label={t("lifeForm.portfolioItem.dateLabel")} name="date" type="date" defaultValue={item?.date ?? ""} />
          <TextField label={t("lifeForm.portfolioItem.evidenceUrlLabel")} name="evidenceUrl" defaultValue={item?.evidenceUrl} />
          <TextField label={t("lifeForm.portfolioItem.strategicValueLabel")} name="strategicValue" type="number" min={0} max={10} defaultValue={item?.strategicValue ?? 5} />
          <NativeSelectField label={t("lifeForm.portfolioItem.statusLabel")} name="status" options={optionize(portfolioStatuses)} defaultValue={item?.status ?? "active"} />
        </FieldGrid>
        <TextAreaField label={t("lifeForm.portfolioItem.descriptionLabel")} name="description" defaultValue={item?.description} />
        <SubmitBar label={item ? t("lifeForm.portfolioItem.submitEdit") : t("lifeForm.portfolioItem.submitCreate")} cancelHref={item ? "/portfolio" : undefined} />
      </form>
    </FormCard>
  );
}

export function StrategicReviewForm({ review }: { review?: StrategicReview }) {
  const { t } = useTranslation();
  return (
    <FormCard title={review ? t("lifeForm.strategicReview.editTitle") : t("lifeForm.strategicReview.title")} description={t("lifeForm.strategicReview.desc")}>
      <form action={review ? updateStrategicReviewAction : createStrategicReviewAction} className="space-y-5">
        {review ? <input type="hidden" name="id" value={review.id} /> : null}
        <input type="hidden" name="returnTo" value="/strategic-review" />
        <FieldGrid>
          <TextField label={t("lifeForm.strategicReview.dateLabel")} name="date" type="date" defaultValue={review?.date ?? formatISO(new Date(), { representation: "date" })} required />
          <NativeSelectField label={t("lifeForm.strategicReview.typeLabel")} name="reviewType" options={optionize(strategicReviewTypes)} defaultValue={review?.reviewType ?? "weekly"} />
          <TextField label={t("lifeForm.strategicReview.eliteSnapshotLabel")} name="eliteIndexSnapshot" type="number" min={0} max={10} defaultValue={review?.eliteIndexSnapshot ?? 0} />
        </FieldGrid>
        <TextAreaField label={t("lifeForm.strategicReview.winsLabel")} name="wins" defaultValue={review?.wins} />
        <TextAreaField label={t("lifeForm.strategicReview.weaknessesLabel")} name="weaknesses" defaultValue={review?.weaknesses} />
        <TextAreaField label={t("lifeForm.strategicReview.decisionsLabel")} name="decisions" defaultValue={review?.decisions} />
        <TextAreaField label={t("lifeForm.strategicReview.nextFocusLabel")} name="nextFocus" defaultValue={review?.nextFocus} />
        <SubmitBar label={review ? t("lifeForm.strategicReview.submitEdit") : t("lifeForm.strategicReview.submitCreate")} cancelHref={review ? "/strategic-review" : undefined} />
      </form>
    </FormCard>
  );
}
