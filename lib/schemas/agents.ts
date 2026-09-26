import type { SchemaKind } from "@/lib/supabase/types";

export type SchemaAgent = {
  kind: Exclude<SchemaKind, "libre">;
  label: string;
  hint: string;
  brief: string;
  icon: string;
  /** champs extra affichés dans le dialogue */
  fields?: SchemaField[];
};

export type SchemaField = {
  key: string;
  label: string;
  placeholder: string;
};

const FORMATION_FIELDS: SchemaField[] = [
  { key: "audience", label: "Pour qui", placeholder: "Ex : artisans qui vendent en ligne" },
  { key: "promesse", label: "Promesse", placeholder: "Ex : 1ère vente en 30 jours" },
  { key: "format", label: "Format", placeholder: "Ex : cohorte 4 semaines, live + replay" },
  { key: "prix", label: "Prix", placeholder: "Ex : 490 €" },
  { key: "duree", label: "Durée", placeholder: "Ex : 6 modules, 8 h" },
];

/**
 * Agents qui dessinent un schéma à partir de la fiche projet.
 * mindmap = tableau type Excalidraw / GitMind. classDiagram = modèle.
 */
export const SCHEMA_AGENTS: SchemaAgent[] = [
  {
    kind: "architecture",
    label: "Architecture technique",
    hint: "Front, back, base, services",
    icon: "layers",
    brief:
      "Dessine une mindmap. Racine = nom du projet. 4 branches : Client, App, Data, Services. Feuilles = vrais outils de la stack (navigateur, Next, API, Postgres, auth, Stripe). 12 nœuds max. 5 mots max par nœud.",
  },
  {
    kind: "parcours",
    label: "Parcours utilisateur",
    hint: "Découverte → premier résultat",
    icon: "route",
    brief:
      "Dessine une mindmap. Racine = la cible. Branches : Decouverte, Landing, Action, Resultat, Paiement. 2 ou 3 feuilles par branche, frictions incluses. 12 nœuds max.",
  },
  {
    kind: "tunnel",
    label: "Tunnel de la landing",
    hint: "Les 12 frames adaptées au projet",
    icon: "gallery-vertical-end",
    brief:
      "Dessine une mindmap. Racine = nom du projet. 4 branches : Attention, Interet, Desir, Action. Feuilles = frames (Hero, Preuve, Probleme, Fonctions, Tarifs, FAQ, CTA) avec le message concret, 5 mots max.",
  },
  {
    kind: "roadmap",
    label: "Roadmap",
    hint: "Fait, en cours, à faire, 1ère vente",
    icon: "map",
    brief:
      "Dessine une mindmap. Racine = nom du projet. 4 branches : Fait, En cours, A faire, Premiere vente. Tâches réelles, 4 max par branche.",
  },
  {
    kind: "donnees",
    label: "Modèle de données",
    hint: "Tables, champs, relations",
    icon: "database",
    brief:
      "Dessine le modèle en `classDiagram` : une classe par table, 3 à 6 champs (nom type), relations avec cardinalités. Tables déduites des fonctionnalités.",
  },
  {
    kind: "formation",
    label: "Tunnel de formation",
    hint: "Vendre un cours : promesse, modules, checkout",
    icon: "graduation-cap",
    fields: FORMATION_FIELDS,
    brief:
      "Tu es l'agent Formation. Dessine une mindmap. Racine = la promesse. Branches : Audience, Modules (5 max), Preuves, Offre, Apres achat. Si audience / promesse / prix sont fournis, ne les invente pas. Pas de chiffres inventés.",
  },
  {
    kind: "offre",
    label: "Offre et pricing",
    hint: "Promesse, piliers, objections, prix",
    icon: "badge-euro",
    fields: FORMATION_FIELDS.filter((f) => f.key !== "duree"),
    brief:
      "Tu es l'agent Offre. Dessine une mindmap. Racine = la promesse. Branches : 3 piliers, Objections, Prix, Garantie, CTA. Libellés concrets, 5 mots max. N'invente pas de prix : écris Prix a definir.",
  },
];

export const SCHEMA_RULES = `Tu dessines des schémas pour un fondateur solo (SaaS ou formation, France).
Réponds UNIQUEMENT avec un bloc \`\`\`mermaid, rien avant ni après.

Si l'agent demande une mindmap :
- Première ligne : mindmap
- Ligne suivante : la racine, texte simple (pas de formes).
- Indentation 2 espaces par niveau. 2 niveaux de branches max.
- 8 à 16 nœuds. 5 mots max. Pas d'emoji, pas de :, pas de /, pas de parenthèses.
- Pas de style, classDef, click, HTML.

Si l'agent demande un classDiagram :
- classDiagram uniquement.
- Identifiants ASCII. Pas de style.

N'invente pas de chiffres. Si une info manque, reste générique.`;

export const SCHEMA_KIND_LABELS: Record<SchemaKind, string> = {
  libre: "Libre",
  ...Object.fromEntries(SCHEMA_AGENTS.map((a) => [a.kind, a.label])),
} as Record<SchemaKind, string>;

export function isSchemaKind(v: unknown): v is SchemaKind {
  return v === "libre" || SCHEMA_AGENTS.some((a) => a.kind === v);
}

export function extractMermaid(text: string) {
  const block = text.match(/```(?:mermaid)?\s*\n([\s\S]*?)```/);
  return (block ? block[1] : text).trim();
}

export function looksLikeMermaid(src: string) {
  return /^(flowchart|graph|classDiagram|mindmap)\b/m.test(src);
}
