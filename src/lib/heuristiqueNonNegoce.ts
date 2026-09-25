import { normaliserDistributeur } from "@/lib/normalisation";

/** Noms souvent confondus avec un distributeur alors qu'il s'agit d'un client, d'un chantier ou d'un autre métier. */
export function nomRessembleANonNegoce(nom: string | null | undefined): boolean {
  if (!nom?.trim()) return false;
  const norm = normaliserDistributeur(nom);
  if (norm.includes("AGENCEMENT")) return true;
  if (norm === "ECOBAT" || norm.startsWith("ECOBAT")) return true;
  return false;
}

export function documentComptePourSuiviFournisseur(rawExtraction: unknown): boolean {
  if (!rawExtraction || typeof rawExtraction !== "object") return true;
  const raw = rawExtraction as {
    domaine?: string;
    emetteur_est_negoce_materiaux?: boolean;
    distributeur?: string;
  };
  if (raw.domaine === "entreprise") return false;
  if (raw.emetteur_est_negoce_materiaux === false) return false;
  if (nomRessembleANonNegoce(raw.distributeur)) return false;
  return true;
}
