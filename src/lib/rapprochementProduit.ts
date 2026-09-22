import { prisma } from "@/lib/prisma";

export type PropositionRapprochement = {
  referenceNorm: string;
  manufacturerRefNorm: string | null;
  designation: string;
  distributor: string;
  prixHt: number;
  documentDate: Date;
  score: number;
};

/** Rapprochement flou V1 : inclusion sur designation/reference dans l'historique personnel. */
export async function proposerRapprochementsProduit(
  userId: string,
  params: { designation: string; reference: string; manufacturerRefNorm?: string | null },
  limite = 3,
): Promise<PropositionRapprochement[]> {
  const needle = params.designation.trim().toLowerCase();
  const refNeedle = params.reference.trim().toLowerCase();
  if (needle.length < 4 && refNeedle.length < 3) return [];

  const historique = await prisma.priceHistory.findMany({
    where: { userId },
    orderBy: { documentDate: "desc" },
    take: 500,
    select: {
      referenceNorm: true,
      manufacturerRefNorm: true,
      distributor: true,
      unitPriceHt: true,
      documentDate: true,
    },
  });

  const lignes = await prisma.lineItem.findMany({
    where: { userId },
    select: { referenceNorm: true, designation: true, manufacturerRefNorm: true },
    distinct: ["referenceNorm"],
    take: 500,
  });

  const designationParRef = new Map(lignes.map((l) => [l.referenceNorm, l.designation]));

  const scores = new Map<string, PropositionRapprochement>();

  for (const h of historique) {
    const designation = designationParRef.get(h.referenceNorm) ?? h.referenceNorm;
    const designationLower = designation.toLowerCase();
    const refLower = h.referenceNorm.toLowerCase();

    let score = 0;
    if (params.manufacturerRefNorm && h.manufacturerRefNorm === params.manufacturerRefNorm) score += 100;
    if (refNeedle && refLower.includes(refNeedle)) score += 40;
    if (needle && designationLower.includes(needle.slice(0, Math.min(needle.length, 12)))) score += 30;
    if (needle.length >= 6 && designationLower.includes(needle)) score += 20;

    if (score < 30) continue;

    const existant = scores.get(h.referenceNorm);
    if (!existant || score > existant.score) {
      scores.set(h.referenceNorm, {
        referenceNorm: h.referenceNorm,
        manufacturerRefNorm: h.manufacturerRefNorm,
        designation,
        distributor: h.distributor,
        prixHt: Number(h.unitPriceHt),
        documentDate: h.documentDate,
        score,
      });
    }
  }

  return [...scores.values()].sort((a, b) => b.score - a.score).slice(0, limite);
}
