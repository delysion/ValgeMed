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
    <Card className="overflow-hidden">
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
      description="Difficulty and importance shape how the system prioritizes your study time."
    >
      <form action={subject ? updateSubjectAction : createSubjectAction} className="space-y-5">
        {subject ? <input type="hidden" name="id" value={subject.id} /> : null}
        <FieldGrid>
          <TextField label="Subject name" name="name" defaultValue={subject?.name} required placeholder="e.g. Gross Anatomy..." description="The name you will see everywhere." />
          <TextField label="Course code" name="code" defaultValue={subject?.code} placeholder="e.g. AR-101..." description="Optional identifier for your records." />
          <TextField label="Theme color" name="color" defaultValue={subject?.color ?? "#5746E5"} description="Used to visually identify this subject in charts and lists." />
          <TextField label="Difficulty (0–10)" name="difficulty" type="number" min={0} max={10} defaultValue={subject?.difficulty ?? 5} description="How hard is this material for you personally?" />
          <TextField label="Importance (0–10)" name="importance" type="number" min={0} max={10} defaultValue={subject?.importance ?? 5} description="How critical is this subject for your goals?" />
        </FieldGrid>
        <TextAreaField label="Description & notes" name="description" defaultValue={subject?.description} placeholder="What this subject covers, key themes, exam weight, or personal strategy notes…" description="Anything that helps you remember why this subject matters." />
        <SubmitBar label={subject ? "Save Subject" : "Create Subject"} pendingLabel={subject ? "Saving Changes..." : "Creating Subject..."} cancelHref={subject ? "/subjects" : undefined} />
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
      description="Every exam becomes a command center with topics, errors, quizzes and a battle plan."
    >
      <form action={exam ? updateExamAction : createExamAction} className="space-y-5">
        {exam ? <input type="hidden" name="id" value={exam.id} /> : null}
        <FieldGrid>
          <NativeSelectField label="Subject" name="subjectId" options={relationOptions(subjects, "Select a subject")} defaultValue={exam?.subjectId} description="Which subject does this exam belong to?" />
          <TextField label="Exam title" name="title" defaultValue={exam?.title} required placeholder="e.g. Pharmacology Final..." description="A clear name you will recognize under pressure." />
          <TextField label="Exam date" name="examDate" type="date" defaultValue={dateValue(exam?.examDate)} description="Used to calculate urgency and countdown." />
          <TextField label="ECTS credits" name="ects" type="number" defaultValue={exam?.ects ?? ""} description="Credit points if applicable." />
          <NativeSelectField label="Exam format" name="format" options={optionize(examFormats)} defaultValue={exam?.format ?? "unknown"} description="Oral, written, practical, or mixed." />
          <TextField label="Difficulty (0–10)" name="difficulty" type="number" min={0} max={10} defaultValue={exam?.difficulty ?? 5} description="How hard is the exam content?" />
          <TextField label="Importance (0–10)" name="importance" type="number" min={0} max={10} defaultValue={exam?.importance ?? 5} description="How much does this exam affect your trajectory?" />
        </FieldGrid>
        <TextAreaField label="Notes & strategy" name="notes" defaultValue={exam?.notes} placeholder="Format details, special rules, professor preferences, or your personal preparation strategy…" description="Anything that might affect how you prepare." />
        <SubmitBar label={exam ? "Save Exam" : "Create Exam"} pendingLabel={exam ? "Saving Changes..." : "Creating Exam..."} cancelHref={exam ? "/exams" : undefined} />
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
      description="Confidence and priority guide how the system schedules your recall and revision."
    >
      <form action={topic ? updateTopicAction : createTopicAction} className="space-y-5">
        {topic ? <input type="hidden" name="id" value={topic.id} /> : null}
        <FieldGrid>
          <NativeSelectField label="Subject" name="subjectId" options={relationOptions(subjects, "Select a subject")} defaultValue={topic?.subjectId} description="Organizes topics by subject." />
          <NativeSelectField label="Linked exam" name="examId" options={relationOptions(exams, "None")} defaultValue={topic?.examId} description="Connects this topic to an exam for readiness tracking." />
          <TextField label="Topic title" name="title" defaultValue={topic?.title} required placeholder="e.g. Cardiac Cycle..." description="A specific, actionable name you will recognize." />
          <NativeSelectField label="Status" name="status" options={optionize(topicStatuses)} defaultValue={topic?.status ?? "not_started"} description="Where are you in the learning process?" />
          <TextField label="Difficulty (0–10)" name="difficulty" type="number" min={0} max={10} defaultValue={topic?.difficulty ?? 5} description="How hard is this material?" />
          <TextField label="Priority (0–10)" name="priority" type="number" min={0} max={10} defaultValue={topic?.priority ?? 5} description="How urgent is this topic right now?" />
          <TextField label="Confidence (0–10)" name="confidence" type="number" min={0} max={10} defaultValue={topic?.confidence ?? 0} description="How well do you know this today? Be honest." />
          <TextField label="Last studied" name="lastStudiedAt" type="date" defaultValue={dateValue(topic?.lastStudiedAt)} description="When did you last review this topic?" />
          <TextField label="Next review" name="nextReviewAt" type="date" defaultValue={dateValue(topic?.nextReviewAt)} description="When should you review this next?" />
        </FieldGrid>
        <TextAreaField label="Description & key concepts" name="description" defaultValue={topic?.description} placeholder="Key concepts, subtopics, equations to memorize, or common traps…" description="A quick reference for future you." />
        <SubmitBar label={topic ? "Save Topic" : "Create Topic"} pendingLabel={topic ? "Saving Changes..." : "Creating Topic..."} cancelHref={topic ? "/topics" : undefined} />
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
      description="Track method, focus, energy and output. Quality beats quantity every time."
    >
      <form action={session ? updateStudySessionAction : createStudySessionAction} className="space-y-5">
        {session ? <input type="hidden" name="id" value={session.id} /> : null}
        <FieldGrid>
          <NativeSelectField label="Subject" name="subjectId" options={relationOptions(subjects, "Select a subject")} defaultValue={session?.subjectId} description="What subject were you studying?" />
          <NativeSelectField label="Topic" name="topicId" options={relationOptions(topics, "None")} defaultValue={session?.topicId} description="Which specific topic?" />
          <NativeSelectField label="Exam" name="examId" options={relationOptions(exams, "None")} defaultValue={session?.examId} description="Link to an exam if relevant." />
          <TextField label="Start time" name="startedAt" type="datetime-local" defaultValue={dateTimeValue(session?.startedAt) || dateTimeValue(new Date())} required description="When did the session begin?" />
          <TextField label="End time" name="endedAt" type="datetime-local" defaultValue={dateTimeValue(session?.endedAt)} description="When did it finish?" />
          <TextField label="Duration (minutes)" name="durationMinutes" type="number" defaultValue={session?.durationMinutes ?? 50} required description="How long did you study?" />
          <NativeSelectField label="Study method" name="method" options={optionize(studyMethods)} defaultValue={session?.method ?? "mixed"} description="Active recall is highest yield." />
          <TextField label="Focus level (0–10)" name="focusLevel" type="number" min={0} max={10} defaultValue={session?.focusLevel ?? 7} description="How focused were you, honestly?" />
          <TextField label="Energy level (0–10)" name="energyLevel" type="number" min={0} max={10} defaultValue={session?.energyLevel ?? 7} description="How did you feel physically and mentally?" />
          <TextField label="Output quality (0–10)" name="outputQuality" type="number" min={0} max={10} defaultValue={session?.outputQuality ?? 7} description="How much did you actually learn and retain?" />
        </FieldGrid>
        <TextAreaField label="Session notes" name="notes" defaultValue={session?.notes} placeholder="What worked, what didn't, key insights, or what to review next time…" description="These notes become your personal playbook." />
        <SubmitBar label={session ? "Save Session" : "Log Session"} pendingLabel={session ? "Saving Changes..." : "Logging Session..."} cancelHref={session ? "/study-sessions" : undefined} />
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
        <TextAreaField label="Question" name="question" defaultValue={item?.question} placeholder="What does the heart's conduction system consist of?..." />
        <TextAreaField label="Answer" name="answer" defaultValue={item?.answer} placeholder="SA node, AV node, Bundle of His, Purkinje fibers..." />
        <Field label="Active">
          <Input type="checkbox" name="isActive" defaultChecked={item?.isActive ?? true} className="h-4 w-4" />
        </Field>
        <SubmitBar label={item ? "Save Item" : "Create Item"} pendingLabel={item ? "Saving Changes..." : "Creating Item..."} cancelHref={item ? "/reviews" : undefined} />
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
      title={error ? "Edit Error" : "Log an Error"}
      description="Errors become prevention rules. Every mistake is data for the system."
    >
      <form action={error ? updateErrorLogAction : createErrorLogAction} className="space-y-5">
        {error ? <input type="hidden" name="id" value={error.id} /> : null}
        <input type="hidden" name="resolved" value="false" />
        <FieldGrid>
          <NativeSelectField label="Subject" name="subjectId" options={relationOptions(subjects, "Select a subject")} defaultValue={error?.subjectId} description="Which subject was this error in?" />
          <NativeSelectField label="Topic" name="topicId" options={relationOptions(topics, "None")} defaultValue={error?.topicId} description="Narrow down to a specific topic." />
          <NativeSelectField label="Exam" name="examId" options={relationOptions(exams, "None")} defaultValue={error?.examId} description="Was this related to a specific exam?" />
          <TextField label="Error title" name="title" defaultValue={error?.title} required placeholder="e.g. Confused systole with diastole..." description="A short, clear description of the mistake." />
          <NativeSelectField label="Error type" name="errorType" options={optionize(errorTypes)} defaultValue={error?.errorType ?? "other"} description="Categorize to spot patterns." />
          <TextField label="Retest date" name="retestAt" type="date" defaultValue={dateValue(error?.retestAt)} description="When will you test yourself on this again?" />
          <TextField label="Severity (0–10)" name="severity" type="number" min={0} max={10} defaultValue={error?.severity ?? 5} description="How serious is this gap in knowledge?" />
          <TextField label="Recurrences" name="recurrenceCount" type="number" min={0} defaultValue={error?.recurrenceCount ?? 0} description="How many times has this same error happened?" />
        </FieldGrid>
        <TextAreaField label="What went wrong?" name="description" defaultValue={error?.description} placeholder="Describe the mistake clearly. What did you answer? What was correct?" description="Be specific. Future you will thank present you." />
        <TextAreaField label="Why did it happen?" name="cause" defaultValue={error?.cause} placeholder="Misunderstanding? Rushed? Forgot a key fact? Confused two similar concepts?" description="Understanding the root cause prevents recurrence." />
        <TextAreaField label="The correct understanding" name="correction" defaultValue={error?.correction} placeholder="Write out the correct answer or approach in your own words." description="Teaching yourself the right way cements the correction." />
        <TextAreaField label="Prevention rule" name="preventionRule" defaultValue={error?.preventionRule} placeholder="e.g. Always trace the conduction pathway before answering." description="A simple rule that would have prevented this error." />
        <Field label="Resolved">
          <Input type="checkbox" name="resolved" defaultChecked={error?.resolved ?? false} className="h-5 w-5 rounded-md" />
        </Field>
        <SubmitBar label={error ? "Save Error" : "Log Error & Learn"} pendingLabel={error ? "Saving Changes..." : "Logging Error..."} cancelHref={error ? "/errors" : undefined} />
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
    <FormCard title="New Quiz Attempt" description="Track real accuracy. Feelings of familiarity are not evidence of knowledge.">
      <form action={createQuizAttemptAction} className="space-y-5">
        <FieldGrid>
          <NativeSelectField label="Subject" name="subjectId" options={relationOptions(subjects, "Select a subject")} defaultValue={exams.find((exam) => exam.id === examId)?.subjectId} description="Which subject was tested?" />
          <NativeSelectField label="Topic" name="topicId" options={relationOptions(topics, "None")} description="Which specific topic, if any?" />
          <NativeSelectField label="Exam" name="examId" options={relationOptions(exams, "None")} defaultValue={examId} description="Preparing for a specific exam?" />
          <TextField label="Date" name="date" type="date" defaultValue={formatISO(new Date(), { representation: "date" })} description="When did you take this quiz?" />
          <TextField label="Total questions" name="totalQuestions" type="number" defaultValue={20} description="How many questions were on the quiz?" />
          <TextField label="Correct answers" name="correctAnswers" type="number" defaultValue={0} description="How many did you answer correctly? Be honest." />
        </FieldGrid>
        <TextAreaField label="Reflections" name="notes" placeholder="Which topics were hardest? What patterns did you notice? What will you review before the next attempt?" description="These reflections guide your next study session." />
        <SubmitBar label="Record Quiz Result" pendingLabel="Recording Result..." />
      </form>
    </FormCard>
  );
}

