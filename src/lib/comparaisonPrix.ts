import type { PrismaClient, Prisma } from "@prisma/client";
import { z } from "zod";
import { normaliserDistributeur } from "@/lib/normalisation";

const SEUIL_ALERTE_POURCENT = 3;

// Forme du payload JSON écrit ci-dessous par creerAlertesHausse pour chaque alerte de
// type PRICE_INCREASE, et lue par accueil/page.tsx et documents/page.tsx. Le payload est
// stocké en `Json` côté Prisma (aucune garantie de forme côté base) : un cast direct
// (`as unknown as ...`) plantait toute la page en Server Component dès qu'une ligne en
// base ne correspondait pas exactement à la forme attendue — validé avec Zod à la
// lecture à la place, voir parserPayloadsAlertesHausse.
export const payloadAlerteHausseSchema = z.object({
  documentId: z.string(),
  distributor: z.string(),
  reference: z.string(),
  designation: z.string(),
  prixActuel: z.number(),
  dernierPrix: z.number().nullable(),
  ecartEuros: z.number().nullable(),
  ecartPourcent: z.number().nullable(),
});

export type PayloadAlerteHausse = z.infer<typeof payloadAlerteHausseSchema>;

// Ignore silencieusement (avec un log) toute alerte dont le payload ne correspond pas au
// schéma attendu, plutôt que de faire planter la page qui les affiche — une seule ligne
// historique malformée ne doit jamais mettre en erreur 500 tout un tableau de bord.
export function parserPayloadsAlertesHausse(alertes: { payload: Prisma.JsonValue }[]): PayloadAlerteHausse[] {
  const resultats: PayloadAlerteHausse[] = [];
  for (const alerte of alertes) {
    const analyse = payloadAlerteHausseSchema.safeParse(alerte.payload);
    if (analyse.success) {
      resultats.push(analyse.data);
    } else {
      console.error("Alerte PRICE_INCREASE avec un payload invalide, ignorée :", analyse.error.flatten());
    }
  }
  return resultats;
}

export interface MeilleurPrixAilleurs {
  distributor: string;
  prixHt: number;
  date: Date;
  documentId: string;
}

export interface ComparaisonLigne {
  referenceNorm: string;
  prixActuel: number;
  dernierPrix: number | null;
  dernierPrixDate: Date | null;
  dernierAchatDocumentId: string | null;
  moyenne12Mois: number | null;
  ecartEuros: number | null;
  ecartPourcent: number | null;
  alerte: boolean;
  // Comparateur inter-enseignes, basé sur la référence fabricant (distincte du code
  // interne de chaque distributeur). referenceFabricantDetectee distingue "pas de
  // référence fabricant identifiée sur cette ligne" de "référence connue mais aucun
  // prix plus bas trouvé ailleurs" : les deux cas doivent être affichés différemment
  // pour ne pas laisser croire à tort qu'il n'y a simplement pas de meilleure offre.
  referenceFabricantDetectee: boolean;
  meilleurPrixAilleurs: MeilleurPrixAilleurs | null;
}

type Client = PrismaClient | Prisma.TransactionClient;

