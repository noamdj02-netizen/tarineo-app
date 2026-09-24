// Génère lib/design-data/*.ts depuis « Studio Noam.html », sans réécrire le contenu.
// Usage : npm run design-data   (lit ../Studio Noam.html par défaut)
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { extractConsts } from "./extract-design-data.mjs";

const src = resolve(process.argv[2] ?? "../Studio Noam.html");
const out = resolve("lib/design-data");
const html = readFileSync(src, "utf8");

const d = extractConsts(html, [
  "T",
  "VARS",
  "FR",
  "Z",
  "CK",
  "C",
  "PK",
  "FYN_PK",
  "INST_PK",
  "C2",
  "NIVA_ITEMS",
  "FYN_ITEMS",
  "FYN_MORE",
  "INST_ITEMS",
  "KF",
  "PKF",
  "QUAL",
  "PROMPT",
  "FLOW",
  "TOOLS",
  "LOGO",
  "S",
  "ST",
  "PRESETS",
]);

// ─── Tokens des 6 thèmes, lus dans le CSS (.kit = Chantier, .kit[data-kit="x"] = les autres) ──
const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n");
function vars(block) {
  const o = {};
  for (const m of block.matchAll(/(--k-[a-z]+)\s*:\s*([^;]+?)\s*(?:;|$)/g)) o[m[1]] = m[2].trim();
  return o;
}
const base = vars(/\.kit\{([^}]*)\}/.exec(css)[1]);
const tokens = {};
for (const t of d.T) {
  const m = new RegExp(`\\.kit\\[data-kit="${t.id}"\\]\\{([^}]*)\\}`).exec(css);
  const all = { ...base, ...(m ? vars(m[1]) : {}) };
  tokens[t.id] = Object.fromEntries(d.VARS.map((v) => [v, all[v] ?? ""]));
}
// CSS complet du kit (tokens + composants .k-*), pour l'afficher tel quel
const kitCss = css.slice(css.indexOf("/* ================= KIT"), css.indexOf(".tpreview{"));

const HEAD = `// Généré par scripts/build-design-data.mjs depuis « Studio Noam.html ».\n// Ne pas modifier à la main : relancer \`npm run design-data\`.\n\n`;
const j = (v) => JSON.stringify(v, null, 2);
const write = (file, body) => {
  writeFileSync(resolve(out, file), HEAD + body);
  console.log("✓", file);
};

write(
  "themes.ts",
  `export type Theme = { id: string; n: string; f: string; fonts: string };

/** Les 6 thèmes (id, nom, pour quel projet, typos). */
export const THEMES: Theme[] = ${j(d.T)};

/** Variables CSS d'un thème, dans l'ordre d'origine. */
export const KIT_VARS = ${j(d.VARS)} as const;

/** Valeur de chaque variable, par thème. */
export const THEME_TOKENS: Record<string, Record<string, string>> = ${j(tokens)};

/** Les 5 couleurs montrées en pastilles. */
export const SWATCH_VARS = ["--k-bg", "--k-surface", "--k-text", "--k-accent", "--k-hot"] as const;

export function swatches(id: string) {
  return SWATCH_VARS.map((v) => ({ v, c: THEME_TOKENS[id]?.[v] ?? "" }));
}

/** Bloc CSS des tokens d'un thème (même format que le bouton « Copier » d'origine). */
export function tokens(id: string) {
  const t = THEME_TOKENS[id] ?? {};
  return \`.kit[data-kit="\${id}"]{\\n\` + KIT_VARS.map((v) => \`  \${v}:\${t[v]};\`).join("\\n") + "\\n}";
}

/** CSS complet du kit de composants (.kit, thèmes, .k-*). */
export const KIT_CSS = ${j(kitCss)};
`,
);

write(
  "frames.ts",
  `export type Zone = "A" | "I" | "D" | "X";
export type Frame = {
  z: Zone;
  ic: string;
  n: string;
  /** maquette fil de fer (HTML) */
  w: string;
  pins: string[];
  role: string;
  rule: string;
  err: string;
  ex: string;
};

/** Les 12 frames d'une landing qui convertit. */
export const FRAMES: Frame[] = ${j(d.FR)};

/** Les 4 zones du tunnel (couleurs = variables CSS de l'app d'origine). */
export const ZONES: Record<Zone, { c: string; s: string; n: string }> = ${j(d.Z)};

/** Checklist avant mise en ligne. */
export const CHECKLIST: string[] = ${j(d.CK)};
`,
);

write(
  "components.ts",
  `export type KitComponent = { ic: string; n: string; w: string; h: string };

/** Composants landing (HTML qui utilise les variables --k-* du thème choisi). */
export const COMPONENTS: KitComponent[] = ${j(d.C)};
`,
);

const packs = [...d.PK, d.FYN_PK, d.INST_PK];
const blocks = [...d.C2, ...d.NIVA_ITEMS, ...d.FYN_ITEMS, ...d.FYN_MORE, ...d.INST_ITEMS];
write(
  "packs.ts",
  `export type PackTokens = Record<string, string>;
export type Pack = {
  id: string;
  cls: string;
  css: string;
  n: string;
  from: string;
  u: string;
  mood: string;
  t: PackTokens;
};
export type Block = { pk: string; k: "web" | "mobile"; n: string; d: string; h: string };

/** Les 6 styles premium de « Composants 2 ». */
export const PACKS: Pack[] = ${j(packs)};

/** Les blocs de chaque style (web + mobile), HTML d'origine. */
export const BLOCKS: Block[] = ${j(blocks)};

/** Animations partagées par les packs. */
export const PACK_KEYFRAMES = ${j(d.KF)};

/** Polices Google des packs. */
export const PACK_FONTS_URL = ${j(d.PKF)};

/** Phrase « niveau Framer/Dribbble » ajoutée aux prompts. */
export const QUALITY_BAR = ${j(d.QUAL)};
`,
);

write(
  "workflow.ts",
  `/** Méthode Figma → Cursor en 7 étapes : [titre, texte, bloc spécial]. */
export const FLOW: [string, string, string][] = ${j(d.FLOW)};

/** Prompt type à coller dans Cursor. */
export const FLOW_PROMPT = ${j(d.PROMPT)};
`,
);

write(
  "tools.ts",
  `/** [nom, lien, couleur, description, connecté à Claude (1/0)] */
export type Tool = [string, string, string, string, (number | boolean)?];
/** [groupe, icône lucide, outils] */
export type ToolGroup = [string, string, Tool[]];

export const TOOL_GROUPS: ToolGroup[] = ${j(d.TOOLS)};

/** Vrais logos (data URI), par nom d'outil. */
export const TOOL_LOGOS: Record<string, string> = ${j(d.LOGO)};
`,
);

write(
  "audit.ts",
  `export type FrameState = "ok" | "warn" | "bad" | "unk";
export type SiteAudit = {
  n: string;
  u: string;
  /** état de chacune des 12 frames */
  s: FrameState[];
  alert: string | null;
  /** corrections prioritaires */
  fx: string[];
};

/** Audit de tes sites face aux 12 frames. */
export const SITES: SiteAudit[] = ${j(d.S)};

/** [fond, couleur, icône lucide, libellé] par état. */
export const STATES: Record<FrameState, [string, string, string, string]> = ${j(d.ST)};
`,
);

write(
  "assistant.ts",
  `/** Questions toutes prêtes sous le chat. */
export const PRESETS: string[] = ${j(d.PRESETS)};
`,
);
