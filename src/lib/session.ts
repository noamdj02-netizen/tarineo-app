import { cache } from "react";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

/** Une seule lecture de session par requête serveur (layout + page). */
export const getSession = cache(auth);

/** ID propriétaire des données métier (documents, devis…) — owner si membre d'équipe. */
export const idDonneesUtilisateur = cache(async (sessionUserId: string): Promise<string> => {
  const utilisateur = await prisma.user.findUnique({
    where: { id: sessionUserId },
    select: { workspaceOwnerId: true },
  });
  return utilisateur?.workspaceOwnerId ?? sessionUserId;
});

/** Session + utilisateur en base — déconnecte si le JWT pointe vers un compte supprimé. */
export async function requireUtilisateur() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/connexion");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    await signOut({ redirectTo: "/connexion?erreur=session" });
    redirect("/connexion?erreur=session");
  }

  return { session, user };
}

export async function requireUtilisateurId(): Promise<string> {
  const { user } = await requireUtilisateur();
  return user.id;
}

/** ID pour les requêtes métier (documents, alertes, devis…). */
export async function requireDonneesUtilisateurId(): Promise<string> {
  const session = await getSession();
  if (!session?.user?.id) redirect("/connexion");
  return session.user.donneesUserId ?? (await idDonneesUtilisateur(session.user.id));
}
