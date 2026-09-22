import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { rechercherEtEnregistrerFournisseur } from "@/lib/rechercherFournisseur";
import { verifierRateLimitRechercheFournisseur } from "@/lib/rateLimitIA";

const corpsSchema = z.object({
  requete: z.string().min(2).max(120),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });
  }

  if (!verifierRateLimitRechercheFournisseur(session.user.id)) {
    return NextResponse.json(
      { erreur: "Trop de recherches — réessayez dans une heure." },
      { status: 429 },
    );
  }

  let corps: z.infer<typeof corpsSchema>;
  try {
    const json = await request.json();
    const parse = corpsSchema.safeParse(json);
    if (!parse.success) {
      return NextResponse.json({ erreur: "Recherche invalide." }, { status: 400 });
    }
    corps = parse.data;
  } catch {
    return NextResponse.json({ erreur: "Corps de requête invalide." }, { status: 400 });
  }

  const resultat = await rechercherEtEnregistrerFournisseur(session.user.id, corps.requete);
  if (!resultat.succes) {
    return NextResponse.json({ erreur: resultat.erreur }, { status: 422 });
  }

  return NextResponse.json(resultat);
}
