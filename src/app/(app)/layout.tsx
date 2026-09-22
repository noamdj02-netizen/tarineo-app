import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Geist, Manrope, Inter } from "next/font/google";
import { prisma } from "@/lib/prisma";
import { resoudreUrlAvatar } from "@/lib/avatarUtilisateur";
import { getSession } from "@/lib/session";
import { chargerNotifications } from "@/lib/notifications";
import { chargerBadgesNav } from "@/lib/navBadges";
import { estRouteLegale } from "@/lib/legalRoutes";
import { AppNavigationProvider } from "@/components/tarineo/motion/AppNavigationContext";
import { AppShell } from "./AppShell";
import { AppThemeScope } from "./AppThemeScope";
import { BottomNav } from "./BottomNav";
import { LegalPublicShell } from "./legal/_components/LegalPublicShell";

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
  const pathname = (await headers()).get("x-pathname") ?? "";
  const pageLegale = estRouteLegale(pathname);
  const session = await getSession();

  if (!session?.user?.id && !pageLegale) {
    redirect("/connexion");
  }

  const classesTheme = `${geist.variable} ${manrope.variable} ${inter.variable} app-theme flex min-h-full flex-1 flex-col`;

  if (pageLegale && !session?.user?.id) {
    return (
      <AppThemeScope>
        <div className={classesTheme}>
          <LegalPublicShell>{children}</LegalPublicShell>
        </div>
      </AppThemeScope>
    );
  }

  const maintenant = new Date();
  const email = session!.user.email ?? "";
  const nomComplet = session!.user.name ?? "Artisan";
  const prenomBrut = nomComplet.split(" ")[0] ?? "Artisan";
  const prenom = prenomBrut.charAt(0).toUpperCase() + prenomBrut.slice(1);
  const dateLabel = maintenant.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const donneesUserId = session!.user.donneesUserId ?? session!.user.id;

  let notifications: Awaited<ReturnType<typeof chargerNotifications>> = [];
  let badgesNav: Awaited<ReturnType<typeof chargerBadgesNav>> = { aVerifier: 0, hausses: 0 };
  let avatarUrl: string | null = null;
  try {
    const [notifs, badges, utilisateur] = await Promise.all([
      chargerNotifications(donneesUserId),
      chargerBadgesNav(donneesUserId),
      prisma.user.findUnique({ where: { id: session!.user.id }, select: { image: true } }),
    ]);
    notifications = notifs;
    badgesNav = badges;
    avatarUrl = await resoudreUrlAvatar(utilisateur?.image);
  } catch (e) {
    console.error("Échec du chargement de la navigation :", e);
  }

  return (
    <AppThemeScope>
      <div className={classesTheme}>
        <AppNavigationProvider>
          <AppShell
            email={email}
            prenom={prenom}
            avatarUrl={avatarUrl}
            dateLabel={dateLabel}
            notifications={notifications}
            badgesNav={badgesNav}
          >
            {children}
          </AppShell>
          <Suspense fallback={null}>
            <BottomNav />
          </Suspense>
        </AppNavigationProvider>
      </div>
    </AppThemeScope>
  );
}
