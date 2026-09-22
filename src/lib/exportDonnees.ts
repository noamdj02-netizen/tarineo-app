import { prisma } from "@/lib/prisma";

export type ExportDonneesUtilisateur = {
  exporteLe: string;
  utilisateur: {
    id: string;
    email: string;
    name: string | null;
    trade: string | null;
    plan: string | null;
    subscriptionStatus: string | null;
    consentAt: string | null;
    createdAt: string;
  };
  entreprise: Awaited<ReturnType<typeof prisma.companyProfile.findUnique>>;
  documents: Array<{
    id: string;
    type: string;
    distributor: string | null;
    documentDate: string | null;
    totalHt: string | null;
    totalTtc: string | null;
    status: string;
    createdAt: string;
    lignes: Array<{
      reference: string;
      designation: string;
      quantity: string;
      unitPriceHt: string;
      totalHt: string;
    }>;
  }>;
  objectifsFournisseurs: Array<{
    distributor: string;
    targetHt: string;
    periodStartMonth: number;
    periodStartDay: number;
  }>;
  devisClients: Array<{
    id: string;
    clientNom: string;
    totalHt: string;
    totalTtc: string;
    createdAt: string;
  }>;
  facturesClients: Array<{
    id: string;
    clientNom: string;
    totalHt: string;
    totalTtc: string;
    createdAt: string;
  }>;
};

/** Export JSON portabilité RGPD — métadonnées uniquement (pas les fichiers binaires). */
export async function exporterDonneesUtilisateur(userId: string): Promise<ExportDonneesUtilisateur> {
  const [utilisateur, entreprise, documents, objectifs, devis, factures] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        trade: true,
        plan: true,
        subscriptionStatus: true,
        consentAt: true,
        createdAt: true,
      },
    }),
    prisma.companyProfile.findUnique({ where: { userId } }),
    prisma.document.findMany({
      where: { userId },
      include: {
        lineItems: {
          select: {
            reference: true,
            designation: true,
            quantity: true,
            unitPriceHt: true,
            totalHt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.distributorGoal.findMany({ where: { userId } }),
    prisma.clientQuote.findMany({
      where: { userId },
      select: { id: true, clientNom: true, totalHt: true, totalTtc: true, createdAt: true },
    }),
    prisma.clientInvoice.findMany({
      where: { userId },
      select: { id: true, clientNom: true, totalHt: true, totalTtc: true, createdAt: true },
    }),
  ]);

  if (!utilisateur) {
    throw new Error("Utilisateur introuvable");
  }

  return {
    exporteLe: new Date().toISOString(),
    utilisateur: {
      ...utilisateur,
      consentAt: utilisateur.consentAt?.toISOString() ?? null,
      createdAt: utilisateur.createdAt.toISOString(),
    },
    entreprise,
    documents: documents.map((doc) => ({
      id: doc.id,
      type: doc.type,
      distributor: doc.distributor,
      documentDate: doc.documentDate?.toISOString() ?? null,
      totalHt: doc.totalHt?.toString() ?? null,
      totalTtc: doc.totalTtc?.toString() ?? null,
      status: doc.status,
      createdAt: doc.createdAt.toISOString(),
      lignes: doc.lineItems.map((l) => ({
        reference: l.reference,
        designation: l.designation,
        quantity: l.quantity.toString(),
        unitPriceHt: l.unitPriceHt.toString(),
        totalHt: l.totalHt.toString(),
      })),
    })),
    objectifsFournisseurs: objectifs.map((o) => ({
      distributor: o.distributor,
      targetHt: o.targetHt.toString(),
      periodStartMonth: o.periodStartMonth,
      periodStartDay: o.periodStartDay,
    })),
    devisClients: devis.map((d) => ({
      id: d.id,
      clientNom: d.clientNom,
      totalHt: d.totalHt.toString(),
      totalTtc: d.totalTtc.toString(),
      createdAt: d.createdAt.toISOString(),
    })),
    facturesClients: factures.map((f) => ({
      id: f.id,
      clientNom: f.clientNom,
      totalHt: f.totalHt.toString(),
      totalTtc: f.totalTtc.toString(),
      createdAt: f.createdAt.toISOString(),
    })),
  };
}
