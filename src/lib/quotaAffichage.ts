import type { EtatQuota } from "@/lib/quota";

export type VarianteQuota = "historique" | "mensuel" | "plein" | "bloque";

export type MetriquesQuota = {
  utilise: number;
  limite: number;
  libelleCourt: string;
  libelleComplet: string;
  variante: VarianteQuota;
  pourcentage: number;
  aide?: string;
};

export function metriquesQuota(etat: EtatQuota): MetriquesQuota | null {
  if (etat.phase === "bloque_paiement_requis") {
    return {
      utilise: 0,
      limite: 0,
      libelleCourt: "Essai expiré",
      libelleComplet: "Essai expiré — abonnement requis",
      variante: "bloque",
      pourcentage: 100,
      aide: "Enregistrez un moyen de paiement pour continuer à importer des documents.",
    };
  }

  if (etat.phase === "historique") {
    const pourcentage = etat.limiteHistorique > 0
      ? Math.round((etat.documentsTotal / etat.limiteHistorique) * 100)
      : 0;
    return {
      utilise: etat.documentsTotal,
      limite: etat.limiteHistorique,
      libelleCourt: `${etat.documentsTotal} / ${etat.limiteHistorique}`,
      libelleComplet: `Import initial · ${etat.documentsTotal} / ${etat.limiteHistorique} documents`,
      variante: "historique",
      pourcentage: Math.min(100, pourcentage),
      aide:
        "Quota d'import de votre historique passé, indépendant du forfait mensuel. Utilisez-le pour importer vos anciens devis et factures.",
    };
  }

  const plein = etat.quotaAtteint;
  const pourcentage = etat.quotaMensuel > 0
    ? Math.round((etat.documentsCeMoisHorsHistorique / etat.quotaMensuel) * 100)
    : 0;

  return {
    utilise: etat.documentsCeMoisHorsHistorique,
    limite: etat.quotaMensuel,
    libelleCourt: `${etat.documentsCeMoisHorsHistorique} / ${etat.quotaMensuel}`,
    libelleComplet: `Ce mois · ${etat.documentsCeMoisHorsHistorique} / ${etat.quotaMensuel} documents`,
    variante: plein ? "plein" : "mensuel",
    pourcentage: Math.min(100, pourcentage),
    aide: plein
      ? etat.surPlanReel
        ? "Quota mensuel atteint. Réessayez le mois prochain."
        : "Quota d'essai atteint. Il passera au quota de votre formule dès le premier paiement."
      : etat.surPlanReel
        ? "Documents envoyés ce mois-ci, hors import initial déjà consommé."
        : "Palier d'essai mensuel — augmente avec votre abonnement.",
  };
}
