import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { DOCUMENTS_BUCKET, getSupabaseAdmin } from "@/lib/supabase";
import { TYPES_EXPORT_COMPTABLE } from "@/lib/exportComptable";
import type { Document } from "@prisma/client";

const BASE_OAUTH = "https://app.pennylane.com";
const BASE_API = "https://app.pennylane.com/api/external/v2";
const SCOPES = [
  "suppliers:all",
  "supplier_invoices:all",
  "file_attachments:all",
].join(" ");

export function pennylaneConfigure(): boolean {
  return Boolean(process.env.PENNYLANE_CLIENT_ID && process.env.PENNYLANE_CLIENT_SECRET);
}

export function urlAutorisationPennylane(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.PENNYLANE_CLIENT_ID as string,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES,
    state,
  });
  return `${BASE_OAUTH}/oauth/authorize?${params.toString()}`;
}

export function genererStatePennylane(userId: string): string {
  const nonce = randomBytes(16).toString("hex");
  const payload = `${userId}:${nonce}`;
  const sig = createHash("sha256")
    .update(`${payload}:${process.env.AUTH_SECRET}`)
    .digest("hex")
    .slice(0, 16);
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function verifierStatePennylane(state: string): string | null {
  try {
    const decoded = Buffer.from(state, "base64url").toString("utf8");
    const [userId, nonce, sig] = decoded.split(":");
    if (!userId || !nonce || !sig) return null;
    const attendu = createHash("sha256")
      .update(`${userId}:${nonce}:${process.env.AUTH_SECRET}`)
      .digest("hex")
      .slice(0, 16);
    return sig === attendu ? userId : null;
  } catch {
    return null;
  }
}

async function echangerToken(body: Record<string, string>) {
  const res = await fetch(`${BASE_OAUTH}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pennylane token: ${res.status} ${text}`);
  }
  return res.json() as Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  }>;
}

export async function connecterPennylane(userId: string, code: string, redirectUri: string): Promise<void> {
  const tokens = await echangerToken({
    client_id: process.env.PENNYLANE_CLIENT_ID as string,
    client_secret: process.env.PENNYLANE_CLIENT_SECRET as string,
    code,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
  await prisma.pennylaneConnection.upsert({
    where: { userId },
    create: {
      userId,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt,
    },
    update: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt,
    },
  });
}

async function rafraichirToken(connexion: { id: string; userId: string; refreshToken: string }) {
  const tokens = await echangerToken({
    client_id: process.env.PENNYLANE_CLIENT_ID as string,
    client_secret: process.env.PENNYLANE_CLIENT_SECRET as string,
    refresh_token: connexion.refreshToken,
    grant_type: "refresh_token",
  });
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
  await prisma.pennylaneConnection.update({
    where: { id: connexion.id },
    data: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt,
    },
  });
  return tokens.access_token;
}

export async function obtenirAccessTokenPennylane(userId: string): Promise<string | null> {
  const connexion = await prisma.pennylaneConnection.findUnique({ where: { userId } });
  if (!connexion) return null;
  if (connexion.expiresAt.getTime() > Date.now() + 60_000) {
    return connexion.accessToken;
  }
  try {
    return await rafraichirToken(connexion);
  } catch (erreur) {
    console.error("Rafraîchissement Pennylane échoué :", erreur);
    return null;
  }
}

export async function deconnecterPennylane(userId: string): Promise<void> {
  const connexion = await prisma.pennylaneConnection.findUnique({ where: { userId } });
  if (!connexion) return;
  try {
    await fetch(`${BASE_OAUTH}/oauth/revoke`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.PENNYLANE_CLIENT_ID as string,
        client_secret: process.env.PENNYLANE_CLIENT_SECRET as string,
        token: connexion.refreshToken,
      }),
    });
  } catch {
    // Révocation best-effort
  }
  await prisma.pennylaneConnection.delete({ where: { userId } });
}

async function appelPennylane(accessToken: string, chemin: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_API}${chemin}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pennylane API ${chemin}: ${res.status} ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

