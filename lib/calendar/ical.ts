export type IcsEventType = "exam" | "review" | "task" | "error" | "contact" | "opportunity";

export type IcsEvent = {
  id: string;
  title: string;
  date: Date;
  type: IcsEventType;
  description?: string | null;
};

export type IcsCalendarInput = {
  productId: string;
  events: IcsEvent[];
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatUtcDateTime(date: Date) {
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
    "T",
    pad(date.getUTCHours()),
    pad(date.getUTCMinutes()),
    pad(date.getUTCSeconds()),
    "Z",
  ].join("");
}

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function foldLine(line: string) {
  const limit = 74;
  if (line.length <= limit) return line;

  const chunks: string[] = [];
  let remaining = line;
  while (remaining.length > limit) {
    chunks.push(remaining.slice(0, limit));
    remaining = ` ${remaining.slice(limit)}`;
  }
  chunks.push(remaining);
  return chunks.join("\r\n");
}

export function buildIcsCalendar({ productId, events }: IcsCalendarInput) {
  const now = formatUtcDateTime(new Date());
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `PRODID:-//${escapeIcsText(productId)}//ValgeMed Calendar//EN`,
  ];

  for (const event of events) {
    const start = formatUtcDateTime(event.date);
    const end = formatUtcDateTime(new Date(event.date.getTime() + 60 * 60 * 1000));

    lines.push(
      "BEGIN:VEVENT",
      `UID:${escapeIcsText(event.id)}@valgemed`,
      `DTSTAMP:${now}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${escapeIcsText(event.title)}`,
      `CATEGORIES:${event.type.toUpperCase()}`,
    );

    if (event.description) {
      lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
    }

    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return `${lines.map(foldLine).join("\r\n")}\r\n`;
}
