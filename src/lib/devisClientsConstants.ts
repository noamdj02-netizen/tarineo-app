/** Constantes partagées formulaire devis — sans Prisma (importables côté client). */

export const CONDITIONS_PAIEMENT_PAR_DEFAUT =
  "Acompte de 30% à la commande, solde à réception des travaux.";

export const DUREE_VALIDITE_PAR_DEFAUT = 30;

export const PRESETS_VALIDITE_JOURS = [15, 30, 60, 90] as const;

export const PRESETS_CONDITIONS_PAIEMENT: { label: string; valeur: string }[] = [
  { label: "30 % acompte", valeur: CONDITIONS_PAIEMENT_PAR_DEFAUT },
  { label: "50 % acompte", valeur: "Acompte de 50% à la commande, solde à réception des travaux." },
  { label: "À réception", valeur: "Paiement intégral à réception des travaux." },
  { label: "30 jours", valeur: "Paiement à 30 jours date de facture." },
];
