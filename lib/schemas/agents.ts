import type { SchemaKind } from "@/lib/supabase/types";

export type SchemaAgent = {
  kind: Exclude<SchemaKind, "libre">;
  label: string;
  /** ce que l'agent dessine, affiché dans le choix */
  hint: string;
  /** consigne donnée à Claude, en plus des règles communes */
  brief: string;
};

/**
 * Agents qui dessinent un schéma à partir de la fiche projet.
 * Ils répondent en Mermaid : seuls flowchart et classDiagram deviennent des formes
 * Excalidraw modifiables, les autres types arriveraient en image figée.
 */
export const SCHEMA_AGENTS: SchemaAgent[] = [
  {
    kind: "architecture",
    label: "Architecture technique",
    hint: "Front, back, base de données, services externes",
    brief:
      "Dessine l'architecture technique du projet en `flowchart LR` : navigateur, front, API, base de données, auth, paiement, services tiers. Base-toi sur la stack. Regroupe par couche avec des subgraph.",
  },
  {
    kind: "parcours",
    label: "Parcours utilisateur",
    hint: "De la découverte au premier résultat",
    brief:
      "Dessine le parcours de la cible en `flowchart LR` : découverte, landing, inscription, première action utile, moment « waouh », paiement. Ajoute les points de friction probables en losange (décision).",
  },
  {
    kind: "tunnel",
    label: "Tunnel de la landing",
    hint: "Les 12 frames adaptées au projet",
    brief:
      "Dessine le tunnel de la landing en `flowchart TD`, une case par frame (Navbar, Hero, Bande de preuve, Problème, Comment ça marche, Fonctionnalités, Démo, Témoignages, Résultats, Tarifs, FAQ, CTA final). Dans chaque case, le message concret pour CE projet en 8 mots max. Regroupe en 4 subgraph : Attention, Intérêt, Désir, Action.",
  },
  {
    kind: "roadmap",
    label: "Roadmap",
    hint: "Fait, en cours, à faire, jusqu'à la première vente",
    brief:
      "Dessine la roadmap en `flowchart TD` avec 4 subgraph dans l'ordre, reliés par des flèches : Fait, En cours, À faire, Première vente. Mets les fonctionnalités et tâches réelles du projet dans le bon groupe, 6 éléments max par groupe.",
  },
  {
    kind: "donnees",
    label: "Modèle de données",
    hint: "Tables, champs clés et relations",
    brief:
      "Dessine le modèle de données en `classDiagram` : une classe par table avec ses 3 à 6 champs clés (nom et type simple), et les relations avec cardinalités. Déduis les tables des fonctionnalités.",
  },
];

export const SCHEMA_RULES = `Tu es un agent qui dessine des schémas pour les projets de Noam (solo founder SaaS, France).
Réponds UNIQUEMENT avec un bloc \`\`\`mermaid, sans texte avant ni après.
Règles Mermaid :
- flowchart ou classDiagram uniquement, comme demandé.
- Pas de style, classDef, linkStyle, click ni emoji.
- Identifiants courts en ASCII (a1, api, db…), libellés en français entre guillemets doubles, 6 mots max.
- 8 à 20 nœuds, lisible sur un écran de téléphone.
- N'invente pas de chiffres. Si une info manque, reste générique.`;

export const SCHEMA_KIND_LABELS: Record<SchemaKind, string> = {
  libre: "Libre",
  ...Object.fromEntries(SCHEMA_AGENTS.map((a) => [a.kind, a.label])),
} as Record<SchemaKind, string>;

export function isSchemaKind(v: unknown): v is SchemaKind {
  return v === "libre" || SCHEMA_AGENTS.some((a) => a.kind === v);
}

/** Extrait le code Mermaid d'une réponse (bloc ```mermaid ou texte brut). */
export function extractMermaid(text: string) {
  const block = text.match(/```(?:mermaid)?\s*\n([\s\S]*?)```/);
  return (block ? block[1] : text).trim();
}
