import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

export async function obtenirOuCreerTokenImportEmail(userId: string): Promise<string> {
  const utilisateur = await prisma.user.findUnique({
    where: { id: userId },
    select: { importEmailToken: true },
  });
  if (utilisateur?.importEmailToken) return utilisateur.importEmailToken;

  const token = randomBytes(12).toString("hex");
  await prisma.user.update({
    where: { id: userId },
    data: { importEmailToken: token },
  });
  return token;
}

export function adresseImportEmail(token: string): string {
  const domaine = process.env.RESEND_INBOUND_DOMAIN ?? "import.tarineo.com";
  return `documents+${token}@${domaine}`;
}

/** Extrait le token depuis l'adresse destinataire Resend (documents+TOKEN@domain). */
export function extraireTokenDepuisDestinataire(to: string): string | null {
  const match = to.match(/documents\+([a-f0-9]+)@/i);
  return match?.[1] ?? null;
}
