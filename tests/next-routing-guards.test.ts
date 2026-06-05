import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = join(__dirname, "..");
const appDir = join(rootDir, "app");
const publicDir = join(rootDir, "public");

function walkFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];

  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) return walkFiles(fullPath);
    return [fullPath];
  });
}

function toRoutePath(parts: string[]) {
  const visibleParts = parts.filter(
    (part) => part !== "app" && !part.startsWith("(") && !part.startsWith("@"),
  );

  if (visibleParts.length === 0) return "/";

  return `/${visibleParts.join("/")}`;
}

function appPathForRouteFile(filePath: string) {
  const parts = relative(appDir, filePath).split(sep);
  const fileName = parts.pop();

  if (fileName !== "route.ts" && fileName !== "route.js") return null;

  return toRoutePath(parts);
}

function publicPathForFile(filePath: string) {
  return `/${relative(publicDir, filePath).split(sep).join("/")}`;
}

describe("Next routing guards", () => {
  it("does not define app route handlers that shadow public files", () => {
    const publicPaths = new Set(walkFiles(publicDir).map(publicPathForFile));
    const conflicts = walkFiles(appDir)
      .map((filePath) => ({ filePath, routePath: appPathForRouteFile(filePath) }))
      .filter(
        (route): route is { filePath: string; routePath: string } =>
          route.routePath !== null && publicPaths.has(route.routePath),
      )
      .map(({ filePath, routePath }) => `${routePath} -> ${relative(rootDir, filePath)}`);

    expect(conflicts).toEqual([]);
  });

  it("serves the web app manifest through the Next metadata file convention", () => {
    const layoutSource = readFileSync(join(rootDir, "app/layout.tsx"), "utf-8");

    expect(existsSync(join(rootDir, "app/manifest.ts"))).toBe(true);
    expect(layoutSource).not.toContain('manifest: "/manifest.json"');
    expect(layoutSource).toContain('manifest: "/manifest.webmanifest"');
  });

  it("keeps early client shell status checks on the API route instead of Server Actions", () => {
    const clientFiles = ["components/app-shell.tsx", "app/pending-approval/page.tsx"];

    for (const file of clientFiles) {
      const source = readFileSync(join(rootDir, file), "utf-8");

      expect(source).not.toContain("checkStatusAction");
      expect(source).toContain("/api/admin/check-status");
    }
  });

  it("keeps a global back control in the protected app shell", () => {
    const source = readFileSync(join(rootDir, "components/app-shell.tsx"), "utf-8");

    const backControlLabels = source.match(/aria-label=\{t\("common\.back"\)\}/g) ?? [];

    expect(source).toContain("router.back()");
    expect(source).toContain("<ArrowLeft");
    expect(backControlLabels.length).toBeGreaterThanOrEqual(2);
  });

  it("does not register or run an app-shell service worker during development", () => {
    const source = readFileSync(join(rootDir, "app/sw-register.tsx"), "utf-8");

    expect(source).toContain('process.env.NODE_ENV !== "production"');
    expect(source).toContain(".unregister()");
  });

  it("does not let the service worker cache app router navigations", () => {
    const source = readFileSync(join(rootDir, "public/sw.js"), "utf-8");

    expect(source).toContain('request.mode === "navigate"');
    expect(source).toContain('request.destination === "document"');
    expect(source).not.toContain("staleWhileRevalidate(request)");
  });

  it("does not trust partial forwarded-host matches during auth callback redirects", () => {
    const source = readFileSync(join(rootDir, "app/auth/callback/route.ts"), "utf-8");

    expect(source).toContain("getTrustedForwardedHost");
    expect(source).toContain("allowedForwardedHosts.has(host)");
    expect(source).not.toContain("forwardedHost.includes");
  });

  it("sets baseline browser security headers", () => {
    const source = readFileSync(join(rootDir, "next.config.ts"), "utf-8");

    expect(source).toContain("X-Content-Type-Options");
    expect(source).toContain("Referrer-Policy");
    expect(source).toContain("X-Frame-Options");
    expect(source).toContain("Permissions-Policy");
  });

  it("does not let profile creation trust querystring identity", () => {
    const route = readFileSync(join(rootDir, "app/api/auth/check-profile/route.ts"), "utf-8");
    const proxy = readFileSync(join(rootDir, "proxy.ts"), "utf-8");

    expect(route).toContain("supabase.auth.getUser()");
    expect(route).not.toContain('searchParams.get("userId")');
    expect(route).not.toContain('searchParams.get("email")');
    expect(route).not.toContain("detail:");
    expect(proxy).not.toContain('"/api/auth/check-profile"');
  });
});
