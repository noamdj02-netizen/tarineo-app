"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applyAppearance,
  parseThemePref,
  persistAppearance,
  resolveTheme,
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type SidebarTheme,
  type ThemePref,
} from "@/lib/theme";

type ThemeContextValue = {
  theme: ThemePref;
  resolved: ResolvedTheme;
  /** Toujours égal à `resolved` — conservé pour compat API. */
  sidebarTheme: SidebarTheme;
  setTheme: (next: ThemePref) => void;
  /** No-op : le sidebar suit le thème global. */
  setSidebarTheme: (next: SidebarTheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme(): ThemePref {
  if (typeof window === "undefined") return "system";
  try {
    return parseThemePref(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "system";
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Valeurs stables SSR = premier paint client (pas de lecture document ici).
  const [theme, setThemeState] = useState<ThemePref>("system");
  const [resolved, setResolved] = useState<ResolvedTheme>("light");

  useEffect(() => {
    const stored = readStoredTheme();
    const mode = resolveTheme(stored);
    setThemeState(stored);
    setResolved(mode);
    applyAppearance(stored, mode);
    persistAppearance(stored);
  }, []);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const mode = resolveTheme("system", mq.matches);
      setResolved(mode);
      applyAppearance("system", mode);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = useCallback((next: ThemePref) => {
    const mode = resolveTheme(next);
    setThemeState(next);
    setResolved(mode);
    persistAppearance(next);
    applyAppearance(next, mode);
  }, []);

  const setSidebarTheme = useCallback((_next: SidebarTheme) => {
    void _next;
    // Sidebar synchronisé au thème global — ignore les anciennes préférences indépendantes.
  }, []);

  const value = useMemo(
    () => ({
      theme,
      resolved,
      sidebarTheme: resolved,
      setTheme,
      setSidebarTheme,
    }),
    [theme, resolved, setTheme, setSidebarTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: "system" as const,
      resolved: "light" as const,
      sidebarTheme: "light" as const,
      setTheme: () => {},
      setSidebarTheme: () => {},
    };
  }
  return ctx;
}
