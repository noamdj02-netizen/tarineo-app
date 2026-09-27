import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { getCompanyProfile } from "@/lib/metier/queries";
import { KIND_LABEL, totalsFromExtract, type DocumentCard } from "@/lib/metier/types";

export type MailDraft = {
  to: string;
  subject: string;
  body: string;
  toLabel: string;
};

function fallbackDraft(doc: DocumentCard, companyName: string, signOff: string): MailDraft {
  const label = KIND_LABEL[doc.kind].toLowerCase();
  const who = doc.party_name || "Madame, Monsieur";
  const chantier = doc.chantier_name ? ` pour le chantier ${doc.chantier_name}` : "";
  const toClient = doc.direction === "out";
  return {
    to: "",
    toLabel: toClient ? "E-mail du client" : "E-mail du distributeur",
    subject: `${KIND_LABEL[doc.kind]} — ${doc.chantier_name || doc.title}`,
    body: `Bonjour ${who},\n\nVeuillez trouver ci-joint ${label} « ${doc.title} »${chantier}.\n\n${signOff}\n${companyName}`.trim(),
  };
}

export async function draftDocumentMail(doc: DocumentCard): Promise<MailDraft> {
  const company = await getCompanyProfile();
  const companyName = company?.raison_sociale?.trim() || "L’entreprise";
  const signBits = [companyName, company?.telephone, company?.email_contact].filter(Boolean);
  const signOff = `Cordialement,\n${signBits.join("\n")}`;
  const base = fallbackDraft(doc, companyName, signOff);
  const totals = totalsFromExtract(doc.extract);
  const lines = doc.lines
    .slice(0, 8)
    .map((l) => `${l.label} (${l.qty} ${l.unit})`)
    .join(", ");

  if (!process.env.ANTHROPIC_API_KEY) return base;

  try {
    const dest = doc.direction === "out" ? "le client" : "le distributeur / l’enseigne";
    const res = await new Anthropic().messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: `Rédige un e-mail professionnel court (FR, vouvoiement) pour envoyer une pièce PDF à ${dest}.
Réponds UNIQUEMENT en JSON : {"subject":"...","body":"..."}
Le body est du texte brut, 2 à 4 phrases + signature. Pas de markdown.

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

Signe avec le nom de l’entreprise. N’invente pas de prix ni de date. Mentionne le chantier s’il existe.`,
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
      body: parsed.body?.trim() || base.body,
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
  logoCid?: string;
}) {
  const paras = input.body
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px;font:15px/1.5 ui-sans-serif,system-ui;color:#1a1a1a;white-space:pre-wrap">${escapeHtml(p)}</p>`)
    .join("");
  const logo = input.logoCid
    ? `<img src="cid:${input.logoCid}" alt="${escapeHtml(input.company)}" width="120" style="display:block;max-width:140px;max-height:64px;margin:0 0 18px;object-fit:contain" />`
    : "";
  const meta = [input.phone, input.email, input.address].filter(Boolean).join(" · ");
  return `<!doctype html><html><body style="margin:0;background:#f3f3f2;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:20px;padding:28px 28px 24px">
    ${logo}
    ${paras}
    <p style="margin:22px 0 0;font:12px/1.45 ui-sans-serif,system-ui;color:#6b6b6b">${escapeHtml(input.company)}${meta ? `<br/>${escapeHtml(meta)}` : ""}</p>
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
