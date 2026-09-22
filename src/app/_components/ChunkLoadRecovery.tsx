"use client";

import { useEffect } from "react";

const CLE_RELOAD = "tarineo-chunk-reload";

function estErreurChunk(erreur: unknown): boolean {
  const message =
    erreur instanceof Error
      ? `${erreur.name} ${erreur.message}`
      : typeof erreur === "string"
        ? erreur
        : "";

  return (
    message.includes("ChunkLoadError") ||
    message.includes("Failed to load chunk") ||
    message.includes("Loading chunk")
  );
}

/** En dev Turbopack, recharge une fois si un chunk HMR obsolète échoue au chargement. */
export function ChunkLoadRecovery() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    sessionStorage.removeItem(CLE_RELOAD);

    function tenterReload(erreur: unknown) {
      if (!estErreurChunk(erreur)) return;
      if (sessionStorage.getItem(CLE_RELOAD)) return;
      sessionStorage.setItem(CLE_RELOAD, "1");
      window.location.reload();
    }

    const onRejection = (event: PromiseRejectionEvent) => tenterReload(event.reason);
    const onError = (event: ErrorEvent) => tenterReload(event.error ?? event.message);

    window.addEventListener("unhandledrejection", onRejection);
    window.addEventListener("error", onError);

    return () => {
      window.removeEventListener("unhandledrejection", onRejection);
      window.removeEventListener("error", onError);
    };
  }, []);

  return null;
}
