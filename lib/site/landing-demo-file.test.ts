import assert from "node:assert/strict";
import test from "node:test";
import { detectLandingDemoMime, validateLandingDemoFile } from "@/lib/site/landing-demo-file";

test("detectLandingDemoMime reconnaît un PDF", () => {
  const buf = Buffer.alloc(12, 0);
  buf.write("%PDF-1.4", 0);
  assert.equal(detectLandingDemoMime(buf), "application/pdf");
});

test("validateLandingDemoFile rejette un fichier vide", () => {
  const r = validateLandingDemoFile("x.pdf", "application/pdf", Buffer.alloc(0));
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.message, /vide/i);
});
