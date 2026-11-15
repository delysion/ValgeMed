import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/upload/route";

const mocks = vi.hoisted(() => ({ authorize: vi.fn(), quota: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@neondatabase/serverless", () => ({ neon: () => mocks.quota }));
vi.mock("@/lib/db/auth", () => ({
  requireApprovedUserId: mocks.authorize,
  ApprovalRequiredError: class extends Error {},
}));

function upload(file: File) {
  const form = new FormData();
  form.set("file", file);
  return new NextRequest("https://example.test/api/upload", { method: "POST", body: form });
}

describe("upload boundaries", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.authorize.mockResolvedValue("user-id");
    mocks.quota.mockResolvedValue([{ attempts: 1 }]);
  });

  it("rejects unauthenticated requests before reading or counting uploads", async () => {
    mocks.authorize.mockRejectedValue(new Error("Unauthorized"));
    const request = upload(new File(["hi"], "test.txt"));
    expect((await POST(request)).status).toBe(401);
    expect(request.bodyUsed).toBe(false);
    expect(mocks.quota).not.toHaveBeenCalled();
  });

  it("rejects a binary file disguised as text", async () => {
    const file = new File([new Uint8Array([0xff, 0xfe])], "fake.txt");
    expect((await POST(upload(file))).status).toBe(415);
  });

  it("enforces the file size and daily limit", async () => {
    expect((await POST(upload(new File([new Uint8Array(4_000_001)], "oversize.txt")))).status).toBe(413);
    mocks.quota.mockResolvedValue([]);
    expect((await POST(upload(new File(["hi"], "test.md")))).status).toBe(429);
  });
});
