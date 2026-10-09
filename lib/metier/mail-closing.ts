/** Formule + bloc signature en texte brut (mailto / body). */

export function formatMailClosing(input: {
  signOff?: string | null;
  signatureText?: string | null;
  companyName?: string | null;
  phone?: string | null;
  email?: string | null;
}): string {
  const signOff = String(input.signOff ?? "").trim() || "Cordialement,";
  const sig = String(input.signatureText ?? "").trim();
  if (sig) return `${signOff}\n${sig}`.trim();
  const bits = [
    String(input.companyName ?? "").trim(),
    String(input.phone ?? "").trim(),
    String(input.email ?? "").trim(),
  ].filter(Boolean);
  return `${signOff}\n${bits.join("\n")}`.trim();
}
