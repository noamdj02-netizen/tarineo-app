"use client";

import { useEffect } from "react";

const KEY = "navpit-auth-landed";

/** L’onglet qui vient de se connecter prévient l’onglet resté sur « vérifie ta boîte ». */
export function publishAuthLanding(path: string) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ path, at: Date.now() }));
  } catch {
    /* navigation privée */
  }
}

export function FollowAuthTab() {
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== KEY || !event.newValue) return;
      try {
        const data = JSON.parse(event.newValue) as { path?: string; at?: number };
        if (!data.path?.startsWith("/") || data.path.startsWith("//") || !data.at) return;
        if (Date.now() - data.at > 60_000) return;
        window.location.assign(data.path);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return null;
}
