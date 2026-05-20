"use client";

import { useState } from "react";
import { BookOpen, Brain, Clock, Sparkles, Plus, Mic, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { GlassCard } from "@/components/premium/glass-card";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/premium/section-header";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { cn } from "@/lib/utils";

interface OnboardingCardProps {
  onSampleData?: () => void;
}

export function OnboardingCard({ onSampleData }: OnboardingCardProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Sparkles,
      title: t("onboarding.step1Title"),
      description: t("onboarding.step1Desc"),
      action: { label: t("onboarding.addSubject"), href: "/subjects" },
    },
    {
      icon: Brain,
      title: t("onboarding.step2Title"),
      description: t("onboarding.step2Desc"),
      action: { label: t("onboarding.goToReviews"), href: "/reviews" },
    },
    {
      icon: Clock,
      title: t("onboarding.step3Title"),
      description: t("onboarding.step3Desc"),
      action: null,
    },
  ];

  return (
    <GlassCard tone="primary">
      <SectionHeader
        title={t("onboarding.title")}
        description={t("onboarding.subtitle")}
        icon={BookOpen}
      />

      {/* Step Progress Indicator */}
      <div className="mt-5 flex items-center gap-2">
        {steps.map((_, index) => (
          <div key={index} className="flex items-center gap-2">
            <button
              onClick={() => setCurrentStep(index)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-200",
                index === currentStep
                  ? "bg-primary text-white shadow-md shadow-primary/25 scale-110"
                  : index < currentStep
                    ? "bg-emerald/20 text-emerald"
                    : "bg-bg-subtle text-text-muted"
              )}
            >
              {index < currentStep ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </button>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-8 rounded-full transition-colors duration-200",
                  index < currentStep ? "bg-emerald" : "bg-border"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Current Step Content */}
      <div className="mt-5">
        {steps.map((step, index) => (
          <div
            key={index}
            className={cn(
              "transition-all duration-300",
              index === currentStep ? "block" : "hidden"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <step.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-text-primary">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-text-secondary">{step.description}</p>
                {step.action && (
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <Link href={step.action.href}>
                      <Plus className="h-4 w-4" />
                      {step.action.label}
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-5 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          {t("common.back") || "Back"}
        </Button>
        <div className="flex gap-2">
          {currentStep < steps.length - 1 ? (
            <Button
              size="sm"
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              {t("common.next") || "Next"}
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={onSampleData}>
              <Sparkles className="h-4 w-4" />
              {t("onboarding.loadSample")}
            </Button>
          )}
        </div>
      </div>

      {/* Voice Hint */}
      <div className="mt-4 flex items-center gap-2 rounded-xl bg-bg-subtle p-3">
        <Mic className="h-4 w-4 text-primary" />
        <p className="text-sm text-text-secondary">
          <span className="font-medium text-text-primary">{t("onboarding.voiceHint")}</span>{" "}
          &quot;{t("onboarding.example1")}&quot; {t("common.or") || "or"} &quot;{t("onboarding.example2")}&quot;
        </p>
      </div>
    </GlassCard>
  );
}
