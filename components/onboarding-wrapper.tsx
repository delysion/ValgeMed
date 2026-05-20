"use client";

import { useState, useTransition } from "react";
import { OnboardingCard } from "@/components/onboarding-card";
import { seedSampleDataAction, type SeedResult } from "@/lib/actions/seed";
import { SmartInputResponse } from "@/components/smart-input-response";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface OnboardingWrapperProps {
  onDataLoaded?: () => void;
}

export function OnboardingWrapper({ onDataLoaded }: OnboardingWrapperProps) {
  const { t, locale } = useTranslation();
  const [response, setResponse] = useState<SeedResult | null>(null);
  const [, startTransition] = useTransition();

  const handleSeedData = () => {
    startTransition(async () => {
      const result = await seedSampleDataAction(locale);
      setResponse(result);
      if (result.success && onDataLoaded) {
        onDataLoaded();
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <OnboardingCard onSampleData={handleSeedData} />
      {response && (
        <SmartInputResponse
          message={response.message}
          success={response.success}
          onDismiss={() => setResponse(null)}
          dismissLabel={t("smartInput.dismiss")}
        />
      )}
    </div>
  );
}