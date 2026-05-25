import { GlassCard } from "@/components/premium/glass-card";
import { EmptyState } from "@/components/premium/empty-state";
import { Beaker } from "lucide-react";
import { getI18n } from "@/lib/i18n/server-i18n";

export default async function HypothesisEnginePage() {
  const { t } = await getI18n();
  const dimensions = t("research.hypothesisDims").split(",");
  const outputs = t("research.hypothesisOutputs").split(",");

  return (
    <div className="flex flex-col gap-6">
      <GlassCard>
        <h3 className="text-sm font-semibold text-text-primary">{t("research.scoringTitle")}</h3>
        <p className="mt-2 text-sm text-text-secondary">
          {t("research.scoringDesc")}
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {dimensions.map((dim) => (
            <div key={dim} className="rounded-lg border border-border/50 bg-bg-subtle px-3 py-2 text-xs text-text-secondary">
              {dim}
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="text-sm font-semibold text-text-primary">{t("research.output")}</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {outputs.map((out, i) => (
            <div key={out} className="rounded-full border border-border/50 bg-bg-subtle px-3 py-1 text-xs text-text-muted">
              {i + 1}. {out}
            </div>
          ))}
        </div>
      </GlassCard>

      <EmptyState
        icon={Beaker}
        title={t("research.noHypotheses")}
        description={t("research.noHypothesesDesc")}
        variant="first-time"
      />
    </div>
  );
}
