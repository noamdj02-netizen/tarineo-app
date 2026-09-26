import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { Scope } from "./types";

// Format : npk_<40 caractères base62>. Le préfixe "npk_" aide les
// scanners de secrets (GitHub) à repérer une clé qui fuite.
export const KEY_PREFIX = "npk_";
const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const BODY_LENGTH = 40;

export function generateApiKey(): { key: string; prefix: string; hash: string } {
  let body = "";
  // Rejection sampling : pas de biais modulo.
  while (body.length < BODY_LENGTH) {
    for (const b of randomBytes(64)) {
      if (b < 248 && body.length < BODY_LENGTH) body += ALPHABET[b % 62];
    }
  }
  const key = KEY_PREFIX + body;
  return { key, prefix: key.slice(0, 12), hash: hashApiKey(key) };
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export function looksLikeApiKey(value: string | undefined): value is string {
  return !!value && value.startsWith(KEY_PREFIX) && value.length === KEY_PREFIX.length + BODY_LENGTH;
}

export function safeEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export const ALL_SCOPES: Scope[] = ["read", "write"];

export function parseScopes(input: unknown): Scope[] {
  if (!Array.isArray(input) || input.length === 0) return ["read"];
  const set = new Set(input.filter((s): s is Scope => ALL_SCOPES.includes(s as Scope)));
  if (set.has("write")) set.add("read"); // write implique read
  return set.size ? [...set] : ["read"];
}
