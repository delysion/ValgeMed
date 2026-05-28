import type { ZodType } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { idSchema } from "@/lib/validators/schemas";

export function parseForm<T>(schema: ZodType<T>, formData: FormData): T {
  const raw = Object.fromEntries(formData.entries());
  return schema.parse(raw);
}

export function parseId(formData: FormData) {
  return idSchema.parse(String(formData.get("id") ?? ""));
}

export function refresh(paths: string[]) {
  for (const path of paths) {
    revalidatePath(path);
  }
}

export function getSafeReturnPath(formData: FormData) {
  const raw = formData.get("returnTo");
  if (typeof raw !== "string") return null;
  const path = raw.trim();

  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) {
    return null;
  }

  return path;
}

export function redirectToReturnPath(formData: FormData, fallback?: string) {
  const path = getSafeReturnPath(formData) ?? fallback;
  if (path) redirect(path);
}
