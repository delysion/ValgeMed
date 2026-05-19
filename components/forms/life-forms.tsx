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
    <FormCard title={note ? "Modifica nota Tartu" : "Nota Tartu"} description="Lingua, cultura accademica, routine e logistica Estonia.">
      <form action={note ? updateTartuNoteAction : createTartuNoteAction} className="space-y-3">
        {note ? <input type="hidden" name="id" value={note.id} /> : null}
        <FieldGrid>
          <TextField label="Titolo" name="title" defaultValue={note?.title} required />
          <NativeSelectField label="Categoria" name="category" options={optionize(tartuNoteCategories)} defaultValue={note?.category ?? "tartu_life"} />
          <NativeSelectField label="Status" name="status" options={optionize(taskStatuses)} defaultValue={note?.status ?? "todo"} />
          <TextField label="Priorita" name="priority" type="number" min={0} max={10} defaultValue={note?.priority ?? 0} />
        </FieldGrid>
        <TextAreaField label="Contenuto" name="content" defaultValue={note?.content} />
        <SubmitBar label={note ? "Salva nota" : "Crea nota"} cancelHref={note ? "/tartu" : undefined} />
      </form>
    </FormCard>
  );
}

export function TimeBlockForm({ block }: { block?: TimeBlock }) {
  return (
    <FormCard title={block ? "Modifica time block" : "Time block"} description="Pianifica e misura il capitale tempo, non solo le ore.">
      <form action={block ? updateTimeBlockAction : createTimeBlockAction} className="space-y-3">
        {block ? <input type="hidden" name="id" value={block.id} /> : null}
        <FieldGrid>
          <TextField label="Data" name="date" type="date" defaultValue={block?.date ?? formatISO(new Date(), { representation: "date" })} />
          <TextField label="Titolo" name="title" defaultValue={block?.title} required />
          <NativeSelectField label="Tipo" name="blockType" options={optionize(timeBlockTypes)} defaultValue={block?.blockType ?? "study"} />
          <TextField label="Pianificati" name="plannedMinutes" type="number" defaultValue={block?.plannedMinutes ?? 50} />
          <TextField label="Reali" name="actualMinutes" type="number" defaultValue={block?.actualMinutes ?? 0} />
          <TextField label="Costo energia" name="energyCost" type="number" min={0} max={10} defaultValue={block?.energyCost ?? 4} />
          <TextField label="Leverage" name="leverageScore" type="number" min={0} max={10} defaultValue={block?.leverageScore ?? 6} />
        </FieldGrid>
        <TextAreaField label="Note" name="notes" defaultValue={block?.notes} />
        <SubmitBar label={block ? "Salva blocco" : "Crea blocco"} cancelHref={block ? "/time" : undefined} />
      </form>
    </FormCard>
  );
}

export function HealthLogForm({ log }: { log?: HealthLog }) {
  return (
    <FormCard title={log ? "Modifica health log" : "Health log"} description="Energy Integrity: recupero, fatica, cibo e movimento.">
      <form action={log ? updateHealthLogAction : createHealthLogAction} className="space-y-3">
        {log ? <input type="hidden" name="id" value={log.id} /> : null}
        <input type="hidden" name="movementDone" value="false" />
        <FieldGrid>
          <TextField label="Data" name="date" type="date" defaultValue={log?.date ?? formatISO(new Date(), { representation: "date" })} />
          <TextField label="Sleep quality" name="sleepQuality" type="number" min={0} max={10} defaultValue={log?.sleepQuality ?? ""} />
          <TextField label="Fatica cognitiva" name="cognitiveFatigue" type="number" min={0} max={10} defaultValue={log?.cognitiveFatigue ?? ""} />
          <TextField label="Recovery" name="recoveryQuality" type="number" min={0} max={10} defaultValue={log?.recoveryQuality ?? ""} />
          <TextField label="Food quality" name="foodQuality" type="number" min={0} max={10} defaultValue={log?.foodQuality ?? ""} />
          <TextField label="Energy Integrity" name="energyIntegrityScore" type="number" min={0} max={10} defaultValue={log?.energyIntegrityScore ?? 0} />
        </FieldGrid>
        <Field label="Movimento">
          <Input type="checkbox" name="movementDone" defaultChecked={log?.movementDone ?? false} className="h-4 w-4" />
        </Field>
        <TextAreaField label="Note" name="notes" defaultValue={log?.notes} />
        <SubmitBar label={log ? "Salva log" : "Registra log"} cancelHref={log ? "/health" : undefined} />
      </form>
    </FormCard>
  );
}

