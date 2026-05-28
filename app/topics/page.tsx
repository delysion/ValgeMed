import { Filter } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { TopicForm } from "@/components/forms/entity-forms";
import { TopicsGrid } from "@/components/topics-grid";
import { masteryKey, type MasteryLevel } from "@/components/premium/gamification";
import { GlassCard } from "@/components/premium/glass-card";
import { Button } from "@/components/ui/button";
import { requireApprovedUser } from "@/lib/auth/supabase";
import { getErrorLogs, getExams, getSubjects, getTopics } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";
import { humanize } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function TopicsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; subject?: string; status?: string; priority?: string }>;
}) {
  const user = await requireApprovedUser();
  const { t } = await getI18n();
  const params = await searchParams;
  const [subjects, exams, topics, errorLogs] = await Promise.all([getSubjects(), getExams(), getTopics(), getErrorLogs()]);
  const editing = topics.find((topic) => topic.id === params.edit);
  const filteredTopics = topics.filter((topic) => {
    if (params.subject && topic.subjectId !== params.subject) return false;
    if (params.status && topic.status !== params.status) return false;
    if (params.priority && topic.priority < Number(params.priority)) return false;
    return true;
  });

  return (
    <AppShell user={user}>
      <PageHeader title={t("topics.title")} description={t("topics.subtitle")} />
      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <TopicForm topic={editing} subjects={subjects} exams={exams} t={t as (key: string) => string} />
        <div className="space-y-5">
          <GlassCard>
            <form className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <select name="subject" defaultValue={params.subject ?? ""} className="h-11 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-text-primary">
                <option value="">{t("common.subject")}</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id} className="bg-[#11151c]">{subject.name}</option>
                ))}
              </select>
              <select name="status" defaultValue={params.status ?? ""} className="h-11 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-text-primary">
                <option value="">{t("common.status")}</option>
                {["not_started", "first_exposure", "understood", "recalled", "practiced", "error_corrected", "consolidated", "exam_ready"].map((status) => (
                  <option key={status} value={status} className="bg-[#11151c]">{humanize(status)}</option>
                ))}
              </select>
              <input name="priority" type="number" min={0} max={10} defaultValue={params.priority ?? ""} placeholder={t("common.priority")} className="h-11 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-text-primary" />
              <Button type="submit" variant="outline">
                <Filter className="h-4 w-4" />
                {t("common.open")}
              </Button>
            </form>
          </GlassCard>

          <TopicsGrid
            topics={filteredTopics}
            subjects={subjects}
            exams={exams}
            errorLogs={errorLogs}
            labels={{
              subject: t("common.subject"),
              linkedExam: t("topics.linkedExam"),
              activeRecall: t("nba.active_recall.title"),
              errorReview: t("nba.error_review.title"),
              reviews: t("reviews.title"),
              confidence: t("common.confidence"),
              priority: t("common.priority"),
              nextReview: t("common.nextReview"),
              unresolved: t("errors.unresolved"),
              open: t("common.open"),
              edit: t("common.edit"),
              delete: t("common.delete"),
              mastery: {
                dormant: t(masteryKey("dormant" satisfies MasteryLevel)),
                awakening: t(masteryKey("awakening" satisfies MasteryLevel)),
                building: t(masteryKey("building" satisfies MasteryLevel)),
                dangerous: t(masteryKey("dangerous" satisfies MasteryLevel)),
                examReady: t(masteryKey("examReady" satisfies MasteryLevel)),
                mastered: t(masteryKey("mastered" satisfies MasteryLevel)),
              },
            }}
          />
        </div>
      </div>
    </AppShell>
  );
}
