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
  const alertes = await prisma.alert.findMany({
    where: { userId, type: "PRICE_INCREASE" },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return alertes.map((a) => {
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
