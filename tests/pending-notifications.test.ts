import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { notifyPendingProfiles } from "@/lib/push/pending";

const mocks = vi.hoisted(() => ({ update: vi.fn(), push: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ getDb: () => ({ update: mocks.update }) }));
vi.mock("@/lib/push/notifications", () => ({ sendPushNotification: mocks.push }));

const claimed = [{ id: "22222222-2222-2222-2222-222222222222" }];
const write = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("OWNER_USER_ID", "11111111-1111-1111-1111-111111111111");
  write.mockImplementation(() => ({ where: () => ({ returning: async () => claimed }) }));
  mocks.update.mockReturnValue({ set: write });
});
afterEach(() => vi.unstubAllEnvs());

it("keeps an unsuccessful delivery eligible for retry", async () => {
  mocks.push.mockResolvedValue(false);
  await expect(notifyPendingProfiles()).rejects.toThrow("No push subscription accepted");
  expect(write).toHaveBeenCalledExactlyOnceWith({ notificationClaimedUntil: expect.any(Date) });
});

it("marks claimed profiles only after push acceptance", async () => {
  mocks.push.mockResolvedValue(true);
  await expect(notifyPendingProfiles()).resolves.toBe(1);
  expect(write).toHaveBeenNthCalledWith(2, { notifiedAt: expect.any(Date), notificationClaimedUntil: null });
  expect(mocks.push.mock.invocationCallOrder[0]).toBeLessThan(write.mock.invocationCallOrder[1]);
});
