import { GlassCard } from "@/components/premium/glass-card";
import { EmptyState } from "@/components/premium/empty-state";
import { BookOpen } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";

export default async function LiteratureMapPage() {
  const { t } = getI18n();
  return (
    <div className="flex flex-col gap-6">
      <GlassCard tone="primary">
        <h3 className="text-sm font-semibold text-text-primary">{t("research.literatureTitle")}</h3>
        <p className="mt-2 text-sm text-text-secondary">
          {t("research.literatureDesc")}
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-border/50 bg-bg-subtle px-3 py-2">
            <p className="text-xs font-medium text-text-primary">{t("research.whatWeKnow")}</p>
            <p className="text-xs text-text-muted">{t("research.whatWeKnowDesc")}</p>
          </div>
          <div className="rounded-lg border border-border/50 bg-bg-subtle px-3 py-2">
            <p className="text-xs font-medium text-text-primary">{t("research.whatWeDontKnow")}</p>
            <p className="text-xs text-text-muted">{t("research.whatWeDontKnowDesc")}</p>
          </div>
          <div className="rounded-lg border border-border/50 bg-bg-subtle px-3 py-2">
            <p className="text-xs font-medium text-text-primary">{t("research.controversial")}</p>
            <p className="text-xs text-text-muted">{t("research.controversialDesc")}</p>
          </div>
          <div className="rounded-lg border border-border/50 bg-bg-subtle px-3 py-2">
            <p className="text-xs font-medium text-text-primary">{t("research.methodWeak")}</p>
            <p className="text-xs text-text-muted">{t("research.methodWeakDesc")}</p>
          </div>
        </div>
      </GlassCard>

      <EmptyState
        icon={BookOpen}
        title={t("research.noGaps")}
        description={t("research.noGapsDesc")}
        variant="first-time"
      />
    </div>
  );
}
