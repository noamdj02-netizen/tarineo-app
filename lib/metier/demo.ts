/** Jeu d’exemple Dupont. Données fictives, toujours marquées comme telles. */

export const DEMO_NOTE = "Exemple";

export const DEMO_IDS = {
  client: "demo-client-dupont",
  dist: "demo-dist-cedeo",
  fourn: "demo-fourn-nicoll",
  product: "demo-prod-pvc-500",
  chantier: "demo-chantier-dupont",
  docIn: "demo-doc-devis-cedeo",
  docOut: "demo-doc-devis-client",
  alert: "demo-alert-pvc",
} as const;

export function demoNow() {
  return new Date().toISOString();
}
