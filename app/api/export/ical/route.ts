import { requireUser } from "@/lib/auth/supabase";
import { buildIcsCalendar, type IcsEvent } from "@/lib/calendar/ical";
import { getTimelinePageData } from "@/lib/data/queries";

function validDate(value: Date | string | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function GET() {
  const user = await requireUser();
  const data = await getTimelinePageData(user.id, 180);
  const events: IcsEvent[] = [];

  for (const exam of data.exams) {
    const date = validDate(exam.examDate);
    if (date) events.push({ id: `exam-${exam.id}`, title: exam.title, date, type: "exam", description: exam.notes });
  }

  for (const item of data.reviewItems) {
    const date = validDate(item.dueAt);
    if (date) events.push({ id: `review-${item.id}`, title: item.question, date, type: "review", description: item.answer });
  }

  for (const task of data.tasks) {
    const date = validDate(task.dueAt);
    if (date) events.push({ id: `task-${task.id}`, title: task.title, date, type: "task", description: task.description });
  }

  for (const error of data.errorLogs) {
    const date = validDate(error.retestAt);
    if (date) events.push({ id: `error-${error.id}`, title: error.title, date, type: "error", description: error.preventionRule ?? error.description });
  }

  for (const contact of data.professionalContacts) {
    const date = validDate(contact.nextFollowUpAt);
    if (date) events.push({ id: `contact-${contact.id}`, title: `Follow up: ${contact.name}`, date, type: "contact", description: contact.notes });
  }

  for (const opportunity of data.opportunities) {
    const date = validDate(opportunity.deadline);
    if (date) events.push({ id: `opportunity-${opportunity.id}`, title: opportunity.title, date, type: "opportunity", description: opportunity.nextAction ?? opportunity.description });
  }

  const body = buildIcsCalendar({
    productId: "ValgeMed",
    events: events.sort((a, b) => a.date.getTime() - b.date.getTime()),
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="valgemed-calendar-${new Date().toISOString().slice(0, 10)}.ics"`,
    },
  });
}
