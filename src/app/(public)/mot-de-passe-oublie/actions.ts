"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { genererTokenReinitialisation } from "@/lib/reinitialisationMotDePasse";
import { envoyerEmailReinitialisation } from "@/lib/email";
import { origineActuelle } from "@/lib/origine";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export async function demanderReinitialisation(formData: FormData) {
  const parsed = schema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    redirect("/mot-de-passe-oublie?erreur=1");
  }

  const { email } = parsed.data;
  const utilisateur = await prisma.user.findUnique({ where: { email } });

  // Toujours la même redirection, que le compte existe ou non — ne jamais révéler
  // si un email est enregistré (évite l'énumération de comptes).
  if (utilisateur) {
    // Un seul lien valide à la fois par compte : on invalide les précédents.
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });

    const { tokenBrut, tokenHache, expires } = genererTokenReinitialisation();
    await prisma.verificationToken.create({
      data: { identifier: email, token: tokenHache, expires },
    });

    const origine = await origineActuelle();
    const url = `${origine}/reinitialiser-mot-de-passe?token=${tokenBrut}`;

    // Le token est déjà en base à ce stade : un échec d'envoi (ex. sandbox Resend qui
    // rejette les domaines non vérifiés) ne doit ni faire planter la page (redirection
    // "envoyé" toujours identique, voir commentaire ci-dessus sur l'énumération de
    // comptes) ni la faire réussir silencieusement sans trace — on journalise et on
    // continue, même pattern que resilierAbonnement dans compte/actions.ts.
    try {
      await envoyerEmailReinitialisation(email, url);
    } catch (erreur) {
      console.error("Échec de l'envoi de l'email de réinitialisation :", erreur);
    }
  }

  redirect("/mot-de-passe-oublie?envoye=1");
}
