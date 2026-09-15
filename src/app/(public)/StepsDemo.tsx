"use client";

import { useEffect, useState } from "react";

const DUREE_ETAPE_MS = 3800;
const NB_ETAPES = 3;

interface Etape {
  titre: string;
  texte: string;
}

function FenetreDemo({ label }: { label: string }) {
  return (
    <div className="mb-5 flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full bg-accent" aria-hidden="true" />
      <span className="h-2.5 w-2.5 rounded-full bg-accent/70" aria-hidden="true" />
      <span className="h-2.5 w-2.5 rounded-full bg-red-500" aria-hidden="true" />
      <span className="ml-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-accent">{label}</span>
    </div>
  );
}

export function StepsDemoSection({ etapes }: { etapes: Etape[] }) {
  const [actif, setActif] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActif((a) => (a + 1) % NB_ETAPES), DUREE_ETAPE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
      <div className="overflow-hidden rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-5 shadow-[4px_11px_11px_rgba(0,0,0,0.06)] sm:p-6">
        <FenetreDemo label="Démonstration" />
        <div className="relative flex min-h-[17rem] items-center justify-center sm:min-h-[18rem]">
          {actif === 0 && <EtapeImport />}
          {actif === 1 && <EtapeAnalyse />}
          {actif === 2 && <EtapeAlerte />}
        </div>
      </div>

      <div className="space-y-7 sm:space-y-8">
        {etapes.map((e, i) => {
          const selectionne = i === actif;
          return (
            <div key={e.titre} className="flex gap-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-extrabold transition-colors duration-500 ${
                  selectionne
                    ? "landing-gradient-bg text-white"
                    : "bg-[var(--landing-chip)] text-[var(--landing-muted)]"
                }`}
                aria-hidden="true"
              >
                {i + 1}
              </div>
              <div className="min-w-0 pt-0.5">
                <p
                  className={`mb-1.5 text-[1.05rem] font-bold transition-colors duration-500 ${
                    selectionne ? "text-[var(--landing-text)]" : "text-[var(--landing-muted)]"
                  }`}
                >
                  {e.titre}
                </p>
                <p
                  className={`text-sm leading-relaxed transition-colors duration-500 ${
                    selectionne ? "text-[var(--landing-text)]/80" : "text-[var(--landing-muted)]/80"
                  }`}
                >
                  {e.texte}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EtapeImport() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-2">
      <div className="flex h-40 w-full max-w-[240px] items-center justify-center rounded-2xl border-2 border-dashed border-accent/45 bg-accent/[0.06]">
        <div className="steps-demo-doc flex h-14 w-14 items-center justify-center rounded-xl bg-accent/15 text-accent">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            width={26}
            height={26}
            className="h-[26px] w-[26px]"
            aria-hidden="true"
          >
            <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
            <path d="M13 3v4a1 1 0 0 0 1 1h4" />
            <path d="M9 13h6M9 17h6" />
          </svg>
        </div>
      </div>
      <p className="text-xs text-[var(--landing-muted)]">Devis_Cedeo_0625.pdf</p>
    </div>
  );
}

function EtapeAnalyse() {
  const lignes = ["Réf. Chauffe-eau Thermor 200L", "Prix unitaire : 595 €", "Distributeur : Cedeo"];

  return (
    <div className="w-full max-w-[260px] space-y-4 px-2">
      {lignes.map((ligne, i) => (
        <div key={ligne} className="relative h-5 w-full">
          <span
            className="steps-demo-skeleton absolute inset-0 rounded bg-[var(--landing-border)]/80"
            style={{ animationDelay: `${i * 450}ms` }}
          />
          <span
            className="steps-demo-text-reveal absolute inset-0 whitespace-nowrap text-sm text-[var(--landing-text)]"
            style={{ animationDelay: `${i * 450 + 400}ms` }}
          >
            {ligne}
          </span>
        </div>
      ))}
    </div>
  );
}

function EtapeAlerte() {
  return (
    <div className="flex w-full max-w-[260px] flex-col items-stretch gap-4 px-2">
      <div className="relative rounded-xl border border-[var(--landing-border)] bg-white px-4 py-3.5 shadow-sm">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-[var(--landing-muted)]">Chauffe-eau 200L</span>
          <span className="font-semibold text-accent">595 €</span>
        </div>
        <span className="steps-demo-cursor absolute right-4 top-3.5" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={18}
            height={18}
            className="h-[18px] w-[18px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
          >
            <path
              d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z"
              fill="white"
              stroke="#171717"
              strokeWidth={1}
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
      <div className="steps-demo-badge flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          width={14}
          height={14}
          className="h-3.5 w-3.5 shrink-0 text-red-500"
          aria-hidden="true"
        >
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
        Hausse détectée +14,4%
      </div>
    </div>
  );
}
