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
 * flowchart et classDiagram seulement : le parseur Excalidraw les tient.
 */
export const SCHEMA_AGENTS: SchemaAgent[] = [
  {
    kind: "architecture",
    label: "Architecture technique",
    hint: "Front, back, base, services",
    icon: "layers",
    brief:
      "Dessine l'architecture en `flowchart LR`. Nœuds : navigateur, front, API, base, auth, paiement, 2 services max. subgraph par couche (Client, App, Data). Losange seulement pour une vraie décision.",
  },
  {
    kind: "parcours",
    label: "Parcours utilisateur",
    hint: "Découverte → premier résultat",
    icon: "route",
    brief:
      "Dessine le parcours cible en `flowchart LR` : découverte, landing, inscription, première action utile, résultat, paiement. Losanges pour les frictions. 10 à 14 nœuds.",
  },
  {
    kind: "tunnel",
    label: "Tunnel de la landing",
    hint: "Les 12 frames adaptées au projet",
    icon: "gallery-vertical-end",
    brief:
      "Dessine le tunnel landing en `flowchart TD`, une case par frame (Navbar, Hero, Preuve, Probleme, Marche, Fonctions, Demo, Temoignages, Resultats, Tarifs, FAQ, CTA). Message concret du projet, 6 mots max par case. 4 subgraph : Attention, Interet, Desir, Action.",
  },
  {
    kind: "roadmap",
    label: "Roadmap",
    hint: "Fait, en cours, à faire, 1ère vente",
    icon: "map",
    brief:
      "Dessine la roadmap en `flowchart TD` avec 4 subgraph reliés : Fait, En cours, A faire, Premiere vente. Tâches réelles du projet, 5 max par groupe.",
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
      "Tu es l'agent Formation. Dessine le tunnel de vente d'une formation en `flowchart TD`. subgraph obligatoires dans cet ordre : Promesse, Parcours eleve (5 modules max), Preuves, Offre et prix, Apres achat (onboarding). Chaque nœud = verbe + objet, 5 mots max. Utilise des formes : rectangle = etape, losange = objection, stadium (( )) = resultat. Si audience / promesse / prix sont fournis, ne les invente pas. Pas de chiffres inventés.",
  },
  {
    kind: "offre",
    label: "Offre et pricing",
    hint: "Promesse, piliers, objections, prix",
    icon: "badge-euro",
    fields: FORMATION_FIELDS.filter((f) => f.key !== "duree"),
    brief:
      "Tu es l'agent Offre. Dessine l'offre en `flowchart TD`. subgraph : Promesse, 3 piliers, Objections (losanges), Prix (3 offres si possible), Garantie. Libellés concrets du projet, 5 mots max. Stadium pour le CTA final. N'invente pas de prix si aucun n'est donné : écris Prix a definir.",
  },
];

export const SCHEMA_RULES = `Tu dessines des schémas pour un fondateur solo (SaaS ou formation, France).
Réponds UNIQUEMENT avec un bloc \`\`\`mermaid, rien avant ni après.

Mermaid strict (sinon le dessin casse) :
- flowchart TD, flowchart LR ou classDiagram uniquement.
- Pas de style, classDef, linkStyle, click, emoji, HTML, ni fa: icônes.
- Identifiants ASCII courts : a1, hero, pay, m1.
- Chaque libellé entre guillemets doubles. 6 mots max. Pas de parenthèses, pas de :, pas de /.
- 8 à 16 nœuds. Lisibles sur téléphone.
- subgraph Noms sans accents ni ponctuation (Attention, Interet, Desir).
- N'invente pas de chiffres. Si une info manque, reste générique.

Formes :
- rectangle id["Texte"] = étape
- losange id{"Texte"} = décision ou objection
- stadium id(["Texte"]) = résultat ou CTA`;

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
  return /^(flowchart|graph|classDiagram)\b/m.test(src);
}
