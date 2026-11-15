import { afterEach, expect, it, vi } from "vitest";
import { GET as cron, POST as internal } from "@/app/api/admin/notify-pending/route";
import { GET as checkProfile } from "@/app/api/auth/check-profile/route";

const mocks = vi.hoisted(() => ({ notify: vi.fn(), authenticate: vi.fn(), profile: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/push/pending", () => ({ notifyPendingProfiles: mocks.notify }));
vi.mock("@/lib/auth/supabase", () => ({ getCurrentUser: mocks.authenticate }));
vi.mock("@/lib/auth/profile", () => ({ getProfileStatus: mocks.profile }));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetAllMocks();
});

it("requires the respective secrets before scheduling notification work", async () => {
  vi.stubEnv("CRON_SECRET", "test-cron");
  vi.stubEnv("INTERNAL_API_TOKEN", "test-internal");
  const url = "https://example.test/api/admin/notify-pending";
  expect((await cron(new Request(url))).status).toBe(401);
  expect((await internal(new Request(url, { method: "POST" }))).status).toBe(401);
  expect(mocks.notify).not.toHaveBeenCalled();
  mocks.notify.mockRejectedValue(new Error("Provider down"));
  expect((await cron(new Request(url, { headers: { authorization: "Bearer test-cron" } }))).status).toBe(503);
});

it("provisions only the authenticated profile", async () => {
  mocks.authenticate.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: "verified" });
  mocks.profile.mockResolvedValue({ approved: false, notified: false });
  expect((await checkProfile()).status).toBe(401);
  expect(mocks.profile).not.toHaveBeenCalled();
  expect((await checkProfile()).status).toBe(200);
  expect(mocks.profile).toHaveBeenCalledExactlyOnceWith({ id: "verified" });
});
