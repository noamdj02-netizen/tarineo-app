/**
 * Rend le mail check-in en HTML + cadres Gmail (desktop / mobile).
 * N’envoie rien.
 * Usage: npx tsx scripts/preview-check-in-email.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import React from "react";
import { render } from "@react-email/render";
import { CheckInEmail, CHECK_IN_SUBJECT } from "@/emails/check-in";

(globalThis as typeof globalThis & { React: typeof React }).React = React;

async function main() {
  const html = await render(
    CheckInEmail({ firstName: "Camille", appUrl: "https://www.navpit.com" }),
  );

  mkdirSync("/opt/cursor/artifacts/emails", { recursive: true });
  writeFileSync("/opt/cursor/artifacts/emails/check-in.html", html);

  const gmailDesktop = `<!doctype html><html><head><meta charset="utf-8"><style>
body{margin:0;background:#f6f8fc;font-family:Roboto,Arial,sans-serif;color:#202124}
.app{max-width:960px;margin:24px auto;background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,.12);overflow:hidden}
.top{display:flex;align-items:center;gap:12px;padding:12px 20px;border-bottom:1px solid #e8eaed}
.avatar{width:40px;height:40px;border-radius:50%;background:#111;color:#fff;display:grid;place-items:center;font-weight:600}
.meta{flex:1;min-width:0}
.from{font-weight:600;font-size:14px}
.email{color:#5f6368;font-size:12px}
.subject{padding:16px 20px 8px;font-size:22px;font-weight:400}
.snippet{padding:0 20px 16px;color:#5f6368;font-size:13px;border-bottom:1px solid #e8eaed}
.body{background:#e8e7e5;padding:16px}
</style></head><body><div class="app">
<div class="top"><div class="avatar">N</div><div class="meta"><div class="from">Noam de Navpit</div><div class="email">à moi · bonjour@navpit.com</div></div></div>
<div class="subject">${CHECK_IN_SUBJECT}</div>
<div class="snippet">Juste un check rapide — tu peux me répondre en deux phrases.</div>
<div class="body">${html}</div>
</div></body></html>`;

  const gmailMobile = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
body{margin:0;background:#fff;font-family:Roboto,Arial,sans-serif;color:#202124}
.bar{padding:10px 16px;border-bottom:1px solid #e8eaed;font-size:13px;color:#5f6368}
.from{padding:14px 16px 4px;font-weight:600;font-size:15px}
.to{padding:0 16px 12px;font-size:12px;color:#5f6368;border-bottom:1px solid #e8eaed}
.subject{padding:14px 16px 6px;font-size:20px}
.snippet{padding:0 16px 14px;font-size:13px;color:#5f6368;border-bottom:1px solid #e8eaed}
.body{background:#e8e7e5;padding:8px}
</style></head><body>
<div class="bar">Boîte de réception</div>
<div class="from">Noam de Navpit</div>
<div class="to">à moi</div>
<div class="subject">${CHECK_IN_SUBJECT}</div>
<div class="snippet">Juste un check rapide — tu peux me répondre en deux phrases.</div>
<div class="body">${html}</div>
</body></html>`;

  writeFileSync("/opt/cursor/artifacts/emails/check-in-gmail-desktop.html", gmailDesktop);
  writeFileSync("/opt/cursor/artifacts/emails/check-in-gmail-mobile.html", gmailMobile);
  console.log("ok", html.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
