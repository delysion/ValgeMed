import type { CoreData } from "@/lib/data/queries";

const exportTables = [
  "subjects",
  "exams",
  "topics",
  "studySessions",
  "reviewItems",
  "errorLogs",
  "quizAttempts",
  "dailyLogs",
  "goals",
  "tasks",
  "identityNotes",
  "tartuNotes",
  "timeBlocks",
  "healthLogs",
  "languageProgress",
  "reputationEvents",
  "opportunities",
  "professionalContacts",
  "lifeAdminItems",
  "portfolioItems",
  "strategicReviews",
] as const;

function normalize(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}

function escapeCsv(value: unknown) {
  const normalized = normalize(value);
  if (/[",\n\r]/.test(normalized)) {
    return `"${normalized.replaceAll('"', '""')}"`;
  }

  return normalized;
}

export function buildJsonExport(data: CoreData) {
  return {
    exportedAt: new Date().toISOString(),
    app: "Tartu Med/Dent OS",
    tables: Object.fromEntries(exportTables.map((table) => [table, data[table]])),
  };
}

export function buildCsvExport(data: CoreData) {
  const chunks: string[] = [];

  for (const table of exportTables) {
    const rows = data[table];
    chunks.push(`# ${table}`);

    if (rows.length === 0) {
      chunks.push("");
      continue;
    }

    const headers = Object.keys(rows[0] as Record<string, unknown>);
    chunks.push(headers.map(escapeCsv).join(","));

    for (const row of rows as Array<Record<string, unknown>>) {
      chunks.push(headers.map((header) => escapeCsv(row[header])).join(","));
    }

    chunks.push("");
  }

  return chunks.join("\n");
}