async function trouverOuCreerFournisseur(accessToken: string, nom: string): Promise<number> {
  const filtres = encodeURIComponent(JSON.stringify([{ field: "name", operator: "eq", value: nom }]));
  const liste = (await appelPennylane(accessToken, `/suppliers?limit=1&filter=${filtres}`)) as {
    items?: { id: number }[];
  };
  if (liste.items?.[0]?.id) return liste.items[0].id;

  const cree = (await appelPennylane(accessToken, "/suppliers", {
    method: "POST",
    body: JSON.stringify({ name: nom }),
  })) as { id: number };
  return cree.id;
}

async function uploaderPieceJointe(accessToken: string, buffer: Buffer, filename: string): Promise<number> {
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(buffer)]), filename);
  const res = await fetch(`${BASE_API}/file_attachments`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload Pennylane: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { id: number };
  return data.id;
}

export async function exporterDocumentVersPennylane(
  userId: string,
  document: Pick<Document, "id" | "fileKey" | "distributor" | "documentDate" | "totalHt" | "totalTtc" | "type">,
): Promise<{ succes: true } | { succes: false; erreur: string }> {
  if (!TYPES_EXPORT_COMPTABLE.includes(document.type as (typeof TYPES_EXPORT_COMPTABLE)[number])) {
    return { succes: false, erreur: "Seules les factures et bons d'achat peuvent être exportées vers Pennylane." };
  }

  const accessToken = await obtenirAccessTokenPennylane(userId);
  if (!accessToken) {
    return { succes: false, erreur: "Connexion Pennylane expirée — reconnectez-vous dans Paramètres." };
  }

  const { data, error } = await getSupabaseAdmin().storage.from(DOCUMENTS_BUCKET).download(document.fileKey);
  if (error || !data) {
    return { succes: false, erreur: "Fichier source introuvable." };
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  const filename = document.fileKey.split("/").pop() ?? `document-${document.id}.pdf`;
  const distributeur = document.distributor?.trim() || "Fournisseur inconnu";
  const date = (document.documentDate ?? new Date()).toISOString().slice(0, 10);
  const ht = Number(document.totalHt ?? 0);
  const ttc = Number(document.totalTtc ?? ht * 1.2);
  const tva = Math.max(0, ttc - ht);

  try {
    const supplierId = await trouverOuCreerFournisseur(accessToken, distributeur);
    const fileAttachmentId = await uploaderPieceJointe(accessToken, buffer, filename);

    await appelPennylane(accessToken, "/supplier_invoices/import", {
      method: "POST",
      body: JSON.stringify({
        file_attachment_id: fileAttachmentId,
        supplier_id: supplierId,
        date,
        deadline: date,
        currency_amount_before_tax: ht.toFixed(2),
        currency_tax: tva.toFixed(2),
        currency_amount: ttc.toFixed(2),
        external_reference: `tarineo:${document.id}`,
      }),
    });

    return { succes: true };
  } catch (erreur) {
    console.error("Export Pennylane échoué :", erreur);
    return { succes: false, erreur: "L'export vers Pennylane a échoué. Vérifiez la connexion et réessayez." };
  }
}

export async function exporterMoisVersPennylane(
  userId: string,
  debut: Date,
  fin: Date,
): Promise<{ exportes: number; erreurs: number }> {
  const accessToken = await obtenirAccessTokenPennylane(userId);
  if (!accessToken) return { exportes: 0, erreurs: 0 };

  const documents = await prisma.document.findMany({
    where: {
      userId,
      status: "VALIDATED",
      type: { in: [...TYPES_EXPORT_COMPTABLE] },
      documentDate: { gte: debut, lt: fin },
    },
    select: {
      id: true,
      fileKey: true,
      distributor: true,
      documentDate: true,
      totalHt: true,
      totalTtc: true,
      type: true,
    },
  });

  let exportes = 0;
  let erreurs = 0;
  for (const doc of documents) {
    const resultat = await exporterDocumentVersPennylane(userId, doc);
    if (resultat.succes) exportes += 1;
    else erreurs += 1;
  }
  return { exportes, erreurs };
}
