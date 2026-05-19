import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

import { ScoreRing } from "@/components/premium/score-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { NextBestAction } from "@/lib/scoring/next-best-action";
import type { TranslationKey } from "@/lib/i18n/dictionaries/en";
import { cn } from "@/lib/utils";

function nextActionKey(action: NextBestAction, part: "title" | "reason"): TranslationKey {
  return `nba.${action.kind}.${part}` as TranslationKey;
}

export function CommandGreeting({
  greeting,
  dateLabel,
  streak,
  eliteScore,
  eliteLabel,
  nextAction,
  t,
  lowData,
}: {
  greeting: string;
  dateLabel: string;
  streak: number;
  eliteScore: number;
  eliteLabel: string;
  nextAction: NextBestAction;
  t: (key: TranslationKey) => string;
  lowData: boolean;
}) {
  const scoreTone = eliteScore >= 7 ? "emerald" : eliteScore >= 5 ? "violet" : eliteScore >= 3 ? "gold" : "rose";

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-br from-violet/6 via-white/[0.03] to-cyan/6 p-6 shadow-[var(--shadow-premium)] backdrop-blur-2xl md:p-8">
      <div className="aurora pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-violet/10 blur-3xl" />
      <div className="aurora-slow pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-cyan/8 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="relative grid gap-8 lg:grid-cols-[1fr_200px]">
        <div className="flex flex-col justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="violet">{dateLabel}</Badge>
              {streak > 0 ? (
                <Badge variant="gold" className="gap-1">
                  <Zap className="h-3 w-3" />
                  {t("gamification.commandStreak")} {streak}
                </Badge>
              ) : null}
              {lowData ? <Badge variant="warning">{t("command.lowDataTitle")}</Badge> : null}
            </div>

            <h3 className="mt-5 max-w-2xl text-balance text-3xl font-semibold tracking-tight text-white md:text-4xl lg:text-5xl">
              {greeting}
            </h3>

            <p className="mt-3 max-w-xl text-base leading-7 text-muted md:text-lg">{t("common.nextMoveVisible")}</p>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 backdrop-blur-xl md:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan signal-pulse" />
                  {t("command.nextBestAction")}
                </p>
                <h4 className="mt-1.5 truncate text-lg font-semibold text-white md:text-xl">{t(nextActionKey(nextAction, "title"))}</h4>
                <p className="mt-1 max-w-lg truncate text-sm leading-6 text-muted">{t(nextActionKey(nextAction, "reason"))}</p>
              </div>
              <Button asChild className="shrink-0">
                <Link href={nextAction.href}>
                  {t("common.open")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid place-items-center">
          <ScoreRing score={eliteScore} label={t("command.eliteIndex")} caption={eliteLabel} tone={scoreTone} size="xl" animated />
        </div>
      </div>
    </div>
  );
}
