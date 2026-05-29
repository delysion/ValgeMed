import { BookOpen, Brain, Clock, RefreshCw, TrendingUp } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { ReviewItemForm } from "@/components/forms/entity-forms";
import { ReviewsList } from "@/components/reviews-list";
import { GlassCard } from "@/components/premium/glass-card";
import { MetricCard } from "@/components/premium/metric-card";
import { SectionHeader } from "@/components/premium/section-header";
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
  const tt = t as (key: string) => string;
  const params = await searchParams;
  const [subjects, topics, reviewItems] = await Promise.all([getSubjects(), getTopics(), getReviewItems()]);
  const editing = reviewItems.find((item) => item.id === params.edit);

  const totalItems = reviewItems.length;
  const activeItems = reviewItems.filter((item) => item.isActive);
  const avgConfidence = activeItems.length > 0
    ? (activeItems.reduce((sum, item) => sum + item.confidence, 0) / activeItems.length).toFixed(1)
    : "0";
  const dueItems = reviewItems.filter((item) => {
    if (!item.dueAt) return false;
    return new Date(item.dueAt) <= new Date();
  }).length;

  return (
    <AppShell user={user}>
      <PageHeader
        title={tt("reviews.title")}
        description={tt("reviews.subtitle")}
      />

      <div className="motion-premium flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Total Cards"
            value={totalItems}
            icon={BookOpen}
            tone="cyan"
            detail={`${subjects.length} subjects`}
          />
          <MetricCard
            label="Active"
            value={activeItems.length}
            icon={RefreshCw}
            tone="emerald"
            detail="in rotation"
          />
          <MetricCard
            label="Avg Confidence"
            value={avgConfidence}
            icon={Brain}
            tone={Number(avgConfidence) >= 6 ? "emerald" : "gold"}
            detail="out of 10"
          />
          <MetricCard
            label="Due Now"
            value={dueItems}
            icon={Clock}
            tone={dueItems > 0 ? "rose" : "emerald"}
            detail="need review"
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
          <GlassCard tone="neutral" padded>
            <SectionHeader
              title={editing ? "Edit Review Card" : "New Review Card"}
              description="Add spaced repetition cards"
              icon={RefreshCw}
            />
            <div className="mt-4">
              <ReviewItemForm item={editing} subjects={subjects} topics={topics} t={tt} />
            </div>
          </GlassCard>

          <GlassCard tone="default" padded={false}>
            <div className="flex items-center justify-between p-5 pb-3">
              <SectionHeader
                title={tt("reviews.title")}
                description={`${totalItems} cards`}
                icon={TrendingUp}
              />
            </div>

            {reviewItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/10 mb-4">
                  <RefreshCw className="h-8 w-8 text-muted" />
                </div>
                <p className="text-muted mb-4">No review cards yet</p>
              </div>
            ) : (
              <ReviewsList
                reviewItems={reviewItems}
                subjects={subjects}
                topics={topics}
                labels={{
                  question: tt("common.question"),
                  subject: tt("common.subject"),
                  type: tt("common.type"),
                  date: tt("common.date"),
                  confidence: tt("common.confidence"),
                  interval: tt("common.interval"),
                  actions: tt("common.actions"),
                  open: tt("common.open"),
                  edit: tt("common.edit"),
                  delete: tt("common.delete"),
                  markReviewed: tt("reviews.markReviewed"),
                  emptyTitle: tt("common.emptyTitle"),
                  emptyBody: tt("common.emptyBody"),
                  active: tt("status.active"),
                  inactive: tt("common.no"),
                }}
              />
            )}
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}
