import Link from "next/link";
import { differenceInCalendarDays, startOfToday } from "date-fns";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { ExamForm } from "@/components/forms/entity-forms";
import { GlassCard } from "@/components/premium/glass-card";
import { MomentumBar } from "@/components/premium/momentum-bar";
import { RiskBadge } from "@/components/premium/gamification";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireApprovedUser } from "@/lib/auth/supabase";
import { getExamPageData } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";
import { fmtDate, humanize } from "@/lib/labels";
import { buildExamReadiness } from "@/lib/scoring/engine";

export const dynamic = "force-dynamic";

export default async function ExamsPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const user = await requireApprovedUser();
  const { t } = await getI18n();
  const params = await searchParams;
  const data = await getExamPageData();
  const editing = data.exams.find((exam) => exam.id === params.edit);
  const subjectById = new Map(data.subjects.map((subject) => [subject.id, subject]));
  const today = startOfToday();

  const examRows = data.exams.map((exam) => {
    const readiness = buildExamReadiness({
      topics: data.topics.filter((topic) => topic.examId === exam.id),
      studySessions: data.studySessions.filter((studySession) => studySession.examId === exam.id),
      errorLogs: data.errorLogs.filter((error) => error.examId === exam.id),
      quizAttempts: data.quizAttempts.filter((attempt) => attempt.examId === exam.id),
      dailyLogs: data.dailyLogs,
    });
    const linkedTopics = data.topics.filter((topic) => topic.examId === exam.id);
    const weakTopics = linkedTopics.filter((topic) => topic.confidence <= 4);
    const openErrors = data.errorLogs.filter((error) => error.examId === exam.id && !error.resolved);

    return { ...exam, liveReadiness: readiness.score, linkedTopics, weakTopics, openErrors };
  });

  return (
    <AppShell user={user}>
      <PageHeader title={t("exams.title")} description={t("exams.subtitle")} />
      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <ExamForm exam={editing} subjects={data.subjects} t={t as (key: string) => string} />
        <div className="grid gap-4 md:grid-cols-2">
          {examRows.map((exam) => {
            const daysLeft = exam.examDate ? differenceInCalendarDays(exam.examDate, today) : null;
            const urgency = daysLeft === null ? 3 : daysLeft <= 7 ? 9 : daysLeft <= 21 ? 7 : 4;
            return (
              <GlassCard key={exam.id} tone={exam.riskLevel >= 7 ? "danger" : "violet"} className="flex flex-col gap-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge variant="muted">{subjectById.get(exam.subjectId)?.name ?? t("common.subject")}</Badge>
                    <h3 className="mt-3 text-2xl font-semibold text-text-primary">{exam.title}</h3>
                    <p className="mt-1 text-sm text-text-secondary">{humanize(exam.format)} - {fmtDate(exam.examDate)}</p>
                  </div>
                  <RiskBadge value={exam.riskLevel} labels={{ low: t("risk.low"), medium: t("risk.medium"), high: t("risk.high"), critical: t("risk.critical") }} />
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-xs text-text-secondary">{t("exams.readiness")}</p>
                    <p className="mt-1 font-mono text-2xl text-text-primary">{exam.liveReadiness.toFixed(1)}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-xs text-text-secondary">{t("exams.urgency")}</p>
                    <p className="mt-1 font-mono text-2xl text-text-primary">{daysLeft ?? "-"}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-xs text-text-secondary">{t("exams.openErrors")}</p>
                    <p className="mt-1 font-mono text-2xl text-text-primary">{exam.openErrors.length}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <MomentumBar label={t("exams.readiness")} value={exam.liveReadiness * 10} tone={exam.liveReadiness < 5 ? "danger" : "cyan"} />
                  <MomentumBar label={t("exams.urgency")} value={urgency * 10} tone={urgency >= 8 ? "danger" : "gold"} />
                </div>

                <div className="flex flex-wrap gap-2">
                  {exam.weakTopics.slice(0, 3).map((topic) => (
                    <Badge key={topic.id} variant="rose">{topic.title}</Badge>
                  ))}
                  {exam.weakTopics.length === 0 ? <Badge variant="success">{t("mastery.examReady")}</Badge> : null}
                </div>

                <Button asChild className="mt-auto">
                  <Link href={`/exams/${exam.id}`}>
                    <ShieldCheck className="h-4 w-4" />
                    {t("exams.cardAction")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </GlassCard>
            );
          })}
          {examRows.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>{t("common.empty")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary">{t("exams.subtitle")}</p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
