import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "../proxy";

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), query: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({ auth: { getUser: mocks.getUser } }),
}));
vi.mock("@neondatabase/serverless", () => ({ neon: () => mocks.query }));

const ownerId = "11111111-1111-1111-1111-111111111111";
const memberId = "22222222-2222-2222-2222-222222222222";
const request = (path: string) => new NextRequest("https://example.test" + path);

describe("private routes", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("OWNER_EMAIL", "owner@example.test");
    vi.stubEnv("OWNER_USER_ID", ownerId);
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    mocks.query.mockResolvedValue([]);
  });

  afterEach(() => vi.unstubAllEnvs());

  it("requires a session by default, including unknown routes and JSON paths", async () => {
    for (const path of ["/api/new.json", "/api/ai/execute", "/api/push/send", "/api/upload"]) {
      expect((await proxy(request(path))).status).toBe(401);
    }
    expect((await proxy(request("/performance-blockers"))).headers.get("location")).toContain("/login?");
    expect((await proxy(request("/login-backup"))).headers.get("location")).toContain("/login?");
    expect((await proxy(request("/login"))).status).toBe(200);
  });

  it("checks pending and approved accounts without writing profiles", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: memberId } } });
    expect((await proxy(request("/api/upload"))).status).toBe(403);
    expect((await proxy(request("/new"))).headers.get("location")).toBe("https://example.test/pending-approval");
    mocks.query.mockResolvedValue([{ approved: true }]);
    expect((await proxy(request("/api/upload"))).status).toBe(200);
    expect(mocks.query.mock.calls.every(([query]) => query.join("").startsWith("SELECT "))).toBe(true);
  });

  it("recognizes the owner only by configured UUID", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: memberId, email: "owner@example.test" } } });
    expect((await proxy(request("/admin/users"))).status).toBe(303);
    mocks.getUser.mockResolvedValue({ data: { user: { id: ownerId, email: "changed@example.test" } } });
    expect((await proxy(request("/admin/users"))).status).toBe(200);
    vi.stubEnv("OWNER_USER_ID", "");
    expect((await proxy(request("/admin/users"))).status).toBe(303);
  });
});
