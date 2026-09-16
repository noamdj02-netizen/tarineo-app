"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const schemaCreation = z.object({
  nom: z.string().trim().min(1, "Le nom du chantier est requis."),
  clientNom: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export async function creerChantier(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const parsed = schemaCreation.safeParse({
    nom: formData.get("nom"),
    clientNom: formData.get("clientNom") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    redirect("/chantiers/nouveau?erreur=1");
  }

  const chantier = await prisma.project.create({
    data: {
      userId: session.user.id,
      nom: parsed.data.nom,
      clientNom: parsed.data.clientNom || null,
      notes: parsed.data.notes || null,
    },
  });

  redirect(`/chantiers/${chantier.id}`);
}

export async function lierDevisAuChantier(projectId: string, quoteId: string) {
  const session = await auth();
  if (!session?.user?.id) return { succes: false as const, erreur: "Non authentifié." };

  const [project, quote] = await Promise.all([
    prisma.project.findFirst({ where: { id: projectId, userId: session.user.id } }),
    prisma.clientQuote.findFirst({ where: { id: quoteId, userId: session.user.id } }),
  ]);
  if (!project || !quote) return { succes: false as const, erreur: "Introuvable." };

  await prisma.clientQuote.update({
    where: { id: quoteId },
    data: { projectId },
  });
  revalidatePath(`/chantiers/${projectId}`);
  revalidatePath(`/devis-clients/${quoteId}`);
  return { succes: true as const };
}

export async function delierDevisDuChantier(quoteId: string) {
  const session = await auth();
  if (!session?.user?.id) return { succes: false as const, erreur: "Non authentifié." };

  const quote = await prisma.clientQuote.findFirst({
    where: { id: quoteId, userId: session.user.id },
    select: { projectId: true },
  });
  if (!quote) return { succes: false as const, erreur: "Introuvable." };

  await prisma.clientQuote.update({
    where: { id: quoteId },
    data: { projectId: null },
  });
  if (quote.projectId) revalidatePath(`/chantiers/${quote.projectId}`);
  revalidatePath(`/devis-clients/${quoteId}`);
  return { succes: true as const };
}

export async function lierDocumentAuChantier(projectId: string, documentId: string) {
  const session = await auth();
  if (!session?.user?.id) return { succes: false as const, erreur: "Non authentifié." };

  const [project, doc] = await Promise.all([
    prisma.project.findFirst({ where: { id: projectId, userId: session.user.id } }),
    prisma.document.findFirst({ where: { id: documentId, userId: session.user.id } }),
  ]);
  if (!project || !doc) return { succes: false as const, erreur: "Introuvable." };

  await prisma.document.update({
    where: { id: documentId },
    data: { projectId },
  });
  revalidatePath(`/chantiers/${projectId}`);
  revalidatePath(`/documents/${documentId}`);
  return { succes: true as const };
}

export async function delierDocumentDuChantier(documentId: string) {
  const session = await auth();
  if (!session?.user?.id) return { succes: false as const, erreur: "Non authentifié." };

  const doc = await prisma.document.findFirst({
    where: { id: documentId, userId: session.user.id },
    select: { projectId: true },
  });
  if (!doc) return { succes: false as const, erreur: "Introuvable." };

  await prisma.document.update({
    where: { id: documentId },
    data: { projectId: null },
  });
  if (doc.projectId) revalidatePath(`/chantiers/${doc.projectId}`);
  revalidatePath(`/documents/${documentId}`);
  return { succes: true as const };
}
