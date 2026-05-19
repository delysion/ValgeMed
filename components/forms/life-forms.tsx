import { formatISO } from "date-fns";
import type React from "react";

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
  return (
    <FormCard title={note ? "Edit Tartu Note" : "Tartu Note"} description="Language, academic culture, routine and Estonian logistics.">
      <form action={note ? updateTartuNoteAction : createTartuNoteAction} className="space-y-3">
        {note ? <input type="hidden" name="id" value={note.id} /> : null}
        <FieldGrid>
          <TextField label="Title" name="title" defaultValue={note?.title} required />
          <NativeSelectField label="Category" name="category" options={optionize(tartuNoteCategories)} defaultValue={note?.category ?? "tartu_life"} />
          <NativeSelectField label="Status" name="status" options={optionize(taskStatuses)} defaultValue={note?.status ?? "todo"} />
          <TextField label="Priority" name="priority" type="number" min={0} max={10} defaultValue={note?.priority ?? 0} />
        </FieldGrid>
        <TextAreaField label="Content" name="content" defaultValue={note?.content} />
        <SubmitBar label={note ? "Save Note" : "Create Note"} cancelHref={note ? "/tartu" : undefined} />
      </form>
    </FormCard>
  );
}

export function TimeBlockForm({ block }: { block?: TimeBlock }) {
  return (
    <FormCard title={block ? "Edit Time Block" : "Time Block"} description="Plan and measure time capital, not just hours.">
      <form action={block ? updateTimeBlockAction : createTimeBlockAction} className="space-y-3">
        {block ? <input type="hidden" name="id" value={block.id} /> : null}
        <FieldGrid>
          <TextField label="Date" name="date" type="date" defaultValue={block?.date ?? formatISO(new Date(), { representation: "date" })} />
          <TextField label="Title" name="title" defaultValue={block?.title} required />
          <NativeSelectField label="Type" name="blockType" options={optionize(timeBlockTypes)} defaultValue={block?.blockType ?? "study"} />
          <TextField label="Planned" name="plannedMinutes" type="number" defaultValue={block?.plannedMinutes ?? 50} />
          <TextField label="Actual" name="actualMinutes" type="number" defaultValue={block?.actualMinutes ?? 0} />
          <TextField label="Energy cost" name="energyCost" type="number" min={0} max={10} defaultValue={block?.energyCost ?? 4} />
          <TextField label="Leverage" name="leverageScore" type="number" min={0} max={10} defaultValue={block?.leverageScore ?? 6} />
        </FieldGrid>
        <TextAreaField label="Notes" name="notes" defaultValue={block?.notes} />
        <SubmitBar label={block ? "Save Block" : "Create Block"} cancelHref={block ? "/time" : undefined} />
      </form>
    </FormCard>
  );
}

export function HealthLogForm({ log }: { log?: HealthLog }) {
  return (
    <FormCard title={log ? "Edit Health Log" : "Health Log"} description="Energy Integrity: recovery, fatigue, food and movement.">
      <form action={log ? updateHealthLogAction : createHealthLogAction} className="space-y-3">
        {log ? <input type="hidden" name="id" value={log.id} /> : null}
        <input type="hidden" name="movementDone" value="false" />
        <FieldGrid>
          <TextField label="Date" name="date" type="date" defaultValue={log?.date ?? formatISO(new Date(), { representation: "date" })} />
          <TextField label="Sleep quality" name="sleepQuality" type="number" min={0} max={10} defaultValue={log?.sleepQuality ?? ""} />
          <TextField label="Cognitive fatigue" name="cognitiveFatigue" type="number" min={0} max={10} defaultValue={log?.cognitiveFatigue ?? ""} />
          <TextField label="Recovery" name="recoveryQuality" type="number" min={0} max={10} defaultValue={log?.recoveryQuality ?? ""} />
          <TextField label="Food quality" name="foodQuality" type="number" min={0} max={10} defaultValue={log?.foodQuality ?? ""} />
          <TextField label="Energy Integrity" name="energyIntegrityScore" type="number" min={0} max={10} defaultValue={log?.energyIntegrityScore ?? 0} />
        </FieldGrid>
        <Field label="Movement">
          <Input type="checkbox" name="movementDone" defaultChecked={log?.movementDone ?? false} className="h-4 w-4" />
        </Field>
        <TextAreaField label="Notes" name="notes" defaultValue={log?.notes} />
        <SubmitBar label={log ? "Save Log" : "Record Log"} cancelHref={log ? "/health" : undefined} />
      </form>
    </FormCard>
  );
}

