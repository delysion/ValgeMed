"use client";

import { useState } from "react";
import { Edit3, Eye } from "lucide-react";
import { RecordDrawer } from "@/components/ui/record-drawer";
import { DeleteButton } from "@/components/forms/delete-button";
import { getMasteryLevel, MasteryBadge, type MasteryLevel } from "@/components/premium/gamification";
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
  labels: {
    subject: string;
    linkedExam: string;
    activeRecall: string;
    errorReview: string;
    reviews: string;
    confidence: string;
    priority: string;
    nextReview: string;
    unresolved: string;
    open: string;
    edit: string;
    delete: string;
    mastery: Record<MasteryLevel, string>;
  };
}

export function TopicsGrid({ topics, subjects, exams, errorLogs, labels }: TopicsGridProps) {
  const [selected, setSelected] = useState<Topic | null>(null);

  const subjectById = new Map(subjects.map((s) => [s.id, s]));
  const examById = new Map(exams.map((e) => [e.id, e]));

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {topics.map((topic) => {
          const openErrors = errorLogs.filter((e) => e.topicId === topic.id && !e.resolved).length;
          const level = getMasteryLevel({ confidence: topic.confidence, status: topic.status, openErrors });
          const suggestedAction = topic.confidence <= 3 ? labels.activeRecall : openErrors > 0 ? labels.errorReview : labels.reviews;

          return (
            <GlassCard
              key={topic.id}
              tone={level === "dangerous" ? "danger" : level === "examReady" ? "gold" : "cyan"}
              className="flex flex-col gap-4 cursor-pointer"
              onClick={() => setSelected(topic)}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-text-secondary">{subjectById.get(topic.subjectId)?.name ?? labels.subject}</p>
                  <h3 className="mt-2 text-xl font-semibold text-text-primary">{topic.title}</h3>
                  <p className="mt-1 text-sm text-text-secondary">{topic.examId ? examById.get(topic.examId)?.title : labels.linkedExam}</p>
                </div>
                <MasteryBadge level={level} label={labels.mastery[level]} />
              </div>
              <div className="space-y-3">
                <MomentumBar label={labels.confidence} value={topic.confidence * 10} tone={topic.confidence <= 3 ? "danger" : "cyan"} />
                <MomentumBar label={labels.priority} value={topic.priority * 10} tone="violet" />
              </div>
              <div className="grid gap-2 text-sm text-text-secondary sm:grid-cols-2">
                <div className="rounded-2xl bg-white/[0.04] p-3">{labels.nextReview}: {fmtDate(topic.nextReviewAt)}</div>
                <div className="rounded-2xl bg-white/[0.04] p-3">{labels.unresolved}: {openErrors}</div>
              </div>
              <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                <Badge variant="muted">{suggestedAction}</Badge>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={labels.open}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(topic);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button asChild variant="ghost" size="icon" aria-label={labels.edit}>
                    <a href={`/topics?edit=${topic.id}`} onClick={(e) => e.stopPropagation()}>
                      <Edit3 className="h-4 w-4" />
                    </a>
                  </Button>
                  <DeleteButton action={deleteTopicAction} id={topic.id} label={labels.delete} onClick={(e) => e.stopPropagation()} />
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
