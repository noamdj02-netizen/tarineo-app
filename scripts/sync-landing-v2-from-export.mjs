/**
 * Synchronise la landing exportée (Vite) vers components/site/landing-v2.
 * Usage: node scripts/sync-landing-v2-from-export.mjs [dossier-ou-.zip]
 * Défaut: ~/Downloads/tarineo.zip
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const IMPORT_REPLACEMENTS = [
  [/from "\.\.\/data\/content"/g, 'from "@/lib/site/landing-v2-content"'],
  [/from "\.\.\/\.\.\/data\/content"/g, 'from "@/lib/site/landing-v2-content"'],
  [/from "\.\.\/lib\/motion"/g, 'from "@/components/site/landing-v2/lib/motion"'],
  [/from "\.\.\/\.\.\/lib\/motion"/g, 'from "@/components/site/landing-v2/lib/motion"'],
  [/from "\.\.\/lib\/useWorkflowReveal"/g, 'from "@/components/site/landing-v2/lib/useWorkflowReveal"'],
  [/from "\.\.\/components\/ui\//g, 'from "@/components/site/landing-v2/components/ui/'],
  [/from "\.\.\/ui\//g, 'from "@/components/site/landing-v2/components/ui/'],
  [/from "\.\/Logo"/g, 'from "@/components/site/landing-v2/components/layout/Logo"'],
  [/from "\.\/Footer"/g, 'from "@/components/site/landing-v2/components/layout/Footer"'],
  [/from "\.\/Header"/g, 'from "@/components/site/landing-v2/components/layout/Header"'],
  [/from "\.\.\/components\/layout\//g, 'from "@/components/site/landing-v2/components/layout/'],
];

function resolveExportRoot(input) {
  let arg = input ?? path.join(os.homedir(), "Downloads", "tarineo.zip");

  if (arg.endsWith(".zip")) {
    if (!fs.existsSync(arg)) {
      console.error("Archive introuvable:", arg);
      process.exit(1);
    }
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tarineo-landing-"));
    execFileSync("unzip", ["-q", arg, "-d", tmp]);
    const nested = fs.readdirSync(tmp).find((name) => {
      const p = path.join(tmp, name);
      return fs.statSync(p).isDirectory() && fs.existsSync(path.join(p, "src"));
    });
    return nested ? path.join(tmp, nested) : tmp;
  }

  if (fs.existsSync(path.join(arg, "src"))) return arg;

  const zipFallback = `${arg}.zip`;
  if (fs.existsSync(zipFallback)) return resolveExportRoot(zipFallback);

  console.error("Export introuvable (dossier avec src/ ou .zip):", arg);
  process.exit(1);
}

function needsUseClient(filePath, content) {
  if (!filePath.endsWith(".tsx")) return false;
  if (content.includes('"use client"') || content.includes("'use client'")) return false;
  return (
    /\buse(State|Effect|Ref|Memo|Callback|LayoutEffect)\b/.test(content) ||
    content.includes("useReveal") ||
    content.includes("useWorkflowReveal")
  );
}

function transformTs(content, filePath) {
  let out = content.replaceAll("/assets/mascots/", "/landing/v2/mascots/");
  for (const [re, rep] of IMPORT_REPLACEMENTS) {
    out = out.replace(re, rep);
  }
  if (needsUseClient(filePath, out)) {
    out = `"use client";\n${out}`;
  }
  return out;
}

function adaptCss(source) {
  let css = source.replace(/^@import "tailwindcss";\s*/m, "");
  css = css.replace(
    /  \/\* Orange d'action TARINEO \*\/[\s\S]*?--color-accent-700: #c24a08;\n\n/,
    "  /* Accent orange : sur `.landing-v2` uniquement (voir bas du fichier). */\n\n",
  );
  css = css.replace(
    /@layer base \{[\s\S]*?\n\}/,
    `@layer base {
  html:has(.landing-v2) {
    -webkit-text-size-adjust: 100%;
    scroll-behavior: smooth;
    scroll-padding-top: 6rem;
  }

  .landing-v2 {
    font-family: var(--font-sans);
    font-size: 1rem;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }

  .landing-v2 h1,
  .landing-v2 h2,
  .landing-v2 h3,
  .landing-v2 h4 {
    color: var(--color-ink-900);
    font-weight: 600;
    text-wrap: balance;
  }

  .landing-v2 p {
    text-wrap: pretty;
  }

  .landing-v2 ::selection {
    background: var(--color-accent-soft);
    color: var(--color-ink-900);
  }

  .landing-v2 :focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
    border-radius: 4px;
  }

  .landing-v2 .nums {
    font-variant-numeric: tabular-nums;
  }
}`,
  );
  if (!css.includes("Scope orange")) {
    css += `
/* Scope orange + fond clair (le layout site applique .dark ailleurs). */
.landing-v2 {
  color-scheme: light;
  --font-sans: var(--font-landing-sans), ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
    sans-serif;
  --font-mono: var(--font-landing-mono), ui-monospace, SFMono-Regular, Menlo, monospace;
  --color-accent: #ff6b1a;
  --color-accent-hover: #f2610f;
  --color-accent-active: #e0570b;
  --color-accent-soft: #fff0e8;
  --color-accent-100: #fde4d6;
  --color-accent-700: #c24a08;
  background-color: var(--color-paper-100);
  color: var(--color-ink-600);
}
`;
  }
  return css;
}

