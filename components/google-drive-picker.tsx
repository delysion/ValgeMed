"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Paperclip, X, FileText, Link, AlertCircle, ExternalLink, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getGoogleDriveConfig, getGoogleDriveScope, type GoogleDriveConfigInput, type GoogleDriveConfigIssue } from "@/lib/google-drive/config";
import { useTranslation } from "@/lib/i18n/useTranslation";

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
};

type GoogleTokenClient = {
  requestAccessToken: () => void;
};

type GoogleOAuthError = {
  type?: string;
};

type GoogleDocsView = {
  setIncludeFolders: (value: boolean) => GoogleDocsView;
  setMimeTypes: (mimeTypes: string[]) => GoogleDocsView;
};

type GooglePickerDocument = {
  id: string;
  name: string;
  url?: string;
  mimeType: string;
};

type GooglePickerData = {
  action?: string;
  docs?: GooglePickerDocument[];
};

type GooglePickerBuilder = {
  setTitle: (title: string) => GooglePickerBuilder;
  addView: (view: GoogleDocsView) => GooglePickerBuilder;
  setOAuthToken: (token: string) => GooglePickerBuilder;
  setAppId: (appId: string) => GooglePickerBuilder;
  setDeveloperKey: (key: string) => GooglePickerBuilder;
  setOrigin: (origin: string) => GooglePickerBuilder;
  setCallback: (callback: (data: GooglePickerData) => void) => GooglePickerBuilder;
  build: () => { setVisible: (visible: boolean) => void };
};

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            prompt: "none" | "consent" | "select_account";
            callback: (tokenResponse: GoogleTokenResponse) => void;
            error_callback: (err: GoogleOAuthError) => void;
          }) => GoogleTokenClient;
        };
      };
      picker?: {
        DocsView: new () => GoogleDocsView;
        PickerBuilder: new () => GooglePickerBuilder;
        Action: { PICKED: string };
      };
    };
    gapi?: {
      load: (
        api: string,
        config: {
          callback: () => void;
          onerror: () => void;
          ontimeout: () => void;
          timeout: number;
        },
      ) => void;
    };
  }
}

interface PickedFile {
  id: string;
  name: string;
  url: string;
  mimeType: string;
}

interface GoogleDrivePickerProps {
  value?: string;
  fileName?: string;
  onPick: (file: PickedFile) => void;
  onClear: () => void;
}

type GoogleDriveServerConfig = Pick<
  GoogleDriveConfigInput,
  "clientId" | "appId" | "apiKey" | "allowedOrigins" | "currentOrigin"
>;

const SCOPES = [getGoogleDriveScope()];

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

async function loadGoogleApi(): Promise<void> {
  await loadScript("https://apis.google.com/js/api.js");
  await new Promise<void>((resolve, reject) => {
    if (window.google?.picker) {
      resolve();
      return;
    }
    if (!window.gapi?.load) {
      reject(new Error("Google API loader unavailable"));
      return;
    }
    window.gapi.load("picker", {
      callback: () => resolve(),
      onerror: () => reject(new Error("Failed to load Google Picker")),
      ontimeout: () => reject(new Error("Timed out loading Google Picker")),
      timeout: 10000,
    });
  });
  await loadScript("https://accounts.google.com/gsi/client");
}

function extractFileNameFromUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.includes("drive.google.com")) {
      const match = url.match(/\/file\/d\/([^/]+)/);
      if (match) return `Google Drive doc (${match[1].slice(0, 8)}...)`;
    }
    const parts = u.pathname.split("/");
    const last = parts[parts.length - 1];
    return last || url.slice(0, 40);
  } catch {
    return url.slice(0, 40);
  }
}

