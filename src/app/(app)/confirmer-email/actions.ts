"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { renvoyerEmailConfirmation } from "@/lib/confirmationEmail";

export async function renvoyerEmailConfirmationAction() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/connexion");

  const resultat = await renvoyerEmailConfirmation(session.user.id);
  if (!resultat.ok) {
    redirect(`/confirmer-email?erreur=envoi`);
  }
  redirect("/confirmer-email?envoye=1");
}
