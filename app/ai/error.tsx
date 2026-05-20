"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AiError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("AI page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <div className="rounded-full bg-rose/10 p-3">
          <AlertCircle className="h-8 w-8 text-rose" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary">
          AI Module Unavailable
        </h2>
        <p className="text-sm text-text-secondary">
          The AI module encountered an error. This usually means Ollama is not running or there&apos;s a configuration issue.
        </p>
        <div className="flex flex-col gap-2 w-full">
          <Button onClick={reset} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <p className="text-xs text-text-muted">
            Make sure Ollama is running: <code className="bg-bg-subtle px-1.5 py-0.5 rounded">ollama serve</code>
          </p>
        </div>
      </div>
    </div>
  );
}
