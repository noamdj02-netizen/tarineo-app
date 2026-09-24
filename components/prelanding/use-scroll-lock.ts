"use client";

import { useEffect } from "react";

let locks = 0;
let saved = "";

/** Bloque le défilement de la page tant qu'au moins une fenêtre est ouverte (aperçu + confirmation). */
export function useScrollLock() {
  useEffect(() => {
    if (locks++ === 0) {
      saved = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    return () => {
      if (--locks === 0) document.body.style.overflow = saved;
    };
  }, []);
}
