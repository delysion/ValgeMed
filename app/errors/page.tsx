import { isBefore, startOfToday } from "date-fns";
import { CheckCircle2, Flame, RotateCw, ShieldAlert, Skull, Trash2 } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { ErrorLogForm } from "@/components/forms/entity-forms";
import { GlassCard } from "@/components/premium/glass-card";
import { MetricCard } from "@/components/premium/metric-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteErrorLogAction, toggleErrorResolvedAction } from "@/lib/actions/resources";
import { requireOwnerSession } from "@/lib/auth/session";
import { getCoreData } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server";
import { fmtDate, humanize } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function ErrorsPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const session = await requireOwnerSession();
  const { t } = await getI18n();
  const params = await searchParams;
  const data = await getCoreData();
  const editing = data.errorLogs.find((error) => error.id === params.edit);
  const subjectById = new Map(data.subjects.map((subject) => [subject.id, subject]));
  const open = data.errorLogs.filter((error) => !error.resolved);
  const destroyed = data.errorLogs.filter((error) => error.resolved);
  const recurring = open.filter((error) => error.recurrenceCount > 0);
  const retestDue = open.filter((error) => error.retestAt && isBefore(error.retestAt, startOfToday()));

  return (
    <AppShell session={session}>
      <PageHeader title={t("errors.title")} description={t("errors.subtitle")} />
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard title={t("errors.unresolved")} value={open.length} icon={ShieldAlert} tone={open.length > 0 ? "danger" : "emerald"} />
        <MetricCard title={t("errors.recurring")} value={recurring.length} icon={RotateCw} tone={recurring.length > 0 ? "rose" : "emerald"} />
        <MetricCard title={t("errors.retestDue")} value={retestDue.length} icon={Flame} tone={retestDue.length > 0 ? "gold" : "emerald"} />
        <MetricCard title={t("errors.destroyed")} value={destroyed.length} icon={CheckCircle2} tone="emerald" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[420px_1fr]">
        <ErrorLogForm error={editing} subjects={data.subjects} topics={data.topics} exams={data.exams} />
        <div className="grid gap-4 md:grid-cols-2">
          {data.errorLogs.map((error) => (
            <GlassCard key={error.id} tone={error.resolved ? "emerald" : error.severity >= 7 ? "danger" : "rose"} className={error.resolved ? "opacity-80" : undefined}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge variant={error.resolved ? "success" : "danger"}>
                    {error.resolved ? t("errors.errorDestroyed") : t("status.open")}
                  </Badge>
                  <h3 className="mt-3 text-xl font-semibold text-text-primary">{error.title}</h3>
                  <p className="mt-1 text-sm text-text-secondary">{subjectById.get(error.subjectId)?.name ?? t("common.subject")} - {humanize(error.errorType)}</p>
                </div>
                <div className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.06]">
                  <Skull className="h-5 w-5 text-rose" />
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/[0.045] p-3">
                  <p className="text-xs text-text-secondary">{t("errors.severity")}</p>
                  <p className="font-mono text-2xl text-text-primary">{error.severity}</p>
                </div>
                <div className="rounded-2xl bg-white/[0.045] p-3">
                  <p className="text-xs text-text-secondary">{t("errors.recurrence")}</p>
                  <p className="font-mono text-2xl text-text-primary">{error.recurrenceCount}</p>
                </div>
                <div className="rounded-2xl bg-white/[0.045] p-3">
                  <p className="text-xs text-text-secondary">{t("errors.retestDue")}</p>
                  <p className="text-sm font-medium text-text-primary">{fmtDate(error.retestAt)}</p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-text-secondary">{t("errors.preventionRule")}</p>
                <p className="mt-2 text-sm leading-6 text-text-primary">{error.preventionRule ?? error.correction ?? error.description}</p>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <form action={toggleErrorResolvedAction}>
                  <input type="hidden" name="id" value={error.id} />
                  <Button type="submit" variant={error.resolved ? "outline" : "default"} size="sm">
                    <CheckCircle2 className="h-4 w-4" />
                    {error.resolved ? t("status.open") : t("errors.errorDestroyed")}
                  </Button>
                </form>
                <Button asChild variant="ghost" size="sm">
                  <a href={`/errors?edit=${error.id}`}>{t("common.edit")}</a>
                </Button>
                <form action={deleteErrorLogAction}>
                  <input type="hidden" name="id" value={error.id} />
                  <Button type="submit" variant="destructive" size="icon" aria-label={t("common.delete")}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
