import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import {
  extractLogoUrlHint,
  fallbackExtractEmailSignature,
  stripEmailHtml,
  type ExtractedEmailSignature,
} from "@/lib/metier/email-signature-parse";

export type { ExtractedEmailSignature };
export { extractLogoUrlHint, fallbackExtractEmailSignature, stripEmailHtml };

export async function extractEmailSignatureFromPaste(raw: string): Promise<ExtractedEmailSignature> {
  const clipped = String(raw ?? "").trim().slice(0, 12_000);
  if (!clipped) {
    return { signOff: "", signatureText: "", fromName: "", logoUrlHint: "", closingPhrases: [] };
  }

  const base = fallbackExtractEmailSignature(clipped);
  if (!process.env.ANTHROPIC_API_KEY) return base;

  try {
    const text = stripEmailHtml(clipped);
    const res = await new Anthropic().messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `Tu extrais la signature d’un e-mail professionnel français déjà envoyé.
Réponds UNIQUEMENT en JSON valide :
{"signOff":"formule courte","signatureText":"bloc signature multiligne","fromName":"nom affiché","logoUrlHint":"url ou vide","closingPhrases":["..."]}

Règles :
- Ne jamais inventer SIRET, RCS, téléphone, e-mail, site ou mentions absents du texte.
- signOff = dernière formule de politesse (ex. « Cordialement, »).
- signatureText = lignes après signOff (nom, titre, société, tél, site) sans le corps du message.
- logoUrlHint = URL d’image logo si visible dans le HTML source, sinon "".
- Pas de markdown.

Texte du mail :
---
${text.slice(0, 8000)}
---
${base.logoUrlHint ? `URL image candidate : ${base.logoUrlHint}` : ""}`,
        },
      ],
    });
    const rawOut = res.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
    const json = rawOut.match(/\{[\s\S]*\}/)?.[0];
    if (!json) return base;
    const parsed = JSON.parse(json) as Partial<ExtractedEmailSignature>;
    return {
      signOff: String(parsed.signOff ?? base.signOff).trim().slice(0, 120) || base.signOff,
      signatureText: String(parsed.signatureText ?? base.signatureText).trim().slice(0, 2000) || base.signatureText,
      fromName: String(parsed.fromName ?? base.fromName).trim().slice(0, 120),
      logoUrlHint: String(parsed.logoUrlHint ?? "").trim().slice(0, 500) || base.logoUrlHint,
      closingPhrases: Array.isArray(parsed.closingPhrases)
        ? parsed.closingPhrases.map((x) => String(x).trim()).filter(Boolean).slice(0, 6)
        : base.closingPhrases,
    };
  } catch {
    return base;
  }
}
