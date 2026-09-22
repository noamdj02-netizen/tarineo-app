import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { parserPayloadsAlertesHausse } from "@/lib/comparaisonPrix";

export type NotifUi = {
  id: string;
  titre: string;
  message: string;
  date: string;
  href: string;
  nonLu: boolean;
};

function formaterDateRelative(date: Date, maintenant: Date): string {
  const diffMs = maintenant.getTime() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return minutes <= 1 ? "À l'instant" : `Il y a ${minutes} min`;
  const heures = Math.floor(minutes / 60);
  if (heures < 24) return `Il y a ${heures} h`;
  const jours = Math.floor(heures / 24);
  if (jours === 1) return "Hier";
  if (jours < 7) return `Il y a ${jours} j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

async function chargerNotificationsBrut(userId: string): Promise<NotifUi[]> {
  const maintenant = new Date();
  const alertes = await prisma.alert.findMany({
    where: { userId, type: { in: ["PRICE_INCREASE", "YEAR_END_DISCOUNT"] } },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return alertes.map((a) => {
    if (a.type === "YEAR_END_DISCOUNT") {
      const p = a.payload as {
        distributor?: string;
        pourcentageAtteinte?: number;
        seuil?: number;
      };
      const titre = p.seuil && p.seuil >= 100 ? "Objectif BFA atteint" : "Objectif BFA proche";
      const message = p.distributor
        ? `${p.distributor} : ${p.pourcentageAtteinte ?? 0} % de l'objectif annuel`
        : "Consultez vos objectifs fournisseurs.";
      return {
        id: a.id,
        titre,
        message,
        date: formaterDateRelative(a.createdAt, maintenant),
        href: "/accueil",
        nonLu: a.seenAt === null,
      };
    }

    const payloads = parserPayloadsAlertesHausse([a]);
    const p = payloads[0];
    const pct = p?.ecartPourcent;
    const titre = p ? `Hausse chez ${p.distributor}` : "Hausse de prix détectée";
    const message = p
      ? `${p.designation || p.reference}${pct != null ? ` : ${pct > 0 ? "+" : ""}${pct.toFixed(0)} %` : ""}`
      : "Consultez le document pour le détail.";
    return {
      id: a.id,
      titre,
      message,
      date: formaterDateRelative(a.createdAt, maintenant),
      href: p ? `/documents/${p.documentId}` : "/documents?hausse=1",
      nonLu: a.seenAt === null,
    };
  });
}

/** Cache court : évite une requête DB à chaque navigation dans l'app. */
export function chargerNotifications(userId: string): Promise<NotifUi[]> {
  return unstable_cache(() => chargerNotificationsBrut(userId), [`notifications-ui-${userId}`], {
    revalidate: 45,
  })();
}
