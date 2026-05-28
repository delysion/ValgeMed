import { Activity, Brain, Clock, Edit3, Eye, Sparkles, Timer, Zap, type LucideIcon } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { DeleteButton } from "@/components/forms/delete-button";
import { StudySessionForm } from "@/components/forms/entity-forms";
import { CollapsiblePanel } from "@/components/premium/collapsible-panel";
import { FocusTimer } from "@/components/premium/focus-timer";
import { GlassCard } from "@/components/premium/glass-card";
import { MomentumBar } from "@/components/premium/momentum-bar";
import { SectionHeader } from "@/components/premium/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteStudySessionAction } from "@/lib/actions/resources";
import { requireApprovedUser } from "@/lib/auth/supabase";
import { getReferenceData, getStudySessions } from "@/lib/data/queries";
import type { StudySession, Subject } from "@/lib/db/schema";
import { getI18n } from "@/lib/i18n/server-i18n";
import { fmtDate, humanize } from "@/lib/labels";

export const dynamic = "force-dynamic";

const activeMethods = new Set(["active_recall", "quiz", "simulation", "error_review"]);

type TFunc = (key: string) => string;

export default async function StudyPage({ searchParams }: { searchParams: Promise<{ edit?: string; view?: string }> }) {
  const user = await requireApprovedUser();
  const { t } = await getI18n();
  const params = await searchParams;
  const [ref, studySessions] = await Promise.all([getReferenceData(), getStudySessions()]);
  const editing = studySessions.find((item) => item.id === params.edit);
  const selectedSession = studySessions.find((item) => item.id === params.view);
  const subjectById = new Map(ref.subjects.map((subject) => [subject.id, subject]));
  const topicById = new Map(ref.topics.map((topic) => [topic.id, topic]));
  const examById = new Map(ref.exams.map((exam) => [exam.id, exam]));
  const activeMinutes = studySessions.filter((item) => activeMethods.has(item.method)).reduce((sum, item) => sum + item.durationMinutes, 0);
  const passiveMinutes = studySessions.filter((item) => ["reading", "notes"].includes(item.method)).reduce((sum, item) => sum + item.durationMinutes, 0);
  const totalMinutes = studySessions.reduce((sum, item) => sum + item.durationMinutes, 0);
  const activeRatio = totalMinutes === 0 ? 0 : (activeMinutes / totalMinutes) * 100;
  const methodTotals = Object.entries(
    studySessions.reduce<Record<string, number>>((acc, item) => {
      acc[item.method] = (acc[item.method] ?? 0) + item.durationMinutes;
      return acc;
    }, {}),
  )
    .map(([name, value]) => ({ name: humanize(name), value }))
    .sort((a, b) => b.value - a.value);
  const dayTotals = Object.entries(
    studySessions.slice(0, 80).reduce<Record<string, number>>((acc, item) => {
      const key = item.startedAt.toISOString().slice(5, 10);
      acc[key] = (acc[key] ?? 0) + item.durationMinutes;
      return acc;
    }, {}),
  )
    .map(([name, minutes]) => ({ name, minutes }))
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(-14);
  const latestSession = studySessions[0];
  const recentSessions = studySessions.slice(0, 10);
  const avgFocus = average(recentSessions.map((item) => item.focusLevel));
  const avgOutput = average(recentSessions.map((item) => item.outputQuality));
  const latestLabel = latestSession
    ? `${subjectById.get(latestSession.subjectId)?.name ?? t("common.subject")} · ${latestSession.durationMinutes} ${t("common.minutes").toLowerCase()}`
    : t("common.noData");

  return (
    <AppShell user={user}>
      <PageHeader title={t("study.title")} description={t("study.subtitle")} />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(390px,440px)]">
        <div className="min-w-0 space-y-5">
          <StudyCommandPanel
            activeMinutes={activeMinutes}
            passiveMinutes={passiveMinutes}
            totalMinutes={totalMinutes}
            activeRatio={activeRatio}
            latestLabel={latestLabel}
            t={t as TFunc}
          />

          <WeeklyStudyPulse
            dayTotals={dayTotals}
            activeRatio={activeRatio}
            avgFocus={avgFocus}
            avgOutput={avgOutput}
            t={t as TFunc}
          />

          <SessionHistoryPanel sessions={studySessions.slice(0, 8)} subjectById={subjectById} t={t as TFunc} />
          {selectedSession ? (
            <StudySessionDetail
              session={selectedSession}
              subjectName={subjectById.get(selectedSession.subjectId)?.name}
              topicTitle={selectedSession.topicId ? topicById.get(selectedSession.topicId)?.title : undefined}
              examTitle={selectedSession.examId ? examById.get(selectedSession.examId)?.title : undefined}
              t={t as TFunc}
            />
          ) : null}
        </div>

        <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <StudySessionForm compact session={editing} subjects={ref.subjects} topics={ref.topics} exams={ref.exams} t={t as TFunc} />

          <CollapsiblePanel title={t("command.focusTimer")} defaultOpen>
            <FocusTimer compact />
          </CollapsiblePanel>

          <MethodMixPanel methodTotals={methodTotals} totalMinutes={totalMinutes} t={t as TFunc} />
        </div>
      </div>
    </AppShell>
  );
}

