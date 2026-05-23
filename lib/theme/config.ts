export const themeCookie = "valgemed_theme";

export function getTheme() {
  const saved = localStorage.getItem(themeCookie);
  if (saved === "dark" || saved === "light") {
    return saved;
  }
  // Fallback to system preference
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}