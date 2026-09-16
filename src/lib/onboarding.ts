import { prisma } from "@/lib/prisma";
import { parserPayloadsAlertesHausse } from "@/lib/comparaisonPrix";

export type ResumeAnalyse = {
  documentsAnalyses: number;
  documentsErreur: number;
  documentsAVerifier: number;
  fournisseursIdentifies: number;
  produitsDetectes: number;
  clientsIdentifies: number;
  variationsPrix: number;
  produitsASurveiller: number;
  impactEuros: number;
};

/** Stats réelles post-import — jamais de faux chiffres. */
export async function calculerResumeAnalyse(userId: string): Promise<ResumeAnalyse> {
  const [docs, lineItems, quotes, invoices, alertes, priceHistoryDistinct] = await Promise.all([
    prisma.document.findMany({
      where: { userId },
      select: { status: true, distributorNorm: true },
    }),
    prisma.lineItem.findMany({
      where: { userId },
      select: { referenceNorm: true, manufacturerRefNorm: true },
    }),
    prisma.clientQuote.findMany({
      where: { userId },
      select: { clientNom: true },
    }),
    prisma.clientInvoice.findMany({
      where: { userId },
      select: { clientNom: true },
    }),
    prisma.alert.findMany({
      where: { userId, type: "PRICE_INCREASE" },
      select: { payload: true },
    }),
    prisma.priceHistory.findMany({
      where: { userId },
      select: { referenceNorm: true },
      distinct: ["referenceNorm"],
    }),
  ]);

  const fournisseurs = new Set(
    docs.map((d) => d.distributorNorm).filter((n): n is string => Boolean(n))
  );

  const produits = new Set<string>();
  for (const l of lineItems) {
    const cle = l.manufacturerRefNorm || l.referenceNorm;
    if (cle) produits.add(cle);
  }

  const clients = new Set<string>();
  for (const q of quotes) {
    const n = q.clientNom.trim().toLowerCase();
    if (n) clients.add(n);
  }
  for (const inv of invoices) {
    const n = inv.clientNom.trim().toLowerCase();
    if (n) clients.add(n);
  }

  const payloads = parserPayloadsAlertesHausse(alertes);
  const refsHausse = new Set(payloads.map((p) => p.reference));
  const impactEuros = payloads.reduce((s, p) => s + Math.max(0, p.ecartEuros ?? 0), 0);

  return {
    documentsAnalyses: docs.filter((d) => d.status === "VALIDATED" || d.status === "NEEDS_REVIEW").length,
    documentsErreur: docs.filter((d) => d.status === "ERROR").length,
    documentsAVerifier: docs.filter((d) => d.status === "NEEDS_REVIEW").length,
    fournisseursIdentifies: fournisseurs.size,
    produitsDetectes: produits.size,
    clientsIdentifies: clients.size,
    variationsPrix: payloads.length,
    produitsASurveiller: refsHausse.size,
    impactEuros: Math.round(impactEuros * 100) / 100,
  };
}

export type EtatOnboarding = {
  aDesDocuments: boolean;
  importDiffer: boolean;
  parcoursTermine: boolean;
  doitVoirChoixImport: boolean;
  doitVoirBanniereReprise: boolean;
};

export async function chargerEtatOnboarding(userId: string): Promise<EtatOnboarding> {
  const [user, nbDocs] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        onboardingImportDeferred: true,
        onboardingFlowCompletedAt: true,
        createdAt: true,
      },
    }),
    prisma.document.count({ where: { userId } }),
  ]);

  const aDesDocuments = nbDocs > 0;
  const importDiffer = user?.onboardingImportDeferred ?? false;
  const parcoursTermine = Boolean(user?.onboardingFlowCompletedAt);

  // Nouveau compte sans docs et sans avoir terminé le parcours → écran choix
  const doitVoirChoixImport = !aDesDocuments && !parcoursTermine && !importDiffer;

  // A choisi "plus tard" et n'a toujours rien importé
  const doitVoirBanniereReprise = !aDesDocuments && importDiffer && !parcoursTermine;

  return {
    aDesDocuments,
    importDiffer,
    parcoursTermine,
    doitVoirChoixImport,
    doitVoirBanniereReprise,
  };
}
