import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { getCompanyMailIdentity } from "@/lib/metier/company-mail-identity";
import { getCompanyProfile, listParties } from "@/lib/metier/queries";
import { KIND_LABEL, totalsFromExtract, type DocumentCard } from "@/lib/metier/types";

export type MailDraft = {
  to: string;
  subject: string;
  body: string;
  toLabel: string;
};

function emailFromExtract(doc: DocumentCard): string {
  const keys = ["contact_email", "last_sent_to", "email"] as const;
  for (const key of keys) {
    const v = doc.extract?.[key];
    if (typeof v === "string" && v.includes("@")) return v.trim();
  }
  return "";
}

function fallbackDraft(doc: DocumentCard, closingBlock: string, to: string): MailDraft {
  const label = KIND_LABEL[doc.kind].toLowerCase();
  const who = doc.party_name || "Madame, Monsieur";
  const chantier = doc.chantier_name ? ` pour le chantier ${doc.chantier_name}` : "";
  const toClient = doc.direction === "out";
  const sent = typeof doc.extract?.sent_at === "string" && doc.extract.sent_at;
  const subject = sent
    ? `Relance ${label} — ${doc.chantier_name || doc.title}`
    : `${KIND_LABEL[doc.kind]} — ${doc.chantier_name || doc.title}`;
  const body = sent
    ? `Bonjour ${who},\n\nJe me permets de revenir vers vous concernant ${label} « ${doc.title} »${chantier}. Souhaitez-vous que nous avancions ensemble ?\n\n${closingBlock}`.trim()
    : `Bonjour ${who},\n\nVeuillez trouver ci-joint ${label} « ${doc.title} »${chantier}.\n\n${closingBlock}`.trim();
  return {
    to,
    toLabel: toClient ? "E-mail du client" : "E-mail du distributeur",
    subject,
    body,
  };
}

function ensureClosing(body: string, closingBlock: string): string {
  const trimmed = body.trim();
  const closing = closingBlock.trim();
  if (!closing) return trimmed;
  if (trimmed.includes(closing.split("\n")[0] ?? "")) return trimmed;
  return `${trimmed}\n\n${closing}`;
}

export async function draftDocumentMail(doc: DocumentCard): Promise<MailDraft> {
  const [company, identity, parties] = await Promise.all([
    getCompanyProfile(),
    getCompanyMailIdentity(),
    listParties(),
  ]);
  const companyName = identity.companyName;
  const closingBlock = identity.closingBlock;
  const party = doc.party_id ? parties.find((p) => p.id === doc.party_id) : null;
  const to =
    emailFromExtract(doc) ||
    (party?.contact_email?.includes("@") ? party.contact_email.trim() : "");
  const base = fallbackDraft(doc, closingBlock, to);
  const totals = totalsFromExtract(doc.extract);
  const lines = doc.lines
    .slice(0, 8)
    .map((l) => `${l.label} (${l.qty} ${l.unit})`)
    .join(", ");
  const isRelance = Boolean(typeof doc.extract?.sent_at === "string" && doc.extract.sent_at);

  if (!process.env.ANTHROPIC_API_KEY) return base;

  try {
    const dest = doc.direction === "out" ? "le client" : "le distributeur / l’enseigne";
    const task = isRelance
      ? `Rédige un e-mail de relance professionnel court (FR, vouvoiement) pour ${dest} concernant une pièce déjà envoyée. Une question claire, pas de pression.`
      : `Rédige un e-mail professionnel court (FR, vouvoiement) pour envoyer une pièce PDF à ${dest}.`;
    const res = await new Anthropic().messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: `${task}
Réponds UNIQUEMENT en JSON : {"subject":"...","body":"..."}
Le body est du texte brut, 2 à 4 phrases puis EXACTEMENT cette signature (ne pas la modifier) :
---
${closingBlock}
---
Pas de markdown. N’invente pas d’autre signature.

Contexte :
- Pièce : ${KIND_LABEL[doc.kind]} « ${doc.title} »
- Sens : ${doc.direction === "out" ? "sortie client" : "achat / relance distributeur"}
- Destinataire : ${doc.party_name || "inconnu"}
- Chantier : ${doc.chantier_name || "non précisé"}
- Lignes : ${lines || "non détaillées"}
- Total HT : ${totals.ht ?? "inconnu"}
- Entreprise : ${companyName}
- Téléphone : ${company?.telephone || "—"}
- E-mail : ${company?.email_contact || "—"}
- Adresse entreprise : ${[company?.adresse_rue, company?.adresse_code_postal, company?.adresse_ville].filter(Boolean).join(", ") || "—"}

N’invente pas de prix ni de date. Mentionne le chantier s’il existe.`,
        },
      ],
    });
    const raw = res.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
    const json = raw.match(/\{[\s\S]*\}/)?.[0];
    if (!json) return base;
    const parsed = JSON.parse(json) as { subject?: string; body?: string };
    return {
      ...base,
      subject: parsed.subject?.trim() || base.subject,
      body: ensureClosing(parsed.body?.trim() || base.body, closingBlock),
    };
  } catch {
    return base;
  }
}

export function pieceMailHtml(input: {
  body: string;
  company: string;
  phone?: string;
  email?: string;
  address?: string;
  /** CID sans préfixe (`company-logo`) ou URL https. */
  logoCid?: string;
  logoUrl?: string;
  /** Signature texte déjà dans le body : ne pas dupliquer le pied HTML. */
  signatureFooter?: string | null;
}) {
  const paras = input.body
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px;font:15px/1.5 ui-sans-serif,system-ui;color:#1a1a1a;white-space:pre-wrap">${escapeHtml(p)}</p>`)
    .join("");
  const logoSrc = input.logoCid
    ? `cid:${input.logoCid}`
    : input.logoUrl?.startsWith("http")
      ? input.logoUrl
      : "";
  const logo = logoSrc
    ? `<img src="${escapeHtml(logoSrc)}" alt="${escapeHtml(input.company)}" width="140" height="auto" style="display:block;width:140px;max-width:140px;max-height:72px;height:auto;margin:0 0 18px;border:0;outline:none;text-decoration:none" />`
    : "";
  const footer = String(input.signatureFooter ?? "").trim();
  const meta = footer
    ? ""
    : [input.phone, input.email, input.address].filter(Boolean).join(" · ");
  const footerHtml = footer
    ? `<p style="margin:22px 0 0;font:13px/1.5 ui-sans-serif,system-ui;color:#3a3a3a;white-space:pre-wrap">${escapeHtml(footer)}</p>`
    : `<p style="margin:22px 0 0;font:12px/1.45 ui-sans-serif,system-ui;color:#6b6b6b">${escapeHtml(input.company)}${meta ? `<br/>${escapeHtml(meta)}` : ""}</p>`;
  return `<!doctype html><html><body style="margin:0;background:#f3f3f2;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:20px;padding:28px 28px 24px">
    ${logo}
    ${paras}
    ${footerHtml}
  </div>
</body></html>`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
