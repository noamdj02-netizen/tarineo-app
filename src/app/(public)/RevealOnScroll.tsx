"use client";

import { useEffect, useRef, useState } from "react";

export type RevealVariant = "up" | "vertical" | "left" | "right" | "scale";

// États caché → visible par variante. Toutes partagent la même durée/courbe
// (transition-all duration-700, easing "expo out" via cubic-bezier) pour la cohérence
// globale — seules la direction et l'amplitude du mouvement changent selon la section.
const VARIANTS: Record<RevealVariant, { hidden: string; visible: string }> = {
  // Reveal "plein" (fondu + translation + léger scale) — Le problème.
  up: { hidden: "opacity-0 translate-y-20 scale-95", visible: "opacity-100 translate-y-0 scale-100" },
  // Fondu + très léger déplacement vertical, sans scale ni latéral — sobre à dessein
  // (Tarifs), et étape centrale de "Comment ça marche" (arrive "du bas").
  vertical: { hidden: "opacity-0 translate-y-6", visible: "opacity-100 translate-y-0" },
  // Léger glissement horizontal (24px) — étapes 1 et 3 de "Comment ça marche".
  left: { hidden: "opacity-0 -translate-x-6", visible: "opacity-100 translate-x-0" },
  right: { hidden: "opacity-0 translate-x-6", visible: "opacity-100 translate-x-0" },
  // Fondu + très léger scale, sans translation — Fonctionnalités.
  scale: { hidden: "opacity-0 scale-[0.97]", visible: "opacity-100 scale-100" },
};

export function RevealOnScroll({
  children,
  className = "",
  variant = "up",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: RevealVariant;
  /** Délai avant le déclenchement, en ms — pour créer un effet cascade/stagger. */
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px 60px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const states = VARIANTS[variant];

  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`reveal-on-scroll transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        visible ? states.visible : states.hidden
      } ${className}`}
    >
      {children}
    </div>
  );
}
