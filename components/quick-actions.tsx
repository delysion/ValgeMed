"use client";

import Link from "next/link";
import { Play, Plus, Brain, Calendar, Lightbulb } from "lucide-react";

import { GlassCard } from "@/components/premium/glass-card";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/premium/section-header";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function QuickActions() {
  const { t } = useTranslation();

  return (
    <GlassCard tone="emerald">
      <SectionHeader
        title={t("quickActions.title")}
        description={t("quickActions.subtitle")}
        icon={Lightbulb}
      />
      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        <Button asChild variant="outline" size="lg" className="h-auto flex-col items-start gap-1 p-4 text-left">
          <Link href="/study">
            <Play className="h-5 w-5" />
            <span className="font-semibold">{t("quickActions.startSession")}</span>
            <span className="text-sm font-normal text-text-secondary">{t("quickActions.startSessionHint")}</span>
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-auto flex-col items-start gap-1 p-4 text-left">
          <Link href="/reviews">
            <Brain className="h-5 w-5" />
            <span className="font-semibold">{t("quickActions.addReview")}</span>
            <span className="text-sm font-normal text-text-secondary">{t("quickActions.addReviewHint")}</span>
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-auto flex-col items-start gap-1 p-4 text-left">
          <Link href="/subjects">
            <Plus className="h-5 w-5" />
            <span className="font-semibold">{t("quickActions.newSubject")}</span>
            <span className="text-sm font-normal text-text-secondary">{t("quickActions.newSubjectHint")}</span>
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-auto flex-col items-start gap-1 p-4 text-left">
          <Link href="/exams">
            <Calendar className="h-5 w-5" />
            <span className="font-semibold">{t("quickActions.nextExam")}</span>
            <span className="text-sm font-normal text-text-secondary">{t("quickActions.nextExamHint")}</span>
          </Link>
        </Button>
      </div>
    </GlassCard>
  );
}