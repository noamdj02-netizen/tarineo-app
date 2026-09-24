#!/usr/bin/env node
/** Lit /tmp/navpit-all-emails.json ou regénère via tsx, puis envoie via Resend. */
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cache = "/tmp/navpit-all-emails.json";
const to = process.argv[2] ?? "noamdj02@gmail.com";
const key = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM ?? "Navpit <bonjour@navpit.com>";

if (!key) {
  console.error("RESEND_API_KEY manquant. Ajoute-le dans .env.local puis :");
  console.error("  npx tsx --env-file=.env.local scripts/send-test-emails.ts", to);
  process.exit(1);
}

async function ensureCache() {
  if (existsSync(cache)) return JSON.parse(readFileSync(cache, "utf8"));
  await new Promise((resolve, reject) => {
    const p = spawn("npx", ["tsx", join(root, "scripts/send-test-emails.ts"), "--render-only", to], {
      cwd: root,
      stdio: ["ignore", "pipe", "inherit"],
      env: { ...process.env, RENDER_ONLY: "1" },
    });
    let out = "";
    p.stdout.on("data", (d) => (out += d));
    p.on("close", (code) => (code === 0 ? resolve(out) : reject(new Error("render failed"))));
  });
  return JSON.parse(readFileSync(cache, "utf8"));
}

// send-test-emails handles send; this file is fallback using cache + fetch
const emails = JSON.parse(readFileSync(cache, "utf8"));

for (const { subject, html } of emails) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
      text: `${subject} — ouvre cet email en HTML pour la preview Navpit.`,
    }),
  });
  const body = await res.json();
  if (!res.ok) console.error("✗", subject, body);
  else console.log("✓", subject, body.id);
  await new Promise((r) => setTimeout(r, 400));
}
