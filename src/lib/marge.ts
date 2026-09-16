import { prisma } from "@/lib/prisma";
import { TYPES_ACHAT_REEL } from "@/lib/documentLabels";
import { normaliserReference } from "@/lib/normalisation";

export type MargeDocumentee = {
  venteHt: number;
  achatsHt: number;
  margeHt: number;
  margePct: number | null;
  /** true seulement si vente ET achats sont tous deux documentés sur le chantier. */
  confirmee: boolean;
  motifNonConfirmee: string | null;
};

export type MargeEstimeeDevis = {
  venteHt: number;
  coutEstimeHt: number | null;
  lignesCouvertes: number;
  lignesTotal: number;
  margeEstimeeHt: number | null;
  /** Toujours "estimé" — basé sur PriceHistory, pas sur des achats liés au chantier. */
  nature: "estime";
};

/** Marge chantier : uniquement documentée (pas inventée). */
export async function calculerMargeChantier(userId: string, projectId: string): Promise<MargeDocumentee> {
  const [quotes, documents] = await Promise.all([
    prisma.clientQuote.findMany({
      where: { userId, projectId },
      select: {
        totalHt: true,
        invoice: { select: { totalHt: true } },
      },
    }),
    prisma.document.findMany({
      where: {
        userId,
        projectId,
        status: "VALIDATED",
        type: { in: [...TYPES_ACHAT_REEL] },
      },
      select: { totalHt: true },
    }),
  ]);

  // Priorité à la facture client si elle existe, sinon le devis (proposition).
  const venteHt = quotes.reduce((s, q) => {
    const montant = q.invoice ? Number(q.invoice.totalHt) : Number(q.totalHt);
    return s + montant;
  }, 0);

  const achatsHt = documents.reduce((s, d) => s + Number(d.totalHt ?? 0), 0);

  if (venteHt <= 0 && achatsHt <= 0) {
    return {
      venteHt: 0,
      achatsHt: 0,
      margeHt: 0,
      margePct: null,
      confirmee: false,
      motifNonConfirmee: "Liez un devis client et des achats fournisseurs à ce chantier.",
    };
  }
  if (venteHt <= 0) {
    return {
      venteHt: 0,
      achatsHt,
      margeHt: 0,
      margePct: null,
      confirmee: false,
      motifNonConfirmee: "Marge non confirmée — aucun devis/facture client lié.",
    };
  }
  if (achatsHt <= 0) {
    return {
      venteHt,
      achatsHt: 0,
      margeHt: 0,
      margePct: null,
      confirmee: false,
      motifNonConfirmee: "Marge non confirmée — aucun achat fournisseur lié au chantier.",
    };
  }

  const margeHt = Math.round((venteHt - achatsHt) * 100) / 100;
  return {
    venteHt,
    achatsHt,
    margeHt,
    margePct: Math.round((margeHt / venteHt) * 1000) / 10,
    confirmee: true,
    motifNonConfirmee: null,
  };
}

/**
 * Estimation de marge sur un devis client via l'historique d'achats personnel.
 * Clairement marquée "estimée" — pas documentée sur un chantier.
 */
export async function estimerMargeDevis(
  userId: string,
  quoteId: string
): Promise<MargeEstimeeDevis | null> {
  const quote = await prisma.clientQuote.findFirst({
    where: { id: quoteId, userId },
    include: { lines: true },
  });
  if (!quote) return null;

  const venteHt = Number(quote.totalHt);
  let coutEstime = 0;
  let lignesCouvertes = 0;

  for (const ligne of quote.lines) {
    const recherche = normaliserReference(ligne.designation);
    if (recherche.length < 3) continue;

    const achats = await prisma.priceHistory.findMany({
      where: {
        userId,
        OR: [
          { referenceNorm: { contains: recherche.slice(0, 24) } },
          { manufacturerRefNorm: { contains: recherche.slice(0, 24) } },
        ],
      },
      orderBy: { documentDate: "desc" },
      take: 3,
    });
    if (achats.length === 0) continue;

    const moyenne = achats.reduce((s, a) => s + Number(a.unitPriceHt), 0) / achats.length;
    coutEstime += moyenne * Number(ligne.quantite);
    lignesCouvertes += 1;
  }

  if (lignesCouvertes === 0) {
    return {
      venteHt,
      coutEstimeHt: null,
      lignesCouvertes: 0,
      lignesTotal: quote.lines.length,
      margeEstimeeHt: null,
      nature: "estime",
    };
  }

  const coutEstimeHt = Math.round(coutEstime * 100) / 100;
  return {
    venteHt,
    coutEstimeHt,
    lignesCouvertes,
    lignesTotal: quote.lines.length,
    margeEstimeeHt: Math.round((venteHt - coutEstimeHt) * 100) / 100,
    nature: "estime",
  };
}
