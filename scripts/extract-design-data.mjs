// Extrait les données statiques de « Studio Noam.html » (constantes JS) en objets.
// Usage CLI : node scripts/extract-design-data.mjs "../Studio Noam.html" T FR > /tmp/design.json
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

/** Renvoie l'index de fin de l'expression qui commence à `start` (tableau, objet ou chaîne). */
function scanExpression(src, start) {
  let depth = 0;
  let i = start;
  const stack = [];
  for (; i < src.length; i++) {
    const c = src[i];
    const top = stack[stack.length - 1];
    if (top === "'" || top === '"') {
      if (c === "\\") i++;
      else if (c === top) stack.pop();
      continue;
    }
    if (top === "`") {
      if (c === "\\") i++;
      else if (c === "`") stack.pop();
      else if (c === "$" && src[i + 1] === "{") {
        stack.push("${");
        i++;
      }
      continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      i = src.indexOf("*/", i + 2) + 1;
      continue;
    }
    if (c === "/" && src[i + 1] === "/") {
      i = src.indexOf("\n", i);
      continue;
    }
    if (c === "'" || c === '"' || c === "`") {
      stack.push(c);
      continue;
    }
    // fin d'une interpolation ${…} dans un template
    if (c === "}" && top === "${") {
      stack.pop();
      continue;
    }
    if (c === "{" || c === "[" || c === "(") {
      stack.push(c);
      depth++;
    } else if (c === "}" || c === "]" || c === ")") {
      stack.pop();
      depth--;
      if (depth === 0 && stack.length === 0) {
        // fonction fléchée : (a,b)=>… continue après la flèche
        const arrow = /^\s*=>/.exec(src.slice(i + 1, i + 10));
        if (arrow) {
          i += arrow[0].length;
          continue;
        }
        return i + 1;
      }
    } else if ((c === ";" || c === "\n") && depth === 0 && stack.length === 0 && i > start) {
      return i;
    }
  }
  return i;
}

/** Le code source de `const NAME=...` (première occurrence dans un <script>). */
function grabConst(html, name) {
  const re = new RegExp(`const ${name}\\s*=`, "g");
  const m = re.exec(html);
  if (!m) throw new Error(`const ${name} introuvable`);
  const start = m.index + m[0].length;
  const end = scanExpression(html, start);
  return html.slice(start, end);
}

export function extractConsts(html, names) {
  const ctx = {};
  vm.createContext(ctx);

  /** Définit `name` ; si une autre constante manque (ReferenceError), la charge d'abord. */
  function define(name, seen = new Set()) {
    if (seen.has(name)) throw new Error(`boucle sur ${name}`);
    seen.add(name);
    for (;;) {
      try {
        vm.runInContext(`var ${name} = ${grabConst(html, name)};`, ctx);
        return;
      } catch (e) {
        const missing = /^(\w+) is not defined/.exec(e?.message ?? "")?.[1];
        if (!missing || missing === name) throw e;
        define(missing, seen);
      }
    }
  }
  for (const n of names) define(n);
  const out = {};
  for (const n of names) out[n] = ctx[n];
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const html = readFileSync(process.argv[2], "utf8");
  process.stdout.write(JSON.stringify(extractConsts(html, process.argv.slice(3))));
}
