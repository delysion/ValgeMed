import { isBefore, isToday, startOfToday } from "date-fns";
import { RotateCw } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { ReviewItemForm } from "@/components/forms/entity-forms";
import { ResourceTable } from "@/components/tables/resource-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  deleteReviewItemAction,
  markReviewItemReviewedAction,
} from "@/lib/actions/resources";
import { requireOwnerSession } from "@/lib/auth/session";
import { getCoreData } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server";
import { fmtDate, humanize } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const session = await requireOwnerSession();
  const { t } = await getI18n();
  const params = await searchParams;
  const data = await getCoreData();
  const editing = data.reviewItems.find((item) => item.id === params.edit);
  const subjectById = new Map(data.subjects.map((subject) => [subject.id, subject]));
  const today = startOfToday();
  const activeItems = data.reviewItems.filter((item) => item.isActive);
  const dueToday = activeItems.filter((item) => isToday(item.dueAt));
  const overdue = activeItems.filter((item) => isBefore(item.dueAt, today));

  return (
    <AppShell session={session}>
      <PageHeader title={t("reviews.title")} description={t("reviews.subtitle")} />
      <div className="grid gap-4 xl:grid-cols-[460px_1fr]">
        <ReviewItemForm item={editing} subjects={data.subjects} topics={data.topics} />
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("reviews.dueToday")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dueToday.length === 0 ? <p className="text-sm text-text-secondary">{t("common.noData")}</p> : null}
                {dueToday.slice(0, 6).map((item) => (
                  <div key={item.id} className="rounded-md border border-border p-3">
                    <div className="text-sm text-text-primary">{item.question}</div>
                    <div className="mt-1 text-xs text-text-secondary">{subjectById.get(item.subjectId)?.name ?? "-"}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("reviews.overdue")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {overdue.length === 0 ? <p className="text-sm text-text-secondary">{t("common.noData")}</p> : null}
                {overdue.slice(0, 6).map((item) => (
                  <div key={item.id} className="rounded-md border border-rose/20 bg-rose-bg p-3">
                    <div className="text-sm text-text-primary">{item.question}</div>
                    <div className="mt-1 text-xs text-text-secondary">{t("common.date")} {fmtDate(item.dueAt)}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>{t("reviews.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResourceTable
                rows={data.reviewItems}
                editBasePath="/reviews"
                deleteAction={deleteReviewItemAction}
                extraActions={(item) => (
                  <form action={markReviewItemReviewedAction} className="flex items-center gap-1">
                    <input type="hidden" name="id" value={item.id} />
                    <input
                      name="confidence"
                      type="number"
                      min={0}
                      max={10}
                      defaultValue={item.confidence}
                      className="h-8 w-14 rounded-md border border-border bg-bg-subtle px-2 text-xs text-text-primary"
                    />
                      <Button type="submit" variant="ghost" size="icon" aria-label={t("reviews.markReviewed")}>
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </form>
                )}
                columns={[
                  { header: t("common.question"), render: (item) => <span className="line-clamp-2 text-text-primary">{item.question}</span> },
                  { header: t("common.subject"), render: (item) => subjectById.get(item.subjectId)?.name ?? "-" },
                  { header: t("common.type"), render: (item) => humanize(item.reviewType) },
                  { header: t("common.date"), render: (item) => fmtDate(item.dueAt) },
                  { header: t("common.confidence"), render: (item) => <Badge>{item.confidence}/10</Badge> },
                  { header: t("common.interval"), render: (item) => `${item.intervalDays}d` },
                ]}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
