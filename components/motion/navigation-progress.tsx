"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Fine barre en haut de l’écran à chaque navigation (feedback immédiat). */
export function NavigationProgress() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<"idle" | "run">("idle");

  useEffect(() => {
    setPhase("run");
    const end = window.setTimeout(() => setPhase("idle"), 420);
    return () => window.clearTimeout(end);
  }, [pathname]);

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[200] h-[2px] origin-left bg-ink will-change-transform",
        phase === "run"
          ? "scale-x-100 opacity-100 transition-[transform,opacity] duration-[380ms] ease-out-soft"
          : "scale-x-0 opacity-0 transition-[transform,opacity] duration-200 ease-out-soft",
      )}
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    />
  );
}
