#!/usr/bin/env node
/**
 * Supprime les doublons Finder « nom 2.ext » non suivis par git (souvent créés par iCloud/sync).
 * Usage: node scripts/remove-finder-duplicates.mjs [--dry-run]
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const dryRun = process.argv.includes("--dry-run");
const root = path.resolve(import.meta.dirname, "..");

const out = execSync("git ls-files --others --exclude-standard", {
  cwd: root,
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
});

const dupRe = / \d+\.(tsx?|jsx?|css|json|mjs|cjs)$/;
const roots = new Set([
  "app",
  "components",
  "lib",
  "hooks",
  "emails",
  "public",
  "docs",
  "scripts",
  "remotion",
  "styles",
  "supabase",
]);

const files = out
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean)
  .filter((rel) => {
    const top = rel.split("/")[0];
    if (!roots.has(top)) return false;
    const base = path.basename(rel);
    return dupRe.test(base) || base.includes(" 2.");
  });

if (!files.length) {
  console.log("Aucun doublon Finder à supprimer.");
  process.exit(0);
}

console.log(`${dryRun ? "[dry-run] " : ""}${files.length} fichier(s)…`);
for (const rel of files) {
  const abs = path.join(root, rel);
  if (dryRun) console.log("  ", rel);
  else {
    fs.unlinkSync(abs);
  }
}

if (!dryRun) console.log("Terminé. Relance npm run dev.");
