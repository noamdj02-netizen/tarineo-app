import { prisma } from "@/lib/prisma";
import { calculerDepensesParDistributeur } from "@/lib/depenses";
import { parserPayloadsAlertesHausse } from "@/lib/comparaisonPrix";
import { logoFournisseur } from "@/lib/logosFournisseurs";
import {
  listerCatalogueFournisseurs,
  slugFournisseurConnu,
  trouverFournisseurConnu,
} from "@/lib/fournisseursConnus";

const COULEURS_DONUT = ["#EC5821", "#3B6AE1", "#1F9D55", "#7C3AED", "#E67A1F", "#D64545"];

export interface FournisseurListe {
  distributorNorm: string;
  nom: string;
  logo: string | null;
  /** Groupe d'appartenance (Saint-Gobain, Kingfisher…) si l'enseigne est au catalogue. */
  groupe: string | null;
  specialite: string | null;
  depenses: number;
  documents: number;
  hausses: number;
  objectif: number | null;
  pourcentageBfa: number | null;
  dernierImport: Date | null;
}

/** Une ligne du catalogue complet : enseigne connue + données perso si déjà importée. */
export interface FournisseurBibliotheque extends FournisseurListe {
  slug: string;
  importe: boolean;
}

function normaliserCle(valeur: string): string {
  return valeur
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]/g, "");
}

export async function listerFournisseursUtilisateur(userId: string): Promise<FournisseurListe[]> {
  const depenses = await calculerDepensesParDistributeur(userId);
  const comptesDocs = await prisma.document.groupBy({
    by: ["distributorNorm"],
    where: { userId, distributorNorm: { not: null }, status: "VALIDATED" },
    _count: { _all: true },
    _max: { documentDate: true },
  });
  const alertes = await prisma.alert.findMany({
    where: { userId, type: "PRICE_INCREASE" },
    select: { payload: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const comptesParNorm = new Map(
    comptesDocs.map((d) => [d.distributorNorm as string, { count: d._count._all, dernier: d._max.documentDate }])
  );

  const haussesParDistributeur = new Map<string, number>();
  for (const p of parserPayloadsAlertesHausse(alertes)) {
    const norm = p.distributor.toLowerCase();
    haussesParDistributeur.set(norm, (haussesParDistributeur.get(norm) ?? 0) + 1);
  }

  return depenses
    .map((d) => {
      const stats = comptesParNorm.get(d.distributorNorm);
      const hausses =
        haussesParDistributeur.get(d.distributorNorm.toLowerCase()) ??
        haussesParDistributeur.get(d.distributor.toLowerCase()) ??
        0;
      const connu = trouverFournisseurConnu(d.distributor) ?? trouverFournisseurConnu(d.distributorNorm);
      return {
        distributorNorm: d.distributorNorm,
        nom: connu?.nom ?? d.distributor,
        logo: logoFournisseur(d.distributorNorm) ?? logoFournisseur(d.distributor),
        groupe: connu?.groupe ?? null,
        specialite: connu?.specialite ?? null,
        depenses: d.depenses,
        documents: stats?.count ?? 0,
        hausses,
        objectif: d.objectif,
        pourcentageBfa: d.pourcentageAtteinte,
        dernierImport: stats?.dernier ?? null,
      };
    })
    .sort((a, b) => b.depenses - a.depenses);
}

export function couleurDonutFournisseur(index: number): string {
  return COULEURS_DONUT[index % COULEURS_DONUT.length];
}

/**
 * Catalogue complet des enseignes connues, enrichi des données personnelles de
 * l'artisan quand il a déjà importé des documents chez elles.
 */
export async function construireBibliothequeComplete(userId: string): Promise<FournisseurBibliotheque[]> {
  const importes = await listerFournisseursUtilisateur(userId);

  // Un même fournisseur importé peut avoir un distributorNorm qui ne correspond pas
  // exactement au slug du catalogue : on rapproche via trouverFournisseurConnu.
  const parSlug = new Map<string, FournisseurListe>();
  for (const f of importes) {
    const connu = trouverFournisseurConnu(f.nom) ?? trouverFournisseurConnu(f.distributorNorm);
    if (connu) parSlug.set(slugFournisseurConnu(connu), f);
  }

  return listerCatalogueFournisseurs().map((connu) => {
    const slug = slugFournisseurConnu(connu);
    const donnees = parSlug.get(slug);

    if (donnees) {
      return { ...donnees, slug, importe: true };
    }

    return {
      slug,
      distributorNorm: slug,
      nom: connu.nom,
      logo: connu.logo ?? null,
      groupe: connu.groupe ?? null,
      specialite: connu.specialite,
      depenses: 0,
      documents: 0,
      hausses: 0,
      objectif: null,
      pourcentageBfa: null,
      dernierImport: null,
      importe: false,
    };
  });
}

/** Résout un identifiant d'URL vers les données perso, si elles existent. */
export function trouverFournisseurImporte(
  importes: FournisseurListe[],
  slugOuNorm: string
): FournisseurListe | null {
  const k = normaliserCle(slugOuNorm);
  const direct = importes.find((f) => normaliserCle(f.distributorNorm) === k);
  if (direct) return direct;

  for (const f of importes) {
    const connu = trouverFournisseurConnu(f.nom) ?? trouverFournisseurConnu(f.distributorNorm);
    if (connu && slugFournisseurConnu(connu) === k) return f;
  }
  return null;
}
