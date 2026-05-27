import { isBefore, isToday, startOfToday } from "date-fns";

import { AppShell, PageHeader } from "@/components/app-shell";
import { ReviewItemForm } from "@/components/forms/entity-forms";
import { ReviewsList } from "@/components/reviews-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireApprovedUser } from "@/lib/auth/supabase";
import { getReviewItems, getSubjects, getTopics } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";
import { fmtDate } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const user = await requireApprovedUser();
  const { t } = await getI18n();
  const params = await searchParams;
  const [subjects, topics, reviewItems] = await Promise.all([getSubjects(), getTopics(), getReviewItems()]);
  const editing = reviewItems.find((item) => item.id === params.edit);
  const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));
  const today = startOfToday();
  const activeItems = reviewItems.filter((item) => item.isActive);
  const dueToday = activeItems.filter((item) => isToday(item.dueAt));
  const overdue = activeItems.filter((item) => isBefore(item.dueAt, today));

  return (
    <AppShell user={user}>
      <PageHeader title={t("reviews.title")} description={t("reviews.subtitle")} />
      <div className="grid gap-4 xl:grid-cols-[460px_1fr]">
        <ReviewItemForm item={editing} subjects={subjects} topics={topics} t={t as (key: string) => string} />
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
              <ReviewsList
                reviewItems={reviewItems}
                subjects={subjects}
                topics={topics}
                labels={{
                  question: t("common.question"),
                  subject: t("common.subject"),
                  type: t("common.type"),
                  date: t("common.date"),
                  confidence: t("common.confidence"),
                  interval: t("common.interval"),
                  actions: t("common.actions"),
                  open: t("common.open"),
                  edit: t("common.edit"),
                  delete: t("common.delete"),
                  markReviewed: t("reviews.markReviewed"),
                  emptyTitle: t("common.emptyTitle"),
                  emptyBody: t("common.emptyBody"),
                  active: t("status.active"),
                  inactive: t("common.no"),
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
