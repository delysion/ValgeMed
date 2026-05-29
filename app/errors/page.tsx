import { isBefore, startOfToday } from "date-fns";
import { CheckCircle2, Flame, RotateCw, ShieldAlert } from "lucide-react";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ErrorGrid } from "@/components/error-grid";
import { ErrorLogForm } from "@/components/forms/entity-forms";
import { GlassCard } from "@/components/premium/glass-card";
import { MetricCard } from "@/components/premium/metric-card";
import { SectionHeader } from "@/components/premium/section-header";
import { Button } from "@/components/ui/button";
import { requireApprovedUser } from "@/lib/auth/supabase";
import { getErrorLogs, getExams, getSubjects, getTopics } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";

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
            <ErrorGrid
              errorLogs={errorLogs}
              subjects={subjects}
              labels={{
                open: tt("status.open"),
                destroyed: tt("errors.errorDestroyed"),
                critical: "Critical",
                severity: "Severity",
                recurrence: "Recurrence",
                retest: "Retest",
                preventionRule: "Prevention Rule",
                edit: tt("common.edit"),
                delete: tt("common.delete"),
                emptyTitle: "No errors logged",
                emptyDesc: "Your knowledge is clean",
              }}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
