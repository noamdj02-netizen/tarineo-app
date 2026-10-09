export type ExtractedEmailSignature = {
  signOff: string;
  signatureText: string;
  fromName: string;
  logoUrlHint: string;
  closingPhrases: string[];
};

const SIGN_OFF_RE =
  /\b(cordialement|bien\s*[àa]\s*vous|sinc[eè]rement|respectueusement|meilleures?\s+salutations|bien\s+cordialement)\b[,.]?/i;

/** Strip HTML tags naïvement pour collages HTML. */
export function stripEmailHtml(raw: string): string {
  return String(raw ?? "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function extractLogoUrlHint(raw: string): string {
  const html = String(raw ?? "");
  const imgs = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]!);
  for (const src of imgs) {
    if (/^https?:\/\//i.test(src) && !/tracking|pixel|spacer|1x1/i.test(src)) {
      return src.slice(0, 500);
    }
  }
  return "";
}

/** Fallback déterministe sans API. */
export function fallbackExtractEmailSignature(raw: string): ExtractedEmailSignature {
  const text = stripEmailHtml(raw);
  const logoUrlHint = extractLogoUrlHint(raw);
  const lines = text.split(/\n/).map((l) => l.trimEnd());
  let signIdx = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (SIGN_OFF_RE.test(lines[i]!) || /^--\s*$/.test(lines[i]!)) {
      signIdx = i;
      break;
    }
  }
  if (signIdx < 0) signIdx = Math.max(0, lines.length - 8);

  const signOffLine = lines[signIdx]?.trim() || "Cordialement,";
  const signOff = SIGN_OFF_RE.test(signOffLine)
    ? signOffLine.replace(/\s+/g, " ").slice(0, 120)
    : "Cordialement,";
  const after = lines
    .slice(signIdx + (SIGN_OFF_RE.test(signOffLine) || /^--/.test(signOffLine) ? 1 : 0))
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 12);
  const signatureText = after.join("\n").slice(0, 2000);
  const fromName = after[0]?.slice(0, 120) || "";

  return {
    signOff,
    signatureText,
    fromName,
    logoUrlHint,
    closingPhrases: signOff ? [signOff] : [],
  };
}
