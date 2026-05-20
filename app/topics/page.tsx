import { ArrowRight, Filter, Trash2 } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { TopicForm } from "@/components/forms/entity-forms";
import { getMasteryLevel, masteryKey, MasteryBadge } from "@/components/premium/gamification";
import { GlassCard } from "@/components/premium/glass-card";
import { MomentumBar } from "@/components/premium/momentum-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteTopicAction } from "@/lib/actions/resources";
import { requireUser } from "@/lib/auth/supabase";
import { getCoreData } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server";
import { fmtDate, humanize } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function TopicsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; subject?: string; status?: string; priority?: string }>;
}) {
  const user = await requireUser();
  const { t } = await getI18n();
  const params = await searchParams;
  const data = await getCoreData();
  const editing = data.topics.find((topic) => topic.id === params.edit);
  const subjectById = new Map(data.subjects.map((subject) => [subject.id, subject]));
  const examById = new Map(data.exams.map((exam) => [exam.id, exam]));
  const filteredTopics = data.topics.filter((topic) => {
    if (params.subject && topic.subjectId !== params.subject) return false;
    if (params.status && topic.status !== params.status) return false;
    if (params.priority && topic.priority < Number(params.priority)) return false;
    return true;
  });

  return (
    <AppShell user={user}>
      <PageHeader title={t("topics.title")} description={t("topics.subtitle")} />
      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <TopicForm topic={editing} subjects={data.subjects} exams={data.exams} t={t as (key: string) => string} />
        <div className="space-y-5">
          <GlassCard>
            <form className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <select name="subject" defaultValue={params.subject ?? ""} className="h-11 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-text-primary">
                <option value="">{t("common.subject")}</option>
                {data.subjects.map((subject) => (
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

          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {filteredTopics.map((topic) => {
              const openErrors = data.errorLogs.filter((error) => error.topicId === topic.id && !error.resolved).length;
              const level = getMasteryLevel({ confidence: topic.confidence, status: topic.status, openErrors });
              const suggestedAction = topic.confidence <= 3 ? t("nba.active_recall.title") : openErrors > 0 ? t("nba.error_review.title") : t("reviews.title");

              return (
                <GlassCard key={topic.id} tone={level === "dangerous" ? "danger" : level === "examReady" ? "gold" : "cyan"} className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-text-secondary">{subjectById.get(topic.subjectId)?.name ?? t("common.subject")}</p>
                      <h3 className="mt-2 text-xl font-semibold text-text-primary">{topic.title}</h3>
                      <p className="mt-1 text-sm text-text-secondary">{topic.examId ? examById.get(topic.examId)?.title : t("topics.linkedExam")}</p>
                    </div>
                    <MasteryBadge level={level} label={t(masteryKey(level))} />
                  </div>
                  <div className="space-y-3">
                    <MomentumBar label={t("common.confidence")} value={topic.confidence * 10} tone={topic.confidence <= 3 ? "danger" : "cyan"} />
                    <MomentumBar label={t("common.priority")} value={topic.priority * 10} tone="violet" />
                  </div>
                  <div className="grid gap-2 text-sm text-text-secondary sm:grid-cols-2">
                    <div className="rounded-2xl bg-white/[0.04] p-3">{t("common.nextReview")}: {fmtDate(topic.nextReviewAt)}</div>
                    <div className="rounded-2xl bg-white/[0.04] p-3">{t("errors.unresolved")}: {openErrors}</div>
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                    <Badge variant="muted">{suggestedAction}</Badge>
                    <div className="flex gap-1">
                      <Button asChild variant="ghost" size="icon" aria-label={t("common.edit")}>
                        <a href={`/topics?edit=${topic.id}`}>
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      </Button>
                      <form action={deleteTopicAction}>
                        <input type="hidden" name="id" value={topic.id} />
                        <Button type="submit" variant="destructive" size="icon" aria-label={t("common.delete")}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
