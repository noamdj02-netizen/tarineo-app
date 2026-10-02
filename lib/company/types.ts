/** Résultat normalisé d’une recherche d’entreprise (champs absents = null). */
export type CompanyLookupResult = {
  name: string | null;
  legalName: string | null;
  tradeName: string | null;
  /** Forme juridique lisible (EURL, SARL…), jamais inventée. */
  legalForm: string | null;
  siren: string | null;
  siret: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  /** Code APE/NAF (ex. 43.22A). */
  activity: string | null;
  /** Libellé activité si disponible côté API (sinon null). */
  activityLabel: string | null;
  /** true = établissement / unité active (état A). */
  active: boolean | null;
  website: string | null;
  logoUrl: string | null;
  /** false si SIRET présent mais clé de Luhn invalide. */
  siretValid: boolean;
  /** Score interne de correspondance (0–100), non affiché comme « probabilité IA ». */
  matchScore: number;
  source: "recherche-entreprises";
};

export type CompanyLookupResponse =
  | { status: "found"; company: CompanyLookupResult }
  | { status: "candidates"; query: string; candidates: CompanyLookupResult[] }
  | { status: "not_found"; query: string }
  | { status: "error"; message: string };
