import { AppShell, PageHeader } from "@/components/app-shell";
import { ReviewItemForm } from "@/components/forms/entity-forms";
import { ReviewsList } from "@/components/reviews-list";
import { requireApprovedUser } from "@/lib/auth/supabase";
import { getReviewItems, getSubjects, getTopics } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";

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

  return (
    <AppShell user={user}>
      <PageHeader title={t("reviews.title")} description={t("reviews.subtitle")} />
      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <ReviewItemForm item={editing} subjects={subjects} topics={topics} t={t as (key: string) => string} />
        <div className="min-w-0">
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
        </div>
      </div>
    </AppShell>
  );
}
