/** Copy + assets — documents métier (devis / factures), pas de photos témoins. */

export const COPY = {
  unlock: "Protégez votre marge",
  waiting: "Fini le chaos documents",
  addTask: "Importer",
  upload: "Importez vos devis",
  uploadFile: "DEVIS.pdf",
  prompt:
    "Analyse ces devis et factures fournisseurs. Identifie les hausses et l’impact sur ma marge chantier.",
  makeSimple: "Votre métier,",
  makeSimpleEnd: "simplifié.",
  workBadge: "TARINEO",
  startNow: "Maintenant.",
  brand: "TARINEO",
  url: "app.tarineo.com",
} as const;

export type DevisSample = {
  id: string;
  kind: "DEVIS" | "FACTURE" | "BON";
  ref: string;
  title: string;
  supplier: string;
  trade?: string;
  orangeBg?: boolean;
  lines: readonly { label: string; amount: number }[];
  totalHt: number;
};

/** 3 documents — même grille que l’ancienne scène « portraits ». */
export const DEVIS_SAMPLES: DevisSample[] = [
  {
    id: "devis-plombier",
    kind: "DEVIS",
    ref: "Devis 2026-014",
    title: "SDB · Madame Dupont",
    supplier: "Cedeo",
    trade: "PLOMBIER",
    orangeBg: false,
    lines: [
      { label: "Tube PVC Ø 500", amount: 248 },
      { label: "Main-d’œuvre, 6 h", amount: 360 },
      { label: "Déplacement", amount: 60 },
    ],
    totalHt: 1310,
  },
  {
    id: "devis-electricien",
    kind: "DEVIS",
    ref: "Devis 2026-028",
    title: "Rénovation · Martin",
    supplier: "Rexel",
    trade: "ÉLECTRICIEN",
    orangeBg: true,
    lines: [
      { label: "Câble 3G2,5 — 120 m", amount: 420 },
      { label: "Tableau divisionnaire", amount: 890 },
      { label: "Pose & raccordement", amount: 1240 },
    ],
    totalHt: 4280,
  },
  {
    id: "facture-chauffage",
    kind: "FACTURE",
    ref: "FAC-2026-08421",
    title: "Chauffage · Leroy",
    supplier: "Point.P",
    trade: "CHAUFFAGISTE",
    orangeBg: false,
    lines: [
      { label: "Tube PER 20×16", amount: 485 },
      { label: "Collecteur 5 sorties", amount: 312 },
      { label: "Isolation calorifuge", amount: 142 },
    ],
    totalHt: 1284,
  },
];

/** Pièces jointes du prompt Copilote. */
export const PROMPT_ATTACHMENTS: DevisSample[] = [
  DEVIS_SAMPLES[0],
  {
    id: "facture-pointp",
    kind: "FACTURE",
    ref: "Facture sept.",
    title: "Achats chantier",
    supplier: "Point.P",
    lines: [
      { label: "Matériel divers", amount: 612 },
      { label: "Frais port", amount: 48 },
    ],
    totalHt: 660,
  },
  {
    id: "bon-cedeo",
    kind: "BON",
    ref: "BC-4421",
    title: "Commande urgence",
    supplier: "Cedeo",
    lines: [{ label: "Vanne 3/4", amount: 1995 }],
    totalHt: 1995,
  },
];