export function LanguageProgressForm({ item }: { item?: LanguageProgress }) {
  return (
    <FormCard title={item ? "Modifica lingua" : "Language progress"} description="Estonian medical terminology, latino e inglese accademico.">
      <form action={item ? updateLanguageProgressAction : createLanguageProgressAction} className="space-y-3">
        {item ? <input type="hidden" name="id" value={item.id} /> : null}
        <FieldGrid>
          <NativeSelectField label="Lingua" name="language" options={optionize(languages)} defaultValue={item?.language ?? "estonian"} />
          <TextField label="Titolo" name="title" defaultValue={item?.title} required />
          <TextField label="Categoria" name="category" defaultValue={item?.category} />
          <TextField label="Minuti" name="minutes" type="number" defaultValue={item?.minutes ?? 20} />
          <TextField label="Confidence" name="confidence" type="number" min={0} max={10} defaultValue={item?.confidence ?? 0} />
          <TextField label="Last practice" name="lastPracticedAt" type="date" defaultValue={dateValue(item?.lastPracticedAt)} />
          <TextField label="Next practice" name="nextPracticeAt" type="date" defaultValue={dateValue(item?.nextPracticeAt)} />
        </FieldGrid>
        <TextAreaField label="Note" name="notes" defaultValue={item?.notes} />
        <SubmitBar label={item ? "Salva lingua" : "Crea item"} cancelHref={item ? "/language" : undefined} />
      </form>
    </FormCard>
  );
}

export function ReputationEventForm({ event }: { event?: ReputationEvent }) {
  return (
    <FormCard title={event ? "Modifica evento" : "Reputation event"} description="Segnali quieti di affidabilita, competenza e contributo.">
      <form action={event ? updateReputationEventAction : createReputationEventAction} className="space-y-3">
        {event ? <input type="hidden" name="id" value={event.id} /> : null}
        <FieldGrid>
          <TextField label="Titolo" name="title" defaultValue={event?.title} required />
          <NativeSelectField label="Tipo" name="eventType" options={optionize(reputationEventTypes)} defaultValue={event?.eventType ?? "reliability_signal"} />
          <TextField label="Data" name="eventDate" type="date" defaultValue={event?.eventDate ?? formatISO(new Date(), { representation: "date" })} />
          <TextField label="Impact" name="impact" type="number" min={0} max={10} defaultValue={event?.impact ?? 5} />
          <TextField label="Evidence URL" name="evidenceUrl" defaultValue={event?.evidenceUrl} />
          <TextField label="Follow-up" name="followUpAt" type="date" defaultValue={dateValue(event?.followUpAt)} />
          <NativeSelectField label="Status" name="status" options={optionize(taskStatuses)} defaultValue={event?.status ?? "done"} />
        </FieldGrid>
        <TextAreaField label="Descrizione" name="description" defaultValue={event?.description} />
        <SubmitBar label={event ? "Salva evento" : "Crea evento"} cancelHref={event ? "/reputation" : undefined} />
      </form>
    </FormCard>
  );
}

export function OpportunityForm({ opportunity }: { opportunity?: Opportunity }) {
  return (
    <FormCard title={opportunity ? "Modifica opportunita" : "Opportunity radar"} description="Research, shadowing, mentorship, conference, language course.">
      <form action={opportunity ? updateOpportunityAction : createOpportunityAction} className="space-y-3">
        {opportunity ? <input type="hidden" name="id" value={opportunity.id} /> : null}
        <FieldGrid>
          <TextField label="Titolo" name="title" defaultValue={opportunity?.title} required />
          <NativeSelectField label="Tipo" name="opportunityType" options={optionize(opportunityTypes)} defaultValue={opportunity?.opportunityType ?? "other"} />
          <TextField label="Deadline" name="deadline" type="date" defaultValue={opportunity?.deadline ?? ""} />
          <TextField label="Valore" name="valueScore" type="number" min={0} max={10} defaultValue={opportunity?.valueScore ?? 5} />
          <TextField label="Sforzo" name="effortScore" type="number" min={0} max={10} defaultValue={opportunity?.effortScore ?? 5} />
          <TextField label="Upside" name="strategicUpside" type="number" min={0} max={10} defaultValue={opportunity?.strategicUpside ?? 5} />
          <NativeSelectField label="Status" name="status" options={optionize(opportunityStatuses)} defaultValue={opportunity?.status ?? "watching"} />
        </FieldGrid>
        <TextAreaField label="Descrizione" name="description" defaultValue={opportunity?.description} />
        <TextAreaField label="Next action" name="nextAction" defaultValue={opportunity?.nextAction} />
        <SubmitBar label={opportunity ? "Salva opportunita" : "Crea opportunita"} cancelHref={opportunity ? "/opportunities" : undefined} />
      </form>
    </FormCard>
  );
}

