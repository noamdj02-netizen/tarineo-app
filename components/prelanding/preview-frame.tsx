"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Largeur de maquette des aperçus : chaque landing est dessinée pour un écran de 1280 px. */
export const DESIGN_WIDTH = 1280;

/**
 * Affiche une landing de 1280 px réduite à la largeur disponible.
 * - `crop` : hauteur fixe par le ratio du parent (carte) ;
 * - sinon : la hauteur suit la page entière (aperçu plein écran).
 */
export function PreviewFrame({
  children,
  crop = false,
  className,
}: {
  children: React.ReactNode;
  crop?: boolean;
  className?: string;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const update = () => {
      setScale(o.clientWidth / DESIGN_WIDTH);
      setHeight(i.offsetHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={outer}
      className={cn("relative w-full overflow-hidden", crop && "h-full", className)}
      style={crop ? undefined : { height: height * scale || undefined }}
    >
      <div
        ref={inner}
        aria-hidden
        inert
        className="pointer-events-none absolute top-0 left-0 origin-top-left select-none"
        style={{
          width: DESIGN_WIDTH,
          transform: `scale(${scale})`,
          visibility: scale ? "visible" : "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}
