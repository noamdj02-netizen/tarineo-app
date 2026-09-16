import { prisma } from "@/lib/prisma";

// Détection de « dérive silencieuse » — V1 de l'agent fournisseur (voir
// SPEC-AGENT-FOURNISSEUR.md, fonctionnalité F4).
//
// L'alerte de hausse existante (comparaisonPrix.ts) compare un achat au précédent et se
// déclenche au-delà de 3 %. Une enseigne qui augmente de 2 % à chaque commande passe donc
// systématiquement sous le radar, alors qu'au bout de quatre commandes l'artisan paie 8 %
// de plus sans l'avoir jamais vu. C'est exactement ce trou-là qu'on comble ici.
//
// Aucune donnée externe : tout est calculé sur l'historique personnel de l'artisan
// (PriceHistory), comme le reste du produit.

/** Au-delà, l'alerte de hausse classique s'est déjà déclenchée — ce n'est plus silencieux. */
const SEUIL_HAUSSE_UNITAIRE_PCT = 3;
/** Dérive cumulée à partir de laquelle on estime que ça vaut le coup d'en parler. */
const SEUIL_DERIVE_CUMULEE_PCT = 5;
/** En dessous, on ne peut pas parler de hausses « répétées ». */
const ACHATS_MIN = 3;
const FENETRE_MOIS = 12;

export interface DeriveDetectee {
  referenceNorm: string;
  reference: string;
  designation: string;
  distributor: string;
  distributorNorm: string;
  premierPrixHt: number;
  dernierPrixHt: number;
  premiereDate: Date;
  derniereDate: Date;
  nombreAchats: number;
  ecartEuros: number;
  ecartPourcent: number;
  /** Plus forte hausse entre deux achats consécutifs : toujours sous le seuil d'alerte. */
  plusForteHaussePct: number;
  /**
   * Surcoût annuel si l'artisan rachète la même quantité qu'au cours des 12 derniers
   * mois, au nouveau prix. `null` si aucune quantité n'a pu être retrouvée.
   */
  surcoutAnnuelEstime: number | null;
}

function debutFenetre(): Date {
  const debut = new Date();
  debut.setMonth(debut.getMonth() - FENETRE_MOIS);
  return debut;
}

/**
 * Renvoie les couples (référence, distributeur) dont le prix a monté par petits pas sur
 * les 12 derniers mois, triés du plus gros surcoût au plus petit.
 *
 * Toujours filtré sur `userId` : un artisan ne voit jamais que son propre historique.
 */
export async function detecterDerivesSilencieuses(userId: string): Promise<DeriveDetectee[]> {
  const achats = await prisma.priceHistory.findMany({
    where: { userId, documentDate: { gte: debutFenetre() } },
    orderBy: { documentDate: "asc" },
    select: {
      referenceNorm: true,
      distributor: true,
      distributorNorm: true,
      unitPriceHt: true,
      documentDate: true,
    },
  });

  // Une dérive se lit par référence ET par distributeur : le même produit acheté plus
  // cher ailleurs n'est pas une dérive, c'est un choix de fournisseur (déjà couvert par
  // le comparateur inter-enseignes).
  const groupes = new Map<string, typeof achats>();
  for (const achat of achats) {
    const cle = `${achat.referenceNorm}|${achat.distributorNorm}`;
    const groupe = groupes.get(cle);
    if (groupe) groupe.push(achat);
    else groupes.set(cle, [achat]);
  }

  const brutes: Omit<DeriveDetectee, "reference" | "designation" | "surcoutAnnuelEstime">[] = [];

  for (const groupe of groupes.values()) {
    if (groupe.length < ACHATS_MIN) continue;

    const prix = groupe.map((a) => Number(a.unitPriceHt));
    const premierPrixHt = prix[0];
    const dernierPrixHt = prix[prix.length - 1];
    if (premierPrixHt <= 0) continue;

    // Une seule hausse franche suffit à disqualifier : l'artisan a déjà été prévenu par
    // l'alerte de hausse du document concerné, la répéter ici serait du bruit.
    let plusForteHaussePct = 0;
    let dejaSignalee = false;
    for (let i = 1; i < prix.length; i++) {
      if (prix[i - 1] <= 0) continue;
      const pas = ((prix[i] - prix[i - 1]) / prix[i - 1]) * 100;
      if (pas > plusForteHaussePct) plusForteHaussePct = pas;
      if (pas > SEUIL_HAUSSE_UNITAIRE_PCT) {
        dejaSignalee = true;
        break;
      }
    }
    if (dejaSignalee) continue;

    const ecartEuros = dernierPrixHt - premierPrixHt;
    const ecartPourcent = (ecartEuros / premierPrixHt) * 100;
    if (ecartPourcent < SEUIL_DERIVE_CUMULEE_PCT) continue;

    brutes.push({
      referenceNorm: groupe[0].referenceNorm,
      distributor: groupe[groupe.length - 1].distributor,
      distributorNorm: groupe[0].distributorNorm,
      premierPrixHt,
      dernierPrixHt,
      premiereDate: groupe[0].documentDate,
      derniereDate: groupe[groupe.length - 1].documentDate,
      nombreAchats: groupe.length,
      ecartEuros,
      ecartPourcent,
      plusForteHaussePct,
    });
  }

  if (brutes.length === 0) return [];

  // PriceHistory ne porte ni le libellé ni les quantités : on les récupère depuis les
  // lignes de documents, et uniquement pour les références réellement retenues.
  const lignes = await prisma.lineItem.findMany({
    where: {
      userId,
      referenceNorm: { in: [...new Set(brutes.map((d) => d.referenceNorm))] },
      document: { documentDate: { gte: debutFenetre() } },
    },
    orderBy: { document: { documentDate: "desc" } },
    select: {
      referenceNorm: true,
      reference: true,
      designation: true,
      quantity: true,
      document: { select: { distributorNorm: true } },
    },
  });

  return brutes
    .map((derive) => {
      const lignesRef = lignes.filter(
        (l) => l.referenceNorm === derive.referenceNorm && l.document.distributorNorm === derive.distributorNorm
      );
      // Tri décroissant déjà appliqué : la première ligne porte le libellé le plus récent.
      const plusRecente = lignesRef[0] ?? null;
      const quantiteTotale = lignesRef.reduce((somme, l) => somme + Number(l.quantity), 0);

      return {
        ...derive,
        reference: plusRecente?.reference ?? derive.referenceNorm,
        designation: plusRecente?.designation ?? derive.referenceNorm,
        surcoutAnnuelEstime: quantiteTotale > 0 ? derive.ecartEuros * quantiteTotale : null,
      };
    })
    .sort((a, b) => (b.surcoutAnnuelEstime ?? b.ecartEuros) - (a.surcoutAnnuelEstime ?? a.ecartEuros));
}
