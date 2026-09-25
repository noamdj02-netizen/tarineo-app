#!/usr/bin/env node
/**
 * Ouvre une page du dashboard local avec les paramètres Figma html-to-design.
 *
 * Prérequis :
 * - `npm run dev` (port 3000 ou 3001)
 * - `NEXT_PUBLIC_FIGMA_CAPTURE=1` dans .env.local puis redémarrer le serveur
 * - Un captureId Figma (généré via MCP generate_figma_design sur le file 9bFrz4hU7bEUcqpbKxYbTv)
 *
 * Usage :
 *   node scripts/figma-dashboard-captures.mjs e3b35baf-.... /accueil
 *   (remplace par un vrai UUID — pas les chevrons <captureId>)
 *   node scripts/figma-dashboard-captures.mjs --list
 */

const FILE_KEY = "9bFrz4hU7bEUcqpbKxYbTv";

/** Routes principales (lib/nav.ts) + compte / abonnement */
const DASHBOARD_ROUTES = [
  { path: "/accueil", label: "Accueil" },
  { path: "/copilote", label: "Copilote" },
  { path: "/automatisations", label: "Automatisations" },
  { path: "/projets", label: "Projets" },
  { path: "/ressources", label: "Ressources" },
  { path: "/schemas", label: "Schémas" },
  { path: "/anatomie", label: "Anatomie" },
  { path: "/composants", label: "Composants" },
  { path: "/composants-2", label: "Composants 2" },
  { path: "/themes", label: "Thèmes" },
  { path: "/outils", label: "Outils" },
  { path: "/audit", label: "Mes sites" },
  { path: "/compte", label: "Compte" },
  { path: "/abonnement", label: "Abonnement" },
];

async function detectDevPort() {
  if (process.env.PORT) return Number(process.env.PORT);
  const { execSync } = await import("node:child_process");
  const candidates = [3000, 3001, 3004, 3002, 3003];
  for (const p of candidates) {
    try {
      const body = execSync(`curl -sf -m 2 http://localhost:${p}/accueil`, { encoding: "utf8" });
      if (body.includes("Navpit") || body.includes("navpit")) return p;
    } catch {
      /* try next */
    }
  }
  for (const p of candidates) {
    try {
      execSync(`curl -sf -o /dev/null -m 1 http://localhost:${p}/accueil`, { stdio: "ignore" });
      console.warn(`Port ${p} répond mais sans « Navpit » dans le HTML — vérifie que c’est le bon serveur.`);
      return p;
    } catch {
      /* try next */
    }
  }
  console.error("Aucun serveur Navpit sur /accueil. Lance npm run dev puis PORT=xxxx si besoin.");
  process.exit(1);
}

function normalizePath(raw) {
  const path = String(raw || "/accueil").trim().replace(/\$$/, "");
  if (!path.startsWith("/")) return `/${path}`;
  return path;
}

const port = await detectDevPort();
const base = `http://localhost:${port}`;

function captureUrl(captureId, path) {
  const endpoint = `https://mcp.figma.com/mcp/capture/${captureId}/submit?bindVariables=true`;
  const hash = new URLSearchParams({
    figmacapture: captureId,
    figmaendpoint: endpoint,
    figmadelay: "3000",
  });
  return `${base}${path}#${hash.toString()}`;
}

if (process.argv.includes("--list")) {
  console.log(`Figma file: https://www.figma.com/design/${FILE_KEY}/`);
  console.log("Crée une page « Dashboard Navpit » dans ce fichier (ne pas coller sur la landing 7:2).\n");
  for (const r of DASHBOARD_ROUTES) {
    console.log(`- ${r.label.padEnd(16)} ${r.path}`);
  }
  console.log("\n1 captureId = 1 page. Après la 1re capture, la barre Figma permet de naviguer et re-capturer.");
  process.exit(0);
}

const [, , captureId, pathArg] = process.argv;
const path = normalizePath(pathArg);
const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (!captureId || !uuidRe.test(captureId)) {
  console.error("Usage: node scripts/figma-dashboard-captures.mjs <captureId-uuid> [/chemin]");
  console.error("       node scripts/figma-dashboard-captures.mjs --list");
  console.error("\nGénère le captureId via Figma MCP (generate_figma_design), pas le texte <captureId>.");
  process.exit(1);
}

const url = captureUrl(captureId, path);
console.log(`\nPort détecté: ${port}`);
console.log(`\nCopie-colle cette URL dans Chrome si aucun onglet ne s’ouvre :\n`);
console.log(url);
console.log("");
if (process.platform === "darwin") {
  const { execSync } = await import("node:child_process");
  try {
    execSync(`open -a "Google Chrome" "${url}"`, { stdio: "ignore" });
    console.log("→ Onglet ouvert dans Google Chrome.");
  } catch {
    execSync(`open "${url}"`, { stdio: "ignore" });
    console.log("→ Onglet ouvert (navigateur par défaut).");
  }
}
