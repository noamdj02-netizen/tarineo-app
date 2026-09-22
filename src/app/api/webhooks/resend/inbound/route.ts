import { NextResponse } from "next/server";
import { after } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { calculerHashFichier, enregistrerDocument } from "@/lib/documents";
import { analyserDocument } from "@/lib/extraction";
import { extraireTokenDepuisDestinataire } from "@/lib/importEmail";
import { verifierRateLimit } from "@/lib/rateLimit";
import { calculerEtatQuota, debutMoisUTC } from "@/lib/quota";
import { secretWebhookInbound, telechargerPieceJointeInbound, verifierRequeteWebhookInbound } from "@/lib/resendInbound";

const TYPES_PIECE_JOINTE = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
]);

async function traiterImportPourUtilisateur(userId: string, emailId: string) {
  const utilisateur = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, createdAt: true, plan: true, subscriptionStatus: true },
  });
  if (!utilisateur) return { status: 404 as const, traitees: [] as string[] };

  if (!verifierRateLimit(`import-email:${utilisateur.id}`, 30, 60 * 60 * 1000)) {
    return { status: 429 as const, traitees: [] as string[] };
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
    return { status: 429 as const, traitees: [] as string[] };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data: email } = await resend.emails.receiving.get(emailId);
  const pieces = email?.attachments ?? [];
  const traitees: string[] = [];

  for (const piece of pieces) {
    if (!TYPES_PIECE_JOINTE.has(piece.content_type)) continue;

    const buffer = await telechargerPieceJointeInbound(emailId, piece.id);
    if (!buffer) continue;

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

  return { status: 200 as const, traitees };
}

export async function POST(request: Request) {
  if (!secretWebhookInbound() && process.env.NODE_ENV === "production") {
    return NextResponse.json({ erreur: "Webhook non configuré" }, { status: 503 });
  }

  const corpsBrut = await request.text();
  if (!verifierRequeteWebhookInbound(request, corpsBrut)) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  let evenement: { type?: string; data?: { email_id?: string; to?: string[] } };
  try {
    evenement = JSON.parse(corpsBrut) as typeof evenement;
  } catch {
    return NextResponse.json({ erreur: "Corps invalide" }, { status: 400 });
  }

  if (evenement.type !== "email.received") {
    return NextResponse.json({ ok: true, ignore: evenement.type ?? "inconnu" });
  }

  const emailId = evenement.data?.email_id;
  const destinataires = evenement.data?.to ?? [];
  if (!emailId) {
    return NextResponse.json({ erreur: "email_id manquant" }, { status: 400 });
  }

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
    select: { id: true },
  });
  if (!utilisateur) {
    return NextResponse.json({ erreur: "Utilisateur introuvable" }, { status: 404 });
  }

  const resultat = await traiterImportPourUtilisateur(utilisateur.id, emailId);
  if (resultat.status === 429) {
    return NextResponse.json({ erreur: "Quota atteint" }, { status: 429 });
  }

  return NextResponse.json({ ok: true, documents: resultat.traitees });
}
