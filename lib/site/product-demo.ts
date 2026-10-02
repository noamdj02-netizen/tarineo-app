/**
 * Données de démonstration marketing uniquement.
 * Ne pas brancher sur les APIs métier — présentation landing.
 */
export const PRODUCT_DEMO = {
  mark: "Exemple",
  chantier: {
    name: "Chantier Madame Dupont",
    address: "12 rue des Acacias, 69003 Lyon",
    status: "En cours" as const,
    devis: 7171.2,
    achats: 442.8,
    marge: 6728.4,
    margePct: 93.8,
    documents: 4,
  },
  hausse: {
    product: "Tube PVC Ø 500",
    supplier: "Cedeo Lyon",
    pct: 9.8,
    before: 442.8,
    after: 486.2,
  },
  kpis: [
    { label: "Devis à envoyer", value: "3", hint: "prêts côté client", accent: "#FF6B1A" },
    { label: "Hausses", value: "2", hint: "prix fournisseur", accent: "#F59E0B" },
    { label: "Factures client", value: "5", hint: "pièces émises", accent: "#16A34A" },
    { label: "Relances", value: "1", hint: "à traiter", accent: "#9A9A9A" },
    { label: "Achats du mois", value: "4 280 €", hint: "HT lignes", accent: "#9A9A9A" },
  ],
  actions: [
    {
      title: "Devis rénovation salle de bain",
      hint: "Madame Dupont · prêt à envoyer",
      cta: "Envoyer",
      tone: "orange" as const,
    },
    {
      title: "Tube PVC Ø 500 chez Cedeo",
      hint: "Hausse +9,8 % · à vérifier",
      cta: "Voir",
      tone: "amber" as const,
    },
    {
      title: "Facture n° FAC-2026-041",
      hint: "Martin Élec · à relancer",
      cta: "Relancer",
      tone: "orange" as const,
    },
  ],
  chantiers: [
    {
      name: "Chantier Madame Dupont",
      client: "Madame Dupont",
      address: "12 rue des Acacias, Lyon",
      status: "En cours" as const,
      docs: 4,
      devis: 7171,
      achats: 443,
      margePct: 93.8,
    },
    {
      name: "Villa Les Pins",
      client: "SCI Les Pins",
      address: "Caluire-et-Cuire",
      status: "Pause" as const,
      docs: 7,
      devis: 12450,
      achats: 3180,
      margePct: 74.5,
    },
  ],
  alertes: [
    { label: "Tube PVC Ø 500", party: "Cedeo Lyon", pct: 9.8 },
    { label: "Câble U1000 R2V 3G2.5", party: "Rexel", pct: 4.2 },
  ],
  achats: {
    total: 4280,
    deltaPct: 12,
    topEnseigne: "Cedeo",
    topAmount: 2140,
  },
  activity: [
    { label: "Devis client créé · Madame Dupont", when: "Il y a 2 h", hot: true },
    { label: "Facture FAC-2026-041 émise", when: "Hier", hot: false },
    { label: "Document Cedeo importé", when: "Hier", hot: true },
    { label: "Hausse détectée · Tube PVC Ø 500", when: "Il y a 2 j", hot: true },
  ],
  analysisChecks: [
    "Client identifié",
    "Chantier identifié",
    "Lignes détectées",
    "TVA détectée",
    "Total HT détecté",
  ],
  analysisPoints: 2,
  analysisReviewItems: [
    "Quantité Tube PVC Ø 500 à confirmer",
    "TVA 20 % à valider avant envoi",
  ],
  pipeline: [
    { id: "devis", label: "Devis", meta: "Accepté · Madame Dupont", amount: "7 171,20 €" },
    { id: "commande", label: "Commande", meta: "Bon de commande", amount: "7 171,20 €" },
    { id: "facture", label: "Facture", meta: "Facture client", amount: "7 171,20 €" },
  ],
} as const;

/** Modules produit pour la grille éditoriale — capacités réelles, pas de gadgets. */
export const PRODUCT_MODULES = [
  {
    id: "devis-ia",
    title: "Devis IA",
    text: "Document, saisie ou voix : un devis structuré, PDF à votre logo.",
    span: "lg:col-span-2",
  },
  {
    id: "chantiers",
    title: "Chantiers",
    text: "Devis, achats, documents et marge dans le même contexte.",
    span: "lg:col-span-2",
  },
  {
    id: "achats",
    title: "Achats",
    text: "Dépenses par enseigne, mois après mois, pour préparer vos remises.",
    span: "lg:col-span-1 lg:row-span-2",
  },
  {
    id: "documents",
    title: "Documents fournisseurs",
    text: "PDF ou photo : extraction des lignes et alerte dès +3 %.",
    span: "lg:col-span-2",
  },
  {
    id: "prix",
    title: "Analyse des prix",
    text: "Comparaison à votre historique : dernier prix, moyenne, écart.",
    span: "lg:col-span-1",
  },
  {
    id: "facturation",
    title: "Facturation",
    text: "Devis → commande → facture, sans ressaisie inutile.",
    span: "lg:col-span-1",
  },
  {
    id: "copilote",
    title: "Copilote",
    text: "Questions sur vos chantiers, réponses appuyées sur vos documents.",
    span: "lg:col-span-2",
  },
] as const;

/* ------------------------------------------------------------------ */
/* Hero — scènes du flux documentaire                                  */
/* ------------------------------------------------------------------ */

export type HeroDocLine = {
  label: string;
  value?: string;
  /** Ligne de contexte : rendue en gris, sans emphase. */
  soft?: boolean;
};

