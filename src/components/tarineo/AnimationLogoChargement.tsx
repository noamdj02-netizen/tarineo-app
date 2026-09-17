"use client";

import Image from "next/image";
import { BRAND_MARK_SRC } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";

type Props = {
  pleinEcran?: boolean;
  className?: string;
};

/**
 * Indicateur de chargement léger — PNG statique + pulse CSS.
 * Évite l'APNG animé (860 Ko) qui surcharge le thread principal et donne
 * l'impression de rafraîchissements en boucle sur le dashboard.
 */
export function AnimationLogoChargement({ pleinEcran = false, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        pleinEcran ? "fixed inset-0 z-[100] bg-[var(--background,#f2f2f2)]" : "min-h-[24vh] w-full px-6 py-8",
        className
      )}
      role="status"
      aria-busy="true"
      aria-label="Chargement"
    >
      <Image
        src={BRAND_MARK_SRC}
        alt=""
        width={48}
        height={48}
        priority
        className="size-12 animate-pulse motion-reduce:animate-none"
      />
      {!pleinEcran && <p className="text-sm text-muted-foreground">Chargement…</p>}
    </div>
  );
}
