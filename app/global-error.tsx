"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          fontFamily: "system-ui, sans-serif",
        }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            textAlign: "center",
            maxWidth: "28rem",
          }}>
            <div style={{
              borderRadius: "50%",
              backgroundColor: "#fef2f2",
              padding: "0.75rem",
            }}>
              <AlertCircle size={32} color="#ef4444" />
            </div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              The application encountered an unexpected error. This might be related to Ollama or a configuration issue.
            </p>
            <button
              onClick={reset}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                backgroundColor: "white",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              <RefreshCw size={16} />
              Try Again
            </button>
            <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
              If using AI features, make sure Ollama is running: ollama serve
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
