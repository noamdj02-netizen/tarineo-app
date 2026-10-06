/**
 * Helpers pour workflows n8n (Gmail → TARINEO).
 * Pas de logique métier TARINEO : uniquement clés et heuristiques côté orchestration.
 */

import { createHash } from "node:crypto";
import type { IntegrationDocumentKind } from "@/lib/integrations/document-kind";

const KEY_MIN = 8;
const KEY_MAX = 128;

/**
 * Clé Idempotency-Key stable pour une pièce jointe Gmail.
 * À reproduire dans n8n : même message + même PJ → même clé → pas de double document.
 */
export function buildIngestIdempotencyKeyFromGmail(input: {
  gmailMessageId: string;
  attachmentId?: string | null;
  fileName?: string | null;
}): string {
  const msg = input.gmailMessageId.trim();
  const part = (input.attachmentId ?? input.fileName ?? "0").trim();
  const raw = `gmail:${msg}:${part}`;
  if (raw.length >= KEY_MIN && raw.length <= KEY_MAX) return raw;
  return createHash("sha256").update(raw).digest("hex").slice(0, KEY_MAX);
}

export type SupplierKindGuess = IntegrationDocumentKind | "needs_review";

/**
 * Devine le document_kind fournisseur à partir du sujet / nom de fichier.
 * Si incertain → needs_review (n8n ne doit pas appeler TARINEO automatiquement).
 */
export function guessSupplierDocumentKindFromEmail(subject: string, fileName: string): SupplierKindGuess {
  const text = `${subject} ${fileName}`.toLowerCase();
  if (/\bfacture\b|invoice|fact\./.test(text)) return "supplier_invoice";
  if (/bon de commande|purchase order|\bbc\b|commande fournisseur/.test(text)) return "supplier_purchase_order";
  if (/bon de livraison|delivery note|\bbl\b|livraison/.test(text)) return "supplier_delivery_note";
  if (/\bdevis\b|quote|offre|proposition/.test(text)) return "supplier_quote";
  return "needs_review";
}

/** Filtre simple : extensions utiles pour l’ingest TARINEO (PDF + images). */
export function isLikelyBusinessAttachment(fileName: string, mimeType?: string): boolean {
  const name = fileName.toLowerCase();
  if (name.endsWith(".pdf")) return true;
  if (/\.(jpe?g|png|webp|gif)$/.test(name)) return true;
  const mime = (mimeType ?? "").toLowerCase();
  if (mime === "application/pdf") return true;
  if (mime.startsWith("image/")) return true;
  return false;
}

/** Priorité pour traiter plusieurs PJ : PDF d’abord, puis images. */
export function attachmentSortPriority(fileName: string): number {
  const n = fileName.toLowerCase();
  if (n.endsWith(".pdf")) return 0;
  if (/\.(jpe?g|png|webp)$/.test(n)) return 1;
  if (n.endsWith(".gif")) return 2;
  return 99;
}
