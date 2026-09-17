import { redirect } from "next/navigation";
import { Geist, Manrope, Inter } from "next/font/google";
import { getSession } from "@/lib/session";
import { chargerNotifications } from "@/lib/notifications";
import { AppShell } from "./AppShell";
import { AppThemeScope } from "./AppThemeScope";
import { BottomNav } from "./BottomNav";
import { EcranLancementMobile } from "./EcranLancementMobile";

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

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
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

  let notifications: Awaited<ReturnType<typeof chargerNotifications>> = [];
  try {
    notifications = await chargerNotifications(session.user.id);
  } catch (e) {
    console.error("Échec du chargement des notifications :", e);
  }

  return (
    <AppThemeScope>
      <div className={`${geist.variable} ${manrope.variable} ${inter.variable} app-theme flex min-h-full flex-1 flex-col`}>
        <EcranLancementMobile />
        <AppShell email={email} prenom={prenom} dateLabel={dateLabel} notifications={notifications}>
          {children}
        </AppShell>
        <BottomNav />
      </div>
    </AppThemeScope>
  );
}
