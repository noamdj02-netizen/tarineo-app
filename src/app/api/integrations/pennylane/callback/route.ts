import { NextResponse } from "next/server";
import { connecterPennylane, verifierStatePennylane } from "@/lib/pennylane";
import { origineActuelle } from "@/lib/origine";

export async function GET(request: Request) {
  const origine = await origineActuelle();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const erreur = searchParams.get("error");

  if (erreur || !code || !state) {
    return NextResponse.redirect(`${origine}/parametres?onglet=integrations&erreur=pennylane_refuse`);
  }

  const userId = verifierStatePennylane(state);
  if (!userId) {
    return NextResponse.redirect(`${origine}/parametres?onglet=integrations&erreur=pennylane_state`);
  }

  try {
    const redirectUri = `${origine}/api/integrations/pennylane/callback`;
    await connecterPennylane(userId, code, redirectUri);
    return NextResponse.redirect(`${origine}/parametres?onglet=integrations&pennylane=connecte`);
  } catch (e) {
    console.error("Callback Pennylane échoué :", e);
    return NextResponse.redirect(`${origine}/parametres?onglet=integrations&erreur=pennylane_token`);
  }
}