export function DailyLogForm({ log, compact = false }: { log?: DailyLog | null; compact?: boolean }) {
  return (
    <FormCard
      title={log ? "Update Daily Log" : "Daily Log"}
      description="Sleep, energy and stress shape the plan. These are not decorative details."
    >
      <form action={log?.id ? updateDailyLogAction : upsertDailyLogAction} className="space-y-5">
        {log?.id ? <input type="hidden" name="id" value={log.id} /> : null}
        <input type="hidden" name="movementDone" value="false" />
        <FieldGrid className={compact ? "xl:grid-cols-3" : undefined}>
          <TextField label="Date" name="date" type="date" defaultValue={log?.date ?? formatISO(new Date(), { representation: "date" })} description="Which day is this log for?" />
          <TextField label="Sleep (hours)" name="sleepHours" type="number" defaultValue={log?.sleepHours ?? ""} placeholder="e.g. 7.5" description="Total hours of sleep last night." />
          <TextField label="Energy (0–10)" name="energyLevel" type="number" min={0} max={10} defaultValue={log?.energyLevel ?? ""} description="How energetic did you feel today?" />
          <TextField label="Stress (0–10)" name="stressLevel" type="number" min={0} max={10} defaultValue={log?.stressLevel ?? ""} description="How stressed or overwhelmed did you feel?" />
          <TextField label="Mood (0–10)" name="moodLevel" type="number" min={0} max={10} defaultValue={log?.moodLevel ?? ""} description="Overall emotional state today." />
          <TextField label="Total study (min)" name="studyMinutes" type="number" defaultValue={log?.studyMinutes ?? 0} description="All study time combined." />
          <TextField label="Active recall (min)" name="activeRecallMinutes" type="number" defaultValue={log?.activeRecallMinutes ?? 0} description="Time spent on active recall specifically." />
          <TextField label="Passive study (min)" name="passiveStudyMinutes" type="number" defaultValue={log?.passiveStudyMinutes ?? 0} description="Reading, notes, videos without active testing." />
        </FieldGrid>
        <Field label="Did you move today?">
          <Input type="checkbox" name="movementDone" defaultChecked={log?.movementDone ?? false} className="h-5 w-5 rounded-md" />
        </Field>
        <TextAreaField label="Daily reflections" name="notes" defaultValue={log?.notes} placeholder="How was today? What affected your focus? What will you do differently tomorrow?" description="Short reflections compound into long-term self-awareness." />
        <SubmitBar label={log?.id ? "Save Log" : "Log Today"} pendingLabel={log?.id ? "Saving Changes..." : "Logging Today..."} cancelHref={log?.id ? "/daily-log" : undefined} />
      </form>
    </FormCard>
  );
}

