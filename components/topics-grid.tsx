"use client";

import { useState } from "react";
import { Edit3, Eye } from "lucide-react";
import { RecordDrawer } from "@/components/ui/record-drawer";
import { DeleteButton } from "@/components/forms/delete-button";
import { getMasteryLevel, masteryKey, MasteryBadge } from "@/components/premium/gamification";
import type { TFunction } from "@/components/premium/gamification";
import { GlassCard } from "@/components/premium/glass-card";
import { MomentumBar } from "@/components/premium/momentum-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteTopicAction } from "@/lib/actions/resources";
import type { Topic, Subject, Exam, ErrorLog } from "@/lib/db/schema";
import { fmtDate } from "@/lib/labels";

interface TopicsGridProps {
  topics: Topic[];
  subjects: Subject[];
  exams: Exam[];
  errorLogs: ErrorLog[];
  t: TFunction;
}

export function TopicsGrid({ topics, subjects, exams, errorLogs, t }: TopicsGridProps) {
  const [selected, setSelected] = useState<Topic | null>(null);

  const subjectById = new Map(subjects.map((s) => [s.id, s]));
  const examById = new Map(exams.map((e) => [e.id, e]));

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {topics.map((topic) => {
          const openErrors = errorLogs.filter((e) => e.topicId === topic.id && !e.resolved).length;
          const level = getMasteryLevel({ confidence: topic.confidence, status: topic.status, openErrors });
          const suggestedAction = topic.confidence <= 3 ? t("nba.active_recall.title") : openErrors > 0 ? t("nba.error_review.title") : t("reviews.title");

          return (
            <GlassCard
              key={topic.id}
              tone={level === "dangerous" ? "danger" : level === "examReady" ? "gold" : "cyan"}
              className="flex flex-col gap-4 cursor-pointer"
              onClick={() => setSelected(topic)}
            >
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t("common.open")}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(topic);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button asChild variant="ghost" size="icon" aria-label={t("common.edit")}>
                    <a href={`/topics?edit=${topic.id}`} onClick={(e) => e.stopPropagation()}>
                      <Edit3 className="h-4 w-4" />
                    </a>
                  </Button>
                  <DeleteButton action={deleteTopicAction} id={topic.id} label={t("common.delete")} onClick={(e) => e.stopPropagation()} />
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <RecordDrawer
        open={selected !== null}
        onClose={() => setSelected(null)}
        record={selected}
        type="topic"
        editBasePath="/topics"
        context={selected ? {
          subjectName: subjectById.get(selected.subjectId)?.name,
          examTitle: selected.examId ? examById.get(selected.examId)?.title : undefined,
        } : undefined}
      />
    </>
  );
}
