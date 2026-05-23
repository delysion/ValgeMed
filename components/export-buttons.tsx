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
  }

  async function handleGoogleDrive() {
    setLoading("gdrive");
    try {
      const res = await fetch("/api/export/zip");
      if (!res.ok) throw new Error("Export failed");
      
      const blob = await res.blob();
      
      // Create a file picker for Google Drive
      const token = await getGoogleToken();
      if (!token) {
        alert("Google Drive access denied");
        setLoading(null);
        return;
      }

      // Upload to Google Drive
      const formData = new FormData();
      formData.append("file", blob, `valgemed-backup-${new Date().toISOString().slice(0, 10)}.zip`);

      const uploadRes = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");
      
      alert(locale === "et" ? "File uploaded to Google Drive" : "File uploaded to Google Drive");
    } catch (error) {
      console.error("Google Drive export failed:", error);
      alert(locale === "et" ? "Export to Google Drive failed" : "Export to Google Drive failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleOneDrive() {
    setLoading("onedrive");
    try {
      const res = await fetch("/api/export/zip");
      if (!res.ok) throw new Error("Export failed");
      
      const blob = await res.blob();
      
      // OneDrive file picker
      const success = await uploadToOneDrive(blob);
      if (success) {
        alert(locale === "et" ? "File uploaded to OneDrive" : "File uploaded to OneDrive");
      }
    } catch (error) {
      console.error("OneDrive export failed:", error);
      alert(locale === "et" ? "Export to OneDrive failed" : "Export to OneDrive failed");
    } finally {
      setLoading(null);
    }
  }

  function getGoogleToken(): Promise<string | null> {
    return new Promise((resolve) => {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) {
        resolve(null);
        return;
      }

      const redirectUri = `${window.location.origin}/api/export/google-callback`;
      const scope = "https://www.googleapis.com/auth/drive.file";
      
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height) / 2;

      const popup = window.open(
        `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}&access_type=offline`,
        "Google Drive Auth",
        `width=${width},height=${height},left=${left},top=${top}`
      );

      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          resolve(null);
        }
      }, 500);

      window.addEventListener("message", (event) => {
        if (event.data?.type === "google-token") {
          clearInterval(checkClosed);
          resolve(event.data.token);
        }
      });
    });
  }

  function uploadToOneDrive(blob: Blob): Promise<boolean> {
    return new Promise((resolve) => {
      const clientId = process.env.NEXT_PUBLIC_ONEDRIVE_CLIENT_ID;
      if (!clientId) {
        resolve(false);
        return;
      }

      // Simplified: just download for now, OneDrive integration requires more setup
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `valgemed-backup-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert(locale === "et" 
        ? "OneDrive: File scaricato. Per upload automatico, configura l'integrazione nelle settings."
        : "OneDrive: File downloaded. For automatic upload, configure integration in settings.");
      
      resolve(true);
    });
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={handleDownloadZip}
        disabled={loading !== null}
        variant="default"
        size="sm"
      >
        {loading === "zip" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {locale === "et" ? "Laadi alla ZIP" : "Download ZIP"}
      </Button>

      <div className="flex items-center gap-2">
        <Button
          onClick={handleGoogleDrive}
          disabled={loading !== null}
          variant="outline"
          size="sm"
        >
          {loading === "gdrive" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Cloud className="h-4 w-4" />
          )}
          Google Drive
        </Button>
        <GoogleDriveHelp />
      </div>

      <Button
        onClick={handleOneDrive}
        disabled={loading !== null}
        variant="outline"
        size="sm"
      >
        {loading === "onedrive" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Cloud className="h-4 w-4" />
        )}
        OneDrive
      </Button>
    </div>
  );
}