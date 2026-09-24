import { KIT_CSS, THEMES, tokens } from "@/lib/design-data/themes";

/** Polices des 6 thèmes (même lien que le HTML d'origine). */
export const KIT_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&family=Archivo:wght@400;600;800;900&family=Bebas+Neue&family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;600&family=Instrument+Serif:ital@0;1&family=Sora:wght@400;600;700&family=Cormorant+Garamond:wght@500;600&family=Manrope:wght@400;500;700&display=swap";

export const LUCIDE_CDN = "https://unpkg.com/lucide@0.469.0/dist/umd/lucide.min.js";

/** Fichier de règles Cursor pour un thème (texte identique au HTML d'origine). */
export function rulesFor(id: string) {
  const t = THEMES.find((x) => x.id === id) ?? THEMES[0];
  return `---
description: Règles design du projet (thème ${t.n})
alwaysApply: true
---
# Stack
- React + TypeScript + Tailwind + shadcn/ui, icônes Lucide.
# Tokens (source de vérité, aussi dans Figma Variables)
${tokens(t.id).replace(/^\.kit\[data-kit="[^"]+"\]/, ":root")}
# Règles
- Utilise UNIQUEMENT ces variables : aucune couleur, taille ou ombre en dur.
- Typos : ${t.fonts}.
- Mobile d'abord : tout doit marcher à 375 px, puis élargir.
- Un composant = un fichier. Réutilise Button, Card, Badge avant d'en créer.
- Respecte la maquette Figma fournie (via MCP) : espacements, tailles, hiérarchie.
- Pas de faux chiffres, pas de faux témoignages : laisse des [placeholders].`;
}

/**
 * Script injecté dans chaque aperçu isolé :
 * - envoie sa hauteur au parent (l'iframe s'ajuste au contenu) ;
 * - écoute { kit } pour changer de thème et { replay } pour rejouer les animations ;
 * - bloque les liens « # » des maquettes.
 */
const FRAME_SCRIPT = `<script src="${LUCIDE_CDN}"></script>
<script>
try{lucide.createIcons()}catch(e){}
var root=document.getElementById('root');
function post(){parent.postMessage({navpitFrame:1,h:Math.ceil(document.documentElement.getBoundingClientRect().height)},'*')}
new ResizeObserver(post).observe(document.documentElement);
addEventListener('load',post);
addEventListener('message',function(e){var d=e.data||{};
  if(d.kit){root.dataset.kit=d.kit}
  if(d.replay){var h=root.innerHTML;root.innerHTML='';requestAnimationFrame(function(){root.innerHTML=h;post()})}
});
document.addEventListener('click',function(e){if(e.target.closest('a[href="#"]'))e.preventDefault()});
post();
</script>`;

/** Document HTML complet pour un aperçu isolé (iframe srcdoc). */
export function frameDoc({
  fonts,
  css,
  rootClass,
  rootAttrs = "",
  html,
}: {
  fonts: string;
  css: string;
  rootClass: string;
  rootAttrs?: string;
  html: string;
}) {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="${fonts}">
<style>html,body{margin:0;background:transparent}*{box-sizing:border-box}.lucide{width:18px;height:18px;stroke-width:2;flex:none}
${css}</style></head><body><div id="root" class="${rootClass}" ${rootAttrs}>${html}</div>${FRAME_SCRIPT}</body></html>`;
}

/** Aperçu d'un composant landing dans un thème. */
export function kitDoc(html: string, themeId: string) {
  return frameDoc({
    fonts: KIT_FONTS_URL,
    css: KIT_CSS,
    rootClass: "kit",
    rootAttrs: `data-kit="${themeId}"`,
    html,
  });
}
