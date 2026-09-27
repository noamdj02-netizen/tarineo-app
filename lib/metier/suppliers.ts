/** Enseignes connues : logo via logo.dev (domaine). */

export const KNOWN_SUPPLIERS: { name: string; domain: string; kind: "distributeur" | "fournisseur" }[] = [
  { name: "Cedeo", domain: "cedeo.fr", kind: "distributeur" },
  { name: "Point.P", domain: "pointp.fr", kind: "distributeur" },
  { name: "Rexel", domain: "rexel.fr", kind: "distributeur" },
  { name: "Brossette", domain: "brossette.fr", kind: "distributeur" },
  { name: "Richardson", domain: "richardson.fr", kind: "distributeur" },
  { name: "Aubade", domain: "aubade.fr", kind: "distributeur" },
  { name: "Zima", domain: "zima.fr", kind: "distributeur" },
  { name: "Marlin", domain: "marlin.fr", kind: "distributeur" },
];

export function supplierDomains(): Record<string, string> {
  return Object.fromEntries(KNOWN_SUPPLIERS.map((s) => [s.name, s.domain]));
}
