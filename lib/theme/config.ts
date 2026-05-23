export const themeCookie = "valgemed_theme";

export async function getTheme() {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem(themeCookie);
  if (saved === "dark" || saved === "light") {
    return saved;
  }
  return "dark";
}