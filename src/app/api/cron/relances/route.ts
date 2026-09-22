import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { envoyerRelancesUtilisateur } from "@/lib/emailsRelance";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  const utilisateurs = await prisma.user.findMany({
    where: { subscriptionStatus: { in: ["trialing", "active", "past_due"] } },
    select: { id: true },
    take: 500,
  });

  let envoyes = 0;
  for (const u of utilisateurs) {
    try {
      await envoyerRelancesUtilisateur(u.id);
      envoyes += 1;
    } catch (erreur) {
      console.error(`Relance échouée pour ${u.id} :`, erreur);
    }
  }

  return NextResponse.json({ ok: true, traites: envoyes });
}