export function GoogleDrivePicker({
  value,
  fileName,
  onPick,
  onClear,
}: GoogleDrivePickerProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const [currentOrigin] = useState(() => typeof window === "undefined" ? "" : window.location.origin);
  const [serverConfig, setServerConfig] = useState<GoogleDriveServerConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const authTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    fetch("/api/google-drive/config", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => response.ok ? response.json() : null)
      .then((config: GoogleDriveServerConfig | null) => {
        if (active && config) setServerConfig(config);
      })
      .catch(() => {
        if (active) setServerConfig(null);
      })
      .finally(() => {
        if (active) setConfigLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
      if (authTimeoutRef.current) clearTimeout(authTimeoutRef.current);
    };
  }, []);

  const driveConfig = useMemo(() => getGoogleDriveConfig({
    clientId: serverConfig?.clientId,
    appId: serverConfig?.appId,
    apiKey: serverConfig?.apiKey,
    allowedOrigins: serverConfig?.allowedOrigins,
    currentOrigin,
  }), [currentOrigin, serverConfig]);

  const googleConfigured = driveConfig.ready;

  const driveSetupError = useCallback((issue: GoogleDriveConfigIssue | null = driveConfig.issue) => {
    switch (issue) {
      case "missing_api_key":
        return t("lifeForm.lifeAdmin.errorMissingApiKey");
      case "missing_app_id":
        return t("lifeForm.lifeAdmin.errorMissingAppId");
      case "origin_not_allowed":
        return t("lifeForm.lifeAdmin.errorOriginNotAllowed", { origin: driveConfig.currentOrigin || currentOrigin || "this origin" });
      case "missing_client_id":
        return t("lifeForm.lifeAdmin.errorInvalidClient", { origin: driveConfig.currentOrigin || currentOrigin || "this origin" });
      default:
        return t("lifeForm.lifeAdmin.errorInvalidClient", { origin: driveConfig.currentOrigin || currentOrigin || "this origin" });
    }
  }, [currentOrigin, driveConfig.currentOrigin, driveConfig.issue, t]);

  const clearAuthTimeout = useCallback(() => {
    if (authTimeoutRef.current) {
      clearTimeout(authTimeoutRef.current);
      authTimeoutRef.current = null;
    }
  }, []);

  const openPicker = useCallback((accessToken: string) => {
    if (!window.google?.picker) {
      setError(t("lifeForm.lifeAdmin.errorLoad"));
      setLoading(false);
      return;
    }

    const docsView = new window.google.picker.DocsView()
      .setIncludeFolders(true)
      .setMimeTypes([
        "application/pdf",
        "image/*",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
      ]);

    const picker = new window.google.picker.PickerBuilder()
      .setTitle("Select a document")
      .addView(docsView)
      .setOAuthToken(accessToken)
      .setAppId(driveConfig.appId)
      .setDeveloperKey(driveConfig.apiKey)
      .setOrigin(currentOrigin)
      .setCallback((data: GooglePickerData) => {
        if (data.action === window.google?.picker?.Action.PICKED) {
          const doc = data.docs?.[0];
          if (!doc) return;
          const file: PickedFile = {
            id: doc.id,
            name: doc.name,
            url: doc.url || `https://drive.google.com/file/d/${doc.id}/view`,
            mimeType: doc.mimeType,
          };
          onPick(file);
        }
        setLoading(false);
      })
      .build();

    picker.setVisible(true);
  }, [currentOrigin, driveConfig.apiKey, driveConfig.appId, onPick, t]);

  const handleAuthAndPick = useCallback(async (prompt?: "none" | "consent" | "select_account") => {
    setError(null);

    if (!driveConfig.ready) {
      setError(driveSetupError());
      setShowManualInput(true);
      return;
    }

    setLoading(true);
    try {
      await loadGoogleApi();

      const tokenClient = window.google?.accounts?.oauth2?.initTokenClient({
        client_id: driveConfig.clientId,
        scope: SCOPES.join(" "),
        prompt: prompt || "consent",
        callback: async (tokenResponse: GoogleTokenResponse) => {
          clearAuthTimeout();
          if (tokenResponse.error) {
            if (tokenResponse.error === "invalid_client") {
              setError(t("lifeForm.lifeAdmin.errorInvalidClient", { origin: driveConfig.currentOrigin || currentOrigin || "this origin" }));
              setShowManualInput(true);
            } else {
              setError(t("lifeForm.lifeAdmin.errorAuth"));
            }
            setLoading(false);
            return;
          }
          if (tokenResponse.access_token) {
            openPicker(tokenResponse.access_token);
          } else {
            setError(t("lifeForm.lifeAdmin.errorAuthFailed"));
            setLoading(false);
          }
        },
        error_callback: (err: GoogleOAuthError) => {
          clearAuthTimeout();
          if (err.type === "popup_failed_to_open") {
            setError(t("lifeForm.lifeAdmin.errorPopup"));
          } else {
            setError(t("lifeForm.lifeAdmin.errorAuthFailed"));
          }
          setLoading(false);
        },
      });

      if (!tokenClient) {
        throw new Error("Google Identity Services unavailable");
      }

      authTimeoutRef.current = setTimeout(() => {
        setError(t("lifeForm.lifeAdmin.errorInvalidClient", { origin: driveConfig.currentOrigin || currentOrigin || "this origin" }));
        setShowManualInput(true);
        setLoading(false);
      }, 12000);
      tokenClient.requestAccessToken();
    } catch (err) {
      clearAuthTimeout();
      console.error("Failed to load Google API:", err);
      setError(t("lifeForm.lifeAdmin.errorLoad"));
      setLoading(false);
    }
  }, [clearAuthTimeout, currentOrigin, driveConfig, driveSetupError, openPicker, t]);

  const handleManualLink = useCallback(() => {
    if (!manualUrl.trim()) return;
    const url = manualUrl.trim();
    onPick({
      id: "manual",
      name: extractFileNameFromUrl(url),
      url,
      mimeType: "application/octet-stream",
    });
    setManualUrl("");
    setShowManualInput(false);
  }, [manualUrl, onPick]);

  const handleSwitchAccount = useCallback(() => {
    handleAuthAndPick("select_account");
  }, [handleAuthAndPick]);

  // State: file already picked
  if (value && fileName) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-bg-elevated px-4 py-3">
        <FileText className="h-4 w-4 shrink-0 text-primary" />
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0 flex-1 truncate text-sm text-ice hover:underline"
        >
          {fileName}
        </a>
        <button
          type="button"
          onClick={onClear}
          className="shrink-0 rounded-lg p-1 text-text-muted hover:bg-bg-subtle hover:text-text-primary"
          aria-label="Remove file"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // State: manual link input
  if (showManualInput) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Link className="h-4 w-4 shrink-0 text-text-muted" />
          <span className="text-xs text-text-muted">{t("lifeForm.lifeAdmin.linkHint")}</span>
        </div>
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
            <p className="text-xs text-amber-200">{error}</p>
          </div>
        )}
        <div className="flex gap-2">
          <Input
            name="fileUrl"
            placeholder={t("lifeForm.lifeAdmin.linkPlaceholder")}
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleManualLink())}
            className="flex-1"
          />
          <Button type="button" variant="ghost" size="sm" onClick={handleManualLink} disabled={!manualUrl.trim()}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
        {googleConfigured && (
          <button
            type="button"
            onClick={() => setShowManualInput(false)}
            className="text-xs text-text-muted hover:text-ice"
          >
            {t("lifeForm.lifeAdmin.backToDrive")}
          </button>
        )}
      </div>
    );
  }

  // State: default — show picker button or manual fallback
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {googleConfigured ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleAuthAndPick("consent")}
            disabled={loading}
            className="gap-2 rounded-xl border border-dashed border-border/60 text-text-secondary hover:border-primary/30 hover:text-ice"
          >
            <Paperclip className="h-4 w-4" />
            {loading ? t("lifeForm.lifeAdmin.driveLoading") : t("lifeForm.lifeAdmin.driveButton")}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          onClick={() => setShowManualInput(true)}
          className="gap-2 rounded-xl border border-dashed border-border/60 text-text-secondary hover:border-primary/30 hover:text-ice"
        >
          <Link className="h-4 w-4" />
          {t("lifeForm.lifeAdmin.linkButton")}
        </Button>
      </div>
      {!configLoading && !googleConfigured && driveConfig.issue && driveConfig.issue !== "missing_client_id" ? (
        <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
          <p className="text-xs text-amber-200">{driveSetupError()}</p>
        </div>
      ) : null}
      {error && (
        <div className="space-y-2">
          <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
            <p className="text-xs text-amber-200">{error}</p>
          </div>
          {googleConfigured && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSwitchAccount}
              className="gap-1.5 text-xs text-text-muted hover:text-ice"
            >
              <LogOut className="h-3 w-3" />
              Switch Google account
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
