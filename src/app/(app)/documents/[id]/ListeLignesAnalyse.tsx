"use client";

import { useMemo } from "react";
import { CarteLigneProduit, type LigneAnalyse } from "./CarteLigneProduit";
import { useAnalyseDocument } from "./AnalyseDocumentContext";
import { ligneCorrespondAuFiltre } from "@/lib/analyseDocument";
import type { ComparaisonLigne } from "@/lib/comparaisonPrix";

type Props = {
  lignes: LigneAnalyse[];
  distributeur: string | null;
  afficherComparaison: boolean;
};

export function ListeLignesAnalyse({ lignes, distributeur, afficherComparaison }: Props) {
  const { filtre, lineReviews } = useAnalyseDocument();

  const lignesFiltrees = useMemo(() => {
    return lignes.filter((ligne) => {
      const ignoree = lineReviews[ligne.id]?.status === "ignored";
      const comparaison = ligne.comparaison as ComparaisonLigne | undefined;
      return ligneCorrespondAuFiltre(filtre, comparaison, ignoree);
    });
  }, [lignes, filtre, lineReviews]);

  if (lignes.length === 0) {
    return (
      <p className="rounded-2xl border border-[var(--border)] bg-white p-6 text-center text-sm text-muted-foreground">
        Aucune ligne extraite.
      </p>
    );
  }

  return (
    <div id="lignes-analyse" className="flex flex-col gap-3 scroll-mt-28">
      {lignesFiltrees.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-secondary/50 p-6 text-center text-sm text-muted-foreground">
          Aucune ligne pour ce filtre.
        </p>
      ) : (
        lignesFiltrees.map((ligne) => (
          <CarteLigneProduit
            key={ligne.id}
            {...ligne}
            distributeur={distributeur}
            afficherComparaison={afficherComparaison}
          />
        ))
      )}
    </div>
  );
}
