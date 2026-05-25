import {
  Sparkles,
  Upload,
} from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { OllamaStatusBadge } from "@/components/ollama-status";
import { OllamaStatusCard } from "@/components/ollama-status-card";
import { AiToolCard } from "@/components/ai-tool-card";
import { AiFlashcardGenerator } from "@/components/ai-flashcard-generator";
import { FileUploadZone } from "@/components/file-upload-zone";
import { GlassCard } from "@/components/premium/glass-card";
import { requireUser } from "@/lib/auth/supabase";
import { getI18n } from "@/lib/i18n/server-i18n";
import { getAiPageData } from "@/lib/data/queries";

export const dynamic = "force-dynamic";

export default async function AiPage() {
  const user = await requireUser();
  const { t, locale } = await getI18n();
  const data = await getAiPageData();

  const subjectsSummary = data.subjects.map((s) => s.name).join(", ") ||
    t("ai.noSubjects");
  const topicsSummary = data.topics.map((t) => `${t.title} (${t.confidence}/10)`).join("; ") ||
    t("ai.noTopics");
  const errorsSummary = data.errorLogs
    .filter((e) => !e.resolved)
    .map((e) => `${e.title} (severity: ${e.severity})`)
    .join("; ") ||
    t("ai.noErrors");
  const reviewsDue = data.reviewItems.filter((r) => r.isActive && r.dueAt <= new Date()).length;
  const examsSummary = data.exams
    .map((e) => `${e.title} (${e.examDate ? new Date(e.examDate).toLocaleDateString() : "no date"})`)
    .join("; ") ||
    t("ai.noExams");

  const toolDescriptions: Record<string, string> = {
    daily_command: locale === "et"
      ? "Sisesta oma praegune õppeseisund ja saan soovitused tänaseks päevaks."
      : "Enter your current study state and I'll suggest today's priorities.",
    exam_battle_plan: locale === "et"
      ? "Sisesta eksami andmed ja saan lahinguplaani."
      : "Enter exam details and I'll create a battle plan.",
    error_analysis: locale === "et"
      ? "Sisesta vigade andmed ja saan mustrite analüüsi."
      : "Enter error data and I'll analyze patterns.",
    weekly_review: locale === "et"
      ? "Sisesta nädala andmed ja saan ülevaate."
      : "Enter weekly data and I'll provide a review.",
    semester_plan: locale === "et"
      ? "Sisesta semestri andmed ja saan plaani."
      : "Enter semester data and I'll create a plan.",
    research_ideas: locale === "et"
      ? "Sisesta uurimisala andmed ja saan ideid."
      : "Enter research area data and I'll suggest ideas.",
  };

  const systemContext =
    `${t("ai.systemSummary")}\n${t("ai.subjects")}: ${subjectsSummary}\n${t("ai.topics")}: ${topicsSummary}\n${t("ai.errors")}: ${errorsSummary}\n${t("ai.reviewsDue")}: ${reviewsDue}\n${t("ai.exams")}: ${examsSummary}`;

  return (
    <AppShell user={user}>
      <PageHeader
        title={t("ai.title")}
        description={t("ai.subtitle")}
        actions={<OllamaStatusBadge />}
      />

      <div className="flex flex-col gap-5">
        {/* Ollama Status Card */}
        <OllamaStatusCard locale={locale} />

        {/* Quick Flashcard Generator */}
        <AiFlashcardGenerator />

        {/* File Upload + AI Processing */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Upload className="h-5 w-5 text-cyan" />
            <h3 className="text-lg font-semibold text-text-primary">
              {t("ai.upload")}
            </h3>
          </div>
          <p className="text-sm text-text-secondary mb-4">
            {t("ai.uploadDesc")}
          </p>
          <FileUploadZone />
        </GlassCard>

        {/* AI Tools Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <AiToolCard
            title={t("ai.dailyCommand")}
            description={toolDescriptions.daily_command}
            icon="WandSparkles"
            tool="daily_command"
            tone="violet"
            locale={locale}
            inputPlaceholder={systemContext}
          />
          <AiToolCard
            title={t("ai.examBattlePlan")}
            description={toolDescriptions.exam_battle_plan}
            icon="Brain"
            tool="exam_battle_plan"
            tone="cyan"
            locale={locale}
            inputPlaceholder={examsSummary}
          />
          <AiToolCard
            title={t("ai.errorPattern")}
            description={toolDescriptions.error_analysis}
            icon="Search"
            tool="error_analysis"
            tone="rose"
            locale={locale}
            inputPlaceholder={errorsSummary}
          />
          <AiToolCard
            title={t("ai.weeklyReview")}
            description={toolDescriptions.weekly_review}
            icon="CalendarRange"
            tool="weekly_review"
            tone="emerald"
            locale={locale}
            inputPlaceholder={systemContext}
          />
          <AiToolCard
            title={t("ai.semesterPlan")}
            description={toolDescriptions.semester_plan}
            icon="FileText"
            tool="semester_plan"
            tone="gold"
            locale={locale}
            inputPlaceholder={systemContext}
          />
          <AiToolCard
            title={t("ai.researchIdeas")}
            description={toolDescriptions.research_ideas}
            icon="FlaskConical"
            tool="research_ideas"
            tone="cyan"
            locale={locale}
            inputPlaceholder={systemContext}
          />
        </div>

        {/* Privacy Notice */}
        <GlassCard tone="neutral">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-text-muted" />
            <div>
              <p className="text-sm font-medium text-text-primary">
                {locale === "et" ? "Privaatsus" : "Privacy"}
              </p>
              <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                {t("ai.warning")}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
