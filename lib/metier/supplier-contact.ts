/** Contact commercial lu sur un document fournisseur / distributeur. */

import type { PriorPriceHit } from "@/lib/metier/prior-prices";
import { KIND_LABEL, type DocKind, type ExtractLine, type ExtractTotals } from "@/lib/metier/types";

export type SupplierContact = {
  name: string;
  email: string;
  phone: string;
  role: string;
};

/** Score « ouf » : CTA acceptation. En dessous → renégociation possible. */
export const ACCEPT_QUOTE_SCORE_MIN = 90;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export function normalizeSupplierContact(raw: {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
}): SupplierContact | null {
  const name = String(raw.name ?? "").trim().slice(0, 120);
  const email = String(raw.email ?? "").trim().toLowerCase().slice(0, 200);
  const phone = String(raw.phone ?? "").trim().slice(0, 40);
  const role = String(raw.role ?? "").trim().slice(0, 80) || (name || email ? "commercial" : "");
  if (!name && !email && !phone) return null;
  return { name, email, phone, role };
}

export function isValidContactEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

/** CTA « accepter le devis » : score élevé + mail commercial + devis/BC entrant. */
export function canOfferAcceptQuoteCta(input: {
  score: number;
  direction: "in" | "out";
  kind: string;
  contactEmail?: string | null;
}): boolean {
  if (input.direction !== "in") return false;
  if (input.kind !== "devis" && input.kind !== "bon_commande") return false;
  if (input.score < ACCEPT_QUOTE_SCORE_MIN) return false;
  return isValidContactEmail(input.contactEmail ?? "");
}

export function buildAcceptQuoteMailto(input: {
  toEmail: string;
  contactName?: string | null;
  partyName?: string | null;
  documentTitle?: string | null;
  documentNumber?: string | null;
  /** AAAA-MM-JJ — reprise dans le corps du mail. */
  deliveryDate?: string | null;
  chantierHint?: string | null;
  /** Signature entreprise (signOff + bloc). */
  closingBlock?: string | null;
}): string {
  const to = input.toEmail.trim();
  const doc =
    [input.documentTitle, input.documentNumber ? `n° ${input.documentNumber}` : null]
      .filter(Boolean)
      .join(" · ") || "votre devis";
  const who = input.contactName?.trim() ? `Bonjour ${input.contactName.trim()},` : "Bonjour,";
  const subject = `Acceptation — ${doc}`;
  const deliveryLine = formatDeliveryMailLine(input.deliveryDate, input.chantierHint);
  const closing = String(input.closingBlock ?? "").trim() || "Cordialement,";
  const body = [
    who,
    "",
    `Nous acceptons ${doc}${input.partyName ? ` (${input.partyName})` : ""}.`,
    deliveryLine,
    "",
    "Merci de bien vouloir procéder selon vos conditions habituelles.",
    "",
    closing,
  ]
    .filter((x) => x != null)
    .join("\n");
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function formatDeliveryMailLine(
  deliveryDate?: string | null,
  chantierHint?: string | null,
): string | null {
  const day = String(deliveryDate ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const [y, m, d] = day.split("-");
  const fr = `${d}/${m}/${y}`;
  const chantier = chantierHint?.trim();
  return chantier
    ? `Livraison souhaitée le ${fr} pour le chantier « ${chantier} ». Merci de confirmer cette date.`
    : `Livraison souhaitée le ${fr}. Merci de confirmer cette date.`;
}

function euroFr(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

/**
 * CTA renégociation : toujours proposé sur devis / BC fournisseur (entrant).
 * Le score ne masque plus le bouton — seul « Accepter » reste réservé au score élevé.
 */
export function canOfferRenegotiateCta(input: {
  score: number;
  direction: "in" | "out";
  kind: string;
}): boolean {
  void input.score;
  if (input.direction !== "in") return false;
  return input.kind === "devis" || input.kind === "bon_commande";
}

export function buildRenegotiateMailto(input: {
  toEmail?: string | null;
  contactName?: string | null;
  partyName?: string | null;
  kind: DocKind | string;
  documentTitle?: string | null;
  documentNumber?: string | null;
  chantierHint?: string | null;
  totals?: ExtractTotals | null;
  lines?: ExtractLine[] | null;
  priorHits?: PriorPriceHit[] | null;
  /** Ignoré dans le mail (jamais exposé au fournisseur). */
  score?: number | null;
  deliveryDate?: string | null;
  closingBlock?: string | null;
}): string {
  void input.score;
  const to = (input.toEmail ?? "").trim();
  const kindLabel = KIND_LABEL[input.kind as DocKind] ?? "document";
  const title = String(input.documentTitle ?? "").trim();
  const number = String(input.documentNumber ?? "").trim();
  // Évite « Commande N° X · n° X »
  const doc =
    title && number && title.toLowerCase().includes(number.toLowerCase())
      ? title
      : [title || null, number ? `n° ${number}` : null].filter(Boolean).join(" · ") || kindLabel;
  const who = input.contactName?.trim() ? `Bonjour ${input.contactName.trim()},` : "Bonjour,";
  const subject = `Demande de révision de prix — ${doc}`;
  const chantier = input.chantierHint?.trim() || null;

  const rises = (input.priorHits ?? []).filter((h) => h.pct > 0).slice(0, 12);
  const lineRows = (input.lines ?? []).slice(0, 20).map((l) => {
    const unit = Number(l.buy_price) || 0;
    return `• ${l.label} — ${l.qty} ${l.unit} × ${euroFr(unit)}`;
  });

  const bodyParts = [
    who,
    "",
    `Concernant ${doc}${input.partyName ? ` (${input.partyName})` : ""}, nous souhaitons revoir les conditions et les prix proposés.`,
    chantier ? `Chantier : ${chantier}.` : null,
    formatDeliveryMailLine(input.deliveryDate, null),
    input.totals?.ht != null ? `Total HT : ${euroFr(input.totals.ht)}.` : null,
    "",
  ];

  if (rises.length) {
    bodyParts.push(
      "Par rapport à nos derniers achats / devis, nous constatons les écarts suivants :",
      ...rises.map(
        (h) =>
          `• ${h.label} : ${euroFr(h.currentPrice)} (votre offre) vs ${euroFr(h.priorPrice)} (référence ${h.priorDocTitle}) → +${h.pct.toFixed(1)} %`,
      ),
      "",
      "Pouvez-vous nous adresser une nouvelle offre alignée sur ces références, ou nous préciser les motifs de ces hausses ?",
      "",
    );
  } else {
    bodyParts.push(
      "Pouvez-vous nous adresser une nouvelle offre avec des prix revus, de préférence alignés sur nos derniers achats ?",
      "",
    );
  }

  if (lineRows.length) {
    bodyParts.push("Articles concernés :", ...lineRows, "");
  }

  const closing = String(input.closingBlock ?? "").trim() || "Cordialement,";
  bodyParts.push("Dans l’attente de votre retour,", "", closing);

  const body = bodyParts.filter((x) => x != null).join("\n");
  const prefix = to && isValidContactEmail(to) ? `mailto:${to}` : "mailto:";
  return `${prefix}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
