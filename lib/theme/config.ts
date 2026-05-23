export const themeCookie = "valgemed_theme";

export async function getTheme() {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem(themeCookie);
  if (saved === "dark" || saved === "light") {
    return saved;
  }
  return "light";
}