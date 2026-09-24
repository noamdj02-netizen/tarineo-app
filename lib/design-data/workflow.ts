// Généré par scripts/build-design-data.mjs depuis « Studio Noam.html ».
// Ne pas modifier à la main : relancer `npm run design-data`.

/** Méthode Figma → Cursor en 7 étapes : [titre, texte, bloc spécial]. */
export const FLOW: [string, string, string][] = [
  [
    "Crée des variables dans Figma",
    "Couleurs, typos, rayons et espacements en Variables Figma, avec les mêmes noms que dans le code (accent, surface, radius-md…).",
    "Commence par un des 6 thèmes de l’onglet Thèmes : ce sont déjà tes tokens."
  ],
  [
    "Auto Layout partout",
    "Chaque section, carte et bouton en Auto Layout. Nomme tes calques : Hero, Hero/Title, Hero/CTA. L’IA lit ces noms.",
    "Sans Auto Layout, l’IA ne sait pas comment ça doit passer sur mobile."
  ],
  [
    "Composants Figma = composants code",
    "Button, Card, Badge, PricingCard… en composants avec variantes (primary, secondary). Même nom dans Figma et dans le code.",
    ""
  ],
  [
    "Connecte Figma à Cursor avec le MCP",
    "Active le serveur MCP Figma (Dev Mode) dans Cursor ou Claude Code. L’IA lit alors la vraie structure du fichier au lieu d’une capture.",
    "Copie le lien d’un frame (clic droit → Copier le lien) : il contient le node-id."
  ],
  [
    "Ajoute un fichier de règles au projet",
    "Il dit à l’IA ta stack, tes tokens et ce qui est interdit. Choisis le thème, copie, colle dans .cursor/rules/design.mdc (ou CLAUDE.md).",
    "RULES"
  ],
  [
    "Une section à la fois",
    "Colle le lien du frame et demande une seule section. Vérifie, puis passe à la suivante.",
    "PROMPT"
  ],
  [
    "Compare et range",
    "Mets la maquette et le rendu côte à côte (mobile + desktop). Liste les écarts dans un seul prompt. Quand c’est bon, ajoute le composant à ta bibliothèque.",
    ""
  ]
];

/** Prompt type à coller dans Cursor. */
export const FLOW_PROMPT = "Voici le frame Figma : [colle le lien avec node-id]\nImplémente UNIQUEMENT la section « [Hero] » en respectant .cursor/rules/design.mdc.\n- Lis la structure via le MCP Figma (Auto Layout, espacements, variables).\n- Réutilise nos composants existants (Button, Card, Badge).\n- Aucune valeur en dur : seulement les tokens.\n- Mobile 375 px d'abord, puis desktop 1280 px.\nQuand c'est fait, liste les écarts éventuels avec la maquette.";
