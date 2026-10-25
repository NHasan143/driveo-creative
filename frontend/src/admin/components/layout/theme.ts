export const THEME_KEY = "driveo-admin:theme";
export type Theme = "light" | "dark";

/**
 * Runs before first paint (inlined in the root layout) so the page never
 * flashes the wrong theme. Saved choice wins, then the OS preference.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(!t){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}if(t==="dark")document.documentElement.classList.add("dark")}catch(e){}})();`;

/** Same rule as the inline script: saved choice, then the OS preference. */
export function resolveTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // Storage blocked: fall back to the OS preference.
  }
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage blocked: the theme still applies for this visit.
  }
}
