#!/usr/bin/env node
/**
 * Capture automatique dashboard + écrans de détail → Figma.
 *
 * Usage :
 *   npm run figma:capture                    # tout (listes + détails)
 *   npm run figma:capture -- details          # seulement les fiches (comme votre capture)
 *   npm run figma:capture -- document-detail  # une fiche document
 *
 * Prod (vos vraies données type F Agencement) :
 *   npm run figma:capture:prod -- details
 *
 * Ne fermez pas la fenêtre Chromium pendant la capture (~2 min).
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { STATIC_PAGES, DETAIL_TEMPLATES } from "./figma-capture-pages.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROFILE = join(__dirname, "..", ".figma-capture-profile");
const BASE = process.env.CAPTURE_BASE ?? "http://localhost:3000";
const FILE_KEY = "TvO91gJNuCUY5YJ7X52FTY";
const CAPTURE_JS = "https://mcp.figma.com/mcp/html-to-design/capture.js";
const isLocal = BASE.includes("localhost") || BASE.includes("127.0.0.1");

const args = process.argv.slice(2);
const onlyDetails = args.includes("details") || args.includes("detail");
const filterArgs = args.filter((a) => !["details", "detail"].includes(a));

// IDs Figma MCP (single-use — regénérer via Figma MCP si erreur 409)
let captureCounter = 0;
const CAPTURE_IDS = [
  "900c8906-a704-454b-9fa3-d2b653b0158e", "d41d1d1c-cd29-4440-bc8c-457e3d69932b",
  "9da49ae6-4a53-46db-88bf-dd7124443925", "85a241d7-12c0-483f-b55f-2a354d625944",
  "5bc96959-bf2b-42ad-b867-ada203dd45a3", "56f8d5fd-9382-4ea9-8f31-f3ce7fc2b6bf",
  "3d0ee459-060a-45b8-8ecf-1c5082ad0cbe", "be1dd2a2-1121-4ab1-8b40-6b86475bf25a",
  "f0659b9c-11a4-4deb-9991-167417f84dec", "903076d0-8d71-4ee1-9d07-03fdf00590b4",
  "ef5c26b7-aaef-4a19-adbd-4f1d255e21c7", "fc164286-8a41-485b-9bb1-a8993bdca802",
  "5e2ee4d0-51cb-47d0-af4a-f59fc87eae13", "8d46a76b-80b4-4f9b-bd18-57548a645051",
  "f2310770-d77b-43e1-ba3c-605c6677dc53", "f63fb3c1-d112-46d6-93c6-4cca629c738b",
  "e533dc1d-79b1-4015-a360-6c85696026f1", "57e9b326-4ee5-42ca-82c4-a553d3aeb2a4",
  "c8f4e901-1111-4222-8333-444455556666", "d9e5f012-2222-4333-9444-555566667777",
];
function nextCaptureId() {
  const id = CAPTURE_IDS[captureCounter % CAPTURE_IDS.length];
  captureCounter++;
  return id;
}

mkdirSync(PROFILE, { recursive: true });

async function injectCaptureScript(page) {
  if (!isLocal) {
    await page.route("**/*", async (route) => {
      const response = await route.fetch();
      const headers = { ...response.headers() };
      delete headers["content-security-policy"];
      delete headers["content-security-policy-report-only"];
      await route.fulfill({ response, headers });
    });
  }

  const res = await page.context().request.get(CAPTURE_JS);
  const script = await res.text();
  await page.evaluate((s) => {
    if (!document.querySelector("[data-figma-capture]")) {
      const el = document.createElement("script");
      el.setAttribute("data-figma-capture", "1");
      el.textContent = s;
      document.head.appendChild(el);
    }
  }, script);
}

function isAuthPage(url) {
  return url.includes("/connexion") || url.includes("/inscription");
}

async function safeWait(page, ms) {
  if (page.isClosed()) throw new Error("Fenêtre fermée — ne fermez pas Chromium pendant la capture");
  await page.waitForTimeout(ms);
}

async function waitForLogin(page) {
  await page.goto(`${BASE}/accueil`, { waitUntil: "domcontentloaded", timeout: 60000 });
  if (!isAuthPage(page.url())) {
    await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
    return;
  }
  console.log("\n⏳ Connectez-vous dans Chromium (2 min max). Ne fermez pas la fenêtre.\n");
  await page.waitForURL((url) => !isAuthPage(url.toString()), { timeout: 120000 });
  await page.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => {});
  await safeWait(page, 2000);
}

