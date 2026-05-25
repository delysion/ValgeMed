import type { ZodType } from "zod";
import { revalidatePath } from "next/cache";
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
