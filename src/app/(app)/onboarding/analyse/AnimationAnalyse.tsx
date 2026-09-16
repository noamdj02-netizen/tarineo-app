"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { marquerOnboardingTermine } from "../actions";

const ETAPES = [
  { id: "recus", label: "Documents reçus", duree: 600 },
  { id: "lus", label: "Documents lus", duree: 900 },
  { id: "fournisseurs", label: "Fournisseurs identifiés", duree: 800 },
  { id: "produits", label: "Produits détectés", duree: 900 },
  { id: "clients", label: "Clients identifiés", duree: 700 },
  { id: "prix", label: "Historique des prix", duree: 800 },
  { id: "variations", label: "Analyse des variations", duree: 900 },
  { id: "dashboard", label: "Préparation du dashboard", duree: 700 },
] as const;

/**
 * Animation d'analyse après un import batch.
 * L'analyse IA a déjà tourné côté serveur pendant l'upload ;
 * cet écran matérialise le "aha moment" puis envoie vers le résumé réel.
 */
export function AnimationAnalyse({
  nbDocuments,
  redirectTo = "/onboarding/resume",
}: {
  nbDocuments: number;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [, startTransition] = useTransition();
  const termine = index >= ETAPES.length;

  useEffect(() => {
    if (termine) {
      const t = setTimeout(() => {
        startTransition(async () => {
          await marquerOnboardingTermine();
          router.push(redirectTo);
          router.refresh();
        });
      }, 700);
      return () => clearTimeout(t);
    }

    const etape = ETAPES[index];
    const t = setTimeout(() => setIndex((i) => i + 1), etape.duree);
    return () => clearTimeout(t);
  }, [index, termine, redirectTo, router]);

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-2 py-10">
      <p className="text-sm font-medium uppercase tracking-wider text-primary">Analyse en cours</p>
      <h1 className="mt-3 text-3xl font-semibold leading-tight text-foreground">
        Tarinéo construit votre espace…
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {nbDocuments > 0
          ? `${nbDocuments} document${nbDocuments > 1 ? "s" : ""} en cours de traitement.`
          : "Lecture et extraction des informations."}
      </p>

      <ul className="mt-10 flex flex-col gap-3">
        {ETAPES.map((etape, i) => {
          const fait = i < index || termine;
          const actif = i === index && !termine;
          return (
            <li
              key={etape.id}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors ${
                fait ? "bg-[#E9F8EE] text-[#1F9D55]" : actif ? "bg-[#FFF0E8] text-primary" : "bg-secondary text-muted-foreground"
              }`}
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/80 text-xs font-bold">
                {fait ? "✓" : actif ? "…" : i + 1}
              </span>
              <span className={fait || actif ? "font-medium" : ""}>{etape.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
