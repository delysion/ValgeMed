import { eq } from "drizzle-orm";
import type { AnyPgColumn, AnyPgTable } from "drizzle-orm/pg-core";
import JSZip from "jszip";
import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/supabase";
import { getDb, type AppDb } from "@/lib/db";
import {
  dailyLogs,
  errorLogs,
  exams,
  goals,
  healthLogs,
  hypotheses,
  identityNotes,
  languageProgress,
  lifeAdminItems,
  literatureGaps,
  manuscripts,
  methodologyRisks,
  opportunities,
  portfolioItems,
  professionalContacts,
  pushSubscriptions,
  quizAttempts,
  reputationEvents,
  researchAreas,
  reviewItems,
  strategicReviews,
  studySessions,
  subjects,
  tartuNotes,
  tasks,
  timeBlocks,
  topics,
  uploads,
} from "@/lib/db/schema";

export const dynamic = "force-dynamic";

type ExportableTable = {
  fileName: string;
  table: AnyPgTable;
  userIdColumn: AnyPgColumn;
};

const exportableTables = [
  { fileName: "subjects", table: subjects, userIdColumn: subjects.userId },
  { fileName: "exams", table: exams, userIdColumn: exams.userId },
  { fileName: "topics", table: topics, userIdColumn: topics.userId },
  { fileName: "studySessions", table: studySessions, userIdColumn: studySessions.userId },
  { fileName: "reviewItems", table: reviewItems, userIdColumn: reviewItems.userId },
  { fileName: "errorLogs", table: errorLogs, userIdColumn: errorLogs.userId },
  { fileName: "quizAttempts", table: quizAttempts, userIdColumn: quizAttempts.userId },
  { fileName: "dailyLogs", table: dailyLogs, userIdColumn: dailyLogs.userId },
  { fileName: "goals", table: goals, userIdColumn: goals.userId },
  { fileName: "tasks", table: tasks, userIdColumn: tasks.userId },
  { fileName: "identityNotes", table: identityNotes, userIdColumn: identityNotes.userId },
  { fileName: "tartuNotes", table: tartuNotes, userIdColumn: tartuNotes.userId },
  { fileName: "timeBlocks", table: timeBlocks, userIdColumn: timeBlocks.userId },
  { fileName: "healthLogs", table: healthLogs, userIdColumn: healthLogs.userId },
  { fileName: "languageProgress", table: languageProgress, userIdColumn: languageProgress.userId },
  { fileName: "reputationEvents", table: reputationEvents, userIdColumn: reputationEvents.userId },
  { fileName: "opportunities", table: opportunities, userIdColumn: opportunities.userId },
  { fileName: "professionalContacts", table: professionalContacts, userIdColumn: professionalContacts.userId },
  { fileName: "lifeAdminItems", table: lifeAdminItems, userIdColumn: lifeAdminItems.userId },
  { fileName: "portfolioItems", table: portfolioItems, userIdColumn: portfolioItems.userId },
  { fileName: "strategicReviews", table: strategicReviews, userIdColumn: strategicReviews.userId },
  { fileName: "researchAreas", table: researchAreas, userIdColumn: researchAreas.userId },
  { fileName: "literatureGaps", table: literatureGaps, userIdColumn: literatureGaps.userId },
  { fileName: "hypotheses", table: hypotheses, userIdColumn: hypotheses.userId },
  { fileName: "manuscripts", table: manuscripts, userIdColumn: manuscripts.userId },
  { fileName: "methodologyRisks", table: methodologyRisks, userIdColumn: methodologyRisks.userId },
  { fileName: "uploads", table: uploads, userIdColumn: uploads.userId },
  { fileName: "pushSubscriptions", table: pushSubscriptions, userIdColumn: pushSubscriptions.userId },
] satisfies ExportableTable[];

async function addUserTableToZip(
  db: AppDb,
  zip: JSZip,
  tableConfig: ExportableTable,
  userId: string,
) {
  const data = await db
    .select()
    .from(tableConfig.table)
    .where(eq(tableConfig.userIdColumn, userId));

  if (data.length > 0) {
    zip.file(`${tableConfig.fileName}.json`, JSON.stringify(data, null, 2));
  }
}

export async function GET() {
  const user = await requireUser();
  const db = getDb();

  const zip = new JSZip();

  for (const tableConfig of exportableTables) {
    await addUserTableToZip(db, zip, tableConfig, user.id);
  }

  const metadata = {
    exportedAt: new Date().toISOString(),
    userId: user.id,
    version: "1.0",
  };
  zip.file("metadata.json", JSON.stringify(metadata, null, 2));

  const content = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });

  return new NextResponse(content, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="valgemed-backup-${new Date().toISOString().slice(0, 10)}.zip"`,
    },
  });
}
