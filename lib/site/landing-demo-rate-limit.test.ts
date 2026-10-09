import assert from "node:assert/strict";
import test from "node:test";
import {
  checkExtractRateLimit,
  clientIpFromHeaders,
  resetLandingExtractRateLimitForTests,
} from "@/lib/site/landing-demo-rate-limit";

test("clientIpFromHeaders lit x-forwarded-for", () => {
  const h = new Headers({ "x-forwarded-for": "203.0.113.9, 10.0.0.1" });
  assert.equal(clientIpFromHeaders(h), "203.0.113.9");
});

test("checkExtractRateLimit bloque après plafond cookie", () => {
  resetLandingExtractRateLimitForTests();
  let cookie: string | null = null;
  for (let i = 0; i < 5; i++) {
    const rl = checkExtractRateLimit(cookie, `203.0.113.${50 + i}`);
    assert.equal(rl.allowed, true, `attempt ${i + 1}`);
    cookie = rl.setCookie?.split(";")[0] ?? null;
  }
  const blocked = checkExtractRateLimit(cookie, "203.0.113.99");
  assert.equal(blocked.allowed, false);
});

test("checkExtractRateLimit bloque le contournement cookie via IP", () => {
  resetLandingExtractRateLimitForTests();
  const ip = "198.51.100.77";
  for (let i = 0; i < 8; i++) {
    const rl = checkExtractRateLimit(null, ip);
    assert.equal(rl.allowed, true, `attempt ${i + 1}`);
  }
  assert.equal(checkExtractRateLimit(null, ip).allowed, false);
});
