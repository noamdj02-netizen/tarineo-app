"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Remonte le scroll du panneau principal à chaque onglet (desktop). */
export function AppMainScrollRestore() {
  const pathname = usePathname();

  useEffect(() => {
    const main = document.getElementById("app-main");
    if (main) main.scrollTop = 0;
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