// Comparaison strictement par distributeur : une hausse chez Point P ne doit pas être
// masquée par un prix plus bas obtenu ailleurs, et inversement un changement de
// fournisseur plus cher ne doit pas déclencher une fausse alerte de hausse.
//
// Le distributeur est un champ libre extrait par l'IA (ou saisi par l'artisan), pas une
// liste fermée d'enseignes connues : on compare sur distributorNorm (normalisé) pour que
// "Rexel", "REXEL" et "Rexel." soient reconnus comme le même distributeur.
export async function comparerLignesAuHistorique(
  client: Client,
  params: {
    userId: string;
    distributor: string;
    documentId: string;
    documentDate: Date;
    /** Limite la comparaison aux achats après cette date (plan Starter = 12 mois). */
    dateMinHistorique?: Date | null;
    lignes: { referenceNorm: string; unitPriceHt: number; manufacturerRefNorm?: string | null }[];
  }
): Promise<ComparaisonLigne[]> {
  const { userId, distributor, documentId, documentDate, dateMinHistorique, lignes } = params;
  const referencesNorm = [...new Set(lignes.map((l) => l.referenceNorm))];
  const manufacturerRefsNorm = [
    ...new Set(lignes.map((l) => l.manufacturerRefNorm).filter((v): v is string => !!v)),
  ];
  const distributorNormActuel = normaliserDistributeur(distributor);

  if (referencesNorm.length === 0) return [];

  const debut12Mois = new Date(documentDate);
  debut12Mois.setFullYear(debut12Mois.getFullYear() - 1);

  // Une seule requête couvre les deux besoins : la comparaison "même distributeur"
  // (via referenceNorm) et la recherche inter-enseignes (via manufacturerRefNorm),
  // filtrées ensuite en mémoire pour éviter un aller-retour DB supplémentaire.
  const historique = await client.priceHistory.findMany({
    where: {
      userId,
      documentId: { not: documentId },
      documentDate: {
        lte: documentDate,
        ...(dateMinHistorique ? { gte: dateMinHistorique } : {}),
      },
      OR: [
        { referenceNorm: { in: referencesNorm } },
        ...(manufacturerRefsNorm.length > 0
          ? [{ manufacturerRefNorm: { in: manufacturerRefsNorm } }]
          : []),
      ],
    },
    orderBy: { documentDate: "desc" },
  });

  return lignes.map((ligne) => {
    // Comparaison strictement par distributeur : une hausse chez Point P ne doit pas
    // être masquée par un prix plus bas obtenu ailleurs, et inversement.
    const achatsRef = historique.filter(
      (h) => h.referenceNorm === ligne.referenceNorm && h.distributorNorm === distributorNormActuel
    );
    const dernier = achatsRef[0] ?? null; // tri desc déjà appliqué : le plus récent en premier
    const achats12Mois = achatsRef.filter((h) => h.documentDate >= debut12Mois);
    const moyenne12Mois =
      achats12Mois.length > 0
        ? achats12Mois.reduce((somme, h) => somme + Number(h.unitPriceHt), 0) / achats12Mois.length
        : null;

    const dernierPrix = dernier ? Number(dernier.unitPriceHt) : null;
    const ecartEuros = dernierPrix !== null ? ligne.unitPriceHt - dernierPrix : null;
    const ecartPourcent =
      dernierPrix !== null && dernierPrix > 0 ? ((ecartEuros as number) / dernierPrix) * 100 : null;

    // Comparateur inter-enseignes : uniquement sur l'historique PERSONNEL de l'artisan,
    // jamais celui d'autres utilisateurs. Basé sur la référence fabricant (et non le
    // code interne du distributeur, propre à chaque enseigne) pour identifier le même
    // produit physique ailleurs.
    let meilleurPrixAilleurs: MeilleurPrixAilleurs | null = null;
    if (ligne.manufacturerRefNorm) {
      const achatsAilleurs = historique.filter(
        (h) => h.manufacturerRefNorm === ligne.manufacturerRefNorm && h.distributorNorm !== distributorNormActuel
      );
      const dernierParDistributeur = new Map<string, (typeof achatsAilleurs)[number]>();
      for (const achat of achatsAilleurs) {
        // tri desc déjà appliqué : le premier rencontré par distributeur est le plus récent
        if (!dernierParDistributeur.has(achat.distributorNorm)) {
          dernierParDistributeur.set(achat.distributorNorm, achat);
        }
      }
      for (const achat of dernierParDistributeur.values()) {
        const prix = Number(achat.unitPriceHt);
        if (prix < ligne.unitPriceHt && (meilleurPrixAilleurs === null || prix < meilleurPrixAilleurs.prixHt)) {
          meilleurPrixAilleurs = {
            distributor: achat.distributor,
            prixHt: prix,
            date: achat.documentDate,
            documentId: achat.documentId,
          };
        }
      }
    }

    return {
      referenceNorm: ligne.referenceNorm,
      prixActuel: ligne.unitPriceHt,
      dernierPrix,
      dernierPrixDate: dernier?.documentDate ?? null,
      dernierAchatDocumentId: dernier?.documentId ?? null,
      moyenne12Mois,
      ecartEuros,
      ecartPourcent,
      alerte: ecartPourcent !== null && ecartPourcent > SEUIL_ALERTE_POURCENT,
      referenceFabricantDetectee: !!ligne.manufacturerRefNorm,
      meilleurPrixAilleurs,
    };
  });
}

// À appeler après comparerLignesAuHistorique mais avant l'insertion des PriceHistory
// du document courant (sinon une ligne se comparerait à elle-même).
export async function creerAlertesHausse(
  client: Client,
  params: {
    userId: string;
    documentId: string;
    distributor: string;
    lignes: { reference: string; designation: string; referenceNorm: string }[];
    comparaisons: ComparaisonLigne[];
  }
): Promise<void> {
  const { userId, documentId, distributor, lignes, comparaisons } = params;

  await client.alert.deleteMany({
    where: {
      userId,
      type: "PRICE_INCREASE",
      payload: { path: ["documentId"], equals: documentId },
    },
  });

  for (const comparaison of comparaisons) {
    if (!comparaison.alerte) continue;
    const ligne = lignes.find((l) => l.referenceNorm === comparaison.referenceNorm);

    await client.alert.create({
      data: {
        userId,
        type: "PRICE_INCREASE",
        payload: {
          documentId,
          distributor,
          reference: ligne?.reference ?? comparaison.referenceNorm,
          designation: ligne?.designation ?? "",
          prixActuel: comparaison.prixActuel,
          dernierPrix: comparaison.dernierPrix,
          ecartEuros: comparaison.ecartEuros,
          ecartPourcent: comparaison.ecartPourcent,
          meilleurPrixAilleurs: comparaison.meilleurPrixAilleurs
            ? {
                distributor: comparaison.meilleurPrixAilleurs.distributor,
                prixHt: comparaison.meilleurPrixAilleurs.prixHt,
                date: comparaison.meilleurPrixAilleurs.date.toISOString(),
              }
            : null,
        },
      },
    });
  }
}
