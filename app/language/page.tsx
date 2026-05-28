import { BookOpen, Globe, Sparkles, Target } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { LanguageProgressForm } from "@/components/forms/life-forms";
import { LanguageProgressList } from "@/components/life/life-lists";
import { GlassCard } from "@/components/premium/glass-card";
import { MetricCard } from "@/components/premium/metric-card";
import { MomentumBar } from "@/components/premium/momentum-bar";
import { SectionHeader } from "@/components/premium/section-header";
import { deleteLanguageProgressAction } from "@/lib/actions/resources";
import { requireApprovedUser } from "@/lib/auth/supabase";
import { getLanguageProgress } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";

export const dynamic = "force-dynamic";

export default async function LanguagePage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const user = await requireApprovedUser();
  const { t } = await getI18n();
  const params = await searchParams;
  const languageProgress = await getLanguageProgress();
  const editing = languageProgress.find((item) => item.id === params.edit);

  const avgConfidence = languageProgress.length > 0
    ? (languageProgress.reduce((sum, item) => sum + item.confidence, 0) / languageProgress.length).toFixed(1)
    : "-";
  const estonianBlocks = languageProgress.filter((item) => item.language === "estonian").length;
  const medicalTerms = languageProgress.filter((item) => item.language === "latin").length;

  return (
    <AppShell user={user}>
      <PageHeader title={t("language.title")} description={t("language.subtitle")} eyebrow={t("quest.languageBlock")} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title={t("language.blocks")} value={languageProgress.length} detail="total blocks" icon={BookOpen} tone="cyan" />
        <MetricCard title={t("common.confidence")} value={avgConfidence} detail="/ 10 avg" icon={Target} tone={Number(avgConfidence) >= 6 ? "emerald" : "gold"} />
        <MetricCard title="Estonian" value={estonianBlocks} detail="blocks" icon={Globe} tone="violet" />
        <MetricCard title={t("language.medicalTerms")} value={medicalTerms} detail="terms" icon={Sparkles} tone="rose" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[420px_1fr]">
        <GlassCard>
          <SectionHeader title={t("language.logProgress")} description={t("language.subtitle")} />
          <div className="mt-4">
            <LanguageProgressForm item={editing} />
          </div>
        </GlassCard>

        <div className="space-y-5">
          <GlassCard tone="violet">
            <SectionHeader title={t("language.progressTrail")} description={t("common.strategicSignal")} />
            <div className="mt-5 space-y-4">
              <MomentumBar label="Estonian" value={estonianBlocks * 15} tone="violet" />
              <MomentumBar label={t("language.medicalTerms")} value={medicalTerms * 15} tone="rose" />
              <MomentumBar label={t("common.confidence")} value={(Number(avgConfidence) / 10) * 100} tone="cyan" />
            </div>
          </GlassCard>

          <GlassCard>
            <SectionHeader title={t("language.history")} description={`${languageProgress.length} ${t("language.entries")}`} />
            <div className="mt-4">
              <LanguageProgressList
                items={languageProgress.slice(0, 12)}
                editBasePath="/language"
                deleteAction={deleteLanguageProgressAction}
                labels={{
                  emptyTitle: t("common.emptyTitle"),
                  emptyBody: t("common.emptyBody"),
                  open: t("common.open"),
                  edit: t("common.edit"),
                  delete: t("common.delete"),
                }}
              />
            </div>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}
