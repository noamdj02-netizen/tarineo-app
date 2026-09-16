"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { Prisma } from "@prisma/client";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hasherMotDePasse, LONGUEUR_MIN_MOT_DE_PASSE } from "@/lib/password";
import { calculerEtatAccesAnticipe } from "@/lib/accesAnticipe";

const schema = z
  .object({
    prenom: z.string().trim().min(1),
    nom: z.string().trim().min(1),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(LONGUEUR_MIN_MOT_DE_PASSE),
    confirmation: z.string(),
    entrepriseNom: z.string().trim().min(1),
    telephone: z.string().trim().optional(),
    consent: z.literal("on"),
  })
  .refine((data) => data.password === data.confirmation, { path: ["confirmation"] });

export async function creerCompte(formData: FormData) {
  const telephoneBrut = String(formData.get("telephone") ?? "").trim();
  const parsed = schema.safeParse({
    prenom: formData.get("prenom"),
    nom: formData.get("nom"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmation: formData.get("confirmation"),
    entrepriseNom: formData.get("entrepriseNom"),
    telephone: telephoneBrut || undefined,
    consent: formData.get("consent"),
  });

  if (!parsed.success) {
    redirect("/inscription?erreur=1");
  }

  const { prenom, nom, email, password, entrepriseNom, telephone } = parsed.data;
  const name = `${prenom} ${nom}`.trim();

  try {
    const { phase } = calculerEtatAccesAnticipe(await prisma.user.count());
    if (phase === "complete") {
      redirect("/inscription?erreur=acces_complet");
    }

    const passwordHash = await hasherMotDePasse(password);
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        consentAt: new Date(),
        entrepriseNom,
        telephone: telephone || null,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      redirect("/inscription?erreur=existe");
    }
    throw error;
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/onboarding" });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/connexion");
    }
    throw error;
  }
}

export async function creerCompteAvecGoogle() {
  await signIn("google", { redirectTo: "/onboarding" });
}

const schemaWaitlist = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export async function rejoindreListeAttente(formData: FormData) {
  const parsed = schemaWaitlist.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    redirect("/inscription?erreur=1");
  }

  await prisma.waitlistSignup.upsert({
    where: { email: parsed.data.email },
    create: { email: parsed.data.email },
    update: {},
  });

  redirect("/inscription?liste_attente=1");
}
