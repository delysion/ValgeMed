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
      title={subject ? "Edit Subject" : "New Subject"}
      description="Difficulty and importance shape priority, risk and progression."
    >
      <form action={subject ? updateSubjectAction : createSubjectAction} className="space-y-3">
        {subject ? <input type="hidden" name="id" value={subject.id} /> : null}
        <FieldGrid>
          <TextField label="Name" name="name" defaultValue={subject?.name} required placeholder="e.g. Human Anatomy" />
          <TextField label="Code" name="code" defaultValue={subject?.code} placeholder="e.g. AR-101" description="Course code if applicable." />
          <TextField label="Color" name="color" defaultValue={subject?.color ?? "#4F46E5"} description="Hex color for visual identification." />
          <TextField label="Difficulty" name="difficulty" type="number" min={0} max={10} defaultValue={subject?.difficulty ?? 0} description="0–10 scale." />
          <TextField label="Importance" name="importance" type="number" min={0} max={10} defaultValue={subject?.importance ?? 0} description="0–10 scale." />
        </FieldGrid>
        <TextAreaField label="Description" name="description" defaultValue={subject?.description} placeholder="What this subject covers, key themes, or personal notes…" />
        <SubmitBar label={subject ? "Save Subject" : "Create Subject"} cancelHref={subject ? "/subjects" : undefined} />
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
      title={exam ? "Edit Exam" : "New Exam"}
      description="Every exam becomes a command center with topics, errors, quizzes and a plan."
    >
      <form action={exam ? updateExamAction : createExamAction} className="space-y-3">
        {exam ? <input type="hidden" name="id" value={exam.id} /> : null}
        <FieldGrid>
          <NativeSelectField label="Subject" name="subjectId" options={relationOptions(subjects, "Select")} defaultValue={exam?.subjectId} />
          <TextField label="Title" name="title" defaultValue={exam?.title} required placeholder="e.g. Pharmacology Final" />
          <TextField label="Date" name="examDate" type="date" defaultValue={dateValue(exam?.examDate)} />
          <TextField label="ECTS" name="ects" type="number" defaultValue={exam?.ects ?? ""} description="Credit points." />
          <NativeSelectField label="Format" name="format" options={optionize(examFormats)} defaultValue={exam?.format ?? "unknown"} />
          <TextField label="Difficulty" name="difficulty" type="number" min={0} max={10} defaultValue={exam?.difficulty ?? 0} description="0–10 scale." />
          <TextField label="Importance" name="importance" type="number" min={0} max={10} defaultValue={exam?.importance ?? 0} description="0–10 scale." />
        </FieldGrid>
        <TextAreaField label="Notes" name="notes" defaultValue={exam?.notes} placeholder="Format details, special rules, or preparation tips…" />
        <SubmitBar label={exam ? "Save Exam" : "Create Exam"} cancelHref={exam ? "/exams" : undefined} />
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
      title={topic ? "Edit Topic" : "New Topic"}
      description="Confidence, priority and next review guide recall and revision."
    >
      <form action={topic ? updateTopicAction : createTopicAction} className="space-y-3">
        {topic ? <input type="hidden" name="id" value={topic.id} /> : null}
        <FieldGrid>
          <NativeSelectField label="Subject" name="subjectId" options={relationOptions(subjects, "Select")} defaultValue={topic?.subjectId} />
          <NativeSelectField label="Exam" name="examId" options={relationOptions(exams)} defaultValue={topic?.examId} />
          <TextField label="Title" name="title" defaultValue={topic?.title} required placeholder="e.g. Cardiac Cycle" />
          <NativeSelectField label="Status" name="status" options={optionize(topicStatuses)} defaultValue={topic?.status ?? "not_started"} />
          <TextField label="Difficulty" name="difficulty" type="number" min={0} max={10} defaultValue={topic?.difficulty ?? 0} description="0–10 scale." />
          <TextField label="Priority" name="priority" type="number" min={0} max={10} defaultValue={topic?.priority ?? 0} description="0–10 scale." />
          <TextField label="Confidence" name="confidence" type="number" min={0} max={10} defaultValue={topic?.confidence ?? 0} description="0–10 scale." />
          <TextField label="Last studied" name="lastStudiedAt" type="date" defaultValue={dateValue(topic?.lastStudiedAt)} />
          <TextField label="Next review" name="nextReviewAt" type="date" defaultValue={dateValue(topic?.nextReviewAt)} />
        </FieldGrid>
        <TextAreaField label="Description" name="description" defaultValue={topic?.description} placeholder="Key concepts, subtopics, or learning objectives…" />
        <SubmitBar label={topic ? "Save Topic" : "Create Topic"} cancelHref={topic ? "/topics" : undefined} />
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
      title={session ? "Edit Session" : "New Session"}
      description="Track method, focus, energy and output: yield per hour, not just hours."
    >
      <form action={session ? updateStudySessionAction : createStudySessionAction} className="space-y-3">
        {session ? <input type="hidden" name="id" value={session.id} /> : null}
        <FieldGrid>
          <NativeSelectField label="Subject" name="subjectId" options={relationOptions(subjects, "Select")} defaultValue={session?.subjectId} />
          <NativeSelectField label="Topic" name="topicId" options={relationOptions(topics)} defaultValue={session?.topicId} />
          <NativeSelectField label="Exam" name="examId" options={relationOptions(exams)} defaultValue={session?.examId} />
          <TextField label="Start" name="startedAt" type="datetime-local" defaultValue={dateTimeValue(session?.startedAt) || dateTimeValue(new Date())} required />
          <TextField label="End" name="endedAt" type="datetime-local" defaultValue={dateTimeValue(session?.endedAt)} />
          <TextField label="Minutes" name="durationMinutes" type="number" defaultValue={session?.durationMinutes ?? 50} required description="Duration in minutes." />
          <NativeSelectField label="Method" name="method" options={optionize(studyMethods)} defaultValue={session?.method ?? "mixed"} />
          <TextField label="Focus" name="focusLevel" type="number" min={0} max={10} defaultValue={session?.focusLevel ?? 7} description="0–10 scale." />
          <TextField label="Energy" name="energyLevel" type="number" min={0} max={10} defaultValue={session?.energyLevel ?? 7} description="0–10 scale." />
          <TextField label="Output" name="outputQuality" type="number" min={0} max={10} defaultValue={session?.outputQuality ?? 7} description="0–10 scale." />
        </FieldGrid>
        <TextAreaField label="Notes" name="notes" defaultValue={session?.notes} placeholder="What worked, what didn't, key insights…" />
        <SubmitBar label={session ? "Save Session" : "Create Session"} cancelHref={session ? "/study-sessions" : undefined} />
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
      title={item ? "Edit Review Item" : "New Review Item"}
      description="Open questions and flashcards stay local, no AI or external cloud."
    >
      <form action={item ? updateReviewItemAction : createReviewItemAction} className="space-y-3">
        {item ? <input type="hidden" name="id" value={item.id} /> : null}
        <input type="hidden" name="isActive" value="false" />
        <FieldGrid>
          <NativeSelectField label="Subject" name="subjectId" options={relationOptions(subjects, "Select")} defaultValue={item?.subjectId} />
          <NativeSelectField label="Topic" name="topicId" options={relationOptions(topics)} defaultValue={item?.topicId} />
          <NativeSelectField label="Type" name="reviewType" options={optionize(reviewTypes)} defaultValue={item?.reviewType ?? "flashcard"} />
          <TextField label="Confidence" name="confidence" type="number" min={0} max={10} defaultValue={item?.confidence ?? 0} description="0–10 scale." />
          <TextField label="Interval days" name="intervalDays" type="number" defaultValue={item?.intervalDays ?? 1} description="Days between reviews." />
          <TextField label="Due" name="dueAt" type="date" defaultValue={dateValue(item?.dueAt) || dateValue(new Date())} />
        </FieldGrid>
        <TextAreaField label="Question" name="question" defaultValue={item?.question} placeholder="What does the heart's conduction system consist of?" />
        <TextAreaField label="Answer" name="answer" defaultValue={item?.answer} placeholder="SA node, AV node, Bundle of His, Purkinje fibers." />
        <Field label="Active">
          <Input type="checkbox" name="isActive" defaultChecked={item?.isActive ?? true} className="h-4 w-4" />
        </Field>
        <SubmitBar label={item ? "Save Item" : "Create Item"} cancelHref={item ? "/reviews" : undefined} />
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
      title={error ? "Edit Error" : "New Error"}
      description="Errors become prevention rules, not personal blame."
    >
      <form action={error ? updateErrorLogAction : createErrorLogAction} className="space-y-3">
        {error ? <input type="hidden" name="id" value={error.id} /> : null}
        <input type="hidden" name="resolved" value="false" />
        <FieldGrid>
          <NativeSelectField label="Subject" name="subjectId" options={relationOptions(subjects, "Select")} defaultValue={error?.subjectId} />
          <NativeSelectField label="Topic" name="topicId" options={relationOptions(topics)} defaultValue={error?.topicId} />
          <NativeSelectField label="Exam" name="examId" options={relationOptions(exams)} defaultValue={error?.examId} />
          <TextField label="Title" name="title" defaultValue={error?.title} required placeholder="e.g. Confused systole with diastole" />
          <NativeSelectField label="Type" name="errorType" options={optionize(errorTypes)} defaultValue={error?.errorType ?? "other"} />
          <TextField label="Retest" name="retestAt" type="date" defaultValue={dateValue(error?.retestAt)} description="When to retest this error." />
          <TextField label="Severity" name="severity" type="number" min={0} max={10} defaultValue={error?.severity ?? 0} description="0–10 scale." />
          <TextField label="Recurrences" name="recurrenceCount" type="number" min={0} defaultValue={error?.recurrenceCount ?? 0} description="How many times it has recurred." />
        </FieldGrid>
        <TextAreaField label="Description" name="description" defaultValue={error?.description} placeholder="What was the mistake? What was the right answer?" />
        <TextAreaField label="Cause" name="cause" defaultValue={error?.cause} placeholder="Why did it happen? Misunderstanding, lack of practice, haste?" />
        <TextAreaField label="Correction" name="correction" defaultValue={error?.correction} placeholder="What is the correct understanding or approach?" />
        <TextAreaField label="Prevention rule" name="preventionRule" defaultValue={error?.preventionRule} placeholder="e.g. Always trace the pathway before answering." />
        <Field label="Resolved">
          <Input type="checkbox" name="resolved" defaultChecked={error?.resolved ?? false} className="h-4 w-4" />
        </Field>
        <SubmitBar label={error ? "Save Error" : "Create Error"} cancelHref={error ? "/errors" : undefined} />
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
    <FormCard title="New Quiz Attempt" description="Real accuracy, not a feeling of familiarity.">
      <form action={createQuizAttemptAction} className="space-y-3">
        <FieldGrid>
          <NativeSelectField label="Subject" name="subjectId" options={relationOptions(subjects, "Select")} defaultValue={exams.find((exam) => exam.id === examId)?.subjectId} />
          <NativeSelectField label="Topic" name="topicId" options={relationOptions(topics)} />
          <NativeSelectField label="Exam" name="examId" options={relationOptions(exams)} defaultValue={examId} />
          <TextField label="Date" name="date" type="date" defaultValue={formatISO(new Date(), { representation: "date" })} />
          <TextField label="Questions" name="totalQuestions" type="number" defaultValue={20} description="Total questions in the quiz." />
          <TextField label="Correct" name="correctAnswers" type="number" defaultValue={0} description="How many did you get right?" />
        </FieldGrid>
        <TextAreaField label="Notes" name="notes" placeholder="Which topics were hardest?" />
        <SubmitBar label="Record Quiz" />
      </form>
    </FormCard>
  );
}

