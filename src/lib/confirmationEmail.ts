import { prisma } from "@/lib/prisma";
import { envoyerEmailActivation } from "@/lib/email";
import { origineActuelle } from "@/lib/origine";
import { genererTokenReinitialisation, hacherToken } from "@/lib/reinitialisationMotDePasse";

export const DUREE_VALIDITE_CONFIRMATION_MS = 24 * 60 * 60 * 1000;

export function identifiantConfirmationEmail(email: string): string {
  return `email-confirm:${email.toLowerCase()}`;
}

function genererTokenConfirmation() {
  const { tokenBrut, tokenHache } = genererTokenReinitialisation();
  return {
    tokenBrut,
    tokenHache,
    expires: new Date(Date.now() + DUREE_VALIDITE_CONFIRMATION_MS),
  };
}

/** Compte email/mot de passe sans confirmation en attente. */
export async function utilisateurDoitConfirmerEmail(userId: string): Promise<boolean> {
  const utilisateur = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      emailVerified: true,
      passwordHash: true,
      accounts: { where: { provider: "google" }, take: 1, select: { id: true } },
    },
  });
  if (!utilisateur?.email || utilisateur.emailVerified) return false;
  if (!utilisateur.passwordHash) return false;
  if (utilisateur.accounts.length > 0 && !utilisateur.passwordHash) return false;

  const enAttente = await prisma.verificationToken.findFirst({
    where: { identifier: identifiantConfirmationEmail(utilisateur.email) },
    select: { identifier: true },
  });
  return Boolean(enAttente);
}

export async function envoyerEmailConfirmationInscription(email: string): Promise<void> {
  const identifiant = identifiantConfirmationEmail(email);
  await prisma.verificationToken.deleteMany({ where: { identifier: identifiant } });

  const { tokenBrut, tokenHache, expires } = genererTokenConfirmation();
  await prisma.verificationToken.create({
    data: { identifier: identifiant, token: tokenHache, expires },
  });

  const origine = await origineActuelle();
  const url = `${origine}/activer-compte?token=${tokenBrut}`;
  await envoyerEmailActivation(email, url, { origine });
}

export async function renvoyerEmailConfirmation(userId: string): Promise<{ ok: true } | { ok: false; erreur: string }> {
  const utilisateur = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, emailVerified: true, passwordHash: true },
  });
  if (!utilisateur?.email) return { ok: false, erreur: "Compte introuvable." };
  if (utilisateur.emailVerified) return { ok: false, erreur: "Adresse déjà confirmée." };
  if (!utilisateur.passwordHash) return { ok: false, erreur: "Compte Google — pas de confirmation requise." };

  try {
    await envoyerEmailConfirmationInscription(utilisateur.email);
    return { ok: true };
  } catch (erreur) {
    console.error("Renvoi email confirmation :", erreur);
    return { ok: false, erreur: "Envoi impossible. Réessayez dans quelques minutes." };
  }
}

export async function confirmerEmailDepuisToken(
  tokenBrut: string,
): Promise<{ ok: true; userId: string } | { ok: false; code: "invalide" | "expire" }> {
  const tokenHache = hacherToken(tokenBrut);
  const enregistrement = await prisma.verificationToken.findFirst({
    where: { token: tokenHache, identifier: { startsWith: "email-confirm:" } },
  });
  if (!enregistrement) return { ok: false, code: "invalide" };
  if (enregistrement.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { identifier_token: { identifier: enregistrement.identifier, token: enregistrement.token } } });
    return { ok: false, code: "expire" };
  }

  const email = enregistrement.identifier.replace(/^email-confirm:/, "");
  const utilisateur = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!utilisateur) return { ok: false, code: "invalide" };

  await prisma.$transaction([
    prisma.user.update({
      where: { id: utilisateur.id },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.deleteMany({ where: { identifier: enregistrement.identifier } }),
  ]);

  return { ok: true, userId: utilisateur.id };
}
