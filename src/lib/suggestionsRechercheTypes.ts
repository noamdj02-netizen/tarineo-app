import type { DocumentType } from "@prisma/client";
import { LABELS_TYPE, ROUTES_DOCUMENTS_PAR_TYPE, TITRES_PAGE_DOCUMENTS } from "@/lib/documentLabels";

export type SuggestionRecherche = {
  id: string;
  type: "tout" | "categorie" | "fournisseur" | "document" | "filtre";
  titre: string;
  sousTitre?: string;
  href: string;
};

const CATEGORIES: {
  type: DocumentType;
  motsCles: string[];
}[] = [
  { type: "DEVIS", motsCles: ["devis", "devis fournisseur", "devis fournisseurs"] },
  { type: "FACTURE", motsCles: ["facture", "factures", "facture fournisseur", "factures fournisseurs"] },
  { type: "BON_COMMANDE", motsCles: ["bon de commande", "bons de commande", "commande", "commandes"] },
  { type: "BON_ENLEVEMENT", motsCles: ["bon d'enlevement", "bons d'enlevement", "enlevement", "enlèvement"] },
];

const FILTRES_RAPIDES: { id: string; motsCles: string[]; titre: string; href: string }[] = [
  {
    id: "verifier",
    motsCles: ["a verifier", "à verifier", "verifier", "vérifier"],
    titre: "Documents à vérifier",
    href: "/documents?verifier=1",
  },
  {
    id: "hausse",
    motsCles: ["hausse", "hausses", "hausse prix"],
    titre: "Hausses de prix détectées",
    href: "/documents?hausse=1",
  },
];

function normaliserRecherche(valeur: string): string {
  return valeur
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function correspondMotCle(requete: string, motCle: string): boolean {
  const q = normaliserRecherche(requete);
  const m = normaliserRecherche(motCle);
  if (q.length < 2) return false;
  return m.startsWith(q) || q.startsWith(m) || m.includes(q);
}

/** Suggestions locales (catégories + raccourcis) — utilisable côté client. */
export function suggestionsCategoriesEtFiltres(requete: string): SuggestionRecherche[] {
  const brut = requete.trim();
  if (brut.length < 2) return [];

  const resultats: SuggestionRecherche[] = [];

  for (const filtre of FILTRES_RAPIDES) {
    if (filtre.motsCles.some((m) => correspondMotCle(brut, m))) {
      resultats.push({
        id: `filtre-${filtre.id}`,
        type: "filtre",
        titre: filtre.titre,
        sousTitre: "Raccourci",
        href: filtre.href,
      });
    }
  }

  for (const categorie of CATEGORIES) {
    if (categorie.motsCles.some((m) => correspondMotCle(brut, m))) {
      const q = encodeURIComponent(brut);
      resultats.push({
        id: `cat-${categorie.type}`,
        type: "categorie",
        titre: TITRES_PAGE_DOCUMENTS[categorie.type],
        sousTitre: `Filtrer dans les ${LABELS_TYPE[categorie.type].toLowerCase()}s`,
        href: `${ROUTES_DOCUMENTS_PAR_TYPE[categorie.type]}?q=${q}`,
      });
    }
  }

  return resultats;
}
