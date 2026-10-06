#!/usr/bin/env node
/**
 * Archive code Remotion + assets vidéo TARINEO → tarineo-remotion-bundle.zip
 *   npm run remotion:zip
 */
import { execSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const out = resolve(root, "tarineo-remotion-bundle.zip");

const paths = [
  "remotion",
  "remotion.config.ts",
  "lib/brand.ts",
  "public/brand",
  "public/illustrations/tarineo-hd",
  "public/remotion-audio",
  "public/videos",
  "promo/package.json",
  "promo/package-lock.json",
  "promo/remotion.config.ts",
  "promo/tsconfig.json",
  "promo/eslint.config.mjs",
  "promo/README.md",
  "promo/src",
  "promo/public",
];

const cmd = [
  "zip",
  "-r",
  out,
  ...paths,
  "-x",
  "*.DS_Store",
  "*/node_modules/*",
  "promo/node_modules/*",
].join(" ");

execSync(`rm -f "${out}" && cd "${root}" && ${cmd}`, { stdio: "inherit" });
console.log(`\n→ ${out}`);
