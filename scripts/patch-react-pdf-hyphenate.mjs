/** Node 20+ refuse `@react-pdf/hyphenate/en-us` (exports sans `./en-us` ni `require`). */
import fs from "node:fs";
import path from "node:path";

const pkgPath = path.join(process.cwd(), "node_modules/@react-pdf/hyphenate/package.json");
if (!fs.existsSync(pkgPath)) process.exit(0);
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
pkg.exports ??= {};
pkg.exports["./en-us"] = {
  types: "./lib/en-us.d.ts",
  import: "./lib/en-us.js",
  require: "./lib/en-us.js",
  default: "./lib/en-us.js",
};
if (pkg.exports["./*"] && typeof pkg.exports["./*"] === "object") {
  pkg.exports["./*"] = {
    ...pkg.exports["./*"],
    require: pkg.exports["./*"].require ?? "./lib/*.js",
    default: pkg.exports["./*"].default ?? "./lib/*.js",
  };
}
fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
