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

  if (utilisateur) {
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });

    const { tokenBrut, tokenHache, expires } = genererTokenReinitialisation();
    await prisma.verificationToken.create({
      data: { identifier: email, token: tokenHache, expires },
    });

    const origine = await origineActuelle();
    const url = `${origine}/reinitialiser-mot-de-passe?token=${tokenBrut}`;

    try {
      await envoyerEmailReinitialisation(email, url, { origine });
    } catch (erreur) {
      console.error("Échec de l'envoi de l'email de réinitialisation :", erreur);
    }
  }

  redirect("/mot-de-passe-oublie?envoye=1");
}