export function LanguageProgressForm({ item }: { item?: LanguageProgress }) {
  return (
    <FormCard title={item ? "Edit Language" : "Language Progress"} description="Estonian medical terminology, Latin and academic English.">
      <form action={item ? updateLanguageProgressAction : createLanguageProgressAction} className="space-y-3">
        {item ? <input type="hidden" name="id" value={item.id} /> : null}
        <FieldGrid>
          <NativeSelectField label="Language" name="language" options={optionize(languages)} defaultValue={item?.language ?? "estonian"} />
          <TextField label="Title" name="title" defaultValue={item?.title} required />
          <TextField label="Category" name="category" defaultValue={item?.category} />
          <TextField label="Minutes" name="minutes" type="number" defaultValue={item?.minutes ?? 20} />
          <TextField label="Confidence" name="confidence" type="number" min={0} max={10} defaultValue={item?.confidence ?? 0} />
          <TextField label="Last practice" name="lastPracticedAt" type="date" defaultValue={dateValue(item?.lastPracticedAt)} />
          <TextField label="Next practice" name="nextPracticeAt" type="date" defaultValue={dateValue(item?.nextPracticeAt)} />
        </FieldGrid>
        <TextAreaField label="Notes" name="notes" defaultValue={item?.notes} />
        <SubmitBar label={item ? "Save Language" : "Create Item"} cancelHref={item ? "/language" : undefined} />
      </form>
    </FormCard>
  );
}

export function ReputationEventForm({ event }: { event?: ReputationEvent }) {
  return (
    <FormCard title={event ? "Edit Event" : "Reputation Event"} description="Quiet signals of reliability, competence and contribution.">
      <form action={event ? updateReputationEventAction : createReputationEventAction} className="space-y-3">
        {event ? <input type="hidden" name="id" value={event.id} /> : null}
        <FieldGrid>
          <TextField label="Title" name="title" defaultValue={event?.title} required />
          <NativeSelectField label="Type" name="eventType" options={optionize(reputationEventTypes)} defaultValue={event?.eventType ?? "reliability_signal"} />
          <TextField label="Date" name="eventDate" type="date" defaultValue={event?.eventDate ?? formatISO(new Date(), { representation: "date" })} />
          <TextField label="Impact" name="impact" type="number" min={0} max={10} defaultValue={event?.impact ?? 5} />
          <TextField label="Evidence URL" name="evidenceUrl" defaultValue={event?.evidenceUrl} />
          <TextField label="Follow-up" name="followUpAt" type="date" defaultValue={dateValue(event?.followUpAt)} />
          <NativeSelectField label="Status" name="status" options={optionize(taskStatuses)} defaultValue={event?.status ?? "done"} />
        </FieldGrid>
        <TextAreaField label="Description" name="description" defaultValue={event?.description} />
        <SubmitBar label={event ? "Save Event" : "Create Event"} cancelHref={event ? "/reputation" : undefined} />
      </form>
    </FormCard>
  );
}

export function OpportunityForm({ opportunity }: { opportunity?: Opportunity }) {
  return (
    <FormCard title={opportunity ? "Edit Opportunity" : "Opportunity Radar"} description="Research, shadowing, mentorship, conference, language course.">
      <form action={opportunity ? updateOpportunityAction : createOpportunityAction} className="space-y-3">
        {opportunity ? <input type="hidden" name="id" value={opportunity.id} /> : null}
        <FieldGrid>
          <TextField label="Title" name="title" defaultValue={opportunity?.title} required />
          <NativeSelectField label="Type" name="opportunityType" options={optionize(opportunityTypes)} defaultValue={opportunity?.opportunityType ?? "other"} />
          <TextField label="Deadline" name="deadline" type="date" defaultValue={opportunity?.deadline ?? ""} />
          <TextField label="Value" name="valueScore" type="number" min={0} max={10} defaultValue={opportunity?.valueScore ?? 5} />
          <TextField label="Effort" name="effortScore" type="number" min={0} max={10} defaultValue={opportunity?.effortScore ?? 5} />
          <TextField label="Upside" name="strategicUpside" type="number" min={0} max={10} defaultValue={opportunity?.strategicUpside ?? 5} />
          <NativeSelectField label="Status" name="status" options={optionize(opportunityStatuses)} defaultValue={opportunity?.status ?? "watching"} />
        </FieldGrid>
        <TextAreaField label="Description" name="description" defaultValue={opportunity?.description} />
        <TextAreaField label="Next action" name="nextAction" defaultValue={opportunity?.nextAction} />
        <SubmitBar label={opportunity ? "Save Opportunity" : "Create Opportunity"} cancelHref={opportunity ? "/opportunities" : undefined} />
      </form>
    </FormCard>
  );
}

