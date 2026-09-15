// Suggestion de prix de vente pour une ligne de devis client, à partir de l'historique
// d'achat fournisseur (PriceHistory) — distinct de comparaisonPrix.ts qui compare un prix
// d'ACHAT à l'historique pour détecter une hausse ; ici on part de l'historique pour
// PROPOSER un prix de VENTE au client.
import type { PrismaClient, Prisma } from "@prisma/client";
import { normaliserReference } from "@/lib/normalisation";

const NOMBRE_ACHATS_MOYENNE = 3;
// Évite les correspondances par substring trop larges (bruyantes et lentes) sur une
// recherche de une ou deux lettres — pas de suggestion tant que l'artisan n'a pas tapé au
// moins 3 caractères utiles.
const LONGUEUR_MIN_RECHERCHE = 3;

type Client = PrismaClient | Prisma.TransactionClient;

export interface SuggestionPrix {
  prixSuggereHt: number;
  moyenneAchatsHt: number;
  nombreAchats: number;
  margeAppliqueePct: number;
}

// Correspondance volontairement approximative (inclusion/substring), pas de rapprochement
// flou par trigram — mis de côté pour une version ultérieure (voir CLAUDE.md). Le texte
// saisi par l'artisan est normalisé de la même façon que les références en base
// (normaliserReference) puis recherché par inclusion dans referenceNorm OU
// manufacturerRefNorm, tous distributeurs confondus : prix suggéré = moyenne des
// `NOMBRE_ACHATS_MOYENNE` achats les plus récents × (1 + marge). Retourne `null` (aucune
// suggestion) si la recherche est trop courte ou si rien ne correspond dans l'historique
// PERSONNEL de l'artisan — jamais un référentiel public.
export async function suggererPrixAchat(
  client: Client,
  params: { userId: string; referenceTexte: string; margeParDefautPct: number }
): Promise<SuggestionPrix | null> {
  const { userId, referenceTexte, margeParDefautPct } = params;
  const recherche = normaliserReference(referenceTexte);
  if (recherche.length < LONGUEUR_MIN_RECHERCHE) return null;

  const achats = await client.priceHistory.findMany({
    where: {
      userId,
      OR: [{ referenceNorm: { contains: recherche } }, { manufacturerRefNorm: { contains: recherche } }],
    },
    orderBy: { documentDate: "desc" },
    take: NOMBRE_ACHATS_MOYENNE,
  });

  if (achats.length === 0) return null;

  const moyenne = achats.reduce((somme, a) => somme + Number(a.unitPriceHt), 0) / achats.length;
  return {
    moyenneAchatsHt: Math.round(moyenne * 100) / 100,
    prixSuggereHt: Math.round(moyenne * (1 + margeParDefautPct / 100) * 100) / 100,
    nombreAchats: achats.length,
    margeAppliqueePct: margeParDefautPct,
  };
}
