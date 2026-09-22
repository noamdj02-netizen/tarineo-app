import { prisma } from "@/lib/prisma";
import { calculerDepensesParDistributeur } from "@/lib/depenses";

const SEUILS_BFA = [80, 100] as const;

type PayloadBfa = {
  distributor: string;
  distributorNorm: string;
  objectif: number;
  depenses: number;
  pourcentageAtteinte: number;
  debutPeriode: string;
  finPeriode: string;
  seuil: number;
};

/** Crée des alertes YEAR_END_DISCOUNT quand un objectif BFA approche ou est atteint. */
export async function synchroniserAlertesBfa(userId: string): Promise<void> {
  const depenses = await calculerDepensesParDistributeur(userId);
  const avecObjectif = depenses.filter((d) => d.objectif !== null && d.pourcentageAtteinte !== null);

  const alertesExistantes = await prisma.alert.findMany({
    where: { userId, type: "YEAR_END_DISCOUNT" },
    select: { payload: true },
  });

  const clesExistantes = new Set(
    alertesExistantes.map((a) => {
      const p = a.payload as PayloadBfa;
      return `${p.distributorNorm}:${p.debutPeriode}:${p.seuil}`;
    }),
  );

  for (const ligne of avecObjectif) {
    const pct = ligne.pourcentageAtteinte ?? 0;
    for (const seuil of SEUILS_BFA) {
      if (pct < seuil) continue;

      const cle = `${ligne.distributorNorm}:${ligne.debutPeriode.toISOString()}:${seuil}`;
      if (clesExistantes.has(cle)) continue;

      const payload: PayloadBfa = {
        distributor: ligne.distributor,
        distributorNorm: ligne.distributorNorm,
        objectif: ligne.objectif ?? 0,
        depenses: ligne.depenses,
        pourcentageAtteinte: Math.round(pct),
        debutPeriode: ligne.debutPeriode.toISOString(),
        finPeriode: ligne.finPeriode.toISOString(),
        seuil,
      };

      await prisma.alert.create({
        data: { userId, type: "YEAR_END_DISCOUNT", payload },
      });
      clesExistantes.add(cle);
    }
  }
}
