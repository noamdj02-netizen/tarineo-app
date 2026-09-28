export const THEME_STORAGE_KEY = "tarineo-theme";
/** Conservé pour compat lecture, plus utilisé pour forcer un thème sidebar indépendant. */
export const SIDEBAR_THEME_STORAGE_KEY = "tarineo-sidebar-theme";

export type ThemePref = "light" | "dark" | "system";
export type SidebarTheme = "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export const THEME_PREFS = ["light", "dark", "system"] as const;
export const SIDEBAR_THEMES = ["dark", "light"] as const;

export function parseThemePref(value: string | null | undefined): ThemePref {
  if (value === "light" || value === "dark" || value === "system") return value;
  return "system";
}

export function parseSidebarTheme(value: string | null | undefined): SidebarTheme {
  if (value === "light" || value === "dark") return value;
  return "dark";
}

export function resolveTheme(pref: ThemePref, systemDark?: boolean): ResolvedTheme {
  if (pref === "light") return "light";
  if (pref === "dark") return "dark";
  const dark =
    systemDark ??
    (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  return dark ? "dark" : "light";
}

/** Sidebar = thème global résolu (plus de thème sidebar indépendant). */
export function applyAppearance(pref: ThemePref, resolved?: ResolvedTheme) {
  if (typeof document === "undefined") return;
  const mode = resolved ?? resolveTheme(pref);
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");
  root.dataset.theme = mode;
  root.dataset.themePref = pref;
  root.dataset.sidebar = mode;
  root.style.colorScheme = mode;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", mode === "dark" ? "#0A0A0A" : "#F5F5F3");
}

export function persistAppearance(pref: ThemePref) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, pref);
    // Aligne l’ancien storage pour éviter un flash au prochain boot si un script legacy le lit.
    localStorage.setItem(SIDEBAR_THEME_STORAGE_KEY, resolveTheme(pref));
  } catch {
    /* private mode */
  }
}

/**
 * Inline, synchrone : thème page + sidebar depuis la même préférence globale.
 * `data-sidebar` suit toujours le mode résolu (jamais le vieux forçage « dark »).
 */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}")||"system";if(t!=="light"&&t!=="dark"&&t!=="system")t="system";var dark=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var mode=dark?"dark":"light";var r=document.documentElement;r.classList.toggle("dark",dark);r.setAttribute("data-theme",mode);r.setAttribute("data-theme-pref",t);r.setAttribute("data-sidebar",mode);r.style.colorScheme=mode;}catch(e){var r2=document.documentElement;r2.classList.remove("dark");r2.setAttribute("data-theme","light");r2.setAttribute("data-theme-pref","system");r2.setAttribute("data-sidebar","light");r2.style.colorScheme="light";}})();`;
