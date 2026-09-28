/** Résultat normalisé d’une recherche d’entreprise (champs absents = null). */
export type CompanyLookupResult = {
  name: string | null;
  legalName: string | null;
  tradeName: string | null;
  siren: string | null;
  siret: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  activity: string | null;
  website: string | null;
  logoUrl: string | null;
  /** false si SIRET présent mais clé de Luhn invalide. */
  siretValid: boolean;
  source: "recherche-entreprises";
};

export type CompanyLookupResponse =
  | { status: "found"; company: CompanyLookupResult }
  | { status: "candidates"; query: string; candidates: CompanyLookupResult[] }
  | { status: "not_found"; query: string }
  | { status: "error"; message: string };
