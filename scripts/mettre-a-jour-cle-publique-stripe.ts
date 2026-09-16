import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// Renseigne NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY depuis la config Stripe CLI (test).
import { execSync } from "node:child_process";

const sortie = execSync("stripe config --list", { encoding: "utf8" });
const match = sortie.match(/^test_mode_pub_key = '(pk_test_[^']+)'/m);
if (!match) {
  console.error("Impossible de lire test_mode_pub_key depuis stripe config --list");
  process.exit(1);
}

const chemin = resolve(process.cwd(), ".env");
let env = readFileSync(chemin, "utf8");
const cle = "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY";
if (/^NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="[^"]+"/m.test(env)) {
  env = env.replace(/^NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="[^"]*"/m, `${cle}="${match[1]}"`);
} else {
  env += `\n${cle}="${match[1]}"`;
}
writeFileSync(chemin, env);
console.log("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY mis à jour dans .env (mode test).");
