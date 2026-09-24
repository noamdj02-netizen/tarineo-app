"use client";

import { useEffect } from "react";

/** Enregistre /sw.js (en production seulement : en dev, le cache gênerait le rechargement à chaud). */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
  }, []);
  return null;
}
