import { prisma } from "@/lib/prisma";
import { parserPayloadsAlertesHausse } from "@/lib/comparaisonPrix";
import { listerFournisseursUtilisateur, couleurDonutFournisseur } from "@/lib/fournisseursPage";

export interface TrancheDepense {
  nom: string;
  pct: number;
  montant: number;
  couleur: string;
}

export interface LigneHausseAnalyse {
  produit: string;
  fournisseur: string;
  haussePct: number;
  date: string;
  prixAvant: number | null;
  prixActuel: number;
  documentId: string;
}

export async function chargerDonneesAnalyses(userId: string) {
  const fournisseurs = await listerFournisseursUtilisateur(userId);
  const totalDepenses = fournisseurs.reduce((s, f) => s + f.depenses, 0);

  const tranches: TrancheDepense[] = fournisseurs
    .filter((f) => f.depenses > 0)
    .map((f, i) => ({
      nom: f.nom,
      montant: f.depenses,
      pct: totalDepenses > 0 ? Math.round((f.depenses / totalDepenses) * 100) : 0,
      couleur: couleurDonutFournisseur(i),
    }));

  const alertes = await prisma.alert.findMany({
    where: {
      userId,
      type: "PRICE_INCREASE",
      createdAt: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { payload: true, createdAt: true },
  });

  const hausses: LigneHausseAnalyse[] = parserPayloadsAlertesHausse(alertes)
    .filter((p) => p.ecartPourcent !== null && p.ecartPourcent > 0)
    .sort((a, b) => (b.ecartPourcent ?? 0) - (a.ecartPourcent ?? 0))
    .slice(0, 5)
    .map((p) => ({
      produit: p.designation,
      fournisseur: p.distributor,
      haussePct: Math.round(p.ecartPourcent ?? 0),
      date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }),
      prixAvant: p.dernierPrix,
      prixActuel: p.prixActuel,
      documentId: p.documentId,
    }));

  return {
    tranches,
    totalDepenses,
    hausses,
    aDesDonnees: totalDepenses > 0 || hausses.length > 0,
  };
}
