import { isBefore, startOfToday } from "date-fns";
import { CheckCircle2, Flame, RotateCw, ShieldAlert, Skull } from "lucide-react";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AppShell, PageHeader } from "@/components/app-shell";
import { DeleteButton } from "@/components/forms/delete-button";
import { ErrorLogForm } from "@/components/forms/entity-forms";
import { GlassCard } from "@/components/premium/glass-card";
import { MetricCard } from "@/components/premium/metric-card";
import { SectionHeader } from "@/components/premium/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteErrorLogAction, toggleErrorResolvedAction } from "@/lib/actions/resources";
import { requireApprovedUser } from "@/lib/auth/supabase";
import { getErrorLogs, getExams, getSubjects, getTopics } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";
import { fmtDate, humanize } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function ErrorsPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const user = await requireApprovedUser();
  const { t } = await getI18n();
  const tt = t as (key: string) => string;
  const params = await searchParams;
  const [subjects, exams, topics, errorLogs] = await Promise.all([getSubjects(), getExams(), getTopics(), getErrorLogs()]);
  const editing = errorLogs.find((error) => error.id === params.edit);
  const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));
  const open = errorLogs.filter((error) => !error.resolved);
  const destroyed = errorLogs.filter((error) => error.resolved);
  const recurring = open.filter((error) => error.recurrenceCount > 0);
  const retestDue = open.filter((error) => error.retestAt && isBefore(error.retestAt, startOfToday()));
  const criticalErrors = open.filter((error) => error.severity >= 8);

  return (
    <AppShell user={user}>
      <PageHeader
        title={tt("errors.title")}
        description={tt("errors.subtitle")}
      />

      <div className="motion-premium flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Unresolved"
            value={open.length}
            icon={ShieldAlert}
            tone={open.length > 0 ? "rose" : "emerald"}
            detail={`${criticalErrors.length} critical`}
          />
          <MetricCard
            label="Recurring"
            value={recurring.length}
            icon={RotateCw}
            tone={recurring.length > 0 ? "gold" : "emerald"}
            detail="need pattern fix"
          />
          <MetricCard
            label="Retest Due"
            value={retestDue.length}
            icon={Flame}
            tone={retestDue.length > 0 ? "gold" : "emerald"}
            detail="overdue check"
          />
          <MetricCard
            label="Destroyed"
            value={destroyed.length}
            icon={CheckCircle2}
            tone="emerald"
            detail="resolved"
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
          <GlassCard tone="neutral" padded>
            <SectionHeader
              title={editing ? "Edit Error Log" : "New Error Log"}
              description="Capture a mistake to destroy it"
              action={editing ? (
                <Button asChild variant="outline" size="sm">
                  <Link href="/errors">
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    {tt("common.cancel")}
                  </Link>
                </Button>
              ) : undefined}
            />
            <div className="mt-4">
              <ErrorLogForm error={editing} subjects={subjects} topics={topics} exams={exams} t={tt} />
            </div>
          </GlassCard>

          <div className="space-y-4">
            {errorLogs.length === 0 ? (
              <GlassCard tone="emerald">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald/10 mb-4">
                    <CheckCircle2 className="h-8 w-8 text-emerald" />
                  </div>
                  <p className="text-muted mb-2">No errors logged</p>
                  <p className="text-xs text-muted-2">Your knowledge is clean</p>
                </div>
              </GlassCard>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {errorLogs.map((error) => {
                  const subject = subjectById.get(error.subjectId);
                  const isCritical = error.severity >= 8 && !error.resolved;

                  return (
                    <GlassCard
                      key={error.id}
                      tone={error.resolved ? "emerald" : isCritical ? "danger" : "rose"}
                      className="relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-muted/5" />

                      <div className="relative">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant={error.resolved ? "success" : "danger"}>
                              {error.resolved ? tt("errors.errorDestroyed") : tt("status.open")}
                            </Badge>
                            {isCritical && (
                              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-rose/10 text-rose">
                                <Flame className="mr-0.5 h-2.5 w-2.5" />
                                Critical
                              </span>
                            )}
                          </div>
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            error.resolved ? "bg-emerald/10" : "bg-rose/10"
                          }`}>
                            <Skull className={`h-5 w-5 ${error.resolved ? "text-emerald" : "text-rose"}`} />
                          </div>
                        </div>

                        <h3 className="text-lg font-semibold text-text-primary mb-1">{error.title}</h3>
                        <p className="text-sm text-muted mb-4">
                          {subject?.name ?? "No subject"} - {humanize(error.errorType)}
                        </p>

                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className={`rounded-xl p-3 text-center ${
                            error.resolved ? "bg-emerald/5" : "bg-rose/5"
                          }`}>
                            <p className="text-xs text-muted uppercase tracking-wider">Severity</p>
                            <p className={`font-mono text-xl font-semibold mt-1 ${
                              error.severity >= 8 ? "text-rose" : error.severity >= 5 ? "text-amber" : "text-text-primary"
                            }`}>
                              {error.severity}
                            </p>
                          </div>
                          <div className={`rounded-xl p-3 text-center ${
                            error.resolved ? "bg-emerald/5" : "bg-rose/5"
                          }`}>
                            <p className="text-xs text-muted uppercase tracking-wider">Recurrence</p>
                            <p className={`font-mono text-xl font-semibold mt-1 ${
                              error.recurrenceCount > 0 ? "text-amber" : "text-text-primary"
                            }`}>
                              {error.recurrenceCount}
                            </p>
                          </div>
                          <div className={`rounded-xl p-3 text-center ${
                            error.resolved ? "bg-emerald/5" : "bg-rose/5"
                          }`}>
                            <p className="text-xs text-muted uppercase tracking-wider">Retest</p>
                            <p className={`font-mono text-sm font-semibold mt-1 ${
                              error.retestAt && isBefore(error.retestAt, startOfToday()) && !error.resolved ? "text-rose" : "text-text-primary"
                            }`}>
                              {error.retestAt ? fmtDate(error.retestAt) : "-"}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-xl border border-border/60 bg-bg-page/35 p-3 mb-4">
                          <p className="text-xs text-muted uppercase tracking-wider mb-1">Prevention Rule</p>
                          <p className="text-sm text-text-secondary leading-relaxed">
                            {error.preventionRule ?? error.correction ?? error.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/50">
                          <form action={toggleErrorResolvedAction} className="flex-1">
                            <input type="hidden" name="id" value={error.id} />
                            <Button
                              type="submit"
                              variant={error.resolved ? "outline" : "default"}
                              size="sm"
                              className="w-full"
                            >
                              <CheckCircle2 className="mr-1.5 h-4 w-4" />
                              {error.resolved ? "Reopen" : "Mark Destroyed"}
                            </Button>
                          </form>
                          <Button asChild variant="ghost" size="icon" className="shrink-0">
                            <Link href={`/errors?edit=${error.id}`}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.844a.5.5 0 0 1-.62-.62l.844-2.872a2 2 0 0 1 .506-.855z"/>
                              </svg>
                            </Link>
                          </Button>
                          <DeleteButton action={deleteErrorLogAction} id={error.id} />
                        </div>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