export function ProfessionalContactForm({ contact }: { contact?: ProfessionalContact }) {
  return (
    <FormCard title={contact ? "Modifica contatto" : "Professional contact"} description="Mentori, docenti, pari seri, contatti clinici o accademici.">
      <form action={contact ? updateProfessionalContactAction : createProfessionalContactAction} className="space-y-3">
        {contact ? <input type="hidden" name="id" value={contact.id} /> : null}
        <FieldGrid>
          <TextField label="Nome" name="name" defaultValue={contact?.name} required />
          <TextField label="Ruolo" name="role" defaultValue={contact?.role} />
          <TextField label="Istituzione" name="institution" defaultValue={contact?.institution} />
          <TextField label="Strength" name="relationshipStrength" type="number" min={0} max={10} defaultValue={contact?.relationshipStrength ?? 0} />
          <TextField label="Last contact" name="lastContactedAt" type="date" defaultValue={dateValue(contact?.lastContactedAt)} />
          <TextField label="Next follow-up" name="nextFollowUpAt" type="date" defaultValue={dateValue(contact?.nextFollowUpAt)} />
        </FieldGrid>
        <TextAreaField label="Note" name="notes" defaultValue={contact?.notes} />
        <SubmitBar label={contact ? "Salva contatto" : "Crea contatto"} cancelHref={contact ? "/network" : undefined} />
      </form>
    </FormCard>
  );
}

export function LifeAdminItemForm({ item }: { item?: LifeAdminItem }) {
  return (
    <FormCard title={item ? "Modifica life admin" : "Life admin"} description="Documenti, housing, universita, salute e scadenze che non devono occupare la mente.">
      <form action={item ? updateLifeAdminItemAction : createLifeAdminItemAction} className="space-y-3">
        {item ? <input type="hidden" name="id" value={item.id} /> : null}
        <FieldGrid>
          <TextField label="Titolo" name="title" defaultValue={item?.title} required />
          <NativeSelectField label="Categoria" name="category" options={optionize(lifeAdminCategories)} defaultValue={item?.category ?? "other"} />
          <TextField label="Due" name="dueAt" type="date" defaultValue={dateValue(item?.dueAt)} />
          <NativeSelectField label="Status" name="status" options={optionize(taskStatuses)} defaultValue={item?.status ?? "todo"} />
          <TextField label="Priorita" name="priority" type="number" min={0} max={10} defaultValue={item?.priority ?? 0} />
        </FieldGrid>
        <TextAreaField label="Descrizione" name="description" defaultValue={item?.description} />
        <SubmitBar label={item ? "Salva item" : "Crea item"} cancelHref={item ? "/life-admin" : undefined} />
      </form>
    </FormCard>
  );
}

export function PortfolioItemForm({ item }: { item?: PortfolioItem }) {
  return (
    <FormCard title={item ? "Modifica portfolio" : "Portfolio item"} description="Evidenze della traiettoria: risultati, progetti, riflessioni e contributi.">
      <form action={item ? updatePortfolioItemAction : createPortfolioItemAction} className="space-y-3">
        {item ? <input type="hidden" name="id" value={item.id} /> : null}
        <FieldGrid>
          <TextField label="Titolo" name="title" defaultValue={item?.title} required />
          <NativeSelectField label="Tipo" name="itemType" options={optionize(portfolioItemTypes)} defaultValue={item?.itemType ?? "other"} />
          <TextField label="Data" name="date" type="date" defaultValue={item?.date ?? ""} />
          <TextField label="Evidence URL" name="evidenceUrl" defaultValue={item?.evidenceUrl} />
          <TextField label="Strategic value" name="strategicValue" type="number" min={0} max={10} defaultValue={item?.strategicValue ?? 5} />
          <NativeSelectField label="Status" name="status" options={optionize(portfolioStatuses)} defaultValue={item?.status ?? "active"} />
        </FieldGrid>
        <TextAreaField label="Descrizione" name="description" defaultValue={item?.description} />
        <SubmitBar label={item ? "Salva portfolio" : "Crea item"} cancelHref={item ? "/portfolio" : undefined} />
      </form>
    </FormCard>
  );
}

export function StrategicReviewForm({ review }: { review?: StrategicReview }) {
  return (
    <FormCard title={review ? "Modifica review" : "Strategic review"} description="Weekly, monthly o semester review: cosa funziona, cosa correggere, cosa proteggere.">
      <form action={review ? updateStrategicReviewAction : createStrategicReviewAction} className="space-y-3">
        {review ? <input type="hidden" name="id" value={review.id} /> : null}
        <FieldGrid>
          <TextField label="Data" name="date" type="date" defaultValue={review?.date ?? formatISO(new Date(), { representation: "date" })} />
          <NativeSelectField label="Tipo" name="reviewType" options={optionize(strategicReviewTypes)} defaultValue={review?.reviewType ?? "weekly"} />
          <TextField label="Elite snapshot" name="eliteIndexSnapshot" type="number" min={0} max={10} defaultValue={review?.eliteIndexSnapshot ?? 0} />
        </FieldGrid>
        <TextAreaField label="Wins" name="wins" defaultValue={review?.wins} />
        <TextAreaField label="Weaknesses" name="weaknesses" defaultValue={review?.weaknesses} />
        <TextAreaField label="Decisions" name="decisions" defaultValue={review?.decisions} />
        <TextAreaField label="Next focus" name="nextFocus" defaultValue={review?.nextFocus} />
        <SubmitBar label={review ? "Salva review" : "Crea review"} cancelHref={review ? "/strategic-review" : undefined} />
      </form>
    </FormCard>
  );
}
