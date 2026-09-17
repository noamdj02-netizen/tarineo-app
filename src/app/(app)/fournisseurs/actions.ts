"use server";

import { auth } from "@/auth";
import { rafraichirPromosFournisseur } from "@/lib/promosFournisseur";

export async function rafraichirPromosAction(bibliothequeId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { succes: false, nbPromos: 0, message: "Non authentifié." };
  }

  return rafraichirPromosFournisseur(bibliothequeId, session.user.id);
}
