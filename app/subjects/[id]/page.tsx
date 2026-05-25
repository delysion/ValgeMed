import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell, PageHeader } from "@/components/app-shell";
import { ScoreBreakdown } from "@/components/score-breakdown";
import { DataTable } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/supabase";
import { getSubjectDetailData } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";
import { fmtDate, humanize } from "@/lib/labels";
import { buildMedicalMasteryScore } from "@/lib/scoring/engine";

export const dynamic = "force-dynamic";

export default async function SubjectCommandCenterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { t } = await getI18n();
  const { id } = await params;
  const data = await getSubjectDetailData();
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
    <AppShell user={user}>
      <PageHeader
        title={subject.name}
        description={t("subjectCmd.description")}
        actions={
          <Button asChild variant="outline">
            <Link href="/subjects">{t("subjectCmd.back")}</Link>
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("subjectCmd.topics")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-3xl text-text-primary">{subjectTopics.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("subjectCmd.reviewsDue")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-3xl text-text-primary">{subjectReviews.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("subjectCmd.openErrors")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-3xl text-text-primary">{subjectErrors.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("subjectCmd.quizAvg")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-3xl text-text-primary">{quizAverage.toFixed(0)}%</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("subjectCmd.weakTopics")}</CardTitle>
              <CardDescription>{nextTopic ? `${t("subjectCmd.nextTopic")}: ${nextTopic.title}` : t("subjectCmd.addTopics")}</CardDescription>
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
                  { key: "topic", header: t("subjectCmd.topics") },
                  { key: "status", header: t("common.status") },
                  { key: "confidence", header: t("common.confidence") },
                  { key: "priority", header: t("common.priority") },
                  { key: "nextReview", header: t("common.nextReview") },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("subjectCmd.openErrors")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {subjectErrors.slice(0, 6).map((error) => (
                <div key={error.id} className="rounded-md border border-border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-text-primary">{error.title}</p>
                    <Badge variant={error.severity >= 7 ? "danger" : "muted"}>{error.severity}/10</Badge>
                  </div>
                  <p className="mt-1 text-sm text-text-secondary">{error.preventionRule ?? error.correction ?? error.description}</p>
                </div>
              ))}
              {subjectErrors.length === 0 ? <p className="text-sm text-text-secondary">{t("subjectCmd.noErrors")}</p> : null}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("subjectCmd.mastery")}</CardTitle>
              <CardDescription>{t("subjectCmd.masteryNote")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ScoreBreakdown result={mastery} compact />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("subjectCmd.pulse")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-text-secondary">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span>{t("subjectCmd.difficulty")}</span>
                <Badge variant="muted">{subject.difficulty}/10</Badge>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span>{t("subjectCmd.importance")}</span>
                <Badge>{subject.importance}/10</Badge>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span>{t("subjectCmd.lastRecall")}</span>
                <span>{fmtDate(lastRecall?.startedAt)}</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-text-secondary">{t("subjectCmd.descLabel")}</p>
                <p className="mt-1">{subject.description ?? t("subjectCmd.noDescription")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
