import { NextResponse } from "next/server";
import { envoyerExportsComptablesMensuels } from "@/lib/exportComptableMensuel";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  const resultat = await envoyerExportsComptablesMensuels();
  return NextResponse.json({ ok: true, ...resultat });
}
