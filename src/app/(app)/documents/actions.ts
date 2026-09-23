"use server";

import { after } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { enregistrerDocument, calculerHashFichier, trouverDoublonParHash } from "@/lib/documents";
import type { ResultatEnregistrementDocument, DoublonPotentiel } from "@/lib/documents";
import { calculerEtatQuota, debutMoisUTC } from "@/lib/quota";
import { verifierRateLimit } from "@/lib/rateLimit";

const schema = z.object({
  type: z.enum(["DEVIS", "FACTURE", "BON_COMMANDE", "BON_ENLEVEMENT"]),
  ignorerDoublon: z.literal("true").optional(),
});

export type ResultatEnvoiDocument =
  | ResultatEnregistrementDocument
  | { succes: false; erreur: "doublon_detecte"; doublon: DoublonPotentiel }
  | { succes: false; erreur: "fichier_invalide" | "session_invalide" };

function extraireFichier(formData: FormData): Blob | null {
  const entree = formData.get("fichier");
  if (!entree || typeof entree === "string") return null;
  // Sur Vercel/Node, FormData peut renvoyer un Blob plutôt qu'une instance File.
  if (entree instanceof Blob && entree.size > 0) return entree;
  return null;
}

export async function envoyerUnDocument(formData: FormData): Promise<ResultatEnvoiDocument> {
  try {
  const session = await auth();
  if (!session?.user?.id) {
    return { succes: false, erreur: "session_invalide" };
  }

  if (!verifierRateLimit(`upload:${session.user.id}`, 40, 60 * 60 * 1000)) {
    return { succes: false, erreur: "fichier_invalide" };
  }

  const parsed = schema.safeParse({
    type: formData.get("type"),
    ignorerDoublon: formData.get("ignorerDoublon") ?? undefined,
  });
  const file = extraireFichier(formData);

  if (!parsed.success || !file) {
    return { succes: false, erreur: "fichier_invalide" };
  }

  // Vérifié avant tout traitement : un document bloqué ne doit coûter ni stockage
  // ni appel IA (voir src/lib/quota.ts pour la logique complète des paliers).
  const utilisateur = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { createdAt: true, plan: true, subscriptionStatus: true },
  });
  if (!utilisateur) {
    return { succes: false, erreur: "erreur" };
  }
  const maintenant = new Date();
  const debutMois = debutMoisUTC(maintenant);
  const [documentsAvantCeMois, documentsCeMois] = await Promise.all([
    prisma.document.count({ where: { userId: session.user.id, createdAt: { lt: debutMois } } }),
    prisma.document.count({ where: { userId: session.user.id, createdAt: { gte: debutMois } } }),
  ]);
  const etatQuota = calculerEtatQuota({
    createdAtUtilisateur: utilisateur.createdAt,
    plan: utilisateur.plan,
    subscriptionStatus: utilisateur.subscriptionStatus,
    documentsAvantCeMois,
    documentsCeMois,
    maintenant,
  });
  if (etatQuota.phase === "bloque_paiement_requis") {
    return { succes: false, erreur: "essai_termine" };
  }
  if (etatQuota.phase === "mensuel" && etatQuota.quotaAtteint) {
    return { succes: false, erreur: "quota_depasse" };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileHash = calculerHashFichier(buffer);

  if (!parsed.data.ignorerDoublon) {
    const doublon = await trouverDoublonParHash(session.user.id, fileHash);
    if (doublon) {
      return { succes: false, erreur: "doublon_detecte", doublon };
    }
  }

  const resultat = await enregistrerDocument(session.user.id, parsed.data.type, buffer, fileHash);

  if (resultat.succes) {
    // L'analyse IA prend 10–60 s : on la lance après la réponse pour ne pas bloquer
    // l'upload ni faire expirer la server action côté navigateur.
    const documentId = resultat.documentId;
    const userId = session.user.id;
    after(async () => {
      try {
        const { analyserDocument } = await import("@/lib/extraction");
        await analyserDocument(documentId, userId);
      } catch (erreur) {
        console.error(`Analyse IA échouée pour ${documentId} :`, erreur);
      }
    });
  }

  return resultat;
  } catch (erreur) {
    console.error("envoyerUnDocument :", erreur);
    return { succes: false, erreur: "erreur" };
  }
}

// Marque la pop-up d'onboarding "historique prêt" comme vue, pour qu'elle ne
// réapparaisse jamais — appelée par PopupOnboardingDevis au montage réel côté
// client (jamais lors d'un pré-rendu/prefetch serveur, qui n'exécute pas ce code).
export async function marquerOnboardingDevisPopupVu(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { onboardingDevisPopupVu: true },
  });
}