export function GoalForm({ goal }: { goal?: Goal }) {
  return (
    <FormCard title={goal ? "Edit Goal" : "New Goal"} description="Academic, health and professional identity goals that shape your trajectory.">
      <form action={goal ? updateGoalAction : createGoalAction} className="space-y-5">
        {goal ? <input type="hidden" name="id" value={goal.id} /> : null}
        <FieldGrid>
          <TextField label="Goal title" name="title" defaultValue={goal?.title} required placeholder="e.g. Master ECG interpretation..." description="A specific, measurable goal you can act on." />
          <NativeSelectField label="Goal type" name="goalType" options={optionize(goalTypes)} defaultValue={goal?.goalType ?? "daily"} description="Daily, weekly, semester, or career goal?" />
          <TextField label="Target date" name="targetDate" type="date" defaultValue={goal?.targetDate ?? ""} description="When do you want to achieve this by?" />
          <NativeSelectField label="Status" name="status" options={optionize(goalStatuses)} defaultValue={goal?.status ?? "active"} description="Is this currently active or on hold?" />
          <TextField label="Priority (0–10)" name="priority" type="number" min={0} max={10} defaultValue={goal?.priority ?? 5} description="How does this compare to your other goals?" />
        </FieldGrid>
        <TextAreaField label="What does success look like?" name="description" defaultValue={goal?.description} placeholder="Describe the goal in detail. How will you know when you have achieved it? What are the milestones?" description="Specificity increases commitment and clarity." />
        <SubmitBar label={goal ? "Save Goal" : "Set Goal"} pendingLabel={goal ? "Saving Changes..." : "Setting Goal..."} cancelHref={goal ? "/goals" : undefined} />
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
    <FormCard title={task ? "Edit Task" : "New Task"} description="Concrete actions linked to your subjects, exams, and topics.">
      <form action={task ? updateTaskAction : createTaskAction} className="space-y-5">
        {task ? <input type="hidden" name="id" value={task.id} /> : null}
        <FieldGrid>
          <TextField label="Task title" name="title" defaultValue={task?.title} required placeholder="e.g. Review pharmacology flashcards..." description="A clear, actionable next step." />
          <TextField label="Due date" name="dueAt" type="date" defaultValue={dateValue(task?.dueAt)} description="When does this need to be done?" />
          <NativeSelectField label="Status" name="status" options={optionize(taskStatuses)} defaultValue={task?.status ?? "todo"} description="Current progress on this task." />
          <TextField label="Priority (0–10)" name="priority" type="number" min={0} max={10} defaultValue={task?.priority ?? 5} description="How urgent is this compared to other tasks?" />
          <NativeSelectField label="Subject" name="relatedSubjectId" options={relationOptions(subjects, "None")} defaultValue={task?.relatedSubjectId} description="Which subject is this task for?" />
          <NativeSelectField label="Exam" name="relatedExamId" options={relationOptions(exams, "None")} defaultValue={task?.relatedExamId} description="Is this preparing for a specific exam?" />
          <NativeSelectField label="Topic" name="relatedTopicId" options={relationOptions(topics, "None")} defaultValue={task?.relatedTopicId} description="Which topic does this task cover?" />
        </FieldGrid>
        <TextAreaField label="Details & resources" name="description" defaultValue={task?.description} placeholder="Additional context, resources, specific steps, or why this task matters…" description="Notes that help you pick this up quickly later." />
        <SubmitBar label={task ? "Save Task" : "Add Task"} pendingLabel={task ? "Saving Changes..." : "Adding Task..."} cancelHref={task ? "/goals" : undefined} />
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
    <FormCard title={note ? "Edit Identity Note" : "Identity Note"} description="Personal standards and identity as a future professional. This is your compass.">
      <form action={note ? updateIdentityNoteAction : createIdentityNoteAction} className="space-y-5">
        {note ? <input type="hidden" name="id" value={note.id} /> : null}
        <FieldGrid>
          <TextField label="Note title" name="title" defaultValue={note?.title} required placeholder="e.g. My clinical philosophy..." description="A theme or principle you want to remember." />
          <NativeSelectField label="Category" name="category" options={optionize(identityCategories)} defaultValue={note?.category ?? "professional_identity"} description="What area of your identity does this touch?" />
        </FieldGrid>
        <TextAreaField label="Your note" name="content" defaultValue={note?.content} placeholder="What kind of doctor or dentist do you want to become? What principles will guide your decisions under pressure?" description="Write honestly. This is private and for your future self." />
        <SubmitBar label={note ? "Save Note" : "Create Note"} pendingLabel={note ? "Saving Changes..." : "Creating Note..."} cancelHref={note ? cancelHref : undefined} />
      </form>
    </FormCard>
  );
}
