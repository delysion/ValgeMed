import { cookies } from "next/headers";

export const themeCookie = "elise_theme";

export async function getTheme(): Promise<"light" | "dark"> {
  try {
    const cookieStore = await cookies();
    const value = cookieStore.get(themeCookie)?.value;
    if (value === "dark" || value === "light") return value;
    return "light";
  } catch {
    return "light";
  }
}
