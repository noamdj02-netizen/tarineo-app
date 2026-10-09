import assert from "node:assert/strict";
import { test } from "node:test";
import {
  extractLogoUrlHint,
  fallbackExtractEmailSignature,
  stripEmailHtml,
} from "@/lib/metier/email-signature-parse";

test("stripEmailHtml conserve les sauts de ligne utiles", () => {
  const out = stripEmailHtml("<p>Bonjour</p><br/>Cordialement,<br/>Jean");
  assert.match(out, /Bonjour/);
  assert.match(out, /Cordialement/);
  assert.match(out, /Jean/);
});

test("fallbackExtractEmailSignature lit Cordialement + bloc", () => {
  const raw = `Bonjour,

Voici le devis.

Cordialement,
Jean Dupont
SARL Toiture
06 12 34 56 78
`;
  const out = fallbackExtractEmailSignature(raw);
  assert.match(out.signOff, /Cordialement/i);
  assert.match(out.signatureText, /Jean Dupont/);
  assert.match(out.signatureText, /SARL Toiture/);
  assert.equal(out.fromName, "Jean Dupont");
});

test("extractLogoUrlHint ignore les pixels de tracking", () => {
  const html = `
    <img src="https://track.example/pixel.gif" />
    <img src="https://cdn.example/logo.png" alt="logo" />
  `;
  assert.equal(extractLogoUrlHint(html), "https://cdn.example/logo.png");
});
