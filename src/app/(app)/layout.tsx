import { redirect } from "next/navigation";
import { Geist, Manrope, Inter } from "next/font/google";
import { auth } from "@/auth";
import { DEMO_UTILISATEUR } from "@/lib/uiDemo";
import { AppShell } from "./AppShell";
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

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/connexion");
  }

  const maintenant = new Date();
  const email =
    session.user.email ??
    (session.user.id ? DEMO_UTILISATEUR.email : "");
  const nomComplet =
    session.user.name ??
    (email.toLowerCase() === DEMO_UTILISATEUR.email ? DEMO_UTILISATEUR.nom : null) ??
    "Artisan";
  const prenomBrut = nomComplet.split(" ")[0] ?? DEMO_UTILISATEUR.prenom;
  const prenom = prenomBrut.charAt(0).toUpperCase() + prenomBrut.slice(1);
  const dateLabel = maintenant.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className={`${geist.variable} ${manrope.variable} ${inter.variable} app-theme flex min-h-full flex-1 flex-col`}>
      <AppShell email={email} prenom={prenom} dateLabel={dateLabel}>
        {children}
      </AppShell>
      <BottomNav />
    </div>
  );
}
