/** Chemins produit. Les anciennes URL Navpit redirigent ici. */
export const R = {
  accueil: "/accueil",
  /** Chat contextuel (⌘J) — pas l’import de documents (/devis/analyser). */
  analyse: "/copilote",
  devisAnalyser: "/devis/analyser",
  devisNouveau: "/devis/nouveau",
  chantiers: "/chantiers",
  chantier: (slug: string) => `/chantiers/${slug}`,
  nouveauChantier: "/chantiers#nouveau",
  distributeur: "/distributeur",
  distributeurDevis: "/distributeur/devis",
  distributeurBc: "/distributeur/bon-commande",
  distributeurBe: "/distributeur/bon-enlevement",
  distributeurFacture: "/distributeur/facture",
  client: "/client",
  clientDevis: "/client/devis",
  clientBc: "/client/bon-commande",
  clientFacture: "/client/facture",
  relances: "/relances",
  automatisations: "/automatisations",
  hausses: "/hausses",
  comparateur: "/comparateur",
  fournisseurs: "/fournisseurs",
  achats: "/achats",
  achatsProduits: "/achats/produits",
  achatsProduit: (slug: string) => `/achats/produits/${slug}`,
  achatsExport: "/achats/export",
  entreprise: "/parametres/entreprise",
  parametres: "/parametres",
  piece: (id: string) => `/pieces/${id}`,
} as const;

export function pieceListHref(direction: "in" | "out", kind: string) {
  if (direction === "out") {
    if (kind === "bon_commande") return R.clientBc;
    if (kind === "facture") return R.clientFacture;
    return R.clientDevis;
  }
  if (kind === "bon_commande") return R.distributeurBc;
  if (kind === "bon_enlevement") return R.distributeurBe;
  if (kind === "facture") return R.distributeurFacture;
  return R.distributeurDevis;
}
