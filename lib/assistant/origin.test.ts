import assert from "node:assert/strict";
import test from "node:test";
import { allowedOrigins, isAllowedOrigin } from "@/lib/assistant/origin";

function req(init: { origin?: string | null; host?: string; url?: string; site?: string }) {
  const headers = new Headers();
  if (init.origin) headers.set("origin", init.origin);
  if (init.host) headers.set("host", init.host);
  if (init.site) headers.set("sec-fetch-site", init.site);
  return new Request(init.url ?? "https://app.tarineo.com/api/assistant", { method: "POST", headers });
}

const prod: NodeJS.ProcessEnv = {
  NODE_ENV: "production",
  VERCEL_ENV: "production",
  NEXT_PUBLIC_APP_URL: "https://app.tarineo.com",
};

const dev: NodeJS.ProcessEnv = {
  NODE_ENV: "development",
  NEXT_PUBLIC_APP_URL: "https://app.tarineo.com",
};

test("allowlist prod contient app.tarineo.com, pas navpit", () => {
  const set = allowedOrigins(prod);
  assert.ok(set.has("https://app.tarineo.com"));
  assert.ok(![...set].some((o) => /navpit/i.test(o)));
});

test("Origin app.tarineo.com → autorisé", () => {
  const d = isAllowedOrigin(req({ origin: "https://app.tarineo.com", host: "app.tarineo.com" }), prod);
  assert.equal(d.ok, true);
});

test("localhost en développement → autorisé", () => {
  const d = isAllowedOrigin(
    req({ origin: "http://localhost:3000", host: "localhost:3000", url: "http://localhost:3000/api/assistant" }),
    dev,
  );
  assert.equal(d.ok, true);
});

test("127.0.0.1 en développement → autorisé", () => {
  const d = isAllowedOrigin(
    req({ origin: "http://127.0.0.1:3000", host: "127.0.0.1:3000", url: "http://127.0.0.1:3000/api/assistant" }),
    dev,
  );
  assert.equal(d.ok, true);
});

test("127.0.0.1 Origin vs localhost Host en dev → autorisé (corrige le 403 Playwright)", () => {
  const d = isAllowedOrigin(
    req({ origin: "http://127.0.0.1:3000", host: "localhost:3000", url: "http://localhost:3000/api/assistant" }),
    dev,
  );
  assert.equal(d.ok, true);
});

test("localhost en production → 403", () => {
  const d = isAllowedOrigin(
    req({ origin: "http://localhost:3000", host: "app.tarineo.com" }),
    prod,
  );
  assert.equal(d.ok, false);
  if (!d.ok) assert.equal(d.reason, "denied");
});

test("origin inconnue → 403", () => {
  const d = isAllowedOrigin(req({ origin: "https://evil.example.com", host: "app.tarineo.com" }), prod);
  assert.equal(d.ok, false);
});

test("navpit.com → 403", () => {
  const d = isAllowedOrigin(req({ origin: "https://navpit.com", host: "app.tarineo.com" }), prod);
  assert.equal(d.ok, false);
});

test("origin malformée → 403", () => {
  const d = isAllowedOrigin(req({ origin: "not a url", host: "app.tarineo.com" }), prod);
  assert.equal(d.ok, false);
  if (!d.ok) assert.equal(d.reason, "malformed");
});

test("Origin absent + same-origin + Host autorisé → ok", () => {
  const d = isAllowedOrigin(
    req({ origin: null, host: "app.tarineo.com", site: "same-origin" }),
    prod,
  );
  assert.equal(d.ok, true);
});

test("Origin absent + cross-site → 403", () => {
  const d = isAllowedOrigin(
    req({ origin: null, host: "app.tarineo.com", site: "cross-site" }),
    prod,
  );
  assert.equal(d.ok, false);
});