async function findFirstLink(page, listPath, pattern) {
  await page.goto(`${BASE}${listPath}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  await safeWait(page, 1500);

  return page.evaluate((patternSource) => {
    const re = new RegExp(patternSource);
    for (const a of document.querySelectorAll("a[href]")) {
      const href = a.getAttribute("href")?.split("?")[0] ?? "";
      if (re.test(href)) return href;
    }
    return null;
  }, pattern.source);
}

async function discoverDetailPages(page) {
  const pages = [];
  for (const tpl of DETAIL_TEMPLATES) {
    const path = await findFirstLink(page, tpl.listPath, tpl.linkPattern);
    if (path) {
      pages.push({
        slug: tpl.slug,
        label: tpl.label,
        path,
        captureId: nextCaptureId(),
      });
      console.log(`   → ${tpl.label}: ${path}`);
    } else {
      console.log(`   ⚠ ${tpl.label}: aucun lien trouvé (liste vide)`);
    }
  }
  return pages;
}

async function capturePage(page, { label, path, captureId }) {
  const endpoint = `https://mcp.figma.com/mcp/capture/${captureId}/submit?bindVariables=true`;
  const url = `${BASE}${path}`;

  console.log(`📸 ${label}…`);

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      if (page.isClosed()) throw new Error("Fenêtre fermée");

      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
      await page.waitForLoadState("networkidle", { timeout: 45000 }).catch(() => {});
      await safeWait(page, 4000);
      await injectCaptureScript(page);

      await page.waitForFunction(
        () => typeof window.figma?.captureForDesign === "function",
        { timeout: 20000 },
      );

      const result = await page.evaluate(
        async ({ captureId, endpoint }) =>
          window.figma.captureForDesign({ captureId, endpoint, selector: "body" }),
        { captureId, endpoint },
      );

      if (result?.ok === false || result?.error) {
        console.error(`   ✗ ${result?.error ?? JSON.stringify(result)}`);
        return false;
      }
      console.log(`   ✓ envoyé → Figma`);
      return true;
    } catch (err) {
      if (attempt === 2 || err.message.includes("fermée")) {
        console.error(`   ✗ ${err.message}`);
        return false;
      }
      await safeWait(page, 2000).catch(() => {});
    }
  }
  return false;
}

const context = await chromium.launchPersistentContext(PROFILE, {
  headless: false,
  viewport: { width: 1440, height: 900 },
  locale: "fr-FR",
});

const page = context.pages()[0] ?? await context.newPage();

try {
  console.log(`Base: ${BASE}${isLocal ? "" : " (prod — injection script Figma)"}`);
  console.log(`Fichier: https://www.figma.com/design/${FILE_KEY}/Tarineo\n`);

  await waitForLogin(page);

  let targets = [];

  if (onlyDetails || filterArgs.some((a) => DETAIL_TEMPLATES.some((t) => t.slug === a))) {
    console.log("Découverte des fiches détail…");
    const details = await discoverDetailPages(page);
    targets = filterArgs.length
      ? details.filter((p) => filterArgs.some((a) => p.slug === a))
      : details;
  } else if (filterArgs.length) {
    targets = STATIC_PAGES
      .filter((p) => filterArgs.some((a) => p.slug === a || p.path.includes(a)))
      .map((p) => ({ ...p, captureId: nextCaptureId() }));
  } else {
    console.log("Découverte des fiches détail…");
    const details = await discoverDetailPages(page);
    targets = [
      ...STATIC_PAGES.map((p) => ({ ...p, captureId: nextCaptureId() })),
      ...details,
    ];
  }

  if (targets.length === 0) {
    console.error("Aucune page à capturer.");
    process.exit(1);
  }

  let ok = 0;
  for (const p of targets) {
    if (await capturePage(page, p)) ok++;
    try {
      await safeWait(page, 2500);
    } catch {
      break;
    }
  }

  console.log(`\n✅ ${ok}/${targets.length} pages dans Figma → page « App — Sync code »`);
} catch (err) {
  console.error("\n❌", err.message);
  process.exit(1);
} finally {
  if (!page.isClosed()) await context.close().catch(() => {});
}
