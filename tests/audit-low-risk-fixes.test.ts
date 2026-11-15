import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = path.resolve(import.meta.dirname, "..");

function source(...parts: string[]) {
  const filePath = path.join(rootDir, ...parts);
  return existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
}

describe("audit low-risk hardening fixes", () => {
  it("does not disable user zoom in the viewport", () => {
    const layout = source("app", "layout.tsx");

    expect(layout).not.toContain("maximumScale");
    expect(layout).not.toContain("userScalable: false");
  });


  it("extracts upload text without writing files to the public asset tree", () => {
    const uploadRoute = source("app", "api", "upload", "route.ts");

    expect(uploadRoute).toContain("extractedText");
    expect(uploadRoute).not.toContain("writeFile");
    expect(uploadRoute).not.toContain("tmpdir()");
    expect(uploadRoute).not.toContain('"public", "uploads"');
  });

  it("connects reusable form labels to controls", () => {
    const fields = source("components", "forms", "fields.tsx");

    expect(fields).toContain("useId");
    expect(fields).toContain("htmlFor={id}");
    expect(fields).toContain("id={id}");
  });

  it("adds accessible names and alerts to interactive client widgets", () => {
    const smartInput = source("components", "smart-input.tsx");
    const uploadZone = source("components", "file-upload-zone.tsx");
    const copilot = source("components", "study-copilot-chat.tsx");

    expect(smartInput).toContain('aria-label={placeholder}');
    expect(smartInput).toContain('aria-label={t(isListening ? "smartInput.voiceStop" : "smartInput.voiceStart")}');
    expect(smartInput).toContain("aria-label={submitLabel}");
    expect(uploadZone).toContain('aria-label="Upload study file"');
    expect(uploadZone).toContain('role="alert"');
    expect(copilot).toContain('aria-label={t("ai.copilotPlaceholder")}');
    expect(copilot).toContain('aria-label={t("ai.copilotSend")}');
  });

  it("does not render dead legal links on the login page", () => {
    const loginPage = source("app", "login", "page.tsx");

    expect(loginPage).not.toContain('href="#"');
  });
});
