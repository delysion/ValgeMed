import Link from "next/link";
import { differenceInCalendarDays, formatISO, startOfToday } from "date-fns";
import { ArrowRight, Brain, Clock, Flame, Languages, ShieldCheck, Sparkles } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { DailyLogForm } from "@/components/forms/entity-forms";
import { ScoreBreakdown } from "@/components/score-breakdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOwnerSession } from "@/lib/auth/session";
import { getCoreData } from "@/lib/data/queries";
import { fmtDate } from "@/lib/labels";
import { buildEliteIndex, buildExamReadiness, buildBurnoutRiskFromLogs } from "@/lib/scoring/engine";
import { getNextBestAction } from "@/lib/scoring/next-best-action";

export const dynamic = "force-dynamic";

function CommandItem({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link href={href} className="rounded-md border border-white/10 bg-white/[0.03] p-3 transition hover:bg-white/[0.06]">
      <p className="text-xs uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </Link>
  );
}

export default async function CommandPage() {
  const session = await requireOwnerSession();
  const data = await getCoreData();
  const today = startOfToday();
  const todayDate = formatISO(today, { representation: "date" });
  const todayLog = data.dailyLogs.find((log) => log.date === todayDate) ?? null;
  const elite = buildEliteIndex(data);
  const burnout = buildBurnoutRiskFromLogs(data.dailyLogs, data.quizAttempts);
  const examsWithReadiness = data.exams.map((exam) => ({
    ...exam,
    liveReadiness: buildExamReadiness({
      topics: data.topics.filter((topic) => topic.examId === exam.id),
      studySessions: data.studySessions.filter((studySession) => studySession.examId === exam.id),
      errorLogs: data.errorLogs.filter((error) => error.examId === exam.id),
      quizAttempts: data.quizAttempts.filter((attempt) => attempt.examId === exam.id),
      dailyLogs: data.dailyLogs,
    }).score,
  }));
  const nextAction = getNextBestAction({
    burnoutRisk: burnout.score,
    energyIntegrity: elite.energyIntegrity.score,
    exams: examsWithReadiness,
    reviewItems: data.reviewItems,
    errorLogs: data.errorLogs,
    topics: data.topics,
    todayLog,
    languageProgress: data.languageProgress,
    opportunities: data.opportunities,
    reputationEvents: data.reputationEvents,
    lifeAdminItems: data.lifeAdminItems,
  });
  const riskyExam = examsWithReadiness
    .filter((exam) => exam.examDate)
    .sort((a, b) => a.liveReadiness - b.liveReadiness || differenceInCalendarDays(a.examDate as Date, today) - differenceInCalendarDays(b.examDate as Date, today))[0];
  const weakTopic = data.topics
    .slice()
    .sort((a, b) => a.confidence - b.confidence || b.priority - a.priority)[0];
  const severeError = data.errorLogs
    .filter((error) => !error.resolved)
    .sort((a, b) => b.severity + b.recurrenceCount - (a.severity + a.recurrenceCount))[0];
  const languageMove = data.languageProgress
    .slice()
    .sort((a, b) => a.confidence - b.confidence || b.minutes - a.minutes)[0];
  const opportunity = data.opportunities
    .filter((item) => !["passed", "archived"].includes(item.status))
    .sort((a, b) => b.strategicUpside - a.strategicUpside)[0];
  const lifeAdmin = data.lifeAdminItems
    .filter((item) => item.status !== "done")
    .sort((a, b) => b.priority - a.priority)[0];
  const lowData =
    data.subjects.length === 0 ||
    data.topics.length === 0 ||
    data.dailyLogs.length === 0 ||
    data.studySessions.length === 0;

  return (
    <AppShell session={session}>
      <PageHeader
        title="Command"
        description="La pagina madre: prossima azione, energia, memoria, errori, Tartu e traiettoria professionale."
        actions={
          <Button asChild variant="outline">
            <Link href="/elite-index">
              Elite Index
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      {lowData ? (
        <Card className="mb-4 border-ice/20 bg-ice/5">
          <CardHeader>
            <CardTitle>Low-data mode</CardTitle>
            <CardDescription>
              Gli score sono provvisori: inserisci almeno una materia, un topic, un daily log e una sessione per renderli piu utili.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <Card className="border-violet/20 bg-violet/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Next best action
              </CardTitle>
              <CardDescription>Regole locali, nessuna AI cloud, nessuna verita assoluta.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <Badge variant="violet">{nextAction.kind}</Badge>
                <h3 className="mt-2 text-xl font-semibold text-white">{nextAction.title}</h3>
                <p className="mt-2 max-w-2xl text-sm text-muted">{nextAction.reason}</p>
              </div>
              <Button asChild>
                <Link href={nextAction.href}>
                  Apri
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <CommandItem
              label="Exam at risk"
              value={riskyExam ? `${riskyExam.title} - readiness ${riskyExam.liveReadiness.toFixed(1)}/10` : "Nessun esame critico tracciato"}
              href={riskyExam ? `/exams/${riskyExam.id}` : "/exams"}
            />
            <CommandItem
              label="Weak topic to destroy"
              value={weakTopic ? `${weakTopic.title} - confidence ${weakTopic.confidence}/10` : "Aggiungi topics fragili"}
              href="/topics"
            />
            <CommandItem
              label="Error to retest"
              value={severeError ? `${severeError.title} - severity ${severeError.severity}/10` : "Nessun errore aperto"}
              href="/errors"
            />
            <CommandItem
              label="Language move"
              value={languageMove ? `${languageMove.title} - ${languageMove.language}` : "Crea un item Estonian/Latin"}
              href="/language"
            />
            <CommandItem
              label="Opportunity radar"
              value={opportunity ? `${opportunity.title} - upside ${opportunity.strategicUpside}/10` : "Nessuna opportunita attiva"}
              href="/opportunities"
            />
            <CommandItem
              label="Life admin"
              value={lifeAdmin ? `${lifeAdmin.title} - priority ${lifeAdmin.priority}/10` : "Nessuna frizione aperta"}
              href="/life-admin"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Memory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-3xl text-white">{data.reviewItems.filter((item) => item.isActive && item.dueAt <= today).length}</p>
                <p className="text-sm text-muted">review due/overdue</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-4 w-4" />
                  Energy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-3xl text-white">{elite.energyIntegrity.score.toFixed(1)}</p>
                <p className="text-sm text-muted">Energy Integrity</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  Estonia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-3xl text-white">{elite.estoniaIntegration.score.toFixed(1)}</p>
                <p className="text-sm text-muted">Tartu integration</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Elise Elite Index
              </CardTitle>
              <CardDescription>{elite.eliteIndex.label}. Segnale strategico, non giudizio.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScoreBreakdown result={elite.eliteIndex} compact />
            </CardContent>
          </Card>
          <DailyLogForm log={todayLog} compact />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Upcoming exam window
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {examsWithReadiness.slice(0, 4).map((exam) => (
                <Link key={exam.id} href={`/exams/${exam.id}`} className="flex items-center justify-between rounded-md border border-white/10 p-3 hover:bg-white/[0.04]">
                  <div>
                    <p className="text-sm font-medium text-white">{exam.title}</p>
                    <p className="text-xs text-muted">{fmtDate(exam.examDate)}</p>
                  </div>
                  <Badge>{exam.liveReadiness.toFixed(1)}</Badge>
                </Link>
              ))}
              {examsWithReadiness.length === 0 ? <p className="text-sm text-muted">Nessun esame inserito.</p> : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