export function ProfessionalContactForm({ contact }: { contact?: ProfessionalContact }) {
  return (
    <FormCard title={contact ? "Edit Contact" : "Professional Contact"} description="Mentors, professors, serious peers, clinical or academic contacts.">
      <form action={contact ? updateProfessionalContactAction : createProfessionalContactAction} className="space-y-3">
        {contact ? <input type="hidden" name="id" value={contact.id} /> : null}
        <FieldGrid>
          <TextField label="Name" name="name" defaultValue={contact?.name} required />
          <TextField label="Role" name="role" defaultValue={contact?.role} />
          <TextField label="Institution" name="institution" defaultValue={contact?.institution} />
          <TextField label="Strength" name="relationshipStrength" type="number" min={0} max={10} defaultValue={contact?.relationshipStrength ?? 0} />
          <TextField label="Last contact" name="lastContactedAt" type="date" defaultValue={dateValue(contact?.lastContactedAt)} />
          <TextField label="Next follow-up" name="nextFollowUpAt" type="date" defaultValue={dateValue(contact?.nextFollowUpAt)} />
        </FieldGrid>
        <TextAreaField label="Notes" name="notes" defaultValue={contact?.notes} />
        <SubmitBar label={contact ? "Save Contact" : "Create Contact"} cancelHref={contact ? "/network" : undefined} />
      </form>
    </FormCard>
  );
}

export function LifeAdminItemForm({ item }: { item?: LifeAdminItem }) {
  return (
    <FormCard title={item ? "Edit Life Admin" : "Life Admin"} description="Documents, housing, university, health and deadlines that should not occupy the mind.">
      <form action={item ? updateLifeAdminItemAction : createLifeAdminItemAction} className="space-y-3">
        {item ? <input type="hidden" name="id" value={item.id} /> : null}
        <FieldGrid>
          <TextField label="Title" name="title" defaultValue={item?.title} required />
          <NativeSelectField label="Category" name="category" options={optionize(lifeAdminCategories)} defaultValue={item?.category ?? "other"} />
          <TextField label="Due" name="dueAt" type="date" defaultValue={dateValue(item?.dueAt)} />
          <NativeSelectField label="Status" name="status" options={optionize(taskStatuses)} defaultValue={item?.status ?? "todo"} />
          <TextField label="Priority" name="priority" type="number" min={0} max={10} defaultValue={item?.priority ?? 0} />
        </FieldGrid>
        <TextAreaField label="Description" name="description" defaultValue={item?.description} />
        <SubmitBar label={item ? "Save Item" : "Create Item"} cancelHref={item ? "/life-admin" : undefined} />
      </form>
    </FormCard>
  );
}

export function PortfolioItemForm({ item }: { item?: PortfolioItem }) {
  return (
    <FormCard title={item ? "Edit Portfolio" : "Portfolio Item"} description="Evidence of trajectory: results, projects, reflections and contributions.">
      <form action={item ? updatePortfolioItemAction : createPortfolioItemAction} className="space-y-3">
        {item ? <input type="hidden" name="id" value={item.id} /> : null}
        <FieldGrid>
          <TextField label="Title" name="title" defaultValue={item?.title} required />
          <NativeSelectField label="Type" name="itemType" options={optionize(portfolioItemTypes)} defaultValue={item?.itemType ?? "other"} />
          <TextField label="Date" name="date" type="date" defaultValue={item?.date ?? ""} />
          <TextField label="Evidence URL" name="evidenceUrl" defaultValue={item?.evidenceUrl} />
          <TextField label="Strategic value" name="strategicValue" type="number" min={0} max={10} defaultValue={item?.strategicValue ?? 5} />
          <NativeSelectField label="Status" name="status" options={optionize(portfolioStatuses)} defaultValue={item?.status ?? "active"} />
        </FieldGrid>
        <TextAreaField label="Description" name="description" defaultValue={item?.description} />
        <SubmitBar label={item ? "Save Portfolio" : "Create Item"} cancelHref={item ? "/portfolio" : undefined} />
      </form>
    </FormCard>
  );
}

export function StrategicReviewForm({ review }: { review?: StrategicReview }) {
  return (
    <FormCard title={review ? "Edit Review" : "Strategic Review"} description="Weekly, monthly or semester review: what works, what to correct, what to protect.">
      <form action={review ? updateStrategicReviewAction : createStrategicReviewAction} className="space-y-3">
        {review ? <input type="hidden" name="id" value={review.id} /> : null}
        <FieldGrid>
          <TextField label="Date" name="date" type="date" defaultValue={review?.date ?? formatISO(new Date(), { representation: "date" })} />
          <NativeSelectField label="Type" name="reviewType" options={optionize(strategicReviewTypes)} defaultValue={review?.reviewType ?? "weekly"} />
          <TextField label="Elite snapshot" name="eliteIndexSnapshot" type="number" min={0} max={10} defaultValue={review?.eliteIndexSnapshot ?? 0} />
        </FieldGrid>
        <TextAreaField label="Wins" name="wins" defaultValue={review?.wins} />
        <TextAreaField label="Weaknesses" name="weaknesses" defaultValue={review?.weaknesses} />
        <TextAreaField label="Decisions" name="decisions" defaultValue={review?.decisions} />
        <TextAreaField label="Next focus" name="nextFocus" defaultValue={review?.nextFocus} />
        <SubmitBar label={review ? "Save Review" : "Create Review"} cancelHref={review ? "/strategic-review" : undefined} />
      </form>
    </FormCard>
  );
}
