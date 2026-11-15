"use client";

import { useState } from "react";
import { processSmartInputAction, type SmartInputResult } from "@/lib/actions/smart-input";
import { SmartInput } from "@/components/smart-input";
import { SmartInputResponse } from "@/components/smart-input-response";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function SmartInputWrapper() {
  const { t, locale } = useTranslation();
  const [response, setResponse] = useState<SmartInputResult | null>(null);

  const handleSubmit = async (text: string) => {
    setResponse(null);
    const result = await processSmartInputAction(text, locale);
    setResponse(result);
    return result.success;
  };

  return (
    <div className="flex flex-col gap-4">
      <SmartInput
        onSubmit={handleSubmit}
        placeholder={t("smartInput.placeholder")}
        submitLabel={t("smartInput.submit")}
        listeningLabel={t("smartInput.listening")}
      />
      {response && (
        <SmartInputResponse
          message={response.message}
          success={response.success}
          details={response.details}
          onDismiss={() => setResponse(null)}
          dismissLabel={t("smartInput.dismiss")}
        />
      )}
    </div>
  );
}