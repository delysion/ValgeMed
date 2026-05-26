import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  getGoogleDriveConfig,
  getGoogleDriveScope,
  splitGoogleDriveAllowedOrigins,
} from "@/lib/google-drive/config";

const rootDir = path.resolve(import.meta.dirname, "..");

function source(...parts: string[]) {
  const filePath = path.join(rootDir, ...parts);
  return existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
}

describe("Google Drive picker configuration", () => {
  it("normalizes the optional authorized origin list", () => {
    expect(splitGoogleDriveAllowedOrigins(" http://localhost:3000,https://app.example.com ")).toEqual([
      "http://localhost:3000",
      "https://app.example.com",
    ]);
  });

  it("flags missing and origin-mismatched Google Drive config before opening OAuth", () => {
    expect(getGoogleDriveConfig({}).issue).toBe("missing_client_id");
    expect(getGoogleDriveConfig({
      clientId: "123.apps.googleusercontent.com",
    }).issue).toBe("missing_api_key");
    expect(getGoogleDriveConfig({
      clientId: "123-abc.apps.googleusercontent.com",
      apiKey: "AIza-test",
      currentOrigin: "http://localhost:3000",
    }).issue).toBe("missing_authorized_origins");
    expect(getGoogleDriveConfig({
      clientId: "custom-client.apps.googleusercontent.com",
      apiKey: "AIza-test",
      allowedOrigins: "http://localhost:3000",
      currentOrigin: "http://localhost:3000",
    }).issue).toBe("missing_app_id");
    expect(getGoogleDriveConfig({
      clientId: "123-abc.apps.googleusercontent.com",
      apiKey: "AIza-test",
      allowedOrigins: "https://app.example.com",
      currentOrigin: "http://localhost:3000",
    }).issue).toBe("origin_not_allowed");
  });

  it("enables Drive only when the current browser origin is explicitly allowlisted", () => {
    expect(getGoogleDriveConfig({
      clientId: "123-abc.apps.googleusercontent.com",
      apiKey: "AIza-test",
      allowedOrigins: "http://localhost:3000,https://app.example.com",
      currentOrigin: "http://localhost:3000",
    })).toMatchObject({ ready: true, issue: null, appId: "123" });
    expect(getGoogleDriveConfig({
      clientId: "custom-client.apps.googleusercontent.com",
      appId: "987654321",
      apiKey: "AIza-test",
      allowedOrigins: "http://localhost:3000",
      currentOrigin: "http://localhost:3000",
    })).toMatchObject({ ready: true, issue: null, appId: "987654321" });
  });

  it("documents the local origin env and falls back when OAuth never calls back", () => {
    const component = source("components", "google-drive-picker.tsx");
    const envExample = source(".env.example");

    expect(envExample).toContain("NEXT_PUBLIC_GOOGLE_AUTHORIZED_ORIGINS");
    expect(envExample).toContain("NEXT_PUBLIC_GOOGLE_APP_ID");
    expect(component).toContain("getGoogleDriveConfig");
    expect(component).toContain(".setAppId(driveConfig.appId)");
    expect(component).toContain(".setOrigin(currentOrigin)");
    expect(component).toContain('window.gapi.load("picker"');
    expect(component).toContain("authTimeoutRef");
    expect(component).toContain("lifeForm.lifeAdmin.errorInvalidClient");
    expect(component).toContain("setShowManualInput(true)");
  });

  it("uses the per-file Drive scope instead of broad readonly Drive access", () => {
    expect(getGoogleDriveScope()).toBe("https://www.googleapis.com/auth/drive.file");
    expect(source("components", "google-drive-picker.tsx")).not.toContain("drive.readonly");
  });
});
