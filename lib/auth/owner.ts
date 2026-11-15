import "server-only";

export function getOwnerUserId(): string | undefined {
  const id = process.env.OWNER_USER_ID?.trim();
  if (id && /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(id)) {
    return id.toLowerCase();
  }
}

export function isOwnerUser(userId: string): boolean {
  return userId === getOwnerUserId();
}
