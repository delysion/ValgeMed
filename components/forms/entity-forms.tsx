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
import { ColorPicker } from "@/components/ui/color-picker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type TFunc = (key: string) => string;

function relationOptions<T extends { id: string; title?: string; name?: string }>(
  rows: T[],
  emptyLabel = "None",
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
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function SubjectForm({ subject, t }: { subject?: Subject; t: TFunc }) {
  return (
    <FormCard
      title={subject ? t("form.subject.editTitle") : t("form.subject.createTitle")}
      description={t("form.subject.description")}
    >
      <form action={subject ? updateSubjectAction : createSubjectAction} className="space-y-5">
        {subject ? <input type="hidden" name="id" value={subject.id} /> : null}
        <FieldGrid>
          <TextField label={t("form.subject.nameLabel")} name="name" defaultValue={subject?.name} required placeholder={t("form.subject.namePlaceholder")} description={t("form.subject.nameDescription")} />
          <TextField label={t("form.subject.codeLabel")} name="code" defaultValue={subject?.code} placeholder={t("form.subject.codePlaceholder")} description={t("form.subject.codeDescription")} />
          <ColorPicker name="color" value={subject?.color ?? "#5746E5"} />
          <TextField label={t("form.subject.difficultyLabel")} name="difficulty" type="number" min={0} max={10} defaultValue={subject?.difficulty ?? 5} description={t("form.subject.difficultyDescription")} />
          <TextField label={t("form.subject.importanceLabel")} name="importance" type="number" min={0} max={10} defaultValue={subject?.importance ?? 5} description={t("form.subject.importanceDescription")} />
        </FieldGrid>
        <TextAreaField label={t("form.subject.notesLabel")} name="description" defaultValue={subject?.description} placeholder={t("form.subject.notesPlaceholder")} description={t("form.subject.notesDescription")} />
        <SubmitBar label={subject ? t("form.subject.editSubmit") : t("form.subject.createSubmit")} pendingLabel={subject ? t("form.subject.editPending") : t("form.subject.createPending")} cancelHref={subject ? "/subjects" : undefined} cancelLabel={t("common.cancel")} />
      </form>
    </FormCard>
  );
}

export function ExamForm({
  exam,
  subjects,
  t,
}: {
  exam?: Exam;
  subjects: Subject[];
  t: TFunc;
}) {
  return (
    <FormCard
      title={exam ? t("form.exam.editTitle") : t("form.exam.createTitle")}
      description={t("form.exam.description")}
    >
      <form action={exam ? updateExamAction : createExamAction} className="space-y-5">
        {exam ? <input type="hidden" name="id" value={exam.id} /> : null}
        <FieldGrid>
          <NativeSelectField label={t("form.exam.subjectLabel")} name="subjectId" options={relationOptions(subjects, t("form.exam.subjectEmpty"))} defaultValue={exam?.subjectId} description={t("form.exam.subjectDescription")} />
          <TextField label={t("form.exam.titleLabel")} name="title" defaultValue={exam?.title} required placeholder={t("form.exam.titlePlaceholder")} description={t("form.exam.titleDescription")} />
          <TextField label={t("form.exam.dateLabel")} name="examDate" type="date" defaultValue={dateValue(exam?.examDate)} description={t("form.exam.dateDescription")} />
          <TextField label={t("form.exam.creditsLabel")} name="ects" type="number" defaultValue={exam?.ects ?? ""} description={t("form.exam.creditsDescription")} />
          <NativeSelectField label={t("form.exam.formatLabel")} name="format" options={optionize(examFormats)} defaultValue={exam?.format ?? "unknown"} description={t("form.exam.formatDescription")} />
          <TextField label={t("form.exam.difficultyLabel")} name="difficulty" type="number" min={0} max={10} defaultValue={exam?.difficulty ?? 5} description={t("form.exam.difficultyDescription")} />
          <TextField label={t("form.exam.importanceLabel")} name="importance" type="number" min={0} max={10} defaultValue={exam?.importance ?? 5} description={t("form.exam.importanceDescription")} />
        </FieldGrid>
        <TextAreaField label={t("form.exam.notesLabel")} name="notes" defaultValue={exam?.notes} placeholder={t("form.exam.notesPlaceholder")} description={t("form.exam.notesDescription")} />
        <SubmitBar label={exam ? t("form.exam.editSubmit") : t("form.exam.createSubmit")} pendingLabel={exam ? t("form.exam.editPending") : t("form.exam.createPending")} cancelHref={exam ? "/exams" : undefined} cancelLabel={t("common.cancel")} />
      </form>
    </FormCard>
  );
}

export function TopicForm({
  topic,
  subjects,
  exams,
  t,
}: {
  topic?: Topic;
  subjects: Subject[];
  exams: Exam[];
  t: TFunc;
}) {
  return (
    <FormCard
      title={topic ? t("form.topic.editTitle") : t("form.topic.createTitle")}
      description={t("form.topic.description")}
    >
      <form action={topic ? updateTopicAction : createTopicAction} className="space-y-5">
        {topic ? <input type="hidden" name="id" value={topic.id} /> : null}
        <FieldGrid>
          <NativeSelectField label={t("form.topic.subjectLabel")} name="subjectId" options={relationOptions(subjects, t("form.topic.subjectEmpty"))} defaultValue={topic?.subjectId} description={t("form.topic.subjectDescription")} />
          <NativeSelectField label={t("form.topic.examLabel")} name="examId" options={relationOptions(exams, t("form.topic.examEmpty"))} defaultValue={topic?.examId} description={t("form.topic.examDescription")} />
          <TextField label={t("form.topic.titleLabel")} name="title" defaultValue={topic?.title} required placeholder={t("form.topic.titlePlaceholder")} description={t("form.topic.titleDescription")} />
          <NativeSelectField label={t("form.topic.statusLabel")} name="status" options={optionize(topicStatuses)} defaultValue={topic?.status ?? "not_started"} description={t("form.topic.statusDescription")} />
          <TextField label={t("form.topic.difficultyLabel")} name="difficulty" type="number" min={0} max={10} defaultValue={topic?.difficulty ?? 5} description={t("form.topic.difficultyDescription")} />
          <TextField label={t("form.topic.priorityLabel")} name="priority" type="number" min={0} max={10} defaultValue={topic?.priority ?? 5} description={t("form.topic.priorityDescription")} />
          <TextField label={t("form.topic.confidenceLabel")} name="confidence" type="number" min={0} max={10} defaultValue={topic?.confidence ?? 0} description={t("form.topic.confidenceDescription")} />
          <TextField label={t("form.topic.lastStudiedLabel")} name="lastStudiedAt" type="date" defaultValue={dateValue(topic?.lastStudiedAt)} description={t("form.topic.lastStudiedDescription")} />
          <TextField label={t("form.topic.nextReviewLabel")} name="nextReviewAt" type="date" defaultValue={dateValue(topic?.nextReviewAt)} description={t("form.topic.nextReviewDescription")} />
        </FieldGrid>
        <TextAreaField label={t("form.topic.notesLabel")} name="description" defaultValue={topic?.description} placeholder={t("form.topic.notesPlaceholder")} description={t("form.topic.notesDescription")} />
        <SubmitBar label={topic ? t("form.topic.editSubmit") : t("form.topic.createSubmit")} pendingLabel={topic ? t("form.topic.editPending") : t("form.topic.createPending")} cancelHref={topic ? "/topics" : undefined} cancelLabel={t("common.cancel")} />
      </form>
    </FormCard>
  );
}

export function StudySessionForm({
  session,
  subjects,
  topics,
  exams,
  t,
}: {
  session?: StudySession;
  subjects: Subject[];
  topics: Topic[];
  exams: Exam[];
  t: TFunc;
}) {
  return (
    <FormCard
      title={session ? t("form.studySession.editTitle") : t("form.studySession.createTitle")}
      description={t("form.studySession.description")}
    >
      <form action={session ? updateStudySessionAction : createStudySessionAction} className="space-y-5">
        {session ? <input type="hidden" name="id" value={session.id} /> : null}
        <FieldGrid>
          <NativeSelectField label={t("form.studySession.subjectLabel")} name="subjectId" options={relationOptions(subjects, t("form.studySession.subjectEmpty"))} defaultValue={session?.subjectId} description={t("form.studySession.subjectDescription")} />
          <NativeSelectField label={t("form.studySession.topicLabel")} name="topicId" options={relationOptions(topics, t("form.studySession.topicEmpty"))} defaultValue={session?.topicId} description={t("form.studySession.topicDescription")} />
          <NativeSelectField label={t("form.studySession.examLabel")} name="examId" options={relationOptions(exams, t("form.studySession.examEmpty"))} defaultValue={session?.examId} description={t("form.studySession.examDescription")} />
          <TextField label={t("form.studySession.startLabel")} name="startedAt" type="datetime-local" defaultValue={dateTimeValue(session?.startedAt) || dateTimeValue(new Date())} required description={t("form.studySession.startDescription")} />
          <TextField label={t("form.studySession.endLabel")} name="endedAt" type="datetime-local" defaultValue={dateTimeValue(session?.endedAt)} description={t("form.studySession.endDescription")} />
          <TextField label={t("form.studySession.durationLabel")} name="durationMinutes" type="number" defaultValue={session?.durationMinutes ?? 50} required description={t("form.studySession.durationDescription")} />
          <NativeSelectField label={t("form.studySession.methodLabel")} name="method" options={optionize(studyMethods)} defaultValue={session?.method ?? "mixed"} description={t("form.studySession.methodDescription")} />
          <TextField label={t("form.studySession.focusLabel")} name="focusLevel" type="number" min={0} max={10} defaultValue={session?.focusLevel ?? 7} description={t("form.studySession.focusDescription")} />
          <TextField label={t("form.studySession.energyLabel")} name="energyLevel" type="number" min={0} max={10} defaultValue={session?.energyLevel ?? 7} description={t("form.studySession.energyDescription")} />
          <TextField label={t("form.studySession.outputLabel")} name="outputQuality" type="number" min={0} max={10} defaultValue={session?.outputQuality ?? 7} description={t("form.studySession.outputDescription")} />
        </FieldGrid>
        <TextAreaField label={t("form.studySession.notesLabel")} name="notes" defaultValue={session?.notes} placeholder={t("form.studySession.notesPlaceholder")} description={t("form.studySession.notesDescription")} />
        <SubmitBar label={session ? t("form.studySession.editSubmit") : t("form.studySession.createSubmit")} pendingLabel={session ? t("form.studySession.editPending") : t("form.studySession.createPending")} cancelHref={session ? "/study-sessions" : undefined} cancelLabel={t("common.cancel")} />
      </form>
    </FormCard>
  );
}

export function ReviewItemForm({
  item,
  subjects,
  topics,
  t,
}: {
  item?: ReviewItem;
  subjects: Subject[];
  topics: Topic[];
  t: TFunc;
}) {
  return (
    <FormCard
      title={item ? t("form.reviewItem.editTitle") : t("form.reviewItem.createTitle")}
      description={t("form.reviewItem.description")}
    >
      <form action={item ? updateReviewItemAction : createReviewItemAction} className="space-y-3">
        {item ? <input type="hidden" name="id" value={item.id} /> : null}
        <input type="hidden" name="isActive" value="false" />
        <FieldGrid>
          <NativeSelectField label={t("form.reviewItem.subjectLabel")} name="subjectId" options={relationOptions(subjects, t("form.reviewItem.subjectEmpty"))} defaultValue={item?.subjectId} />
          <NativeSelectField label={t("form.reviewItem.topicLabel")} name="topicId" options={relationOptions(topics)} defaultValue={item?.topicId} />
          <NativeSelectField label={t("form.reviewItem.typeLabel")} name="reviewType" options={optionize(reviewTypes)} defaultValue={item?.reviewType ?? "flashcard"} />
          <TextField label={t("form.reviewItem.confidenceLabel")} name="confidence" type="number" min={0} max={10} defaultValue={item?.confidence ?? 0} description={t("form.reviewItem.confidenceDescription")} />
          <TextField label={t("form.reviewItem.intervalLabel")} name="intervalDays" type="number" defaultValue={item?.intervalDays ?? 1} description={t("form.reviewItem.intervalDescription")} />
          <TextField label={t("form.reviewItem.dueLabel")} name="dueAt" type="date" defaultValue={dateValue(item?.dueAt) || dateValue(new Date())} />
        </FieldGrid>
        <TextAreaField label={t("form.reviewItem.questionLabel")} name="question" defaultValue={item?.question} placeholder={t("form.reviewItem.questionPlaceholder")} />
        <TextAreaField label={t("form.reviewItem.answerLabel")} name="answer" defaultValue={item?.answer} placeholder={t("form.reviewItem.answerPlaceholder")} />
        <Field label={t("form.reviewItem.activeLabel")}>
          <Input type="checkbox" name="isActive" defaultChecked={item?.isActive ?? true} className="h-4 w-4" />
        </Field>
        <SubmitBar label={item ? t("form.reviewItem.editSubmit") : t("form.reviewItem.createSubmit")} pendingLabel={item ? t("form.reviewItem.editPending") : t("form.reviewItem.createPending")} cancelHref={item ? "/reviews" : undefined} cancelLabel={t("common.cancel")} />
      </form>
    </FormCard>
  );
}

export function ErrorLogForm({
  error,
  subjects,
  topics,
  exams,
  t,
}: {
  error?: ErrorLog;
  subjects: Subject[];
  topics: Topic[];
  exams: Exam[];
  t: TFunc;
}) {
  return (
    <FormCard
      title={error ? t("form.errorLog.editTitle") : t("form.errorLog.createTitle")}
      description={t("form.errorLog.description")}
    >
      <form action={error ? updateErrorLogAction : createErrorLogAction} className="space-y-5">
        {error ? <input type="hidden" name="id" value={error.id} /> : null}
        <input type="hidden" name="resolved" value="false" />
        <FieldGrid>
          <NativeSelectField label={t("form.errorLog.subjectLabel")} name="subjectId" options={relationOptions(subjects, t("form.errorLog.subjectEmpty"))} defaultValue={error?.subjectId} description={t("form.errorLog.subjectDescription")} />
          <NativeSelectField label={t("form.errorLog.topicLabel")} name="topicId" options={relationOptions(topics, t("form.errorLog.topicEmpty"))} defaultValue={error?.topicId} description={t("form.errorLog.topicDescription")} />
          <NativeSelectField label={t("form.errorLog.examLabel")} name="examId" options={relationOptions(exams, t("form.errorLog.examEmpty"))} defaultValue={error?.examId} description={t("form.errorLog.examDescription")} />
          <TextField label={t("form.errorLog.titleLabel")} name="title" defaultValue={error?.title} required placeholder={t("form.errorLog.titlePlaceholder")} description={t("form.errorLog.titleDescription")} />
          <NativeSelectField label={t("form.errorLog.typeLabel")} name="errorType" options={optionize(errorTypes)} defaultValue={error?.errorType ?? "other"} description={t("form.errorLog.typeDescription")} />
          <TextField label={t("form.errorLog.retestLabel")} name="retestAt" type="date" defaultValue={dateValue(error?.retestAt)} description={t("form.errorLog.retestDescription")} />
          <TextField label={t("form.errorLog.severityLabel")} name="severity" type="number" min={0} max={10} defaultValue={error?.severity ?? 5} description={t("form.errorLog.severityDescription")} />
          <TextField label={t("form.errorLog.recurrencesLabel")} name="recurrenceCount" type="number" min={0} defaultValue={error?.recurrenceCount ?? 0} description={t("form.errorLog.recurrencesDescription")} />
        </FieldGrid>
        <TextAreaField label={t("form.errorLog.whatLabel")} name="description" defaultValue={error?.description} placeholder={t("form.errorLog.whatPlaceholder")} description={t("form.errorLog.whatDescription")} />
        <TextAreaField label={t("form.errorLog.whyLabel")} name="cause" defaultValue={error?.cause} placeholder={t("form.errorLog.whyPlaceholder")} description={t("form.errorLog.whyDescription")} />
        <TextAreaField label={t("form.errorLog.correctionLabel")} name="correction" defaultValue={error?.correction} placeholder={t("form.errorLog.correctionPlaceholder")} description={t("form.errorLog.correctionDescription")} />
        <TextAreaField label={t("form.errorLog.preventionLabel")} name="preventionRule" defaultValue={error?.preventionRule} placeholder={t("form.errorLog.preventionPlaceholder")} description={t("form.errorLog.preventionDescription")} />
        <Field label={t("form.errorLog.resolvedLabel")}>
          <Input type="checkbox" name="resolved" defaultChecked={error?.resolved ?? false} className="h-5 w-5 rounded-md" />
        </Field>
        <SubmitBar label={error ? t("form.errorLog.editSubmit") : t("form.errorLog.createSubmit")} pendingLabel={error ? t("form.errorLog.editPending") : t("form.errorLog.createPending")} cancelHref={error ? "/errors" : undefined} cancelLabel={t("common.cancel")} />
      </form>
    </FormCard>
  );
}

export function QuizAttemptForm({
  subjects,
  topics,
  exams,
  examId,
  t,
}: {
  subjects: Subject[];
  topics: Topic[];
  exams: Exam[];
  examId?: string;
  t: TFunc;
}) {
  return (
    <FormCard title={t("form.quizAttempt.title")} description={t("form.quizAttempt.description")}>
      <form action={createQuizAttemptAction} className="space-y-5">
        <FieldGrid>
          <NativeSelectField label={t("form.quizAttempt.subjectLabel")} name="subjectId" options={relationOptions(subjects, t("form.quizAttempt.subjectEmpty"))} defaultValue={exams.find((exam) => exam.id === examId)?.subjectId} description={t("form.quizAttempt.subjectDescription")} />
          <NativeSelectField label={t("form.quizAttempt.topicLabel")} name="topicId" options={relationOptions(topics, t("form.quizAttempt.topicEmpty"))} description={t("form.quizAttempt.topicDescription")} />
          <NativeSelectField label={t("form.quizAttempt.examLabel")} name="examId" options={relationOptions(exams, t("form.quizAttempt.examEmpty"))} defaultValue={examId} description={t("form.quizAttempt.examDescription")} />
          <TextField label={t("form.quizAttempt.dateLabel")} name="date" type="date" defaultValue={formatISO(new Date(), { representation: "date" })} description={t("form.quizAttempt.dateDescription")} />
          <TextField label={t("form.quizAttempt.totalLabel")} name="totalQuestions" type="number" defaultValue={20} description={t("form.quizAttempt.totalDescription")} />
          <TextField label={t("form.quizAttempt.correctLabel")} name="correctAnswers" type="number" defaultValue={0} description={t("form.quizAttempt.correctDescription")} />
        </FieldGrid>
        <TextAreaField label={t("form.quizAttempt.reflectionsLabel")} name="notes" placeholder={t("form.quizAttempt.reflectionsPlaceholder")} description={t("form.quizAttempt.reflectionsDescription")} />
        <SubmitBar label={t("form.quizAttempt.submit")} pendingLabel={t("form.quizAttempt.pending")} />
      </form>
    </FormCard>
  );
}

export function DailyLogForm({ log, compact = false, t }: { log?: DailyLog | null; compact?: boolean; t: TFunc }) {
  return (
    <FormCard
      title={log?.id ? t("form.dailyLog.editTitle") : t("form.dailyLog.createTitle")}
      description={t("form.dailyLog.description")}
    >
      <form action={log?.id ? updateDailyLogAction : upsertDailyLogAction} className="space-y-5">
        {log?.id ? <input type="hidden" name="id" value={log.id} /> : null}
        <input type="hidden" name="movementDone" value="false" />
        <FieldGrid className={compact ? "xl:grid-cols-3" : undefined}>
          <TextField label={t("form.dailyLog.dateLabel")} name="date" type="date" defaultValue={log?.date ?? formatISO(new Date(), { representation: "date" })} description={t("form.dailyLog.dateDescription")} />
          <TextField label={t("form.dailyLog.sleepLabel")} name="sleepHours" type="number" defaultValue={log?.sleepHours ?? ""} placeholder={t("form.dailyLog.sleepPlaceholder")} description={t("form.dailyLog.sleepDescription")} />
          <TextField label={t("form.dailyLog.energyLabel")} name="energyLevel" type="number" min={0} max={10} defaultValue={log?.energyLevel ?? ""} description={t("form.dailyLog.energyDescription")} />
          <TextField label={t("form.dailyLog.stressLabel")} name="stressLevel" type="number" min={0} max={10} defaultValue={log?.stressLevel ?? ""} description={t("form.dailyLog.stressDescription")} />
          <TextField label={t("form.dailyLog.moodLabel")} name="moodLevel" type="number" min={0} max={10} defaultValue={log?.moodLevel ?? ""} description={t("form.dailyLog.moodDescription")} />
          <TextField label={t("form.dailyLog.studyLabel")} name="studyMinutes" type="number" defaultValue={log?.studyMinutes ?? 0} description={t("form.dailyLog.studyDescription")} />
          <TextField label={t("form.dailyLog.activeLabel")} name="activeRecallMinutes" type="number" defaultValue={log?.activeRecallMinutes ?? 0} description={t("form.dailyLog.activeDescription")} />
          <TextField label={t("form.dailyLog.passiveLabel")} name="passiveStudyMinutes" type="number" defaultValue={log?.passiveStudyMinutes ?? 0} description={t("form.dailyLog.passiveDescription")} />
        </FieldGrid>
        <Field label={t("form.dailyLog.movedLabel")}>
          <Input type="checkbox" name="movementDone" defaultChecked={log?.movementDone ?? false} className="h-5 w-5 rounded-md" />
        </Field>
        <TextAreaField label={t("form.dailyLog.reflectionsLabel")} name="notes" defaultValue={log?.notes} placeholder={t("form.dailyLog.reflectionsPlaceholder")} description={t("form.dailyLog.reflectionsDescription")} />
        <SubmitBar label={log?.id ? t("form.dailyLog.editSubmit") : t("form.dailyLog.createSubmit")} pendingLabel={log?.id ? t("form.dailyLog.editPending") : t("form.dailyLog.createPending")} cancelHref={log?.id ? "/daily-log" : undefined} cancelLabel={t("common.cancel")} />
      </form>
    </FormCard>
  );
}

export function GoalForm({ goal, t }: { goal?: Goal; t: TFunc }) {
  return (
    <FormCard title={goal ? t("form.goal.editTitle") : t("form.goal.createTitle")} description={t("form.goal.description")}>
      <form action={goal ? updateGoalAction : createGoalAction} className="space-y-5">
        {goal ? <input type="hidden" name="id" value={goal.id} /> : null}
        <FieldGrid>
          <TextField label={t("form.goal.titleLabel")} name="title" defaultValue={goal?.title} required placeholder={t("form.goal.titlePlaceholder")} description={t("form.goal.titleDescription")} />
          <NativeSelectField label={t("form.goal.typeLabel")} name="goalType" options={optionize(goalTypes)} defaultValue={goal?.goalType ?? "daily"} description={t("form.goal.typeDescription")} />
          <TextField label={t("form.goal.targetLabel")} name="targetDate" type="date" defaultValue={goal?.targetDate ?? ""} description={t("form.goal.targetDescription")} />
          <NativeSelectField label={t("form.goal.statusLabel")} name="status" options={optionize(goalStatuses)} defaultValue={goal?.status ?? "active"} description={t("form.goal.statusDescription")} />
          <TextField label={t("form.goal.priorityLabel")} name="priority" type="number" min={0} max={10} defaultValue={goal?.priority ?? 5} description={t("form.goal.priorityDescription")} />
        </FieldGrid>
        <TextAreaField label={t("form.goal.successLabel")} name="description" defaultValue={goal?.description} placeholder={t("form.goal.successPlaceholder")} description={t("form.goal.successDescription")} />
        <SubmitBar label={goal ? t("form.goal.editSubmit") : t("form.goal.createSubmit")} pendingLabel={goal ? t("form.goal.editPending") : t("form.goal.createPending")} cancelHref={goal ? "/goals" : undefined} cancelLabel={t("common.cancel")} />
      </form>
    </FormCard>
  );
}

export function TaskForm({
  task,
  subjects,
  exams,
  topics,
  t,
}: {
  task?: Task;
  subjects: Subject[];
  exams: Exam[];
  topics: Topic[];
  t: TFunc;
}) {
  return (
    <FormCard title={task ? t("form.task.editTitle") : t("form.task.createTitle")} description={t("form.task.description")}>
      <form action={task ? updateTaskAction : createTaskAction} className="space-y-5">
        {task ? <input type="hidden" name="id" value={task.id} /> : null}
        <FieldGrid>
          <TextField label={t("form.task.titleLabel")} name="title" defaultValue={task?.title} required placeholder={t("form.task.titlePlaceholder")} description={t("form.task.titleDescription")} />
          <TextField label={t("form.task.dueLabel")} name="dueAt" type="date" defaultValue={dateValue(task?.dueAt)} description={t("form.task.dueDescription")} />
          <NativeSelectField label={t("form.task.statusLabel")} name="status" options={optionize(taskStatuses)} defaultValue={task?.status ?? "todo"} description={t("form.task.statusDescription")} />
          <TextField label={t("form.task.priorityLabel")} name="priority" type="number" min={0} max={10} defaultValue={task?.priority ?? 5} description={t("form.task.priorityDescription")} />
          <NativeSelectField label={t("form.task.subjectLabel")} name="relatedSubjectId" options={relationOptions(subjects, t("form.task.subjectEmpty"))} defaultValue={task?.relatedSubjectId} description={t("form.task.subjectDescription")} />
          <NativeSelectField label={t("form.task.examLabel")} name="relatedExamId" options={relationOptions(exams, t("form.task.examEmpty"))} defaultValue={task?.relatedExamId} description={t("form.task.examDescription")} />
          <NativeSelectField label={t("form.task.topicLabel")} name="relatedTopicId" options={relationOptions(topics, t("form.task.topicEmpty"))} defaultValue={task?.relatedTopicId} description={t("form.task.topicDescription")} />
        </FieldGrid>
        <TextAreaField label={t("form.task.detailsLabel")} name="description" defaultValue={task?.description} placeholder={t("form.task.detailsPlaceholder")} description={t("form.task.detailsDescription")} />
        <SubmitBar label={task ? t("form.task.editSubmit") : t("form.task.createSubmit")} pendingLabel={task ? t("form.task.editPending") : t("form.task.createPending")} cancelHref={task ? "/goals" : undefined} cancelLabel={t("common.cancel")} />
      </form>
    </FormCard>
  );
}

export function IdentityNoteForm({
  note,
  cancelHref = "/identity",
  t,
}: {
  note?: IdentityNote;
  cancelHref?: string;
  t: TFunc;
}) {
  return (
    <FormCard title={note ? t("form.identityNote.editTitle") : t("form.identityNote.createTitle")} description={t("form.identityNote.description")}>
      <form action={note ? updateIdentityNoteAction : createIdentityNoteAction} className="space-y-5">
        {note ? <input type="hidden" name="id" value={note.id} /> : null}
        <FieldGrid>
          <TextField label={t("form.identityNote.titleLabel")} name="title" defaultValue={note?.title} required placeholder={t("form.identityNote.titlePlaceholder")} description={t("form.identityNote.titleDescription")} />
          <NativeSelectField label={t("form.identityNote.categoryLabel")} name="category" options={optionize(identityCategories)} defaultValue={note?.category ?? "professional_identity"} description={t("form.identityNote.categoryDescription")} />
        </FieldGrid>
        <TextAreaField label={t("form.identityNote.noteLabel")} name="content" defaultValue={note?.content} placeholder={t("form.identityNote.notePlaceholder")} description={t("form.identityNote.noteDescription")} />
        <SubmitBar label={note ? t("form.identityNote.editSubmit") : t("form.identityNote.createSubmit")} pendingLabel={note ? t("form.identityNote.editPending") : t("form.identityNote.createPending")} cancelHref={note ? cancelHref : undefined} cancelLabel={t("common.cancel")} />
      </form>
    </FormCard>
  );
}