function average(values: number[]) {
  const safe = values.filter(Number.isFinite);
  if (safe.length === 0) return 0;
  return safe.reduce((sum, value) => sum + value, 0) / safe.length;
}

function StudyCommandPanel({
  activeMinutes,
  passiveMinutes,
  totalMinutes,
  activeRatio,
  latestLabel,
  t,
}: {
  activeMinutes: number;
  passiveMinutes: number;
  totalMinutes: number;
  activeRatio: number;
  latestLabel: string;
  t: TFunc;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-cyan/15 bg-gradient-to-br from-bg-surface via-bg-surface to-cyan-bg/20 shadow-[var(--shadow-card)]">
      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan/15 bg-cyan-bg/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan">
            <Activity className="h-3.5 w-3.5" />
            {t("study.commandCenter")}
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
            {activeRatio >= 60 ? t("study.signalActive") : t("study.signalNeedsRecall")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">{t("study.commandCenterDesc")}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-bg-page/45 p-4 text-right">
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-text-muted">{t("study.weeklyOutput")}</p>
          <p className="mt-1 font-mono text-4xl font-semibold text-text-primary">{totalMinutes}</p>
          <p className="text-xs text-text-secondary">{t("common.minutes")}</p>
        </div>
      </div>
      <div className="grid border-t border-border/70 bg-bg-page/25 md:grid-cols-4">
        <StudySignal icon={Brain} label={t("study.activeRecall")} value={`${activeMinutes}m`} tone="cyan" />
        <StudySignal icon={Clock} label={t("study.passive")} value={`${passiveMinutes}m`} tone="gold" />
        <StudySignal icon={Zap} label={t("study.activeRatio")} value={`${activeRatio.toFixed(0)}%`} tone={activeRatio >= 55 ? "emerald" : "rose"} />
        <StudySignal icon={Sparkles} label={t("study.lastSession")} value={latestLabel} tone="violet" />
      </div>
    </section>
  );
}

function StudySignal({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: "cyan" | "gold" | "emerald" | "rose" | "violet";
}) {
  const toneClass = {
    cyan: "text-cyan bg-cyan-bg/40 border-cyan/15",
    gold: "text-gold bg-gold-bg/35 border-gold/15",
    emerald: "text-emerald bg-emerald-bg/35 border-emerald/15",
    rose: "text-rose bg-rose-bg/35 border-rose/15",
    violet: "text-violet bg-violet-bg/35 border-violet/15",
  };

  return (
    <div className="flex min-w-0 items-center gap-3 border-b border-border/60 p-4 last:border-b-0 md:border-r md:border-b-0 md:last:border-r-0">
      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${toneClass[tone]}`}>
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold uppercase tracking-[0.1em] text-text-muted">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-text-primary">{value}</p>
      </div>
    </div>
  );
}

function WeeklyStudyPulse({
  dayTotals,
  activeRatio,
  avgFocus,
  avgOutput,
  t,
}: {
  dayTotals: Array<{ name: string; minutes: number }>;
  activeRatio: number;
  avgFocus: number;
  avgOutput: number;
  t: TFunc;
}) {
  const maxMinutes = Math.max(60, ...dayTotals.map((day) => day.minutes));

  return (
    <GlassCard tone="cyan" className="overflow-hidden">
      <SectionHeader title={t("study.weeklyOutput")} description={t("common.protectEnergy")} icon={Timer} />
      <div className="mt-5">
        {dayTotals.length > 0 ? (
          <div className="rounded-2xl border border-border/60 bg-bg-page/35 p-4">
            <div className="flex h-52 items-end gap-2">
              {dayTotals.map((day) => {
                const height = Math.max(8, (day.minutes / maxMinutes) * 100);
                return (
                  <div key={day.name} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                    <div className="flex h-40 w-full items-end rounded-xl bg-bg-surface/45 px-1.5 pb-1.5">
                      <div
                        className="w-full rounded-lg bg-gradient-to-t from-cyan via-emerald to-gold shadow-[0_8px_24px_rgba(88,208,232,0.18)]"
                        style={{ height: `${height}%` }}
                        title={`${day.minutes} ${t("common.minutes").toLowerCase()}`}
                      />
                    </div>
                    <span className="truncate text-[10px] font-medium text-text-muted">{day.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-border/60 bg-bg-page/30 text-sm text-text-muted">
            {t("common.noData")}
          </div>
        )}
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <MomentumBar label={t("study.activeRecall")} value={activeRatio} tone="cyan" />
        <MomentumBar label={t("common.focus")} value={avgFocus * 10} tone="violet" />
        <MomentumBar label={t("common.output")} value={avgOutput * 10} tone="emerald" />
      </div>
    </GlassCard>
  );
}

function SessionHistoryPanel({
  sessions,
  subjectById,
  t,
}: {
  sessions: StudySession[];
  subjectById: Map<string, Subject>;
  t: TFunc;
}) {
  return (
    <GlassCard>
      <SectionHeader title={t("study.sessionHistory")} description={t("study.recentSessions")} />
      <div className="mt-4 divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 bg-bg-page/25">
        {sessions.length > 0 ? (
          sessions.map((item) => {
            const subject = item.subjectId ? subjectById.get(item.subjectId) : null;
            return (
              <div key={item.id} className="grid gap-3 p-4 transition hover:bg-bg-surface/55 md:grid-cols-[minmax(0,1fr)_auto_auto_auto] md:items-center">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="h-10 w-1.5 rounded-full" style={{ backgroundColor: subject?.color ?? "#58D0E8" }} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-primary">{subject?.name ?? t("common.subject")}</p>
                    <p className="mt-0.5 text-xs text-text-secondary">{fmtDate(item.startedAt)} · {humanize(item.method)}</p>
                  </div>
                </div>
                <Badge variant={activeMethods.has(item.method) ? "success" : "muted"} className="w-fit">{item.durationMinutes}m</Badge>
                <div className="flex gap-2 text-xs text-text-secondary">
                  <span>{t("common.focus")}: {item.focusLevel}/10</span>
                  <span>{t("common.output")}: {item.outputQuality}/10</span>
                </div>
                <div className="flex justify-end gap-1">
                  <Button asChild variant="ghost" size="icon" aria-label={t("common.open")}>
                    <a href={`/study?view=${item.id}`}>
                      <Eye className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button asChild variant="ghost" size="icon" aria-label={t("common.edit")}>
                    <a href={`/study?edit=${item.id}`}>
                      <Edit3 className="h-4 w-4" />
                    </a>
                  </Button>
                  <DeleteButton action={deleteStudySessionAction} id={item.id} label={t("common.delete")} returnTo="/study" />
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-6 text-sm text-text-muted">{t("common.noData")}</div>
        )}
      </div>
    </GlassCard>
  );
}

function StudySessionDetail({
  session,
  subjectName,
  topicTitle,
  examTitle,
  t,
}: {
  session: StudySession;
  subjectName?: string;
  topicTitle?: string;
  examTitle?: string;
  t: TFunc;
}) {
  return (
    <GlassCard tone="cyan">
      <SectionHeader title={subjectName ?? t("common.subject")} description={`${fmtDate(session.startedAt)} / ${humanize(session.method)}`} />
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <Badge className="w-fit">{session.durationMinutes}m</Badge>
        <Badge variant={session.focusLevel >= 7 ? "success" : "muted"} className="w-fit">{t("common.focus")}: {session.focusLevel}/10</Badge>
        <Badge variant={session.outputQuality >= 7 ? "success" : "muted"} className="w-fit">{t("common.output")}: {session.outputQuality}/10</Badge>
        <Badge variant={session.energyLevel >= 6 ? "success" : "warning"} className="w-fit">{t("form.studySession.energyLabel")}: {session.energyLevel}/10</Badge>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <DetailLine label={t("common.topic")} value={topicTitle} />
        <DetailLine label={t("common.exam")} value={examTitle} />
        <DetailLine label={t("form.studySession.startLabel")} value={fmtDate(session.startedAt)} />
        <DetailLine label={t("form.studySession.endLabel")} value={fmtDate(session.endedAt)} />
      </div>
      {session.notes ? (
        <div className="mt-4 rounded-2xl border border-border/60 bg-bg-page/35 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">{t("form.studySession.notesLabel")}</p>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-text-secondary">{session.notes}</p>
        </div>
      ) : null}
    </GlassCard>
  );
}

function DetailLine({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-xl border border-border/60 bg-bg-page/35 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">{label}</p>
      <p className="mt-1 text-sm text-text-primary">{value || "-"}</p>
    </div>
  );
}

function MethodMixPanel({
  methodTotals,
  totalMinutes,
  t,
}: {
  methodTotals: Array<{ name: string; value: number }>;
  totalMinutes: number;
  t: TFunc;
}) {
  return (
    <GlassCard>
      <SectionHeader title={t("study.methodMix")} description={t("study.methodSelector")} />
      <div className="mt-4 space-y-3">
        {methodTotals.length > 0 ? (
          methodTotals.slice(0, 6).map((method, index) => {
            const width = totalMinutes === 0 ? 0 : (method.value / totalMinutes) * 100;
            const tone = index % 3 === 0 ? "bg-cyan" : index % 3 === 1 ? "bg-emerald" : "bg-gold";
            return (
              <div key={method.name}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-medium text-text-primary">{method.name}</span>
                  <span className="shrink-0 font-mono text-xs text-text-secondary">{method.value}m</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-bg-subtle">
                  <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.max(4, width)}%` }} />
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-border/60 bg-bg-page/30 p-6 text-sm text-text-muted">
            {t("common.noData")}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
