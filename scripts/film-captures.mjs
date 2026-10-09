#!/usr/bin/env node
/**
 * Captures PNG pour le film — 1920×1080, deviceScaleFactor 2.
 * Prérequis : `npm run dev` + TARINEO_OPEN_ACCESS=true dans .env.local
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const OUT = path.resolve("docs/film/captures");
const VIEWPORT = { width: 1920, height: 1080 };
const NAV = { waitUntil: "domcontentloaded", timeout: 120_000 };

async function goto(page, url) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await page.goto(url, NAV);
      return;
    } catch (e) {
      if (attempt === 2) throw e;
      console.warn(`goto retry (${attempt}/2):`, url);
      await page.waitForTimeout(2000);
    }
  }
}

async function port() {
  if (process.env.PORT) return Number(process.env.PORT);
  for (const p of [3000, 3002, 3001]) {
    try {
      const res = await fetch(`http://localhost:${p}/api/film/demo-ids`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return p;
    } catch {
      /* next */
    }
  }
  throw new Error("Serveur dev introuvable (npm run dev + open access).");
}

async function shot(page, name, opts = {}) {
  const file = path.join(OUT, name);
  await page.screenshot({ path: file, fullPage: false, ...opts });
  console.log("wrote", file);
}

async function main() {
  const basePort = await port();
  const base = `http://localhost:${basePort}`;
  const ids = await (await fetch(`${base}/api/film/demo-ids`)).json();
  if (!ids.docOut) throw new Error("Seed démo incomplet — rechargez /accueil puis réessayez.");

  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    colorScheme: "light",
  });
  const page = await context.newPage();
  await page.addStyleTag({ content: "[data-copilot-fab]{display:none!important}" });

  await goto(page, `${base}/accueil`);
  await shot(page, "01-accueil.png");

  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.getByRole("button", { name: "Documents fournisseur" }).click();
  await page.getByRole("button", { name: "Documents entreprise" }).click();
  await page.waitForTimeout(400);
  await shot(page, "02-sidebar.png");

  await goto(page, `${base}/devis/analyser?film=lecture`);
  await page.waitForSelector("text=Transformer le fichier", { timeout: 15000 });
  await shot(page, "06-analyse.png");

  await goto(page, `${base}/pieces/${ids.docOut}`);
  await page.waitForTimeout(800);
  await shot(page, "08-piece-devis-client.png");

  await goto(page, `${base}/client/devis`);
  await page.waitForSelector("text=Prêt", { timeout: 10000 }).catch(() => null);
  await shot(page, "13-client-devis.png");

  await goto(page, `${base}/relances`);
  await page.getByRole("heading", { name: "Relances" }).waitFor({ state: "visible", timeout: 30_000 });
  await page.locator("table.app-table").getByRole("button", { name: "Relancer" }).first().waitFor({
    state: "visible",
    timeout: 15_000,
  });
  await shot(page, "12-relances.png");
  await page.locator("table.app-table").getByRole("button", { name: "Relancer" }).first().click();
  await page.waitForSelector("#relance-title", { timeout: 8000 });
  await page.waitForTimeout(500);
  await shot(page, "12b-relance-dialog.png");

  await goto(page, `${base}/hausses`);
  await shot(page, "14-hausses.png");

  await goto(page, `${base}/achats/produits/${ids.productSlug}`);
  await shot(page, "15-produit.png");

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
