import { redirect } from "next/navigation";
import { Geist, Manrope, Inter } from "next/font/google";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parserPayloadsAlertesHausse } from "@/lib/comparaisonPrix";
import { AppShell, type NotifUi } from "./AppShell";
import { BottomNav } from "./BottomNav";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

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

async function chargerNotifications(userId: string): Promise<NotifUi[]> {
  const maintenant = new Date();
  const [alertes, aVerifier, enErreur] = await Promise.all([
    prisma.alert.findMany({
      where: { userId, type: "PRICE_INCREASE" },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.document.findMany({
      where: { userId, status: "NEEDS_REVIEW" },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, distributor: true, createdAt: true },
    }),
    prisma.document.findMany({
      where: { userId, status: "ERROR" },
      orderBy: { createdAt: "desc" },
      take: 2,
      select: { id: true, distributor: true, createdAt: true },
    }),
  ]);

  const notifs: NotifUi[] = [];

  for (const doc of aVerifier) {
    notifs.push({
      id: `review-${doc.id}`,
      titre: "Document à vérifier",
      message: doc.distributor
        ? `${doc.distributor} — confiance faible, validez ou corrigez.`
        : "Une extraction nécessite votre validation.",
      date: formaterDateRelative(doc.createdAt, maintenant),
      href: `/documents/${doc.id}`,
      nonLu: true,
    });
  }

  for (const doc of enErreur) {
    notifs.push({
      id: `err-${doc.id}`,
      titre: "Échec de lecture",
      message: "Nous n'avons pas réussi à lire ce document — réessayez ou importez un autre fichier.",
      date: formaterDateRelative(doc.createdAt, maintenant),
      href: `/documents/${doc.id}`,
      nonLu: true,
    });
  }

  for (const a of alertes) {
    const payloads = parserPayloadsAlertesHausse([a]);
    const p = payloads[0];
    const pct = p?.ecartPourcent;
    notifs.push({
      id: a.id,
      titre: p ? `Hausse chez ${p.distributor}` : "Hausse de prix détectée",
      message: p
        ? `${p.designation || p.reference}${pct != null ? ` : ${pct > 0 ? "+" : ""}${pct.toFixed(0)} %` : ""}`
        : "Consultez le document pour le détail.",
      date: formaterDateRelative(a.createdAt, maintenant),
      href: p ? `/documents/${p.documentId}` : "/documents?hausse=1",
      nonLu: a.seenAt === null,
    });
  }

  return notifs.slice(0, 10);
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/connexion");
  }

  const maintenant = new Date();
  const email = session.user.email ?? "";
  const nomComplet = session.user.name ?? "Artisan";
  const prenomBrut = nomComplet.split(" ")[0] ?? "Artisan";
  const prenom = prenomBrut.charAt(0).toUpperCase() + prenomBrut.slice(1);
  const dateLabel = maintenant.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  let notifications: NotifUi[] = [];
  try {
    notifications = await chargerNotifications(session.user.id);
  } catch (e) {
    console.error("Échec du chargement des notifications :", e);
  }

  return (
    <div className={`${geist.variable} ${manrope.variable} ${inter.variable} app-theme flex min-h-full flex-1 flex-col`}>
      <AppShell email={email} prenom={prenom} dateLabel={dateLabel} notifications={notifications}>
        {children}
      </AppShell>
      <BottomNav />
    </div>
  );
}
