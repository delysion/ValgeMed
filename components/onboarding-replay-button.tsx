"use client";

import { useState } from "react";
import { RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingCard } from "@/components/onboarding-card";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function OnboardingReplayButton() {
  const { t } = useTranslation();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [seedDone, setSeedDone] = useState(false);

  if (showOnboarding) {
    return (
      <div className="flex flex-col gap-4">
        <OnboardingCard onSampleData={() => setSeedDone(true)} />
        {seedDone && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald/10 p-3 text-sm text-emerald">
            <CheckCircle2 className="h-4 w-4" />
            {t("seed.success").replace("{count}", "6")}
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setShowOnboarding(false);
            setSeedDone(false);
          }}
        >
          {t("smartInput.dismiss")}
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={() => setShowOnboarding(true)} variant="outline">
      <RefreshCw className="h-4 w-4" />
      {t("onboarding.loadSample")}
    </Button>
  );
}
