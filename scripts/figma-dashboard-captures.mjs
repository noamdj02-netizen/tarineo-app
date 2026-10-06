#!/usr/bin/env node
/**
 * Ouvre une page locale avec la barre Figma html-to-design.
 *
 * Prérequis :
 * - `npm run dev` (souvent :3000, :3002 si occupé)
 * - `NEXT_PUBLIC_FIGMA_CAPTURE=1` dans .env.local + redémarrer le serveur
 * - captureId : Figma MCP `generate_figma_design` (file 9bFrz4hU7bEUcqpbKxYbTv)
 *
 * Usage :
 *   npm run figma:go              → ouvre /accueil (id dans .figma-capture-id)
 *   npm run figma:go:mobile       → même chose, fenêtre iPhone (390×844)
 *   npm run figma:go -- /hausses
 *   npm run figma:capture -- <uuid> [/chemin]
 *   npm run figma:capture -- --list
 *
 * Après la 1re capture, la barre Figma permet de naviguer dans l’app et re-capturer.
 */

const FILE_KEY = "9bFrz4hU7bEUcqpbKxYbTv";

/** Routes TARINEO utiles pour captures produit (lib/routes.ts + nav). */
const APP_ROUTES = [
  { path: "/accueil", label: "Accueil" },
  { path: "/hausses", label: "Hausses" },
  { path: "/achats/produits", label: "Achats — produits" },
  { path: "/achats/export", label: "Export compta" },
  { path: "/comparateur", label: "Comparateur" },
  { path: "/chantiers", label: "Chantiers" },
  { path: "/chantiers/dupont-sdb", label: "Chantier Dupont SDB" },
  { path: "/chantiers/martin-mise-aux-normes", label: "Chantier Martin" },
  { path: "/distributeur/devis", label: "Devis fournisseur" },
  { path: "/distributeur/facture", label: "Factures fournisseur" },
  { path: "/client/devis", label: "Devis client" },
  { path: "/client/bon-commande", label: "BC client" },
  { path: "/devis/analyser", label: "Analyser un devis" },
  { path: "/devis/nouveau", label: "Nouveau devis" },
  { path: "/copilote", label: "Copilote" },
  { path: "/relances", label: "Relances" },
  { path: "/fournisseurs", label: "Fournisseurs" },
  { path: "/parametres/entreprise", label: "Entreprise" },
  { path: "/parametres", label: "Paramètres" },
];

async function detectDevPort() {
  if (process.env.PORT) return Number(process.env.PORT);
  const { execSync } = await import("node:child_process");
  const candidates = [3000, 3002, 3001, 3003, 3004];
  for (const p of candidates) {
    try {
      const body = execSync(`curl -sf -m 2 http://localhost:${p}/accueil`, { encoding: "utf8" });
      if (/tarineo|accueil|NEXT_PUBLIC/i.test(body)) return p;
    } catch {
      /* try next */
    }
  }
  for (const p of candidates) {
    try {
      execSync(`curl -sf -o /dev/null -m 1 http://localhost:${p}/accueil`, { stdio: "ignore" });
      console.warn(`Port ${p} répond — vérifie que c’est bien \`npm run dev\` TARINEO.`);
      return p;
    } catch {
      /* try next */
    }
  }
  console.error("Aucun serveur sur /accueil. Lance : npm run dev");
  process.exit(1);
}

function normalizePath(raw) {
  const path = String(raw || "/accueil").trim();
  if (!path.startsWith("/")) return `/${path}`;
  return path;
}

const port = await detectDevPort();
const base = `http://localhost:${port}`;

function captureUrl(captureId, path, { mobile = false } = {}) {
  const endpoint = `https://mcp.figma.com/mcp/capture/${captureId}/submit?bindVariables=true`;
  const hash = new URLSearchParams({
    figmacapture: captureId,
    figmaendpoint: endpoint,
    figmadelay: mobile ? "4000" : "3000",
  });
  return `${base}${path}#${hash.toString()}`;
}

const IOS_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1";

async function openInBrowser(url, mobile) {
  const { execSync, spawn } = await import("node:child_process");
  const { existsSync } = await import("node:fs");
  if (process.platform === "darwin") {
    const chromeBin = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    if (mobile && existsSync(chromeBin)) {
      spawn(chromeBin, ["--new-window", "--window-size=390,844", `--user-agent=${IOS_UA}`, url], {
        detached: true,
        stdio: "ignore",
      }).unref();
      console.log("→ Chrome mobile (390×844, UA iPhone). DevTools : ⌥⌘I → icône téléphone si besoin.");
      return;
    }
    try {
      execSync(`open -a "Google Chrome" "${url}"`, { stdio: "ignore" });
    } catch {
      execSync(`open "${url}"`, { stdio: "ignore" });
    }
    console.log("→ Chrome ouvert (connecte-toi à TARINEO si besoin, puis valide la capture).");
    return;
  }
  execSync(`xdg-open "${url}"`, { stdio: "ignore" });
}

if (process.argv.includes("--list")) {
  console.log(`Figma file: https://www.figma.com/design/${FILE_KEY}/`);
  console.log("Crée une page dédiée « TARINEO captures » dans ce fichier.\n");
  for (const r of APP_ROUTES) {
    console.log(`- ${r.label.padEnd(28)} ${r.path}`);
  }
  console.log("\n1 captureId = 1ère page. Ensuite : barre Figma → naviguer → re-capturer.");
  process.exit(0);
}

const mobile = process.argv.includes("--mobile");
const cliArgs = process.argv.slice(2).filter((a) => a !== "--mobile");
const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
let captureId = cliArgs[0];
let pathArg = cliArgs[1];
if (captureId?.startsWith("/")) {
  pathArg = captureId;
  captureId = undefined;
}
if (!captureId || !uuidRe.test(captureId)) {
  const { readFileSync } = await import("node:fs");
  const { resolve } = await import("node:path");
  const idFile = resolve(import.meta.dirname, "../.figma-capture-id");
  try {
    captureId = readFileSync(idFile, "utf8").trim();
  } catch {
    console.error("Pas de captureId. Demande « relance capture figma » à Cursor, ou :");
    console.error("  npm run figma:capture -- <uuid> [/chemin]");
    process.exit(1);
  }
}
if (!uuidRe.test(captureId)) {
  console.error("UUID invalide dans .figma-capture-id");
  process.exit(1);
}
const path = normalizePath(pathArg);

const url = captureUrl(captureId, path, { mobile });
console.log(`\nPort: ${port}${mobile ? " · mode mobile" : ""}`);
console.log(`\nURL (si Chrome ne s’ouvre pas) :\n${url}\n`);
await openInBrowser(url, mobile);