const BUTTON_NEXT = `"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full text-center font-medium transition-colors duration-200 ease-out select-none";

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-[0.9375rem]",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-white shadow-accent hover:bg-accent-hover active:bg-accent-active",
  secondary:
    "bg-paper-0 text-ink-900 border border-line hover:border-line-strong hover:bg-paper-50 active:bg-paper-200",
  ghost: "text-ink-900 hover:text-accent-700",
};

function linkClass(size: Size, variant: Variant, className: string) {
  return \`\${base} \${sizes[size]} \${variants[variant]} \${className}\`;
}

export function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  const cls = linkClass(size, variant, className);

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  if (href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto")) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={cls}>
      {children}
    </button>
  );
}

export function ArrowRight({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M4 10h11.5M11 5.5l4.5 4.5-4.5 4.5" />
    </svg>
  );
}
`;

function syncFromExport(exportRoot) {
  const srcRoot = path.join(exportRoot, "src");
  const CONTENT_SRC = path.join(srcRoot, "data", "content.ts");
  const CONTENT_DST = path.join(repoRoot, "lib/site/landing-v2-content.ts");
  const CSS_SRC = path.join(srcRoot, "styles", "index.css");
  const CSS_DST = path.join(repoRoot, "styles/landing-v2.css");
  const MASCOTS_SRC = path.join(exportRoot, "public/assets/mascots");
  const MASCOTS_DST = path.join(repoRoot, "public/landing/v2/mascots");
  const LOGO_SRC = path.join(exportRoot, "public/logo-tarineo.png");
  const LOGO_DST = path.join(repoRoot, "public/landing/v2/logo-tarineo.png");

  if (!fs.existsSync(srcRoot)) {
    console.error("src/ manquant dans l'export:", exportRoot);
    process.exit(1);
  }

  console.log("Source:", exportRoot);

  function copyMapped(relSrc, relDst, transform) {
    const from = path.join(srcRoot, relSrc);
    const to = path.join(repoRoot, relDst);
    if (!fs.existsSync(from)) {
      console.warn("skip (missing):", relSrc);
      return;
    }
    const raw = fs.readFileSync(from, "utf8");
    const next = transform ? transform(raw, from) : raw;
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.writeFileSync(to, next);
    console.log("sync", relDst);
  }

  fs.copyFileSync(CONTENT_SRC, CONTENT_DST);
  console.log("sync lib/site/landing-v2-content.ts");

  const css = adaptCss(fs.readFileSync(CSS_SRC, "utf8"));
  fs.writeFileSync(CSS_DST, css);
  console.log("sync styles/landing-v2.css");

  for (const rel of ["lib/motion.ts", "lib/useWorkflowReveal.ts"]) {
    copyMapped(rel, `components/site/landing-v2/${rel}`, (c) => c);
  }

  const walk = (dir, base = "") => {
    for (const name of fs.readdirSync(dir)) {
      const abs = path.join(dir, name);
      const rel = path.join(base, name);
      if (fs.statSync(abs).isDirectory()) walk(abs, rel);
      else if (name.endsWith(".tsx")) {
        copyMapped(rel, `components/site/landing-v2/${rel}`, transformTs);
      }
    }
  };

  walk(path.join(srcRoot, "sections"), "sections");
  walk(path.join(srcRoot, "components"), "components");

  const buttonDst = path.join(repoRoot, "components/site/landing-v2/components/ui/Button.tsx");
  fs.writeFileSync(buttonDst, BUTTON_NEXT);
  console.log("patch components/site/landing-v2/components/ui/Button.tsx (Next.js Link)");

  if (fs.existsSync(MASCOTS_SRC)) {
    fs.mkdirSync(MASCOTS_DST, { recursive: true });
    for (const file of fs.readdirSync(MASCOTS_SRC)) {
      if (!file.endsWith(".webp")) continue;
      fs.copyFileSync(path.join(MASCOTS_SRC, file), path.join(MASCOTS_DST, file));
    }
    console.log("sync public/landing/v2/mascots");
  }

  if (fs.existsSync(LOGO_SRC)) {
    fs.mkdirSync(path.dirname(LOGO_DST), { recursive: true });
    fs.copyFileSync(LOGO_SRC, LOGO_DST);
    console.log("sync public/landing/v2/logo-tarineo.png");
  }
}

const exportRoot = resolveExportRoot(process.argv[2]);
syncFromExport(exportRoot);
console.log("Done.");
