import Link from "next/link";
import { addDays, differenceInCalendarDays, format } from "date-fns";
import { ArrowLeft, Trash2 } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { QuizAttemptForm } from "@/components/forms/entity-forms";
import { ScoreBreakdown } from "@/components/score-breakdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteQuizAttemptAction } from "@/lib/actions/resources";
import { requireOwnerSession } from "@/lib/auth/session";
import { getCoreData } from "@/lib/data/queries";
import { fmtDate, humanize } from "@/lib/labels";
import { buildExamReadiness } from "@/lib/scoring/engine";

export const dynamic = "force-dynamic";

export default async function ExamCommandCenter({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireOwnerSession();
  const { id } = await params;
  const data = await getCoreData();
  const exam = data.exams.find((item) => item.id === id);

  if (!exam) {
    return (
      <AppShell session={session}>
        <PageHeader title="Exam not found" />
        <Button asChild variant="outline">
          <Link href="/exams">Torna agli esami</Link>
        </Button>
      </AppShell>
    );
  }

  const subject = data.subjects.find((item) => item.id === exam.subjectId);
  const examTopics = data.topics.filter((topic) => topic.examId === exam.id);
  const examErrors = data.errorLogs.filter((error) => error.examId === exam.id);
  const examQuiz = data.quizAttempts.filter((attempt) => attempt.examId === exam.id);
  const examSessions = data.studySessions.filter((studySession) => studySession.examId === exam.id);
  const readiness = buildExamReadiness({
    topics: examTopics,
    studySessions: examSessions,
    errorLogs: examErrors,
    quizAttempts: examQuiz,
    dailyLogs: data.dailyLogs,
  });
  const weakTopics = examTopics
    .slice()
    .sort((a, b) => a.confidence - b.confidence || b.priority - a.priority)
    .slice(0, 5);
  const daysLeft = exam.examDate ? differenceInCalendarDays(exam.examDate, new Date()) : null;
  const plan = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(new Date(), index);
    const weakTopic = weakTopics[index % Math.max(weakTopics.length, 1)];
    const action =
      index >= 5
        ? "Simulation + correzione errori"
        : weakTopic
          ? `Active recall: ${weakTopic.title}`
          : "Costruisci topics e review item";

    return { date, action };
  });

  return (
    <AppShell session={session}>
      <PageHeader
        title={exam.title}
        description={`${subject?.name ?? "Materia"} - ${humanize(exam.format)} - ${fmtDate(exam.examDate)}${daysLeft !== null ? ` - ${daysLeft} giorni` : ""}`}
        actions={
          <Button asChild variant="outline">
            <Link href="/exams">
              <ArrowLeft className="h-4 w-4" />
              Esami
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Readiness breakdown</CardTitle>
              <CardDescription>Score locale, spiegabile e non assoluto.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScoreBreakdown result={readiness} />
            </CardContent>
          </Card>
          <QuizAttemptForm subjects={data.subjects} topics={data.topics} exams={data.exams} examId={exam.id} />
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Last 7 days plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                {plan.map((item) => (
                  <div key={item.date.toISOString()} className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                    <div className="text-xs uppercase tracking-[0.12em] text-muted">
                      {format(item.date, "EEE dd")}
                    </div>
                    <div className="mt-2 text-sm text-white">{item.action}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Topics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {examTopics.length === 0 ? <p className="text-sm text-muted">Nessun topic collegato.</p> : null}
                {examTopics.map((topic) => (
                  <div key={topic.id} className="flex items-center justify-between rounded-md border border-white/10 p-3">
                    <div>
                      <div className="text-sm font-medium text-white">{topic.title}</div>
                      <div className="text-xs text-muted">{humanize(topic.status)}</div>
                    </div>
                    <Badge variant={topic.confidence <= 3 ? "danger" : "muted"}>{topic.confidence}/10</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Open errors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {examErrors.length === 0 ? <p className="text-sm text-muted">Nessun errore registrato.</p> : null}
                {examErrors.map((error) => (
                  <div key={error.id} className="rounded-md border border-white/10 p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-white">{error.title}</div>
                      <Badge variant={error.resolved ? "success" : "danger"}>{error.severity}/10</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted">{error.correction ?? error.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quiz attempts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {examQuiz.length === 0 ? <p className="text-sm text-muted">Nessun quiz registrato.</p> : null}
                {examQuiz.map((attempt) => (
                  <div key={attempt.id} className="flex items-center justify-between rounded-md border border-white/10 p-3">
                    <div>
                      <div className="text-sm text-white">{fmtDate(attempt.date)}</div>
                      <div className="text-xs text-muted">
                        {attempt.correctAnswers}/{attempt.totalQuestions} corrette
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>{attempt.scorePercent.toFixed(1)}%</Badge>
                      <form action={deleteQuizAttemptAction}>
                        <input type="hidden" name="id" value={attempt.id} />
                        <Button type="submit" variant="ghost" size="icon" aria-label="Elimina quiz">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Study sessions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {examSessions.length === 0 ? <p className="text-sm text-muted">Nessuna sessione collegata.</p> : null}
                {examSessions.slice(0, 8).map((studySession) => (
                  <div key={studySession.id} className="flex items-center justify-between rounded-md border border-white/10 p-3">
                    <div>
                      <div className="text-sm text-white">{humanize(studySession.method)}</div>
                      <div className="text-xs text-muted">{fmtDate(studySession.startedAt)}</div>
                    </div>
                    <Badge variant="violet">{studySession.durationMinutes} min</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
