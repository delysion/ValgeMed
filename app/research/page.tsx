import { getI18n } from "@/lib/i18n/server-i18n";
import { GlassCard } from "@/components/premium/glass-card";
import { AlertTriangle, BookOpen, Beaker, FileText, Shield } from "lucide-react";
import Link from "next/link";

export default async function ResearchCommandPage() {
  const { t } = await getI18n();

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <GlassCard tone="primary">
          <h3 className="text-sm font-semibold text-text-primary">{t("research.highestReturn")}</h3>
          <p className="mt-2 text-sm text-text-secondary">
            {t("research.highestReturnDesc")}
          </p>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h3 className="text-sm font-semibold text-text-primary">{t("research.atRisk")}</h3>
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            {t("research.atRiskDesc")}
          </p>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-text-primary">{t("research.ethicsGdpr")}</h3>
          </div>
          <p className="mt-2 text-xs text-text-muted">
            {t("research.ethicsDesc")}
          </p>
        </GlassCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/research/literature" className="group rounded-2xl border border-border/50 bg-bg-surface p-5 card-hover">
          <BookOpen className="h-6 w-6 text-primary" />
          <h3 className="mt-3 text-sm font-semibold text-text-primary">{t("research.literatureMap")}</h3>
          <p className="mt-1 text-xs text-text-secondary">{t("research.literatureMapDesc")}</p>
        </Link>
        <Link href="/research/hypotheses" className="group rounded-2xl border border-border/50 bg-bg-surface p-5 card-hover">
          <Beaker className="h-6 w-6 text-cyan" />
          <h3 className="mt-3 text-sm font-semibold text-text-primary">{t("research.hypothesisEngine")}</h3>
          <p className="mt-1 text-xs text-text-secondary">{t("research.hypothesisEngineDesc")}</p>
        </Link>
        <Link href="/research/manuscripts" className="group rounded-2xl border border-border/50 bg-bg-surface p-5 card-hover">
          <FileText className="h-6 w-6 text-violet" />
          <h3 className="mt-3 text-sm font-semibold text-text-primary">{t("research.manuscriptPipeline")}</h3>
          <p className="mt-1 text-xs text-text-secondary">{t("research.manuscriptPipelineDesc")}</p>
        </Link>
      </div>

      <GlassCard>
        <h3 className="text-sm font-semibold text-text-primary">{t("research.methodologyRisks")}</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 text-xs text-text-secondary">
          <p>{t("research.risk1")}</p>
          <p>{t("research.risk2")}</p>
          <p>{t("research.risk3")}</p>
          <p>{t("research.risk4")}</p>
          <p>{t("research.risk5")}</p>
          <p>{t("research.risk6")}</p>
          <p>{t("research.risk7")}</p>
          <p>{t("research.risk8")}</p>
          <p>{t("research.risk9")}</p>
          <p>{t("research.risk10")}</p>
        </div>
      </GlassCard>
    </div>
  );
}
