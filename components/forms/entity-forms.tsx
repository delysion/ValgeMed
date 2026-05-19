import { formatISO } from "date-fns";
import type React from "react";

import {
  createErrorLogAction,
  createExamAction,
  createGoalAction,
  createIdentityNoteAction,
  createQuizAttemptAction,
  createReviewItemAction,
  createStudySessionAction,
  createSubjectAction,
  createTaskAction,
  createTopicAction,
  updateDailyLogAction,
  updateErrorLogAction,
  updateExamAction,
  updateGoalAction,
  updateIdentityNoteAction,
  updateReviewItemAction,
  updateStudySessionAction,
  updateSubjectAction,
  updateTaskAction,
  updateTopicAction,
  upsertDailyLogAction,
} from "@/lib/actions/resources";
import type {
  DailyLog,
  ErrorLog,
  Exam,
  Goal,
  IdentityNote,
  ReviewItem,
  StudySession,
  Subject,
  Task,
  Topic,
} from "@/lib/db/schema";
import { dateTimeValue, dateValue, optionize } from "@/lib/labels";
import {
  errorTypes,
  examFormats,
  goalStatuses,
  goalTypes,
  identityCategories,
  reviewTypes,
  studyMethods,
  taskStatuses,
  topicStatuses,
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

function relationOptions<T extends { id: string; title?: string; name?: string }>(
  rows: T[],
  emptyLabel = "Nessuno",
) {
  return [
    { label: emptyLabel, value: "" },
    ...rows.map((row) => ({
      label: row.title ?? row.name ?? row.id,
      value: row.id,
    })),
  ];
}

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

export function SubjectForm({ subject }: { subject?: Subject }) {
  return (
    <FormCard
      title={subject ? "Modifica materia" : "Nuova materia"}
      description="Difficolta e importanza aiutano priorita, rischio e progressione."
    >
      <form action={subject ? updateSubjectAction : createSubjectAction} className="space-y-3">
        {subject ? <input type="hidden" name="id" value={subject.id} /> : null}
        <FieldGrid>
          <TextField label="Nome" name="name" defaultValue={subject?.name} required />
          <TextField label="Codice" name="code" defaultValue={subject?.code} />
          <TextField label="Colore" name="color" defaultValue={subject?.color ?? "#a8d8ff"} />
          <TextField label="Difficolta" name="difficulty" type="number" min={0} max={10} defaultValue={subject?.difficulty ?? 0} />
          <TextField label="Importanza" name="importance" type="number" min={0} max={10} defaultValue={subject?.importance ?? 0} />
        </FieldGrid>
        <TextAreaField label="Descrizione" name="description" defaultValue={subject?.description} />
        <SubmitBar label={subject ? "Salva materia" : "Crea materia"} cancelHref={subject ? "/subjects" : undefined} />
      </form>
    </FormCard>
  );
}

export function ExamForm({
  exam,
  subjects,
}: {
  exam?: Exam;
  subjects: Subject[];
}) {
  return (
    <FormCard
      title={exam ? "Modifica esame" : "Nuovo esame"}
      description="Ogni esame diventa un command center con topics, errori, quiz e piano."
    >
      <form action={exam ? updateExamAction : createExamAction} className="space-y-3">
        {exam ? <input type="hidden" name="id" value={exam.id} /> : null}
        <FieldGrid>
          <NativeSelectField label="Materia" name="subjectId" options={relationOptions(subjects, "Seleziona")} defaultValue={exam?.subjectId} />
          <TextField label="Titolo" name="title" defaultValue={exam?.title} required />
          <TextField label="Data" name="examDate" type="date" defaultValue={dateValue(exam?.examDate)} />
          <TextField label="ECTS" name="ects" type="number" defaultValue={exam?.ects ?? ""} />
          <NativeSelectField label="Formato" name="format" options={optionize(examFormats)} defaultValue={exam?.format ?? "unknown"} />
          <TextField label="Difficolta" name="difficulty" type="number" min={0} max={10} defaultValue={exam?.difficulty ?? 0} />
          <TextField label="Importanza" name="importance" type="number" min={0} max={10} defaultValue={exam?.importance ?? 0} />
        </FieldGrid>
        <TextAreaField label="Note" name="notes" defaultValue={exam?.notes} />
        <SubmitBar label={exam ? "Salva esame" : "Crea esame"} cancelHref={exam ? "/exams" : undefined} />
      </form>
    </FormCard>
  );
}

export function TopicForm({
  topic,
  subjects,
  exams,
}: {
  topic?: Topic;
  subjects: Subject[];
  exams: Exam[];
}) {
  return (
    <FormCard
      title={topic ? "Modifica topic" : "Nuovo topic"}
      description="Confidence, priorita e next review guidano recall e ripassi."
    >
      <form action={topic ? updateTopicAction : createTopicAction} className="space-y-3">
        {topic ? <input type="hidden" name="id" value={topic.id} /> : null}
        <FieldGrid>
          <NativeSelectField label="Materia" name="subjectId" options={relationOptions(subjects, "Seleziona")} defaultValue={topic?.subjectId} />
          <NativeSelectField label="Esame" name="examId" options={relationOptions(exams)} defaultValue={topic?.examId} />
          <TextField label="Titolo" name="title" defaultValue={topic?.title} required />
          <NativeSelectField label="Status" name="status" options={optionize(topicStatuses)} defaultValue={topic?.status ?? "not_started"} />
          <TextField label="Difficolta" name="difficulty" type="number" min={0} max={10} defaultValue={topic?.difficulty ?? 0} />
          <TextField label="Priorita" name="priority" type="number" min={0} max={10} defaultValue={topic?.priority ?? 0} />
          <TextField label="Confidence" name="confidence" type="number" min={0} max={10} defaultValue={topic?.confidence ?? 0} />
          <TextField label="Last studied" name="lastStudiedAt" type="date" defaultValue={dateValue(topic?.lastStudiedAt)} />
          <TextField label="Next review" name="nextReviewAt" type="date" defaultValue={dateValue(topic?.nextReviewAt)} />
        </FieldGrid>
        <TextAreaField label="Descrizione" name="description" defaultValue={topic?.description} />
        <SubmitBar label={topic ? "Salva topic" : "Crea topic"} cancelHref={topic ? "/topics" : undefined} />
      </form>
    </FormCard>
  );
}

export function StudySessionForm({
  session,
  subjects,
  topics,
  exams,
}: {
  session?: StudySession;
  subjects: Subject[];
  topics: Topic[];
  exams: Exam[];
}) {
  return (
    <FormCard
      title={session ? "Modifica sessione" : "Nuova sessione"}
      description="Traccia metodo, focus, energia e output: rendimento per ora, non solo ore."
    >
      <form action={session ? updateStudySessionAction : createStudySessionAction} className="space-y-3">
        {session ? <input type="hidden" name="id" value={session.id} /> : null}
        <FieldGrid>
          <NativeSelectField label="Materia" name="subjectId" options={relationOptions(subjects, "Seleziona")} defaultValue={session?.subjectId} />
          <NativeSelectField label="Topic" name="topicId" options={relationOptions(topics)} defaultValue={session?.topicId} />
          <NativeSelectField label="Esame" name="examId" options={relationOptions(exams)} defaultValue={session?.examId} />
          <TextField label="Inizio" name="startedAt" type="datetime-local" defaultValue={dateTimeValue(session?.startedAt) || dateTimeValue(new Date())} required />
          <TextField label="Fine" name="endedAt" type="datetime-local" defaultValue={dateTimeValue(session?.endedAt)} />
          <TextField label="Minuti" name="durationMinutes" type="number" defaultValue={session?.durationMinutes ?? 50} required />
          <NativeSelectField label="Metodo" name="method" options={optionize(studyMethods)} defaultValue={session?.method ?? "mixed"} />
          <TextField label="Focus" name="focusLevel" type="number" min={0} max={10} defaultValue={session?.focusLevel ?? 7} />
          <TextField label="Energia" name="energyLevel" type="number" min={0} max={10} defaultValue={session?.energyLevel ?? 7} />
          <TextField label="Output" name="outputQuality" type="number" min={0} max={10} defaultValue={session?.outputQuality ?? 7} />
        </FieldGrid>
        <TextAreaField label="Note" name="notes" defaultValue={session?.notes} />
        <SubmitBar label={session ? "Salva sessione" : "Crea sessione"} cancelHref={session ? "/study-sessions" : undefined} />
      </form>
    </FormCard>
  );
}

export function ReviewItemForm({
  item,
  subjects,
  topics,
}: {
  item?: ReviewItem;
  subjects: Subject[];
  topics: Topic[];
}) {
  return (
    <FormCard
      title={item ? "Modifica review item" : "Nuovo review item"}
      description="Domande aperte e flashcard restano locali, senza AI o cloud esterno."
    >
      <form action={item ? updateReviewItemAction : createReviewItemAction} className="space-y-3">
        {item ? <input type="hidden" name="id" value={item.id} /> : null}
        <input type="hidden" name="isActive" value="false" />
        <FieldGrid>
          <NativeSelectField label="Materia" name="subjectId" options={relationOptions(subjects, "Seleziona")} defaultValue={item?.subjectId} />
          <NativeSelectField label="Topic" name="topicId" options={relationOptions(topics)} defaultValue={item?.topicId} />
          <NativeSelectField label="Tipo" name="reviewType" options={optionize(reviewTypes)} defaultValue={item?.reviewType ?? "flashcard"} />
          <TextField label="Confidence" name="confidence" type="number" min={0} max={10} defaultValue={item?.confidence ?? 0} />
          <TextField label="Interval days" name="intervalDays" type="number" defaultValue={item?.intervalDays ?? 1} />
          <TextField label="Due" name="dueAt" type="date" defaultValue={dateValue(item?.dueAt) || dateValue(new Date())} />
        </FieldGrid>
        <TextAreaField label="Domanda" name="question" defaultValue={item?.question} />
        <TextAreaField label="Risposta" name="answer" defaultValue={item?.answer} />
        <Field label="Attivo">
          <Input type="checkbox" name="isActive" defaultChecked={item?.isActive ?? true} className="h-4 w-4" />
        </Field>
        <SubmitBar label={item ? "Salva item" : "Crea item"} cancelHref={item ? "/reviews" : undefined} />
      </form>
    </FormCard>
  );
}

export function ErrorLogForm({
  error,
  subjects,
  topics,
  exams,
}: {
  error?: ErrorLog;
  subjects: Subject[];
  topics: Topic[];
  exams: Exam[];
}) {
  return (
    <FormCard
      title={error ? "Modifica errore" : "Nuovo errore"}
      description="L'errore diventa regola di prevenzione, non colpa personale."
    >
      <form action={error ? updateErrorLogAction : createErrorLogAction} className="space-y-3">
        {error ? <input type="hidden" name="id" value={error.id} /> : null}
        <input type="hidden" name="resolved" value="false" />
        <FieldGrid>
          <NativeSelectField label="Materia" name="subjectId" options={relationOptions(subjects, "Seleziona")} defaultValue={error?.subjectId} />
          <NativeSelectField label="Topic" name="topicId" options={relationOptions(topics)} defaultValue={error?.topicId} />
          <NativeSelectField label="Esame" name="examId" options={relationOptions(exams)} defaultValue={error?.examId} />
          <TextField label="Titolo" name="title" defaultValue={error?.title} required />
          <NativeSelectField label="Tipo" name="errorType" options={optionize(errorTypes)} defaultValue={error?.errorType ?? "other"} />
          <TextField label="Retest" name="retestAt" type="date" defaultValue={dateValue(error?.retestAt)} />
          <TextField label="Severity" name="severity" type="number" min={0} max={10} defaultValue={error?.severity ?? 0} />
          <TextField label="Ricorrenze" name="recurrenceCount" type="number" min={0} defaultValue={error?.recurrenceCount ?? 0} />
        </FieldGrid>
        <TextAreaField label="Descrizione" name="description" defaultValue={error?.description} />
        <TextAreaField label="Causa" name="cause" defaultValue={error?.cause} />
        <TextAreaField label="Correzione" name="correction" defaultValue={error?.correction} />
        <TextAreaField label="Regola prevenzione" name="preventionRule" defaultValue={error?.preventionRule} />
        <Field label="Risolto">
          <Input type="checkbox" name="resolved" defaultChecked={error?.resolved ?? false} className="h-4 w-4" />
        </Field>
        <SubmitBar label={error ? "Salva errore" : "Crea errore"} cancelHref={error ? "/errors" : undefined} />
      </form>
    </FormCard>
  );
}

export function QuizAttemptForm({
  subjects,
  topics,
  exams,
  examId,
}: {
  subjects: Subject[];
  topics: Topic[];
  exams: Exam[];
  examId?: string;
}) {
  return (
    <FormCard title="Nuovo quiz attempt" description="Accuratezza reale, non sensazione di familiarita.">
      <form action={createQuizAttemptAction} className="space-y-3">
        <FieldGrid>
          <NativeSelectField label="Materia" name="subjectId" options={relationOptions(subjects, "Seleziona")} defaultValue={exams.find((exam) => exam.id === examId)?.subjectId} />
          <NativeSelectField label="Topic" name="topicId" options={relationOptions(topics)} />
          <NativeSelectField label="Esame" name="examId" options={relationOptions(exams)} defaultValue={examId} />
          <TextField label="Data" name="date" type="date" defaultValue={formatISO(new Date(), { representation: "date" })} />
          <TextField label="Domande" name="totalQuestions" type="number" defaultValue={20} />
          <TextField label="Corrette" name="correctAnswers" type="number" defaultValue={0} />
        </FieldGrid>
        <TextAreaField label="Note" name="notes" />
        <SubmitBar label="Registra quiz" />
      </form>
    </FormCard>
  );
}

export function DailyLogForm({ log, compact = false }: { log?: DailyLog | null; compact?: boolean }) {
  return (
    <FormCard
      title={log ? "Aggiorna daily log" : "Daily log"}
      description="Sonno, energia e stress pesano sul piano: non sono dettagli decorativi."
    >
      <form action={log?.id ? updateDailyLogAction : upsertDailyLogAction} className="space-y-3">
        {log?.id ? <input type="hidden" name="id" value={log.id} /> : null}
        <input type="hidden" name="movementDone" value="false" />
        <FieldGrid className={compact ? "xl:grid-cols-3" : undefined}>
          <TextField label="Data" name="date" type="date" defaultValue={log?.date ?? formatISO(new Date(), { representation: "date" })} />
          <TextField label="Sonno" name="sleepHours" type="number" defaultValue={log?.sleepHours ?? ""} />
          <TextField label="Energia" name="energyLevel" type="number" min={0} max={10} defaultValue={log?.energyLevel ?? ""} />
          <TextField label="Stress" name="stressLevel" type="number" min={0} max={10} defaultValue={log?.stressLevel ?? ""} />
          <TextField label="Mood" name="moodLevel" type="number" min={0} max={10} defaultValue={log?.moodLevel ?? ""} />
          <TextField label="Study min" name="studyMinutes" type="number" defaultValue={log?.studyMinutes ?? 0} />
          <TextField label="Recall min" name="activeRecallMinutes" type="number" defaultValue={log?.activeRecallMinutes ?? 0} />
          <TextField label="Passive min" name="passiveStudyMinutes" type="number" defaultValue={log?.passiveStudyMinutes ?? 0} />
        </FieldGrid>
        <Field label="Movimento">
          <Input type="checkbox" name="movementDone" defaultChecked={log?.movementDone ?? false} className="h-4 w-4" />
        </Field>
        <TextAreaField label="Note" name="notes" defaultValue={log?.notes} />
        <SubmitBar label={log?.id ? "Salva log" : "Registra oggi"} cancelHref={log?.id ? "/daily-log" : undefined} />
      </form>
    </FormCard>
  );
}

export function GoalForm({ goal }: { goal?: Goal }) {
  return (
    <FormCard title={goal ? "Modifica goal" : "Nuovo goal"} description="Obiettivi accademici, salute e identita professionale.">
      <form action={goal ? updateGoalAction : createGoalAction} className="space-y-3">
        {goal ? <input type="hidden" name="id" value={goal.id} /> : null}
        <FieldGrid>
          <TextField label="Titolo" name="title" defaultValue={goal?.title} required />
          <NativeSelectField label="Tipo" name="goalType" options={optionize(goalTypes)} defaultValue={goal?.goalType ?? "daily"} />
          <TextField label="Target" name="targetDate" type="date" defaultValue={goal?.targetDate ?? ""} />
          <NativeSelectField label="Status" name="status" options={optionize(goalStatuses)} defaultValue={goal?.status ?? "active"} />
          <TextField label="Priorita" name="priority" type="number" min={0} max={10} defaultValue={goal?.priority ?? 0} />
        </FieldGrid>
        <TextAreaField label="Descrizione" name="description" defaultValue={goal?.description} />
        <SubmitBar label={goal ? "Salva goal" : "Crea goal"} cancelHref={goal ? "/goals" : undefined} />
      </form>
    </FormCard>
  );
}

export function TaskForm({
  task,
  subjects,
  exams,
  topics,
}: {
  task?: Task;
  subjects: Subject[];
  exams: Exam[];
  topics: Topic[];
}) {
  return (
    <FormCard title={task ? "Modifica task" : "Nuovo task"} description="Azioni concrete legate a materia, esame o topic.">
      <form action={task ? updateTaskAction : createTaskAction} className="space-y-3">
        {task ? <input type="hidden" name="id" value={task.id} /> : null}
        <FieldGrid>
          <TextField label="Titolo" name="title" defaultValue={task?.title} required />
          <TextField label="Due" name="dueAt" type="date" defaultValue={dateValue(task?.dueAt)} />
          <NativeSelectField label="Status" name="status" options={optionize(taskStatuses)} defaultValue={task?.status ?? "todo"} />
          <TextField label="Priorita" name="priority" type="number" min={0} max={10} defaultValue={task?.priority ?? 0} />
          <NativeSelectField label="Materia" name="relatedSubjectId" options={relationOptions(subjects)} defaultValue={task?.relatedSubjectId} />
          <NativeSelectField label="Esame" name="relatedExamId" options={relationOptions(exams)} defaultValue={task?.relatedExamId} />
          <NativeSelectField label="Topic" name="relatedTopicId" options={relationOptions(topics)} defaultValue={task?.relatedTopicId} />
        </FieldGrid>
        <TextAreaField label="Descrizione" name="description" defaultValue={task?.description} />
        <SubmitBar label={task ? "Salva task" : "Crea task"} cancelHref={task ? "/goals" : undefined} />
      </form>
    </FormCard>
  );
}

export function IdentityNoteForm({
  note,
  cancelHref = "/identity",
}: {
  note?: IdentityNote;
  cancelHref?: string;
}) {
  return (
    <FormCard title={note ? "Modifica identity note" : "Identity note"} description="Standard personale e identita da futura professionista.">
      <form action={note ? updateIdentityNoteAction : createIdentityNoteAction} className="space-y-3">
        {note ? <input type="hidden" name="id" value={note.id} /> : null}
        <FieldGrid>
          <TextField label="Titolo" name="title" defaultValue={note?.title} required />
          <NativeSelectField label="Categoria" name="category" options={optionize(identityCategories)} defaultValue={note?.category ?? "professional_identity"} />
        </FieldGrid>
        <TextAreaField label="Contenuto" name="content" defaultValue={note?.content} />
        <SubmitBar label={note ? "Salva nota" : "Crea nota"} cancelHref={note ? cancelHref : undefined} />
      </form>
    </FormCard>
  );
}
