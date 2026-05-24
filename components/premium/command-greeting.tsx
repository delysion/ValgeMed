import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

import { LevelBadge } from "@/components/premium/gamification";
import { ScoreRing } from "@/components/premium/score-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { NextBestAction } from "@/lib/scoring/next-best-action";
import type { TranslationKey } from "@/lib/i18n/dictionaries/en";

function nextActionKey(action: NextBestAction, part: "title" | "reason"): TranslationKey {
  return `nba.${action.kind}.${part}` as TranslationKey;
}

function timeBasedGreetingKey(): TranslationKey {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "greeting.morning";
  if (hour >= 12 && hour < 17) return "greeting.afternoon";
  if (hour >= 17 && hour < 22) return "greeting.evening";
  return "greeting.night";
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
  greeting?: string;
  dateLabel: string;
  streak: number;
  eliteScore: number;
  eliteLabel: string;
  nextAction: NextBestAction;
  t: (key: TranslationKey) => string;
  lowData: boolean;
}) {
  const displayGreeting = greeting ?? t(timeBasedGreetingKey());
  const scoreTone = eliteScore >= 7 ? "emerald" : eliteScore >= 5 ? "violet" : eliteScore >= 3 ? "gold" : "rose";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/12 bg-gradient-to-br from-primary-soft/70 via-bg-elevated to-cyan-bg/30 p-5 shadow-[var(--shadow-hero)] sm:p-7 md:p-8 lg:p-10">
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/6 blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-violet/5 blur-[80px]" />

      <div className="relative grid gap-6 lg:grid-cols-[1fr_220px]">
        <div className="flex flex-col justify-between gap-5">
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

            <h3 className="mt-4 max-w-2xl text-balance text-3xl font-bold tracking-tight text-text-primary sm:text-4xl md:text-5xl">
              {displayGreeting}
            </h3>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary sm:text-base">{t("common.nextMoveVisible")}</p>
          </div>

          <LevelBadge eliteScore={eliteScore} streak={streak} className="max-w-sm" />

          <div className="group relative overflow-hidden rounded-xl border border-border bg-bg-elevated/80 p-4 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md sm:p-5">
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                  <span className="relative inline-flex h-1.5 w-1.5">
                    <span className="ping-dot absolute inline-flex h-full w-full rounded-full bg-primary" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                  </span>
                  {t("command.nextBestAction")}
                </p>
                <h4 className="mt-1.5 truncate text-lg font-bold text-text-primary transition-colors group-hover:text-primary sm:text-xl">{t(nextActionKey(nextAction, "title"))}</h4>
                <p className="mt-1 max-w-lg truncate text-sm leading-relaxed text-text-secondary">{t(nextActionKey(nextAction, "reason"))}</p>
              </div>
              <Button asChild className="shrink-0 rounded-xl">
                <Link href={nextAction.href}>
                  {t("common.open")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="hidden lg:grid place-items-center">
          <ScoreRing score={eliteScore} label={t("command.eliteIndex")} caption={eliteLabel} tone={scoreTone} size="xl" animated />
        </div>
      </div>
    </div>
  );
}
