import { frameDoc } from "@/lib/kit";
import {
  PACK_FONTS_URL,
  PACK_KEYFRAMES,
  PACKS,
  QUALITY_BAR,
  type Block,
  type Pack,
} from "@/lib/design-data/packs";

// Textes copiés par les boutons de « Composants 2 » : identiques au HTML d'origine.

function packOf(c: Block) {
  return PACKS.find((x) => x.id === c.pk) as Pack;
}

export function pkTokens(p: Pack) {
  const t = p.t;
  return `:root{\n  --bg:${t.bg};\n  --surface:${t.surface};\n  --surface-2:${t.surface2};\n  --text:${t.text};\n  --muted:${t.muted};\n  --border:${t.border};\n  --accent:${t.accent};\n  --accent-ink:${t.ink};\n  --soft:${t.soft};\n  --accent-2:${t.glow};\n  --radius:${t.r};\n  --font-display:"${t.disp}";\n  --font-body:"${t.body}";\n  --font-mono:"${t.mono}";\n}`;
}

export function pkTw(p: Pack) {
  const t = p.t;
  return `// tailwind.config.js · style ${p.n}
module.exports = {
  theme: { extend: {
    colors: { bg:'${t.bg}', surface:'${t.surface}', 'surface-2':'${t.surface2}', text:'${t.text}', muted:'${t.muted}', border:'${t.border}', accent:'${t.accent}', 'accent-ink':'${t.ink}', soft:'${t.soft}', 'accent-2':'${t.glow}' },
    fontFamily: { display:['${t.disp}','sans-serif'], body:['${t.body}','sans-serif'], mono:['${t.mono}','monospace'] },
    borderRadius: { card:'${t.r}' },
    boxShadow: { soft:'0 0 0 1px rgba(0,0,0,.04), 0 2px 6px rgba(0,0,0,.04), 0 16px 40px -18px rgba(0,0,0,.18)' },
  } },
}`;
}

export function pkCode(c: Block) {
  const p = packOf(c);
  return `<!-- ${c.n} · style ${p.n} -->
<link rel="stylesheet" href="${PACK_FONTS_URL}">
<script src="https://unpkg.com/lucide@0.469.0/dist/umd/lucide.min.js"></script>
<style>
${PACK_KEYFRAMES}
${p.css}
</style>
<div class="${p.cls}">
${c.h}
</div>
<script>lucide.createIcons()</script>`;
}

export function pkCursor(c: Block) {
  const p = packOf(c),
    t = p.t;
  return `Crée un composant React + TypeScript + Tailwind (+ framer-motion pour les animations) : « ${c.n} »${c.k === "mobile" ? " — écran iPhone 390×844 dans un cadre de téléphone" : ""}.
Direction artistique « ${p.n} » : ${p.mood}
Tokens (dans tailwind.config, jamais de valeur en dur) : bg ${t.bg}, surface ${t.surface}, surface-2 ${t.surface2}, texte ${t.text}, gris ${t.muted}, bordure ${t.border}, accent ${t.accent} (texte dessus ${t.ink}), accent doux ${t.soft}, accent 2 ${t.glow}, arrondi ${t.r}. Polices : ${t.disp} (titres, letter-spacing serré), ${t.body} (texte), ${t.mono} (labels/chiffres).
Structure exacte : ${c.d}
${QUALITY_BAR}
Règles : icônes lucide-react, mobile d'abord, textes en français, aucun faux chiffre client (placeholders). Livre un seul fichier composant + un exemple d'utilisation.`;
}

export function pkGpt(c: Block) {
  const p = packOf(c),
    t = p.t;
  return `Tu es un designer UI senior qui publie sur Dribbble et Behance. Génère UN SEUL fichier HTML complet, prêt à ouvrir dans le navigateur, avec Tailwind CSS via CDN (<script src="https://cdn.tailwindcss.com"></script>) et une config tailwind inline.
Composant : « ${c.n} »${c.k === "mobile" ? ", affiché dans un cadre d’iPhone réaliste (Dynamic Island, coins 44px)" : ""}.
Direction artistique « ${p.n} » : ${p.mood}
Couleurs : fond ${t.bg}, cartes ${t.surface}, texte ${t.text}, secondaire ${t.muted}, bordures ${t.border}, accent ${t.accent} (texte dessus ${t.ink}), accent doux ${t.soft}, accent 2 ${t.glow}. Arrondi ${t.r}. Google Fonts : ${t.disp} (titres), ${t.body} (texte), ${t.mono} (labels).
Contenu et mise en page : ${c.d}
${QUALITY_BAR}
Textes en français, icônes Lucide (CDN). Réponds uniquement avec le code.`;
}

/** Aperçu isolé d'un bloc, avec le CSS de son style. */
export function packDoc(c: Block) {
  const p = packOf(c);
  return frameDoc({
    fonts: PACK_FONTS_URL,
    css: `${PACK_KEYFRAMES}\n${p.css}\n#root{min-width:0}`,
    rootClass: p.cls,
    html: c.h,
  });
}
