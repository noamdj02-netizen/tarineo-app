"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

const SEUIL_PX = 64;
const MAX_TIRAGE = 96;

/**
 * Tirez vers le bas en haut de page pour rafraîchir (mobile).
 * Desktop : pas d'effet (pointeurs souris ignorés).
 */
export function PullToRefresh({ children, className }: { children: ReactNode; className?: string }) {
  const router = useRouter();
  const debutY = useRef<number | null>(null);
  const [tirage, setTirage] = useState(0);
  const [rafraichit, setRafraichit] = useState(false);
  const actif = useRef(false);

  const enHaut = useCallback(() => {
    if (typeof window === "undefined") return true;
    return window.scrollY <= 2;
  }, []);

  function onTouchStart(e: React.TouchEvent) {
    if (rafraichit || !enHaut()) {
      debutY.current = null;
      actif.current = false;
      return;
    }
    debutY.current = e.touches[0].clientY;
    actif.current = true;
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!actif.current || debutY.current === null || rafraichit) return;
    if (!enHaut()) {
      debutY.current = null;
      setTirage(0);
      actif.current = false;
      return;
    }
    const delta = e.touches[0].clientY - debutY.current;
    if (delta <= 0) {
      setTirage(0);
      return;
    }
    // Résistance : plus on tire, moins ça avance
    const resistant = Math.min(MAX_TIRAGE, delta * 0.45);
    setTirage(resistant);
  }

  async function onTouchEnd() {
    if (!actif.current) return;
    actif.current = false;
    debutY.current = null;
    if (tirage >= SEUIL_PX && !rafraichit) {
      setRafraichit(true);
      setTirage(SEUIL_PX * 0.7);
      try {
        router.refresh();
        await new Promise((r) => setTimeout(r, 650));
      } finally {
        setRafraichit(false);
        setTirage(0);
      }
      return;
    }
    setTirage(0);
  }

  const pret = tirage >= SEUIL_PX;

  return (
    <div
      className={cn("relative", className)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      <div
        className="pointer-events-none flex items-center justify-center overflow-hidden transition-[height] duration-150 ease-out lg:hidden"
        style={{ height: tirage > 0 || rafraichit ? Math.max(tirage, rafraichit ? 40 : 0) : 0 }}
        aria-hidden={!rafraichit && tirage === 0}
      >
        <Loader2Icon
          className={cn(
            "size-5 text-primary transition-opacity",
            rafraichit || pret ? "opacity-100" : "opacity-50",
            rafraichit || pret ? "animate-spin" : undefined,
          )}
        />
      </div>
      <div
        style={{
          transform: tirage > 0 ? `translateY(${tirage * 0.15}px)` : undefined,
          transition: tirage === 0 ? "transform 150ms ease-out" : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
