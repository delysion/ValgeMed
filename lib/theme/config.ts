export const themeCookie = "valgemed_theme";

export async function getTheme() {
  if (typeof window === "undefined") return "dark";
  const cookie = document.cookie.split("; ").find((c) => c.startsWith(themeCookie + "="));
  if (cookie) {
    const val = cookie.split("=")[1] as "light" | "dark";
    if (val === "light" || val === "dark") return val;
  }
  const saved = localStorage.getItem(themeCookie);
  if (saved === "dark" || saved === "light") return saved;
  return "dark";
}