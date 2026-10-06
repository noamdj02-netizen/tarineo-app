import { BRAND } from "@/lib/brand";

/**
 * Éditeur du site et du service — source : Annuaire des entreprises (data.gouv).
 * @see https://annuaire-entreprises.data.gouv.fr/entreprise/alann-drapier-130865041
 */
export const LEGAL_PUBLISHER = {
  legalName: "Alann Drapier",
  legalNameRegistry: "ALANN DRAPIER",
  legalForm: "Entrepreneur individuel",
  tradeName: BRAND.name,
  siren: "130865041",
  siret: "13086504100011",
  addressLine: "47 rue Vivienne",
  postalCode: "75002",
  city: "Paris",
  country: "France",
  activityCode: "62.01Z",
  activityLabel: "Programmation informatique",
  directorPublication: "Alann Drapier",
  registryUrl:
    "https://annuaire-entreprises.data.gouv.fr/entreprise/alann-drapier-130865041",
  /** Dernière relecture des mentions légales (contenu site). */
  legalPagesUpdated: "6 octobre 2026",
  /** Prix CGV : franchise en base (vérifier avec le comptable si le régime change). */
  pricesVatNote:
    "Les prix sont indiqués en euros hors taxes (HT). L’éditeur n’est pas assujetti à la TVA sur ses prestations (article 293 B du CGI) ; toute évolution de régime sera reflétée sur facture.",
  professionalWithdrawalNote:
    "Le service est réservé aux professionnels agissant dans le cadre de leur activité. Ils ne bénéficient pas du droit de rétractation prévu pour les consommateurs (articles L221-3 et suivants du Code de la consommation).",
} as const;

export function formatLegalSiret(siret: string): string {
  const d = siret.replace(/\s/g, "");
  if (d.length !== 14) return siret;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 9)} ${d.slice(9)}`;
}

export function formatLegalSiren(siren: string): string {
  const d = siren.replace(/\s/g, "");
  if (d.length !== 9) return siren;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}

export function publisherEditorParagraph(): string {
  const p = LEGAL_PUBLISHER;
  return (
    `${p.tradeName} est édité par ${p.legalName}, ${p.legalForm.toLowerCase()} ` +
    `(activité principale : ${p.activityCode} — ${p.activityLabel.toLowerCase()}), ` +
    `SIREN ${formatLegalSiren(p.siren)}, SIRET ${formatLegalSiret(p.siret)}, ` +
    `dont le siège est situé ${p.addressLine}, ${p.postalCode} ${p.city}, ${p.country}. ` +
    `Fiche officielle : ${p.registryUrl}.`
  );
}

export function publisherPublicationDirectorLine(): string {
  return `Directeur de la publication : ${LEGAL_PUBLISHER.directorPublication}. Contact : ${BRAND.contactEmail}.`;
}

/** Région Supabase : surcharger via LEGAL_SUPABASE_DATA_REGION (ex. eu-west-3). */
export function publisherSupabaseDataRegion(): string {
  const fromEnv = process.env.LEGAL_SUPABASE_DATA_REGION?.trim();
  if (fromEnv) return fromEnv;
  return "Union européenne (infrastructure Supabase)";
}
