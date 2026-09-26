import { THEMES, THEME_TOKENS } from "@/lib/design-data/themes";

/** Contrat marque au format Open Design, tokens Navpit. */
export function designMdForTheme(themeId: string, brand?: string) {
  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];
  const tok = THEME_TOKENS[theme.id] ?? THEME_TOKENS.chantier;
  const name = brand?.trim() || theme.n;

  return `# ${name}

> Category: Navpit kit
> ${theme.f}

## Visual Theme & Atmosphere
${theme.n}. ${theme.f}. Cockpit Navpit : tokens du thème uniquement. Pas de violet IA, pas de mesh générique.

## Color Palette & Roles
- **Background:** ${tok["--k-bg"]}
- **Surface:** ${tok["--k-surface"]}
- **Foreground:** ${tok["--k-text"]}
- **Muted:** ${tok["--k-muted"]}
- **Border:** ${tok["--k-border"]}
- **Accent:** ${tok["--k-accent"]} — CTA et un seul élément hero
- **On accent:** ${tok["--k-ink"]}
- **Soft:** ${tok["--k-soft"]}
- **Hot:** ${tok["--k-hot"]}
Never invent hex outside this list.

## Typography Rules
- **Display:** ${tok["--k-disp"]}, weight ${tok["--k-dw"]}, tracking ${tok["--k-dls"]}
- **Body:** ${tok["--k-body"]}
- **Mono:** ${tok["--k-mono"]}
- Scale: 12 · 13.5 · 15.5 · 18 · 24 · 32 · 44
- Headlines: Inter Tight / Space Grotesk if the theme does not declare otherwise.

## Component Stylings
- **Buttons:** radius ${tok["--k-r"]}, pill for primary cockpit CTAs, label never wraps.
- **Cards:** surface, 1px border, radius 16-18, shadow only if DESIGN says raised.
- **Inputs:** 1px border, focus = ink at 30%.

## Layout Principles
- Content max 1080-1200px. Hero fits the first viewport.
- 12 frames landing: Navbar, Hero, Preuve, Probleme, Marche, Fonctions, Demo, Temoignages, Resultats, Tarifs, FAQ, CTA.
- One accent moment per section. No three equal feature cards.

## Depth & Elevation
- Flat by default.
- Raised: ${tok["--k-shadow"]}
No glassmorphism, no mesh purple.

## Do's and Don'ts
- Use real product copy and real photos.
- One CTA intent per page.
- No em-dash as decoration.
- No fake stats.

## Responsive Behavior
- Desktop ≥ 1024: full grid.
- Phone < 768: single column, same tokens.

## Agent Prompt Guide
- Subtract first. Follow the 12 frames. Attach HTML as a landing on the Navpit project.
- If a color is missing, pick the closest token and say so.
`;
}

export function designMdFromHero(values: Record<string, string>) {
  const name = values.MARQUE || "Marque";
  return `# ${name}

> Category: Navpit landing
> Hero variables. Do not invent hex.

## Color Palette & Roles
- **Background:** ${values.COULEUR_FOND ?? "#f3f3f2"}
- **Accent:** ${values.COULEUR_ACCENT ?? "#111111"} — one CTA, one hero accent
- **Foreground:** ${values.COULEUR_TEXTE ?? "#111111"}
- **Surface:** #ffffff
Never invent hex outside this list.

## Typography Rules
- **Display / body:** ${values.POLICE_TITRE ?? "Inter Tight"}
- No default serif. No Instrument Serif unless the hero names it.

## Layout Principles
- 12 frames: Navbar, Hero, Preuve, Probleme, Marche, Fonctions, Demo, Temoignages, Resultats, Tarifs, FAQ, CTA.
- The hero IS the image. Photo ${values.URL_PORTRAIT || "required"}. Mise ${values.MISE || "product"}.
- One CTA: ${values.CTA_PRINCIPAL || "—"}. Secondary: ${values.CTA_SECONDAIRE || "—"}.

## Do's and Don'ts
- Real copy. Proof: ${values.PREUVE || "none yet"}.
- No lorem, no fake stats, no em-dash decoration, no cream+brass+espresso.

## Agent Prompt Guide
- Single HTML or one React hero. Tokens only from this file.
`;
}

export function tokensCssForTheme(themeId: string) {
  const tok = THEME_TOKENS[themeId] ?? THEME_TOKENS.chantier;
  const lines = Object.entries(tok)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");
  return `:root {\n${lines}\n}\n`;
}
