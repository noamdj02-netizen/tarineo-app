#!/usr/bin/env node
/** Envoie le cache /tmp/navpit-all-emails.json via Resend (fallback). */
import { readFileSync, existsSync } from "node:fs";

const cache = "/tmp/navpit-all-emails.json";
const to = process.argv[2] ?? "noamdj02@gmail.com";
const key = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM ?? "TARINEO <contact@tarineo.fr>";

if (!key) {
  console.error("RESEND_API_KEY manquant. Ajoute-le dans .env.local puis :");
  console.error("  npx tsx --env-file=.env.local scripts/send-test-emails.ts", to);
  process.exit(1);
}

if (!existsSync(cache)) {
  console.error("Cache manquant:", cache);
  console.error("Génère-le avec : npx tsx --env-file=.env.local scripts/send-test-emails.ts --render-only");
  process.exit(1);
}

const emails = JSON.parse(readFileSync(cache, "utf8"));

for (const { subject, html } of emails) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });
  const body = await res.json();
  if (!res.ok) console.error("✗", subject, body);
  else console.log("✓", subject, body.id);
}
