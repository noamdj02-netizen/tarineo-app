"use client";

import { useEffect, useRef, useState } from "react";

export interface StatChiffre {
  valeur: number;
  /** Nombre de décimales à afficher (0 par défaut). */
  decimales?: number;
  prefixe?: string;
  suffixe?: string;
  /** Ajoute un séparateur de milliers (espace) — pour les grandes valeurs comme 6800€. */
  milliers?: boolean;
  desc: string;
}

const DUREE_COMPTAGE_MS = 1200;

// Ralentit en fin de comptage plutôt qu'une progression linéaire — plus proche de
// l'effet lovable.dev qu'un décompte mécanique.
function easeOutExpo(t: number) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function formatNombre(n: number, decimales: number, milliers?: boolean) {
  const fixe = n.toFixed(decimales);
  if (!milliers) return fixe.replace(".", ",");
  const [entier, decimale] = fixe.split(".");
  const groupe = entier.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return decimale ? `${groupe},${decimale}` : groupe;
}

export function ProofStatsSection({ stats }: { stats: StatChiffre[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const startedRef = useRef(false);
  const [progression, setProgression] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || startedRef.current) return;
        startedRef.current = true;
        observer.disconnect();

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setProgression(1);
          return;
        }

        const debut = performance.now();
        const etape = (maintenant: number) => {
          const t = Math.min((maintenant - debut) / DUREE_COMPTAGE_MS, 1);
          setProgression(easeOutExpo(t));
          if (t < 1) requestAnimationFrame(etape);
        };
        requestAnimationFrame(etape);
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="border-y border-border/60 bg-[var(--ticker-bg)] px-4 py-12 sm:px-6 sm:py-14">
      <div className="mx-auto grid max-w-[1100px] grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.desc} className="rounded-2xl border border-border bg-surface p-5 text-center">
            <span className="block text-3xl font-extrabold leading-none text-accent sm:text-4xl">
              {s.prefixe}
              {formatNombre(s.valeur * progression, s.decimales ?? 0, s.milliers)}
              {s.suffixe}
            </span>
            <p className="mt-2 text-sm font-medium leading-relaxed text-foreground/80">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
