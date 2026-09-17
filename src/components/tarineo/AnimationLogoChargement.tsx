"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const LOGO_ANIMATION_SRC = "/auth/logo-v1.apng";

type Props = {
  pleinEcran?: boolean;
  boucle?: boolean;
  className?: string;
  onTermine?: () => void;
};

/** Taille moyenne — identique chargement page et splash mobile. */
const TAILLE_LOGO = "h-auto w-[140px] sm:w-[160px]";

export function AnimationLogoChargement({
  pleinEcran = false,
  boucle = true,
  className,
  onTermine,
}: Props) {
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    if (boucle || !onTermine) return;
    const timer = window.setTimeout(onTermine, 2100);
    return () => window.clearTimeout(timer);
  }, [boucle, onTermine]);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 bg-[var(--background,#f2f2f2)]",
        pleinEcran ? "fixed inset-0 z-[100]" : "min-h-[32vh] w-full px-6 py-10",
        className
      )}
      role="status"
      aria-busy="true"
      aria-label="Chargement"
    >
      <img
        src={erreur ? "/dashboard/logo.png" : LOGO_ANIMATION_SRC}
        alt=""
        width={160}
        height={160}
        onError={() => setErreur(true)}
        className={cn(
          "pointer-events-none object-contain",
          TAILLE_LOGO,
          erreur && "animate-pulse"
        )}
      />
      {!pleinEcran && <p className="text-sm text-muted-foreground">Chargement…</p>}
    </div>
  );
}
