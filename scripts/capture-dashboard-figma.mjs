#!/usr/bin/env node
/**
 * Ouvre chaque page du dashboard dans le navigateur avec le hash Figma capture.
 *
 * Prérequis :
 *   1. `npm run dev` (le script Figma capture est injecté en dev dans layout.tsx)
 *   2. Être connecté à Tarinéo dans le navigateur (session active)
 *
 * Usage :
 *   node scripts/capture-dashboard-figma.mjs           # ouvre toutes les pages
 *   node scripts/capture-dashboard-figma.mjs accueil   # une seule page
 *   node scripts/capture-dashboard-figma.mjs --list      # liste sans ouvrir
 */
import { execSync } from "node:child_process";

const BASE = process.argv.includes("--base")
  ? process.argv[process.argv.indexOf("--base") + 1]
  : "http://localhost:3000";

const ENDPOINT_PREFIX = "https://mcp.figma.com/mcp/capture";

/** IDs générés via Figma MCP `generate_figma_design` — fichier TvO91gJNuCUY5YJ7X52FTY */
const PAGES = [
  { slug: "accueil", label: "Accueil", path: "/accueil", captureId: "37b18762-ff0a-468e-8fd0-aeb9a3c9989c" },
  { slug: "documents", label: "Documents (tous)", path: "/documents", captureId: "900c8906-a704-454b-9fa3-d2b653b0158e" },
  { slug: "devis-fournisseurs", label: "Devis fournisseurs", path: "/documents/devis-fournisseurs", captureId: "d41d1d1c-cd29-4440-bc8c-457e3d69932b" },
  { slug: "factures-fournisseurs", label: "Factures fournisseurs", path: "/documents/factures-fournisseurs", captureId: "9da49ae6-4a53-46db-88bf-dd7124443925" },
  { slug: "bons-commande", label: "Bons de commande", path: "/bons-de-commande", captureId: "85a241d7-12c0-483f-b55f-2a354d625944" },
  { slug: "bons-enlevement", label: "Bons d'enlèvement", path: "/bons-enlevement", captureId: "5bc96959-bf2b-42ad-b867-ada203dd45a3" },
  { slug: "fournisseurs", label: "Fournisseurs", path: "/fournisseurs", captureId: "56f8d5fd-9382-4ea9-8f31-f3ce7fc2b6bf" },
  { slug: "devis-clients", label: "Devis clients", path: "/devis-clients", captureId: "3d0ee459-060a-45b8-8ecf-1c5082ad0cbe" },
  { slug: "factures-clients", label: "Factures clients", path: "/factures-clients", captureId: "f0659b9c-11a4-4deb-9991-167417f84dec" },
  { slug: "clients", label: "Clients", path: "/clients", captureId: "903076d0-8d71-4ee1-9d07-03fdf00590b4" },
  { slug: "facturation", label: "Facturation électronique", path: "/facturation-clients", captureId: "ef5c26b7-aaef-4a19-adbd-4f1d255e21c7" },
  { slug: "parametres", label: "Paramètres", path: "/parametres", captureId: "fc164286-8a41-485b-9bb1-a8993bdca802" },
  { slug: "compte", label: "Mon compte", path: "/compte", captureId: "5e2ee4d0-51cb-47d0-af4a-f59fc87eae13" },
  { slug: "entreprise", label: "Mon entreprise", path: "/entreprise", captureId: "8d46a76b-80b4-4f9b-bd18-57548a645051" },
  { slug: "onboarding", label: "Onboarding", path: "/onboarding", captureId: "f2310770-d77b-43e1-ba3c-605c6677dc53" },
];

function captureUrl(path, captureId) {
  const endpoint = encodeURIComponent(`${ENDPOINT_PREFIX}/${captureId}/submit?bindVariables=true`);
  return `${BASE}${path}#figmacapture=${captureId}&figmaendpoint=${endpoint}&figmadelay=2500`;
}

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const listOnly = process.argv.includes("--list");
const targets = args.length
  ? PAGES.filter((p) => args.some((a) => p.slug === a || p.path.includes(a)))
  : PAGES;

if (targets.length === 0) {
  console.error("Aucune page correspondante. Slugs :", PAGES.map((p) => p.slug).join(", "));
  process.exit(1);
}

console.log(`Base : ${BASE}`);
console.log(`Fichier Figma : https://www.figma.com/design/TvO91gJNuCUY5YJ7X52FTY/Tarineo (page « App — Sync code »)\n`);

for (const page of targets) {
  const url = captureUrl(page.path, page.captureId);
  console.log(`${page.label} (${page.slug})`);
  console.log(`  ${url}\n`);
  if (!listOnly) {
    try {
      execSync(`open "${url}"`, { stdio: "ignore" });
    } catch {
      console.error("  → copiez l'URL manuellement");
    }
  }
}

if (!listOnly) {
  console.log("Sur chaque onglet : attendez le chargement complet, puis validez la barre Figma capture.");
  console.log("Astuce : capturez une page à la fois avec `node scripts/capture-dashboard-figma.mjs accueil`");
}
