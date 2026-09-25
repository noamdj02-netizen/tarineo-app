#!/usr/bin/env node
/**
 * Capture automatique app → Figma (html-to-design).
 *
 * Usage :
 *   npm run figma:capture                         # desktop, listes + détails
 *   npm run figma:capture -- --mobile             # viewport mobile (427×952)
 *   npm run figma:capture -- --both                # desktop puis mobile
 *   npm run figma:capture -- details              # fiches détail seulement
 *   npm run figma:capture -- accueil              # une page (slug)
 *
 * Prod :
 *   npm run figma:capture:prod
 *   CAPTURE_BASE=https://app.tarineo.com npm run figma:capture -- --mobile
 *
 * Fichier Figma : https://www.figma.com/design/TvO91gJNuCUY5YJ7X52FTY/Tarineo
 * Ne fermez pas Chromium pendant la capture.
 */
import { chromium } from "playwright";
import { mkdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  STATIC_PAGES,
  MOBILE_STATIC_PAGES,
  DETAIL_TEMPLATES,
  MOBILE_DETAIL_TEMPLATES,
} from "./figma-capture-pages.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROFILE = join(__dirname, "..", ".figma-capture-profile");
const POOL_PATH = join(__dirname, "figma-capture-id-pool.json");
const BASE = process.env.CAPTURE_BASE ?? "http://localhost:3000";
const FILE_KEY = "TvO91gJNuCUY5YJ7X52FTY";
const CAPTURE_JS = "https://mcp.figma.com/mcp/html-to-design/capture.js";
const isLocal = BASE.includes("localhost") || BASE.includes("127.0.0.1");

const args = process.argv.slice(2);
const onlyDetails = args.includes("details") || args.includes("detail");
const modeMobile = args.includes("mobile");
const modeBoth = args.includes("both");
const filterArgs = args.filter((a) => !["details", "detail", "mobile", "both"].includes(a));

const VIEWPORT_DESKTOP = { width: 1440, height: 900 };
const VIEWPORT_MOBILE = { width: 427, height: 952 };

function loadCapturePool() {
  if (existsSync(POOL_PATH)) {
    const data = JSON.parse(readFileSync(POOL_PATH, "utf8"));
    if (Array.isArray(data.pool) && data.pool.length > 0) return [...data.pool];
  }
  console.warn("⚠ Pool vide — ajoutez des IDs dans scripts/figma-capture-id-pool.json (Figma MCP generate_figma_design).");
  return [];
}

let capturePool = loadCapturePool();
let captureCounter = 0;

function nextCaptureId() {
  if (captureCounter >= capturePool.length) {
    throw new Error(
      `Plus d'IDs de capture (${captureCounter} utilisés). Regénérez le pool via Figma MCP (generate_figma_design) et mettez à jour figma-capture-id-pool.json.`,
    );
  }
  return capturePool[captureCounter++];
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

async function discoverDetailPages(page, templates) {
  const pages = [];
  for (const tpl of templates) {
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
  const url = path.startsWith("/") ? `${BASE}${path}` : `${BASE}/${path}`;

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

function buildTargets({ mobile }) {
  const staticPages = mobile ? MOBILE_STATIC_PAGES : STATIC_PAGES;
  const detailTemplates = mobile ? MOBILE_DETAIL_TEMPLATES : DETAIL_TEMPLATES;

  if (onlyDetails || filterArgs.some((a) => detailTemplates.some((t) => t.slug === a || t.slug.replace("-mobile", "") === a))) {
    return { staticPages: [], detailTemplates, filterDetails: true };
  }
  if (filterArgs.length) {
    return {
      staticPages: staticPages.filter((p) => filterArgs.some((a) => p.slug === a || p.slug.replace("-mobile", "") === a || p.path.includes(a))),
      detailTemplates: [],
      filterDetails: false,
    };
  }
  return { staticPages, detailTemplates, filterDetails: false };
}

async function runPass(page, { mobile, labelPass }) {
  console.log(`\n—— ${labelPass} ——\n`);
  await page.setViewportSize(mobile ? VIEWPORT_MOBILE : VIEWPORT_DESKTOP);

  const { staticPages, detailTemplates, filterDetails } = buildTargets({ mobile });
  let targets = [];

  if (filterDetails || onlyDetails) {
    console.log("Découverte des fiches détail…");
    const details = await discoverDetailPages(page, detailTemplates);
    targets = filterArgs.length
      ? details.filter((p) => filterArgs.some((a) => p.slug === a || p.slug.replace("-mobile", "") === a))
      : details;
  } else {
    console.log("Découverte des fiches détail…");
    const details = await discoverDetailPages(page, detailTemplates);
    targets = [
      ...staticPages.map((p) => ({ ...p, captureId: nextCaptureId() })),
      ...details,
    ];
  }

  if (targets.length === 0) {
    console.error("Aucune page à capturer pour ce passage.");
    return 0;
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
  console.log(`\n✅ ${labelPass} : ${ok}/${targets.length} pages envoyées`);
  return ok;
}

const context = await chromium.launchPersistentContext(PROFILE, {
  headless: false,
  viewport: VIEWPORT_DESKTOP,
  locale: "fr-FR",
});

const page = context.pages()[0] ?? await context.newPage();

try {
  console.log(`Base: ${BASE}${isLocal ? "" : " (prod)"}`);
  console.log(`Fichier: https://www.figma.com/design/${FILE_KEY}/Tarineo\n`);
  console.log(`IDs disponibles dans le pool : ${capturePool.length}`);

  await waitForLogin(page);

  let totalOk = 0;
  if (modeBoth) {
    totalOk += await runPass(page, { mobile: false, labelPass: "Desktop 1440×900" });
    totalOk += await runPass(page, { mobile: true, labelPass: "Mobile 427×952" });
  } else {
    totalOk += await runPass(page, {
      mobile: modeMobile,
      labelPass: modeMobile ? "Mobile 427×952" : "Desktop 1440×900",
    });
  }

  console.log(`\n🎨 Total : ${totalOk} capture(s) → Figma (page « App — Sync code » ou nouvelle page)`);
  if (captureCounter >= capturePool.length) {
    console.log("\n💡 Pool épuisé : demandez à l’agent de regénérer des IDs Figma avant la prochaine resync.");
  }
} catch (err) {
  console.error("\n❌", err.message);
  process.exit(1);
} finally {
  if (!page.isClosed()) await context.close().catch(() => {});
}