export function DailyLogForm({ log, compact = false }: { log?: DailyLog | null; compact?: boolean }) {
  return (
    <FormCard
      title={log ? "Update Daily Log" : "Daily Log"}
      description="Sleep, energy and stress weigh on the plan: they are not decorative details."
    >
      <form action={log?.id ? updateDailyLogAction : upsertDailyLogAction} className="space-y-3">
        {log?.id ? <input type="hidden" name="id" value={log.id} /> : null}
        <input type="hidden" name="movementDone" value="false" />
        <FieldGrid className={compact ? "xl:grid-cols-3" : undefined}>
          <TextField label="Date" name="date" type="date" defaultValue={log?.date ?? formatISO(new Date(), { representation: "date" })} />
          <TextField label="Sleep" name="sleepHours" type="number" defaultValue={log?.sleepHours ?? ""} placeholder="e.g. 7.5" description="Hours of sleep." />
          <TextField label="Energy" name="energyLevel" type="number" min={0} max={10} defaultValue={log?.energyLevel ?? ""} description="0–10 scale." />
          <TextField label="Stress" name="stressLevel" type="number" min={0} max={10} defaultValue={log?.stressLevel ?? ""} description="0–10 scale." />
          <TextField label="Mood" name="moodLevel" type="number" min={0} max={10} defaultValue={log?.moodLevel ?? ""} description="0–10 scale." />
          <TextField label="Study min" name="studyMinutes" type="number" defaultValue={log?.studyMinutes ?? 0} description="Total study time." />
          <TextField label="Recall min" name="activeRecallMinutes" type="number" defaultValue={log?.activeRecallMinutes ?? 0} description="Active recall time." />
          <TextField label="Passive min" name="passiveStudyMinutes" type="number" defaultValue={log?.passiveStudyMinutes ?? 0} description="Passive study time." />
        </FieldGrid>
        <Field label="Movement">
          <Input type="checkbox" name="movementDone" defaultChecked={log?.movementDone ?? false} className="h-4 w-4" />
        </Field>
        <TextAreaField label="Notes" name="notes" defaultValue={log?.notes} placeholder="How was today? What affected your focus?" />
        <SubmitBar label={log?.id ? "Save Log" : "Log Today"} cancelHref={log?.id ? "/daily-log" : undefined} />
      </form>
    </FormCard>
  );
}

