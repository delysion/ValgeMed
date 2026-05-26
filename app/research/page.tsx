import Link from "next/link";
import { AlertTriangle, ArrowRight, Beaker, BookOpen, FileText, Shield } from "lucide-react";

import { ResearchAreaForm } from "@/components/forms/research-forms";
import { GlassCard } from "@/components/premium/glass-card";
import { getResearchPipelineData } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";

export const dynamic = "force-dynamic";

function percent(value: number, total: number) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export default async function ResearchCommandPage() {
  const { t } = await getI18n();
  const data = await getResearchPipelineData();

  const publishableGaps = data.literatureGaps.filter((gap) => gap.publishableForStudent);
  const activeHypotheses = data.hypotheses.filter((hypothesis) => !["archived", "tested"].includes(hypothesis.status ?? ""));
  const activeManuscripts = data.manuscripts.filter((manuscript) => !["submitted", "published"].includes(manuscript.stage));
  const openRisks = data.methodologyRisks.filter((risk) => !risk.mitigated);

  const nextPaperAction =
    data.researchAreas.length === 0
      ? { title: "Create one research area", href: "/research", detail: "Name the domain, knowns, unknowns and weak methods." }
      : publishableGaps.length === 0
        ? { title: "Find a publishable gap", href: "/research/literature", detail: "Mark one gap as small enough for a student output." }
        : activeHypotheses.length === 0
          ? { title: "Score a hypothesis", href: "/research/hypotheses", detail: "Turn the best gap into a testable research question." }
          : activeManuscripts.length === 0
            ? { title: "Open a manuscript record", href: "/research/manuscripts", detail: "Attach the strongest hypothesis to a concrete output." }
            : { title: "Advance manuscript stage", href: "/research/manuscripts", detail: "Move one active manuscript to the next production step." };

  const metrics = [
    { label: "Research areas", value: data.researchAreas.length, detail: "mapped domains" },
    { label: "Publishable gaps", value: publishableGaps.length, detail: `${percent(publishableGaps.length, data.literatureGaps.length)}% of gaps` },
    { label: "Active hypotheses", value: activeHypotheses.length, detail: "ready to test" },
    { label: "Manuscripts", value: activeManuscripts.length, detail: "in production" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <GlassCard tone="primary">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Next paper action</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-normal text-text-primary">{nextPaperAction.title}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">{nextPaperAction.detail}</p>
          </div>
          <Link
            href={nextPaperAction.href}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
          >
            Open step
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl border border-border/60 bg-bg-surface/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">{metric.label}</p>
            <p className="mt-2 font-mono text-3xl font-semibold text-text-primary">{metric.value}</p>
            <p className="mt-1 text-xs text-text-secondary">{metric.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/research/literature" className="group rounded-xl border border-border/60 bg-bg-surface p-5 transition hover:border-primary/35 hover:bg-bg-elevated">
          <BookOpen className="h-6 w-6 text-primary" />
          <h3 className="mt-3 text-sm font-semibold text-text-primary">{t("research.literatureMap")}</h3>
          <p className="mt-1 text-xs leading-5 text-text-secondary">Knowns, unknowns, controversy and student-sized publishable gaps.</p>
        </Link>
        <Link href="/research/hypotheses" className="group rounded-xl border border-border/60 bg-bg-surface p-5 transition hover:border-cyan/35 hover:bg-bg-elevated">
          <Beaker className="h-6 w-6 text-cyan" />
          <h3 className="mt-3 text-sm font-semibold text-text-primary">{t("research.hypothesisEngine")}</h3>
          <p className="mt-1 text-xs leading-5 text-text-secondary">Score feasibility, novelty and output shape before committing effort.</p>
        </Link>
        <Link href="/research/manuscripts" className="group rounded-xl border border-border/60 bg-bg-surface p-5 transition hover:border-violet/35 hover:bg-bg-elevated">
          <FileText className="h-6 w-6 text-violet" />
          <h3 className="mt-3 text-sm font-semibold text-text-primary">{t("research.manuscriptPipeline")}</h3>
          <p className="mt-1 text-xs leading-5 text-text-secondary">Convert a hypothesis into a deadline, stage and target journal.</p>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <GlassCard>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-text-primary">Paper-production pipeline</h3>
            {openRisks.length > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-lg bg-rose/10 px-2 py-1 text-xs font-medium text-rose">
                <AlertTriangle className="h-3.5 w-3.5" />
                {openRisks.length} open risks
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald/10 px-2 py-1 text-xs font-medium text-emerald">
                <Shield className="h-3.5 w-3.5" />
                No open risks
              </span>
            )}
          </div>
          <div className="mt-4 grid gap-3">
            {data.researchAreas.slice(0, 4).map((area) => {
              const areaGaps = data.literatureGaps.filter((gap) => gap.researchAreaId === area.id);
              return (
                <div key={area.id} className="rounded-xl border border-border/60 bg-bg-page/35 p-4">
                  <p className="text-sm font-semibold text-text-primary">{area.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-text-secondary">{area.whatIsUnknown ?? area.description ?? "No unknowns mapped yet."}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-text-muted">
                    <span>{areaGaps.length} gaps</span>
                    <span>{areaGaps.filter((gap) => gap.publishableForStudent).length} publishable</span>
                  </div>
                </div>
              );
            })}
            {data.researchAreas.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border/70 p-4 text-sm text-text-secondary">
                Start by creating one research area. Everything else should attach to a real publishable direction.
              </p>
            ) : null}
          </div>
        </GlassCard>

        <ResearchAreaForm />
      </div>
    </div>
  );
}
