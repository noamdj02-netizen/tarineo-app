import { NextResponse } from "next/server";
import { after } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { calculerHashFichier, enregistrerDocument } from "@/lib/documents";
import { analyserDocument } from "@/lib/extraction";
import { extraireTokenDepuisDestinataire } from "@/lib/importEmail";
import { verifierRateLimit } from "@/lib/rateLimit";
import { calculerEtatQuota, debutMoisUTC } from "@/lib/quota";

const pieceJointeSchema = z.object({
  filename: z.string(),
  content: z.string().optional(),
  content_type: z.string().optional(),
});

const corpsSchema = z.object({
  from: z.string(),
  to: z.union([z.string(), z.array(z.string())]),
  subject: z.string().optional(),
  attachments: z.array(pieceJointeSchema).optional(),
});

export async function POST(request: Request) {
  const secret = process.env.RESEND_INBOUND_WEBHOOK_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ erreur: "Webhook non configuré" }, { status: 503 });
    }
  } else {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
    }
  }

  const corps = corpsSchema.safeParse(await request.json());
  if (!corps.success) {
    return NextResponse.json({ erreur: "Corps invalide" }, { status: 400 });
  }

  const destinataires = Array.isArray(corps.data.to) ? corps.data.to : [corps.data.to];
  let token: string | null = null;
  for (const adresse of destinataires) {
    token = extraireTokenDepuisDestinataire(adresse);
    if (token) break;
  }
  if (!token) {
    return NextResponse.json({ erreur: "Destinataire inconnu" }, { status: 400 });
  }

  const utilisateur = await prisma.user.findUnique({
    where: { importEmailToken: token },
    select: { id: true, createdAt: true, plan: true, subscriptionStatus: true },
  });
  if (!utilisateur) {
    return NextResponse.json({ erreur: "Utilisateur introuvable" }, { status: 404 });
  }

  if (!verifierRateLimit(`import-email:${utilisateur.id}`, 30, 60 * 60 * 1000)) {
    return NextResponse.json({ erreur: "Quota dépassé" }, { status: 429 });
  }

  const maintenant = new Date();
  const debutMois = debutMoisUTC(maintenant);
  const [documentsAvantCeMois, documentsCeMois] = await Promise.all([
    prisma.document.count({ where: { userId: utilisateur.id, createdAt: { lt: debutMois } } }),
    prisma.document.count({ where: { userId: utilisateur.id, createdAt: { gte: debutMois } } }),
  ]);
  const etatQuota = calculerEtatQuota({
    createdAtUtilisateur: utilisateur.createdAt,
    plan: utilisateur.plan,
    subscriptionStatus: utilisateur.subscriptionStatus,
    documentsAvantCeMois,
    documentsCeMois,
    maintenant,
  });
  if (etatQuota.phase === "bloque_paiement_requis" || (etatQuota.phase === "mensuel" && etatQuota.quotaAtteint)) {
    return NextResponse.json({ erreur: "Quota documents atteint" }, { status: 429 });
  }

  const pieces = corps.data.attachments ?? [];
  const traitees: string[] = [];

  for (const piece of pieces) {
    if (!piece.content) continue;
    const buffer = Buffer.from(piece.content, "base64");
    const hash = calculerHashFichier(buffer);
    const enregistrement = await enregistrerDocument(utilisateur.id, "DEVIS", buffer, hash);
    if (!enregistrement.succes) continue;

    traitees.push(enregistrement.documentId);
    after(async () => {
      try {
        await analyserDocument(enregistrement.documentId, utilisateur.id);
      } catch (erreur) {
        console.error("Analyse email inbound échouée :", erreur);
      }
    });
  }

  return NextResponse.json({ ok: true, documents: traitees });
}
