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

  it("flags missing Google Drive config before opening OAuth without requiring a public origin env", () => {
    expect(getGoogleDriveConfig({}).issue).toBe("missing_client_id");
    expect(getGoogleDriveConfig({
      clientId: "123.apps.googleusercontent.com",
    }).issue).toBe("missing_api_key");
    expect(getGoogleDriveConfig({
      clientId: "123-abc.apps.googleusercontent.com",
      apiKey: "AIza-test",
      currentOrigin: "http://localhost:3000",
    }).issue).toBe(null);
    expect(getGoogleDriveConfig({
      clientId: "custom-client.apps.googleusercontent.com",
      apiKey: "AIza-test",
      currentOrigin: "http://localhost:3000",
    }).issue).toBe("missing_app_id");
    expect(getGoogleDriveConfig({
      clientId: "123-abc.apps.googleusercontent.com",
      apiKey: "AIza-test",
      allowedOrigins: "https://app.example.com",
      currentOrigin: "http://localhost:3000",
    }).issue).toBe("origin_not_allowed");
  });

  it("enables Drive with server-delivered config and optionally honors an origin allowlist", () => {
    expect(getGoogleDriveConfig({
      clientId: "123-abc.apps.googleusercontent.com",
      apiKey: "AIza-test",
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

  it("loads picker config from a server route and falls back when OAuth never calls back", () => {
    const component = source("components", "google-drive-picker.tsx");
    const envExample = source(".env.example");
    const route = source("app", "api", "google-drive", "config", "route.ts");

    expect(envExample).toContain("GOOGLE_CLIENT_ID");
    expect(envExample).toContain("GOOGLE_API_KEY");
    expect(envExample).not.toContain("NEXT_PUBLIC_GOOGLE_AUTHORIZED_ORIGINS");
    expect(route).toContain("getGoogleDriveConfig");
    expect(route).toContain("requireApprovedUser");
    expect(route).toContain("process.env.GOOGLE_CLIENT_ID");
    expect(route).not.toContain("process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID");
    expect(route).not.toContain("process.env.NEXT_PUBLIC_GOOGLE_API_KEY");
    expect(component).toContain("getGoogleDriveConfig");
    expect(component).toContain('fetch("/api/google-drive/config"');
    expect(component).not.toContain("NEXT_PUBLIC_GOOGLE_AUTHORIZED_ORIGINS");
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
