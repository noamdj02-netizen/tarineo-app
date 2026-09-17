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
  const [docsParStatut, fournisseursDistinct, produitsRow, quotes, invoices, alertes] = await Promise.all([
    prisma.document.groupBy({
      by: ["status"],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.document.findMany({
      where: { userId, distributorNorm: { not: null } },
      select: { distributorNorm: true },
      distinct: ["distributorNorm"],
    }),
    prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(DISTINCT COALESCE("manufacturerRefNorm", "referenceNorm")) AS count
      FROM "LineItem"
      WHERE "userId" = ${userId}
        AND COALESCE("manufacturerRefNorm", "referenceNorm") IS NOT NULL
        AND COALESCE("manufacturerRefNorm", "referenceNorm") <> ''
    `,
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
  ]);

  const countParStatut = new Map(docsParStatut.map((d) => [d.status, d._count._all]));
  const documentsAnalyses =
    (countParStatut.get("VALIDATED") ?? 0) + (countParStatut.get("NEEDS_REVIEW") ?? 0);

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
    documentsAnalyses,
    documentsErreur: countParStatut.get("ERROR") ?? 0,
    documentsAVerifier: countParStatut.get("NEEDS_REVIEW") ?? 0,
    fournisseursIdentifies: fournisseursDistinct.length,
    produitsDetectes: Number(produitsRow[0]?.count ?? 0),
    clientsIdentifies: clients.size,
    variationsPrix: payloads.length,
    produitsASurveiller: refsHausse.size,
    impactEuros: Math.round(impactEuros * 100) / 100,
  };
}

/** Marque le parcours onboarding comme terminé — sans revalidatePath (appelable au rendu serveur). */
export async function completerOnboardingFlow(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      onboardingFlowCompletedAt: new Date(),
      onboardingImportDeferred: false,
    },
  });
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
