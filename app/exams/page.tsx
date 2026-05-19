import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { ExamForm } from "@/components/forms/entity-forms";
import { ResourceTable } from "@/components/tables/resource-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteExamAction } from "@/lib/actions/resources";
import { requireOwnerSession } from "@/lib/auth/session";
import { getCoreData } from "@/lib/data/queries";
import { fmtDate, humanize } from "@/lib/labels";
import { buildExamReadiness } from "@/lib/scoring/engine";

export const dynamic = "force-dynamic";

export default async function ExamsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const session = await requireOwnerSession();
  const params = await searchParams;
  const data = await getCoreData();
  const editing = data.exams.find((exam) => exam.id === params.edit);
  const subjectById = new Map(data.subjects.map((subject) => [subject.id, subject]));

  const examRows = data.exams.map((exam) => {
    const readiness = buildExamReadiness({
      topics: data.topics.filter((topic) => topic.examId === exam.id),
      studySessions: data.studySessions.filter((studySession) => studySession.examId === exam.id),
      errorLogs: data.errorLogs.filter((error) => error.examId === exam.id),
      quizAttempts: data.quizAttempts.filter((attempt) => attempt.examId === exam.id),
      dailyLogs: data.dailyLogs,
    });

    return { ...exam, liveReadiness: readiness.score };
  });

  return (
    <AppShell session={session}>
      <PageHeader
        title="Exams"
        description="Scadenze, readiness, risk level e accesso al battle plan."
      />
      <div className="grid gap-4 xl:grid-cols-[460px_1fr]">
        <ExamForm exam={editing} subjects={data.subjects} />
        <Card>
          <CardHeader>
            <CardTitle>Esami</CardTitle>
          </CardHeader>
          <CardContent>
            <ResourceTable
              rows={examRows}
              editBasePath="/exams"
              deleteAction={deleteExamAction}
              extraActions={(exam) => (
                <Button asChild variant="ghost" size="icon">
                  <Link href={`/exams/${exam.id}`} aria-label="Battle plan">
                    <ShieldCheck className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              columns={[
                {
                  header: "Esame",
                  render: (exam) => (
                    <div>
                      <div className="font-medium text-white">{exam.title}</div>
                      <div className="text-xs text-muted">{subjectById.get(exam.subjectId)?.name ?? "-"}</div>
                    </div>
                  ),
                },
                { header: "Data", render: (exam) => fmtDate(exam.examDate) },
                { header: "Formato", render: (exam) => humanize(exam.format) },
                {
                  header: "Readiness",
                  render: (exam) => <Badge>{exam.liveReadiness.toFixed(1)}/10</Badge>,
                },
                {
                  header: "Risk",
                  render: (exam) => <Badge variant={exam.riskLevel >= 7 ? "danger" : "muted"}>{exam.riskLevel}/10</Badge>,
                },
                {
                  header: "Topics linked",
                  render: (exam) => data.topics.filter((topic) => topic.examId === exam.id).length,
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
