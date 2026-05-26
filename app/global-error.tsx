"use client";

import { useEffect, useState } from "react";
import { AlertCircle, RefreshCw, Bug } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

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
              {error?.message || "An unexpected error occurred"}
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
            <button
              onClick={() => setShowDetails(!showDetails)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                border: "none",
                borderRadius: "0.5rem",
                backgroundColor: "transparent",
                cursor: "pointer",
                fontSize: "0.75rem",
                color: "#6b7280",
                textDecoration: "underline",
              }}
            >
              <Bug size={12} />
              {showDetails ? "Hide" : "Show"} error details
            </button>
            {showDetails && (
              <pre style={{
                fontSize: "0.7rem",
                color: "#ef4444",
                backgroundColor: "#fef2f2",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                overflow: "auto",
                maxWidth: "100%",
                textAlign: "left",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}>
                {error?.toString()}
                {error?.stack && `\n\n${error.stack}`}
              </pre>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
