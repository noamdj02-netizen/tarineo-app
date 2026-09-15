"use client";

import { useEffect, useState } from "react";

const DUREE_SCAN_MS = 1500;
const DUREE_RESULTAT_MS = 4300;

type Phase = "scan" | "resultat";

interface Ligne {
  label: string;
  valeur: string;
  classeValeur: string;
  bordure: boolean;
}

const LIGNES: Ligne[] = [
  {
    label: "Chauffe-eau Thermor Duralis 200L",
    valeur: "595 € ▲",
    classeValeur: "font-semibold text-red-400",
    bordure: true,
  },
  {
    label: "Votre prix habituel (jan. 2025)",
    valeur: "520 €",
    classeValeur: "font-semibold text-foreground",
    bordure: true,
  },
  {
    label: "Votre prix moyen sur 12 mois",
    valeur: "534 €",
    classeValeur: "font-semibold text-green-400",
    bordure: true,
  },
  { label: "Écart vs votre historique", valeur: "+14,4 % (+75 €)", classeValeur: "font-semibold text-red-400", bordure: false },
];

// Carte de démonstration du hero : boucle infinie recherche → résultat → pause de
// lecture → recherche, pour simuler un cycle d'analyse complet. Le passage
// prefers-reduced-motion se règle uniquement côté CSS (voir globals.css) : le cycle
// JS continue de tourner, seules les transitions visuelles sont neutralisées — même
// approche que StepsDemo.tsx.
export function HeroAnalysisCard() {
  const [phase, setPhase] = useState<Phase>("scan");

  useEffect(() => {
    const duree = phase === "scan" ? DUREE_SCAN_MS : DUREE_RESULTAT_MS;
    const id = setTimeout(() => setPhase((p) => (p === "scan" ? "resultat" : "scan")), duree);
    return () => clearTimeout(id);
  }, [phase]);

  const enScan = phase === "scan";

  return (
    <div className="hero-card-scan relative overflow-hidden rounded-2xl border border-border/80 bg-[var(--demo-panel)] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.45)] sm:p-6">
      {enScan && <span className="hero-scan-sweep pointer-events-none absolute inset-0" aria-hidden="true" />}

      <div className="mb-5 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-accent" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-accent/70" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-red-500" aria-hidden="true" />
        <span className="ml-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-accent">
          {enScan ? "Analyse en cours..." : "Analyse terminée"}
        </span>
        <span
          className={`ml-auto rounded bg-green-500/20 px-2 py-0.5 text-[0.7rem] font-bold text-green-400 ${enScan ? "hero-ia-pulse" : ""}`}
        >
          IA
        </span>
      </div>
      <p className="mb-4 font-bold text-foreground">Devis fournisseur, 14/06/2025</p>

      {enScan ? (
        <div className="space-y-2.5" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`flex items-center justify-between py-2 ${i < 3 ? "border-b border-border/60" : ""}`}
            >
              <span
                className="hero-scan-skeleton h-3.5 w-40 max-w-[55%] rounded bg-border"
                style={{ animationDelay: `${i * 120}ms` }}
              />
              <span
                className="hero-scan-skeleton h-3.5 w-14 rounded bg-border"
                style={{ animationDelay: `${i * 120 + 60}ms` }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {LIGNES.map((ligne, i) => (
            <div
              key={ligne.label}
              className={`hero-result-row flex items-center justify-between py-2 text-sm ${
                ligne.bordure ? "border-b border-border/60" : ""
              }`}
              style={{ animationDelay: `${i * 110}ms` }}
            >
              <span className="text-muted">{ligne.label}</span>
              <span className={ligne.classeValeur}>{ligne.valeur}</span>
            </div>
          ))}
        </div>
      )}

      {!enScan && (
        <div
          className="hero-result-alert mt-4 flex gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
          style={{ animationDelay: "480ms" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            width={16}
            height={16}
            className="mt-0.5 h-4 w-4 shrink-0 text-red-400"
            aria-hidden="true"
          >
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
          <span>Hausse détectée sur votre historique. Ce produit vous coûtait 520 € il y a 6 mois. Vous pouvez négocier.</span>
        </div>
      )}
    </div>
  );
}
