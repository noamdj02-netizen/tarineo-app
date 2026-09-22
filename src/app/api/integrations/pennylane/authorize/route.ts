import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { accesExportComptable } from "@/lib/planGating";
import { prisma } from "@/lib/prisma";
import { genererStatePennylane, pennylaneConfigure, urlAutorisationPennylane } from "@/lib/pennylane";
import { origineActuelle } from "@/lib/origine";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/connexion", process.env.AUTH_URL ?? "http://localhost:3000"));
  }

  if (!pennylaneConfigure()) {
    return NextResponse.redirect(new URL("/parametres?onglet=integrations&erreur=pennylane_config", await origineActuelle()));
  }

  const utilisateur = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, subscriptionStatus: true },
  });
  if (!utilisateur || !accesExportComptable(utilisateur.plan, utilisateur.subscriptionStatus)) {
    return NextResponse.redirect(new URL("/parametres?onglet=abonnement", await origineActuelle()));
  }

  const origine = await origineActuelle();
  const redirectUri = `${origine}/api/integrations/pennylane/callback`;
  const state = genererStatePennylane(session.user.id);
  const url = urlAutorisationPennylane(redirectUri, state);
  return NextResponse.redirect(url);
}
