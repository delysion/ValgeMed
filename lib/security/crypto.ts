import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const PREFIX = "enc:v1:";
const ALGORITHM = "aes-256-gcm";

function getKey() {
  const secret = process.env.AI_KEY_ENCRYPTION_SECRET ?? process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("Missing AI_KEY_ENCRYPTION_SECRET or SESSION_SECRET for secret encryption.");
  }

  return createHash("sha256").update(secret).digest();
}

export function isEncryptedSecret(value: string | null | undefined) {
  return typeof value === "string" && value.startsWith(PREFIX);
}

export function encryptSecret(value: string | null | undefined) {
  if (!value) return null;
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${PREFIX}${iv.toString("base64url")}:${tag.toString("base64url")}:${encrypted.toString("base64url")}`;
}

export function decryptSecret(value: string | null | undefined) {
  if (!value) return null;
  if (!isEncryptedSecret(value)) {
    // Migration-safe fallback for already stored keys. New writes are encrypted.
    return value;
  }

  const [, payload] = value.split(PREFIX);
  const [ivPart, tagPart, encryptedPart] = payload.split(":");
  if (!ivPart || !tagPart || !encryptedPart) {
    return null;
  }

  try {
    const decipher = createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivPart, "base64url"));
    decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedPart, "base64url")),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch {
    return null;
  }
}
