#!/usr/bin/env node
/** Capture une seule page → Figma. Usage: node scripts/capture-one-page.mjs /onboarding <captureId> */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const path = process.argv[2];
const captureId = process.argv[3];
if (!path || !captureId) {
  console.error("Usage: node scripts/capture-one-page.mjs /onboarding <captureId>");
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROFILE = join(__dirname, "..", ".figma-capture-profile");
const BASE = process.env.CAPTURE_BASE ?? "http://localhost:3000";
const isLocal = BASE.includes("localhost") || BASE.includes("127.0.0.1");
const CAPTURE_JS = "https://mcp.figma.com/mcp/html-to-design/capture.js";
const endpoint = `https://mcp.figma.com/mcp/capture/${captureId}/submit?bindVariables=true`;

mkdirSync(PROFILE, { recursive: true });

const context = await chromium.launchPersistentContext(PROFILE, {
  headless: false,
  viewport: { width: 1440, height: 900 },
  locale: "fr-FR",
});

const page = context.pages()[0] ?? await context.newPage();

try {
  if (!isLocal) {
    await page.route("**/*", async (route) => {
      const response = await route.fetch();
      const headers = { ...response.headers() };
      delete headers["content-security-policy"];
      delete headers["content-security-policy-report-only"];
      await route.fulfill({ response, headers });
    });
  }

  async function gotoTarget() {
    await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForLoadState("networkidle", { timeout: 45000 }).catch(() => {});
  }

  console.log(`→ ${BASE}${path}`);
  await gotoTarget();

  if (page.url().includes("/connexion")) {
    console.log("⏳ Connectez-vous dans Chromium (2 min) — ne fermez pas la fenêtre…");
    await page.waitForURL((u) => !u.toString().includes("/connexion"), { timeout: 120000 });
    await gotoTarget();
  }

  await page.waitForSelector("text=Bonjour", { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3000);

  async function ensureCaptureScript() {
    const res = await page.context().request.get(CAPTURE_JS);
    await page.evaluate((s) => {
      if (!window.figma?.captureForDesign) {
        const el = document.createElement("script");
        el.textContent = s;
        document.head.appendChild(el);
      }
    }, await res.text());
    await page.waitForTimeout(1500);
    await page.waitForFunction(() => typeof window.figma?.captureForDesign === "function", { timeout: 20000 });
  }

  await ensureCaptureScript();

  const result = await page.evaluate(
    async ({ captureId, endpoint }) =>
      window.figma.captureForDesign({ captureId, endpoint, selector: "body" }),
    { captureId, endpoint },
  );

  console.log(result?.error ? `✗ ${result.error}` : "✓ Page envoyée vers Figma");
  console.log(`Capture ID: ${captureId}`);
} finally {
  await page.waitForTimeout(2000);
  await context.close();
}
