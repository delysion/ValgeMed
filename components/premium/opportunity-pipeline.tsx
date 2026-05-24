"use client";

import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n/useTranslation";
import type { Opportunity } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export function OpportunityPipeline({ opportunities }: { opportunities: Opportunity[] }) {
  const { t } = useTranslation();

  const stages = [
    { key: "watching", label: t("opportunity.stageWatching"), tone: "text-muted-2" as const },
    { key: "active", label: t("opportunity.stageActive"), tone: "text-cyan" as const },
    { key: "applied", label: t("opportunity.stageApplied"), tone: "text-violet" as const },
    { key: "won", label: t("opportunity.stageWon"), tone: "text-emerald" as const },
    { key: "passed", label: t("opportunity.stagePassed"), tone: "text-muted-2" as const },
    { key: "archived", label: t("opportunity.stageArchived"), tone: "text-muted-2" as const },
  ];
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stages
        .filter((stage) => opportunities.some((o) => o.status === stage.key))
        .map((stage) => {
          const stageOpps = opportunities.filter((o) => o.status === stage.key);
          return (
            <div key={stage.key} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="mb-3 flex items-center justify-between">
                <h4 className={cn("text-[10px] font-semibold uppercase tracking-[0.1em]", stage.tone)}>{stage.label}</h4>
                <span className="rounded bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-muted">{stageOpps.length}</span>
              </div>
              <div className="space-y-2">
                {stageOpps.map((opp) => (
                  <OppCard key={opp.id} opp={opp} weekFromNow={weekFromNow} />
                ))}
              </div>
            </div>
          );
        })}
    </div>
  );
}

function OppCard({ opp, weekFromNow }: { opp: Opportunity; weekFromNow: Date }) {
  const { t } = useTranslation();
  const deadlineDate = opp.deadline ? new Date(opp.deadline) : null;
  const isUrgent = deadlineDate ? deadlineDate <= weekFromNow : false;

  return (
    <div className={cn("rounded-lg border p-2.5 transition hover:bg-white/[0.03]", isUrgent ? "border-gold/15" : "border-white/[0.06] bg-white/[0.02]")}>
      <p className="text-sm font-medium text-white">{opp.title}</p>
      {opp.description ? <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-muted-2">{opp.description}</p> : null}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-muted-2">
        {deadlineDate ? (
          <span className={cn("font-medium", isUrgent && "text-gold")}>{format(deadlineDate, "d MMM")}</span>
        ) : null}
        {opp.strategicUpside ? <span>{t("opportunity.upside", { value: opp.strategicUpside })}</span> : null}
        {opp.nextAction ? <Badge variant="muted" className="text-[9px]">{opp.nextAction}</Badge> : null}
      </div>
    </div>
  );
}
