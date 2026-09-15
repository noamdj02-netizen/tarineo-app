"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hacherToken } from "@/lib/reinitialisationMotDePasse";
import { hasherMotDePasse, LONGUEUR_MIN_MOT_DE_PASSE } from "@/lib/password";

const schema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(LONGUEUR_MIN_MOT_DE_PASSE),
    confirmation: z.string(),
  })
  .refine((data) => data.password === data.confirmation, { path: ["confirmation"] });

export async function reinitialiserMotDePasse(formData: FormData) {
  const parsed = schema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmation: formData.get("confirmation"),
  });

  if (!parsed.success) {
    const token = formData.get("token");
    redirect(`/reinitialiser-mot-de-passe?token=${token}&erreur=1`);
  }

  const { token, password } = parsed.data;
  const tokenHache = hacherToken(token);

  const verification = await prisma.verificationToken.findUnique({ where: { token: tokenHache } });

  // Un lien déjà utilisé n'existe plus (supprimé ci-dessous après consommation) ;
  // un lien expiré est traité comme invalide plutôt que silencieusement accepté.
  if (!verification || verification.expires < new Date()) {
    redirect("/reinitialiser-mot-de-passe?erreur=invalide");
  }

  const { identifier: email } = verification;
  const passwordHash = await hasherMotDePasse(password);

  // Le token est à usage unique : on le supprime dans la même opération que la mise à
  // jour du mot de passe, avant tout signIn, pour qu'il ne puisse pas être rejoué même
  // si la suite échoue.
  await prisma.$transaction([
    prisma.user.update({ where: { email }, data: { passwordHash } }),
    prisma.verificationToken.delete({ where: { token: tokenHache } }),
  ]);

  try {
    await signIn("credentials", { email, password, redirectTo: "/compte" });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/connexion");
    }
    throw error;
  }
}