export type HeroDoc = {
  /** Type de pièce, affiché en titre de carte. */
  kind: string;
  /** Pastille de format ou de statut (PDF, Accepté…). */
  tag?: string;
  party: string;
  partyMeta: string;
  /** Enseigne reconnue par SupplierLogo, sinon initiale du tiers. */
  logo?: string;
  lines: HeroDocLine[];
  highlight?: { label: string; value: string; tone: "gain" | "alert" };
  total: { label: string; value: string };
};

export type HeroScene = {
  id: string;
  /** Libellé court pour les contrôles de scène. */
  label: string;
  /** Phrase lue par les lecteurs d’écran à la place de l’animation. */
  summary: string;
  source: HeroDoc;
  engine: { title: string; steps: readonly string[] };
  result: HeroDoc;
};

/**
 * Trois scènes du hero. Montants volontairement cohérents entre eux
 * (coût d’achat → prix de vente, écart en € et en %, TVA) : ce sont des
 * exemples, affichés comme tels, jamais des statistiques réelles.
 */
export const HERO_SCENES: readonly HeroScene[] = [
  {
    id: "analyser",
    label: "Analyser un devis",
    summary:
      "TARINEO lit un devis fournisseur Point.P à 442,80 € HT, en extrait les lignes, puis prépare un devis client à 598,00 € HT avec une marge estimée de 26 %.",
    source: {
      kind: "Devis fournisseur",
      tag: "PDF",
      party: "Point.P Lyon Est",
      partyMeta: "N° DEV-2026-0842",
      logo: "Point.P",
      lines: [
        { label: "Tube PVC Ø 500", value: "442,80 €" },
        { label: "Joint Ø 500", value: "4 u", soft: true },
        { label: "Collier Ø 500", value: "8 u", soft: true },
      ],
      total: { label: "Total HT", value: "442,80 €" },
    },
    engine: {
      title: "Analyse en cours",
      steps: [
        "Extraction des données",
        "Vérification des prix",
        "Comparaison historique",
        "Calcul de la marge",
      ],
    },
    result: {
      kind: "Devis client",
      tag: "Prêt",
      party: "Madame Dupont",
      partyMeta: "12 rue des Acacias, Lyon",
      lines: [
        { label: "Tube PVC Ø 500 posé", value: "598,00 €" },
        { label: "Fourniture et pose", soft: true },
      ],
      highlight: { label: "Marge estimée", value: "26 %", tone: "gain" },
      total: { label: "Total HT", value: "598,00 €" },
    },
  },
  {
    id: "hausse",
    label: "Surveiller une hausse",
    summary:
      "TARINEO compare un nouveau prix Rexel de 486,20 € à votre dernier prix payé de 442,80 € et signale une hausse de 43,40 €, soit 9,8 %.",
    source: {
      kind: "Votre historique",
      tag: "12 mois",
      party: "Rexel Lyon",
      partyMeta: "Tube PVC Ø 500",
      logo: "Rexel",
      lines: [
        { label: "Dernier prix payé", value: "442,80 €" },
        { label: "Moyenne 12 mois", value: "438,10 €", soft: true },
      ],
      total: { label: "Référence", value: "442,80 €" },
    },
    engine: {
      title: "Comparaison des prix",
      steps: [
        "Lecture du document",
        "Rapprochement de la référence",
        "Écart calculé",
        "Seuil d’alerte 3 %",
      ],
    },
    result: {
      kind: "Hausse détectée",
      tag: "Alerte",
      party: "Rexel Lyon",
      partyMeta: "Facture du 12 mars 2026",
      logo: "Rexel",
      lines: [
        { label: "Nouveau prix", value: "486,20 €" },
        { label: "Écart", value: "+ 43,40 €" },
      ],
      highlight: { label: "Variation", value: "+ 9,8 %", tone: "alert" },
      total: { label: "Total HT", value: "486,20 €" },
    },
  },
  {
    id: "transformer",
    label: "Transformer un document",
    summary:
      "TARINEO reprend un devis client accepté de 7 171,20 € HT et en produit la facture correspondante, soit 8 605,44 € TTC avec 20 % de TVA.",
    source: {
      kind: "Devis client",
      tag: "Accepté",
      party: "Madame Dupont",
      partyMeta: "Chantier Madame Dupont",
      lines: [
        { label: "Total des lignes", value: "7 171,20 €" },
        { label: "14 lignes · 3 lots", soft: true },
      ],
      total: { label: "Total HT", value: "7 171,20 €" },
    },
    engine: {
      title: "Conversion en cours",
      steps: [
        "Reprise des lignes",
        "Report des quantités",
        "Report de la TVA",
        "Numérotation",
      ],
    },
    result: {
      kind: "Facture client",
      tag: "Émise",
      party: "Madame Dupont",
      partyMeta: "N° FAC-2026-041",
      lines: [
        { label: "Total HT", value: "7 171,20 €" },
        { label: "TVA 20 %", value: "1 434,24 €" },
      ],
      total: { label: "Total TTC", value: "8 605,44 €" },
    },
  },
];

/** Critically damped spring — Apple default for UI enter. */
export const PRODUCT_SPRING = { type: "spring" as const, bounce: 0, duration: 0.4 };
export const PRODUCT_SPRING_FAST = { type: "spring" as const, bounce: 0, duration: 0.3 };

export const PRODUCT_EASE = [0.2, 0.8, 0.2, 1] as const;
