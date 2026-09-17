"use client";

import { useEffect } from "react";

/**
 * Les modales (Dialog, Sheet, menus) sont rendues dans un portal attaché à <body>,
 * en dehors du div .app-theme du layout. On applique le thème clair sur <html>
 * pour que les variables CSS (--primary, --accent, etc.) restent cohérentes partout.
 */
export function AppThemeScope({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add("app-theme");
    return () => document.documentElement.classList.remove("app-theme");
  }, []);

  return children;
}
