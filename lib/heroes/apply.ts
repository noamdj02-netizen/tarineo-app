import { OD_SKILLS } from "@/lib/open-design/catalog";
import { designMdFromHero } from "@/lib/open-design/design-md";
import type { CopyTool, HeroCard } from "./types";

export function fillHeroPrompt(template: string, values: Record<string, string>) {
  return template.replace(/\{\{([A-Z0-9_]+)\}\}/g, (_, key: string) => values[key] ?? `{{${key}}}`);
}

export function defaultValues(hero: HeroCard): Record<string, string> {
  return Object.fromEntries(hero.variables.map((v) => [v.key, v.defaut]));
}

/** Brief collé sur le projet : Cursor / Claude / le copilote s'en servent. */
export function landingBrief(hero: HeroCard, values: Record<string, string>) {
  const filled = fillHeroPrompt(hero.prompt, values);
  return [
    `# ${values.MARQUE} — ${hero.nom}`,
    ``,
    `Landing à générer dans le repo. Ouvre Cursor, Claude Code ou le copilote et construis la page à partir de ce brief. Objectif : une landing publiable en cinq minutes.`,
    ``,
    `## Identité`,
    `- Marque : ${values.MARQUE}`,
    `- Titre : ${values.TITRE}`,
    `- Sous-titre : ${values.SOUS_TITRE}`,
    `- CTA : ${values.CTA_PRINCIPAL} / ${values.CTA_SECONDAIRE}`,
    `- Fond ${values.COULEUR_FOND} · Accent ${values.COULEUR_ACCENT} · Texte ${values.COULEUR_TEXTE}`,
    `- Police : ${values.POLICE_TITRE}`,
    `- Photo : ${values.URL_PORTRAIT || "—"}`,
    `- Preuve : ${values.PREUVE || "—"}`,
    ``,
    `## Prompt`,
    filled,
    ``,
    `## DESIGN.md`,
    designMdFromHero(values),
    ``,
    `## Skill landing (Open Design → Navpit)`,
    OD_SKILLS[0].brief,
  ].join("\n");
}

export function promptForTool(tool: CopyTool, filled: string) {
  switch (tool) {
    case "Cursor":
      return `Dans ce repo Next.js App Router, crée \`components/hero.tsx\` (client) selon ce brief. N'importe pas de design existant.\n\n${filled}`;
    case "Claude Code":
      return `Crée un composant hero autonome \`components/hero.tsx\` dans ce projet Next.js. Suit le brief à la lettre.\n\n${filled}`;
    case "Lovable":
      return `Page d'accueil : un seul hero full viewport. Voici le brief exact.\n\n${filled}`;
    case "v0":
      return `Generate one original React hero section. Follow this brief exactly.\n\n${filled}`;
  }
}
