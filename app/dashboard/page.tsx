import Link from "next/link";
import { differenceInCalendarDays, startOfToday } from "date-fns";
import { ArrowRight, Flame, TimerReset } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { MetricBarChart, MethodPieChart } from "@/components/charts/study-charts";
import { DailyLogForm } from "@/components/forms/entity-forms";
import { ScoreBreakdown } from "@/components/score-breakdown";
import { DataTable } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOwnerSession } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/data/queries";
import { fmtDate } from "@/lib/labels";
import {
  buildBurnoutRiskFromLogs,
  buildExamReadiness,
  buildStudyEfficiency,
} from "@/lib/scoring/engine";
import { getNextBestAction } from "@/lib/scoring/next-best-action";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireOwnerSession();
  const data = await getDashboardData();
  const burnoutRisk = buildBurnoutRiskFromLogs(data.dailyLogs, data.quizAttempts);
  const efficiency = buildStudyEfficiency({
    sessions: data.studySessions,
    dailyLogs: data.dailyLogs,
    quizAttempts: data.quizAttempts,
  });
  const examsWithReadiness = data.exams.map((exam) => {
    const readiness = buildExamReadiness({
      topics: data.topics.filter((topic) => topic.examId === exam.id),
      studySessions: data.studySessions.filter((session) => session.examId === exam.id),
      errorLogs: data.errorLogs.filter((error) => error.examId === exam.id),
      quizAttempts: data.quizAttempts.filter((attempt) => attempt.examId === exam.id),
      dailyLogs: data.dailyLogs,
    });

    return { ...exam, liveReadiness: readiness.score };
  });
  const nextAction = getNextBestAction({
    burnoutRisk: burnoutRisk.score,
    exams: examsWithReadiness,
    reviewItems: data.reviewItems,
    errorLogs: data.errorLogs,
    topics: data.topics,
    todayLog: data.todayLog,
  });
  const studyMinutesThisWeek = data.studySessions.reduce(
    (sum, session) => sum + session.durationMinutes,
    0,
  );
  const activeMethods = new Set(["active_recall", "quiz", "simulation", "error_review"]);
  const activeMinutes = data.studySessions
    .filter((session) => activeMethods.has(session.method))
    .reduce((sum, session) => sum + session.durationMinutes, 0);
  const passiveMinutes = data.studySessions
    .filter((session) => ["reading", "notes"].includes(session.method))
    .reduce((sum, session) => sum + session.durationMinutes, 0);
  const readinessChart = examsWithReadiness.slice(0, 6).map((exam) => ({
    name: exam.title.slice(0, 16),
    readiness: Number(exam.liveReadiness.toFixed(1)),
  }));
  const methodChart = [
    { name: "Active", value: activeMinutes },
    { name: "Passive", value: passiveMinutes },
  ].filter((item) => item.value > 0);
  const weakTopics = data.topics
    .slice()
    .sort((a, b) => a.confidence - b.confidence || b.priority - a.priority)
    .slice(0, 8);

  return (
    <AppShell session={session}>
      <PageHeader
        title="Dashboard"
        description="Today command, rischio, review, errori e prossima azione."
      />

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-4">
          <Card className="border-ice/20 bg-ice/5">
            <CardHeader>
              <CardTitle>Today command</CardTitle>
              <CardDescription>{new Date().toLocaleDateString("it-IT", { weekday: "long", day: "2-digit", month: "long" })}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-4">
              <div>
                <p className="text-xs text-muted">Study this week</p>
                <p className="mt-1 font-mono text-3xl text-white">{studyMinutesThisWeek}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Due reviews</p>
                <p className="mt-1 font-mono text-3xl text-white">{data.reviewItems.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Open errors</p>
                <p className="mt-1 font-mono text-3xl text-white">{data.errorLogs.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Burnout risk</p>
                <p className="mt-1 font-mono text-3xl text-white">{burnoutRisk.score.toFixed(1)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next best action</CardTitle>
              <CardDescription>Regole locali, non AI.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="violet">{nextAction.kind}</Badge>
                  <h3 className="text-lg font-semibold text-white">{nextAction.title}</h3>
                </div>
                <p className="mt-2 text-sm text-muted">{nextAction.reason}</p>
              </div>
              <Button asChild>
                <Link href={nextAction.href}>
                  Apri
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Exam readiness chart</CardTitle>
              </CardHeader>
              <CardContent>
                <MetricBarChart data={readinessChart} dataKey="readiness" domain={[0, 10]} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Active vs passive study</CardTitle>
              </CardHeader>
              <CardContent>
                {methodChart.length ? <MethodPieChart data={methodChart} /> : <p className="text-sm text-muted">Nessuna sessione questa settimana.</p>}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top weak topics</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={weakTopics.map((topic) => ({
                  topic: topic.title,
                  confidence: topic.confidence,
                  priority: topic.priority,
                  difficulty: topic.difficulty,
                  nextReview: topic.nextReviewAt ? fmtDate(topic.nextReviewAt) : "-",
                }))}
                columns={[
                  { key: "topic", header: "Topic" },
                  { key: "confidence", header: "Confidence" },
                  { key: "priority", header: "Priority" },
                  { key: "difficulty", header: "Difficulty" },
                  { key: "nextReview", header: "Next review" },
                ]}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Burnout risk</CardTitle>
              <CardDescription>Mostra i fattori che spingono lo score.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScoreBreakdown result={burnoutRisk} compact />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Study efficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreBreakdown result={efficiency} compact />
            </CardContent>
          </Card>
          <DailyLogForm log={data.todayLog} compact />
          <Card>
            <CardHeader>
              <CardTitle>Upcoming exams</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {examsWithReadiness.slice(0, 5).map((exam) => (
                <Link key={exam.id} href={`/exams/${exam.id}`} className="flex items-center justify-between rounded-md border border-white/10 p-3 hover:bg-white/[0.04]">
                  <div>
                    <div className="text-sm font-medium text-white">{exam.title}</div>
                    <div className="text-xs text-muted">
                      {fmtDate(exam.examDate)} {exam.examDate ? `(${differenceInCalendarDays(exam.examDate, startOfToday())}d)` : ""}
                    </div>
                  </div>
                  <Badge>{exam.liveReadiness.toFixed(1)}</Badge>
                </Link>
              ))}
              {examsWithReadiness.length === 0 ? <p className="text-sm text-muted">Nessun esame inserito.</p> : null}
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><TimerReset className="h-4 w-4" /> Due reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.reviewItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="rounded-md border border-white/10 p-3 text-sm text-muted">{item.question}</div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Flame className="h-4 w-4" /> Open errors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.errorLogs.slice(0, 5).map((error) => (
                  <div key={error.id} className="flex justify-between rounded-md border border-white/10 p-3 text-sm">
                    <span className="text-muted">{error.title}</span>
                    <Badge variant={error.severity >= 7 ? "danger" : "muted"}>{error.severity}</Badge>
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
