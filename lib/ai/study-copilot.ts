export const MAX_STUDY_COPILOT_MESSAGES = 8;
export const MAX_STUDY_COPILOT_MESSAGE_CHARS = 3_000;
export const MAX_STUDY_COPILOT_CONTEXT_CHARS = 12_000;

export type StudyCopilotMessage = {
  role: "user" | "assistant";
  content: string;
};

export type StudyCopilotContextData = {
  subjects: Array<{ name: string }>;
  topics: Array<{ title: string; confidence?: number | null; priority?: number | null; status?: string | null }>;
  errorLogs: Array<{ title: string; severity?: number | null; resolved?: boolean | null }>;
  reviewItems: Array<{ question?: string | null; isActive?: boolean | null; dueAt?: Date | string | null }>;
  exams: Array<{ title: string; examDate?: Date | string | null; importance?: number | null }>;
};

function boundText(text: string, maxChars: number) {
  if (text.length <= maxChars) return text;
  const suffix = "\n[truncated]";
  return `${text.slice(0, Math.max(0, maxChars - suffix.length))}${suffix}`;
}

function asDate(value: Date | string | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function describeList(items: string[], limit: number) {
  const visible = items.slice(0, limit);
  const remaining = Math.max(0, items.length - visible.length);
  if (visible.length === 0) return "none";
  return `${visible.join("; ")}${remaining ? `; and ${remaining} more` : ""}`;
}

export function sanitizeStudyCopilotMessages(messages: unknown): StudyCopilotMessage[] {
  if (!Array.isArray(messages)) return [];

  return messages
    .flatMap((message) => {
      if (!message || typeof message !== "object") return [];
      const candidate = message as { role?: unknown; content?: unknown };
      if (candidate.role !== "user" && candidate.role !== "assistant") return [];
      if (typeof candidate.content !== "string") return [];

      const role: StudyCopilotMessage["role"] = candidate.role;
      const content = candidate.content.trim();
      if (!content) return [];

      return [{ role, content: boundText(content, MAX_STUDY_COPILOT_MESSAGE_CHARS) }];
    })
    .slice(-MAX_STUDY_COPILOT_MESSAGES);
}

export function buildStudyCopilotContext(input: StudyCopilotContextData, now = new Date()) {
  const subjects = describeList(input.subjects.map((subject) => subject.name), 12);
  const weakTopics = [...input.topics]
    .sort((a, b) => (a.confidence ?? 10) - (b.confidence ?? 10) || (b.priority ?? 0) - (a.priority ?? 0))
    .slice(0, 8)
    .map((topic) => `${topic.title} (confidence ${topic.confidence ?? "n/a"}, priority ${topic.priority ?? "n/a"}, ${topic.status ?? "unknown"})`);

  const openErrors = input.errorLogs
    .filter((error) => !error.resolved)
    .sort((a, b) => (b.severity ?? 0) - (a.severity ?? 0))
    .slice(0, 8)
    .map((error) => `${error.title} (severity ${error.severity ?? "n/a"})`);

  const dueReviews = input.reviewItems
    .filter((item) => item.isActive !== false)
    .filter((item) => {
      const dueAt = asDate(item.dueAt);
      return dueAt ? dueAt <= now : false;
    });

  const dueReviewExamples = dueReviews
    .slice(0, 5)
    .map((item) => item.question?.slice(0, 120) || "Review item");

  const upcomingExams = input.exams
    .map((exam) => ({ ...exam, examDate: asDate(exam.examDate) }))
    .filter((exam): exam is typeof exam & { examDate: Date } => !!exam.examDate && exam.examDate >= now)
    .sort((a, b) => a.examDate.getTime() - b.examDate.getTime() || (b.importance ?? 0) - (a.importance ?? 0))
    .slice(0, 8)
    .map((exam) => `${exam.title} (${exam.examDate.toISOString().slice(0, 10)}, importance ${exam.importance ?? "n/a"})`);

  return boundText(
    [
      `Subjects: ${subjects}`,
      `Weak or high-priority topics: ${describeList(weakTopics, 8)}`,
      `Open errors: ${describeList(openErrors, 8)}`,
      `Due reviews: ${dueReviews.length}${dueReviewExamples.length ? ` (${describeList(dueReviewExamples, 5)})` : ""}`,
      `Upcoming exams: ${describeList(upcomingExams, 8)}`,
    ].join("\n"),
    MAX_STUDY_COPILOT_CONTEXT_CHARS,
  );
}

export function buildStudyCopilotPrompt({
  locale,
  context,
  messages,
}: {
  locale?: string;
  context: string;
  messages: StudyCopilotMessage[];
}) {
  const languageRule = locale === "et"
    ? "Respond in Estonian. Keep medical terminology precise."
    : "Respond in English. Keep medical terminology precise.";

  const transcript = sanitizeStudyCopilotMessages(messages)
    .map((message) => `${message.role === "user" ? "User" : "Assistant"}: ${message.content}`)
    .join("\n");

  return [
    "You are Study Copilot, a read-only study planning assistant inside a personal study app.",
    languageRule,
    "Use only the user context below plus the current conversation. Do not invent subjects, exams, due dates, grades, medical facts, or personal details.",
    "You are read-only. Do not claim that you saved, edited, deleted, scheduled, diagnosed, treated, or contacted anyone.",
    "If the user asks for a write action, draft the proposed action and tell them to confirm it manually in the app.",
    "For medical content, explain study concepts only. Do not provide diagnosis, treatment, or emergency guidance.",
    "Prefer concise answers with concrete next steps. Mention uncertainty when context is missing.",
    "",
    "User context:",
    context,
    "",
    "Conversation:",
    transcript || "No prior messages.",
  ].join("\n");
}
