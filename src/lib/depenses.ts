import { prisma } from "@/lib/prisma";
import { TYPES_ACHAT_REEL } from "@/lib/documentLabels";
import { filtreDocumentsDistributeur, filtreDocumentsSuiviFournisseur } from "@/lib/filtreDocumentsDistributeur";
import { documentComptePourSuiviFournisseur, nomRessembleANonNegoce } from "@/lib/heuristiqueNonNegoce";

export interface DepenseDistributeur {
  distributor: string;
  distributorNorm: string;
  depenses: number;
  objectif: number | null;
  periodStartMonth: number;
  periodStartDay: number;
  debutPeriode: Date;
  finPeriode: Date;
  pourcentageAtteinte: number | null;
  encoursRestant: number | null;
}

// Période glissante de 12 mois reconduite chaque année à partir du jour/mois donné
// (année ignorée). Par défaut 1er janvier = année civile. Certains distributeurs
// calculent leur BFA sur une autre période (ex. juillet-juin) : l'artisan peut
// l'ajuster via DistributorGoal.periodStartMonth/Day.
function periodeCourante(mois: number, jour: number, reference: Date): { debut: Date; fin: Date } {
  const annee = reference.getUTCFullYear();
  let debut = new Date(Date.UTC(annee, mois - 1, jour));
  if (debut > reference) {
    debut = new Date(Date.UTC(annee - 1, mois - 1, jour));
  }
  const fin = new Date(Date.UTC(debut.getUTCFullYear() + 1, mois - 1, jour));
  return { debut, fin };
}

export async function calculerDepensesParDistributeur(userId: string): Promise<DepenseDistributeur[]> {
  const maintenant = new Date();

  // Séquentiel : avec le pooler Supabase, le parallélisme sature la connexion unique
  // et finit en timeout P2024 (« Failed to fetch » côté navigateur).
  const objectifs = await prisma.distributorGoal.findMany({ where: { userId } });
  const documents = await prisma.document.findMany({
    where: {
      userId,
      ...filtreDocumentsDistributeur,
      ...filtreDocumentsSuiviFournisseur,
      type: { in: [...TYPES_ACHAT_REEL] },
      status: "VALIDATED",
      distributorNorm: { not: null },
    },
    select: {
      distributor: true,
      distributorNorm: true,
      documentDate: true,
      totalHt: true,
      rawExtraction: true,
    },
    orderBy: { documentDate: "desc" },
  });

  const objectifParNorm = new Map(objectifs.map((o) => [o.distributorNorm, o]));

  const groupes = new Map<string, { distributor: string; documents: typeof documents }>();
  for (const doc of documents) {
    if (
      !doc.distributorNorm ||
      nomRessembleANonNegoce(doc.distributor) ||
      !documentComptePourSuiviFournisseur(doc.rawExtraction)
    ) {
      continue;
    }
    const existant = groupes.get(doc.distributorNorm);
    if (existant) {
      existant.documents.push(doc);
    } else {
      groupes.set(doc.distributorNorm, { distributor: doc.distributor ?? doc.distributorNorm, documents: [doc] });
    }
  }
  // Un objectif sans achat validé pour l'instant doit quand même apparaître (jauge à 0%).
  for (const objectif of objectifs) {
    if (!groupes.has(objectif.distributorNorm)) {
      groupes.set(objectif.distributorNorm, { distributor: objectif.distributor, documents: [] });
    }
  }

  const resultats: DepenseDistributeur[] = [];
  for (const [distributorNorm, { distributor, documents: docs }] of groupes) {
    const objectif = objectifParNorm.get(distributorNorm);
    const mois = objectif?.periodStartMonth ?? 1;
    const jour = objectif?.periodStartDay ?? 1;
    const { debut, fin } = periodeCourante(mois, jour, maintenant);

    const depenses = docs
      .filter((d) => d.documentDate && d.documentDate >= debut && d.documentDate < fin)
      .reduce((somme, d) => somme + Number(d.totalHt ?? 0), 0);

    const cible = objectif ? Number(objectif.targetHt) : null;
    const pourcentageAtteinte = cible ? (depenses / cible) * 100 : null;
    const encoursRestant = cible !== null ? cible - depenses : null;

    resultats.push({
      distributor: objectif?.distributor ?? distributor,
      distributorNorm,
      depenses,
      objectif: cible,
      periodStartMonth: mois,
      periodStartDay: jour,
      debutPeriode: debut,
      finPeriode: fin,
      pourcentageAtteinte,
      encoursRestant,
    });
  }

  // Distributeurs avec objectif d'abord (les plus proches de 100% en tête), puis les
  // autres triés par dépenses décroissantes.
  resultats.sort((a, b) => {
    if (a.objectif !== null && b.objectif === null) return -1;
    if (a.objectif === null && b.objectif !== null) return 1;
    if (a.objectif !== null && b.objectif !== null) {
      return (b.pourcentageAtteinte ?? 0) - (a.pourcentageAtteinte ?? 0);
    }
    return b.depenses - a.depenses;
  });

  return resultats;
}
