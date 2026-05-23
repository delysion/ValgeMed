"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function ExportButtons() {
  const { t, locale } = useTranslation();
  const [loading, setLoading] = useState(false);

  async function handleDownloadZip() {
    setLoading(true);
    try {
      const res = await fetch("/api/export/zip");
      if (!res.ok) throw new Error("Export failed");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `valgemed-backup-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("ZIP export failed:", error);
      alert(locale === "et" ? "Export failed" : "Export failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-3">
      <Button
        onClick={handleDownloadZip}
        disabled={loading}
        variant="default"
        size="sm"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {locale === "et" ? "Laadi alla ZIP" : "Download ZIP Backup"}
      </Button>
    </div>
  );
}