export function GoalForm({ goal }: { goal?: Goal }) {
  return (
    <FormCard title={goal ? "Edit Goal" : "New Goal"} description="Academic, health and professional identity goals.">
      <form action={goal ? updateGoalAction : createGoalAction} className="space-y-3">
        {goal ? <input type="hidden" name="id" value={goal.id} /> : null}
        <FieldGrid>
          <TextField label="Title" name="title" defaultValue={goal?.title} required placeholder="e.g. Master ECG interpretation" />
          <NativeSelectField label="Type" name="goalType" options={optionize(goalTypes)} defaultValue={goal?.goalType ?? "daily"} />
          <TextField label="Target" name="targetDate" type="date" defaultValue={goal?.targetDate ?? ""} description="When should this be achieved?" />
          <NativeSelectField label="Status" name="status" options={optionize(goalStatuses)} defaultValue={goal?.status ?? "active"} />
          <TextField label="Priority" name="priority" type="number" min={0} max={10} defaultValue={goal?.priority ?? 0} description="0–10 scale." />
        </FieldGrid>
        <TextAreaField label="Description" name="description" defaultValue={goal?.description} placeholder="What does success look like? How will you measure it?" />
        <SubmitBar label={goal ? "Save Goal" : "Create Goal"} cancelHref={goal ? "/goals" : undefined} />
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
    <FormCard title={task ? "Edit Task" : "New Task"} description="Concrete actions linked to subject, exam or topic.">
      <form action={task ? updateTaskAction : createTaskAction} className="space-y-3">
        {task ? <input type="hidden" name="id" value={task.id} /> : null}
        <FieldGrid>
          <TextField label="Title" name="title" defaultValue={task?.title} required placeholder="e.g. Review pharm flashcards" />
          <TextField label="Due" name="dueAt" type="date" defaultValue={dateValue(task?.dueAt)} />
          <NativeSelectField label="Status" name="status" options={optionize(taskStatuses)} defaultValue={task?.status ?? "todo"} />
          <TextField label="Priority" name="priority" type="number" min={0} max={10} defaultValue={task?.priority ?? 0} description="0–10 scale." />
          <NativeSelectField label="Subject" name="relatedSubjectId" options={relationOptions(subjects)} defaultValue={task?.relatedSubjectId} />
          <NativeSelectField label="Exam" name="relatedExamId" options={relationOptions(exams)} defaultValue={task?.relatedExamId} />
          <NativeSelectField label="Topic" name="relatedTopicId" options={relationOptions(topics)} defaultValue={task?.relatedTopicId} />
        </FieldGrid>
        <TextAreaField label="Description" name="description" defaultValue={task?.description} placeholder="Additional context, resources, or steps…" />
        <SubmitBar label={task ? "Save Task" : "Create Task"} cancelHref={task ? "/goals" : undefined} />
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
    <FormCard title={note ? "Edit Identity Note" : "Identity Note"} description="Personal standards and identity as a future professional.">
      <form action={note ? updateIdentityNoteAction : createIdentityNoteAction} className="space-y-3">
        {note ? <input type="hidden" name="id" value={note.id} /> : null}
        <FieldGrid>
          <TextField label="Title" name="title" defaultValue={note?.title} required placeholder="e.g. My clinical philosophy" />
          <NativeSelectField label="Category" name="category" options={optionize(identityCategories)} defaultValue={note?.category ?? "professional_identity"} />
        </FieldGrid>
        <TextAreaField label="Content" name="content" defaultValue={note?.content} placeholder="What kind of doctor or dentist do you want to become?" />
        <SubmitBar label={note ? "Save Note" : "Create Note"} cancelHref={note ? cancelHref : undefined} />
      </form>
    </FormCard>
  );
}
