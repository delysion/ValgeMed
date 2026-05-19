import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell, PageHeader } from "@/components/app-shell";
import { ScoreBreakdown } from "@/components/score-breakdown";
import { DataTable } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOwnerSession } from "@/lib/auth/session";
import { getCoreData } from "@/lib/data/queries";
import { fmtDate, humanize } from "@/lib/labels";
import { buildMedicalMasteryScore } from "@/lib/scoring/engine";

export const dynamic = "force-dynamic";

export default async function SubjectCommandCenterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireOwnerSession();
  const { id } = await params;
  const data = await getCoreData();
  const subject = data.subjects.find((item) => item.id === id);

  if (!subject) {
    notFound();
  }

  const subjectTopics = data.topics.filter((topic) => topic.subjectId === id);
  const subjectSessions = data.studySessions.filter((studySession) => studySession.subjectId === id);
  const subjectReviews = data.reviewItems.filter((review) => review.subjectId === id && review.isActive);
  const subjectErrors = data.errorLogs.filter((error) => error.subjectId === id && !error.resolved);
  const subjectQuizzes = data.quizAttempts.filter((attempt) => attempt.subjectId === id);
  const mastery = buildMedicalMasteryScore({
    topics: subjectTopics,
    studySessions: subjectSessions,
    quizAttempts: subjectQuizzes,
    errorLogs: subjectErrors,
  });
  const weakTopics = subjectTopics
    .slice()
    .sort((a, b) => a.confidence - b.confidence || b.priority - a.priority)
    .slice(0, 8);
  const nextTopic = weakTopics[0];
  const quizAverage =
    subjectQuizzes.length === 0
      ? 0
      : subjectQuizzes.reduce((sum, quiz) => sum + quiz.scorePercent, 0) / subjectQuizzes.length;
  const lastRecall = subjectSessions
    .filter((studySession) => ["active_recall", "quiz", "simulation", "error_review"].includes(studySession.method))
    .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())[0];

  return (
    <AppShell session={session}>
      <PageHeader
        title={subject.name}
        description="Subject command center: mastery, weak topics, review due, open errors and next best topic."
        actions={
          <Button asChild variant="outline">
            <Link href="/subjects">Back</Link>
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-3xl text-white">{subjectTopics.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Reviews due</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-3xl text-white">{subjectReviews.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Open errors</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-3xl text-white">{subjectErrors.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Quiz avg</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-3xl text-white">{quizAverage.toFixed(0)}%</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Weak topics</CardTitle>
              <CardDescription>{nextTopic ? `Next best topic: ${nextTopic.title}` : "Add topics to activate subject guidance."}</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={weakTopics.map((topic) => ({
                  topic: topic.title,
                  status: humanize(topic.status),
                  confidence: `${topic.confidence}/10`,
                  priority: `${topic.priority}/10`,
                  nextReview: fmtDate(topic.nextReviewAt),
                }))}
                columns={[
                  { key: "topic", header: "Topic" },
                  { key: "status", header: "Status" },
                  { key: "confidence", header: "Confidence" },
                  { key: "priority", header: "Priority" },
                  { key: "nextReview", header: "Next review" },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Open errors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {subjectErrors.slice(0, 6).map((error) => (
                <div key={error.id} className="rounded-md border border-white/10 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-white">{error.title}</p>
                    <Badge variant={error.severity >= 7 ? "danger" : "muted"}>{error.severity}/10</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted">{error.preventionRule ?? error.correction ?? error.description}</p>
                </div>
              ))}
              {subjectErrors.length === 0 ? <p className="text-sm text-muted">No open errors for this subject.</p> : null}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medical mastery</CardTitle>
              <CardDescription>Local signal, not objective truth.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScoreBreakdown result={mastery} compact />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Subject pulse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span>Difficulty</span>
                <Badge variant="muted">{subject.difficulty}/10</Badge>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span>Importance</span>
                <Badge>{subject.importance}/10</Badge>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span>Last active recall</span>
                <span>{fmtDate(lastRecall?.startedAt)}</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-muted">Description</p>
                <p className="mt-1">{subject.description ?? "No description."}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
