/**
 * Contenu de la landing TARINEO : textes, démo, tarifs, FAQ.
 * Un seul fichier à modifier — les composants de components/site/ ne contiennent pas de copy métier.
 *
 * Toutes les données chiffrées ci-dessous sont des DONNÉES DE DÉMONSTRATION,
 * affichées comme telles sur la page. Ce ne sont pas des statistiques réelles.
 */

import { BRAND } from "@/lib/brand";
import { supplierDomains } from "@/lib/metier/suppliers";

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export type HeroVideo = {
  webm: string;
  mp4: string;
  poster: string;
  posterMobile: string;
};

/** Offre unique, reprise telle quelle partout sur le site. */
export const OFFER = "1er mois offert, sans carte bancaire";

/** CTA essai : court dans la nav / le footer, long dans le hero et le bandeau final. */
export const CTA_TRIAL = {
  short: "Commencer",
  long: "Essayer TARINEO gratuitement",
} as const;

/** Mention unique pour toute démo chiffrée. */
export const DEMO_MARK = "Exemple";
export const DEMO_NOTE = "Données fictives.";

export const HERO = {
  badge: "Alertes prix · artisans BTP",
  title: "Vos fournisseurs augmentent leurs prix.",
  /** Ligne 2 du H1 — surlignée au marqueur dans le hero landing v2. */
  titleTail: "Vous le voyez ?",
  text:
    "TARINEO lit vos factures et vous alerte dès qu’une référence augmente, avant que ça mange la marge de vos chantiers.",
  primary: { label: "Essayer TARINEO gratuitement", href: "/inscription" },
  secondary: { label: "Découvrir TARINEO", href: "/#devis-facture" },
  founderLine: "Créé par un ancien des Travaux Publics.",
  /** Hero sans vidéo — fichiers conservés dans /public/landing pour d’autres surfaces. */
  video: null as HeroVideo | null,
  image: "/landing/hero-chantier.webp" as string | null,
  imageAlt: "Chantier de construction",
} as const;

/** Bandeau sous le hero : 4 preuves, pas une grille de cartes. */
export const HERO_BENEFITS = [
  {
    title: "Hausses visibles",
    text: "Alerte dès qu’une référence augmente",
    icon: "shield",
  },
  {
    title: "Devis plus rapides",
    text: "IA, voix ou manuel",
    icon: "file",
  },
  {
    title: "Chantiers centralisés",
    text: "Tous vos documents au même endroit",
    icon: "chart",
  },
  {
    title: "Données sécurisées",
    text: "Hébergement en France",
    icon: "lock",
  },
] as const;

/** Ligne d’exemple affichée sous le hero (démo). */
export const HERO_SAMPLE = {
  supplier: "Point.P",
  product: "Tube PER 16×20",
  before: 12.4,
  after: 14.2,
} as const;

/* ------------------------------------------------------------------ */
/* Fournisseurs : domaines pour les logos (logo.dev)                    */
/* ------------------------------------------------------------------ */

/**
 * Domaines logo.dev — dérivés du répertoire métier [`KNOWN_SUPPLIERS`](../metier/suppliers.ts).
 * Les logos restent la propriété de leurs titulaires ; aucun partenariat n'est affiché.
 */
export const SUPPLIER_DOMAINS: Record<string, string> = supplierDomains();

/** Seuil d'alerte de l'app : une hausse compte à partir de +3 % (voir CLAUDE.md de l'app). */
export const ALERT_THRESHOLD = 3;

/* ------------------------------------------------------------------ */
/* Problème                                                            */
/* ------------------------------------------------------------------ */

export const PROBLEM = {
  title: "Vos fournisseurs changent leurs prix.",
  tail: "Vous ne le voyez pas toujours.",
  text: "Devis, factures, bons de commande, tarifs : les documents s’empilent chaque semaine. Les prix bougent, mais personne n’a le temps de vérifier chaque ligne.",
  points: [
    {
      title: "Des documents partout",
      text: "Devis, factures, bons de commande, bons d’enlèvement : en PDF, par mail ou en papier au fond du camion.",
    },
    {
      title: "Des prix qui bougent",
      text: "Quelques centimes sur un raccord, quelques euros sur un câble. Rien de visible sur une seule facture.",
    },
    {
      title: "Une marge qui fond",
      text: "Sur des centaines de références et une année de chantiers, ces écarts finissent par peser sur la marge.",
    },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* Comment ça marche                                                   */
/* ------------------------------------------------------------------ */

export type HowStepId = "import" | "analyse" | "compare";

export const HOW_STEPS: {
  id: HowStepId;
  label: string;
  title: string;
  text: string;
}[] = [
  {
    id: "import",
    label: "Importer",
    title: "Déposez votre PDF ou votre photo.",
    text: "Devis, facture, bon de commande ou bon d’enlèvement : glissez le fichier ou prenez-le en photo sur le chantier.",
  },
  {
    id: "analyse",
    label: "Analyser",
    title: "TARINEO extrait les lignes et les prix.",
    text: "Références, désignations, quantités et prix unitaires sont lus automatiquement. Vous vérifiez, vous corrigez si besoin.",
  },
  {
    id: "compare",
    label: "Comparer",
    title: "Voyez les variations tout de suite.",
    text: "Chaque ligne est comparée à votre historique : ce qui a augmenté, de combien, et depuis quand.",
  },
];

/* ------------------------------------------------------------------ */
/* Document fournisseur (démo interactive)                             */
/* ------------------------------------------------------------------ */

export type DocLine = {
  ref: string;
  label: string;
  before: number;
  after: number;
  since: string;
};
export type DemoDocument = {
  supplier: string;
  kind: string;
  number: string;
  date: string;
  lines: DocLine[];
};

/** Noms de fournisseurs cités à titre d’exemple : aucune relation commerciale ni intégration. */
export const DEMO_DOCUMENTS: DemoDocument[] = [
  {
    supplier: "Cedeo",
    kind: "Devis",
    number: "DV-24817",
    date: "12/09",
    lines: [
      {
        ref: "PER1620",
        label: "Tube PER 16×20, couronne 50 m",
        before: 12.4,
        after: 14.2,
        since: "mars",
      },
      {
        ref: "RAC16",
        label: "Raccord à sertir 16 mm",
        before: 3.85,
        after: 4.1,
        since: "juin",
      },
      {
        ref: "COL100",
        label: "Collecteur 4 départs",
        before: 48.9,
        after: 48.9,
        since: "",
      },
      {
        ref: "VAN34",
        label: "Vanne d’arrêt 3/4",
        before: 17.6,
        after: 19.95,
        since: "avril",
      },
    ],
  },
  {
    supplier: "Point.P",
    kind: "Facture",
    number: "FA-99304",
    date: "08/09",
    lines: [
      {
        ref: "CIM35",
        label: "Ciment CEM II 35 kg",
        before: 9.8,
        after: 10.9,
        since: "mai",
      },
      {
        ref: "PAR13",
        label: "Plaque de plâtre BA13",
        before: 7.2,
        after: 7.2,
        since: "",
      },
      {
        ref: "RAIL48",
        label: "Rail 48 mm, 3 m",
        before: 3.1,
        after: 3.45,
        since: "juillet",
      },
      {
        ref: "SAB04",
        label: "Sable 0/4, big bag",
        before: 62,
        after: 66.5,
        since: "février",
      },
    ],
  },
  {
    supplier: "Rexel",
    kind: "Bon de commande",
    number: "BC-55120",
    date: "03/09",
    lines: [
      {
        ref: "R2V3G25",
        label: "Câble R2V 3G2,5, 100 m",
        before: 118,
        after: 131.5,
        since: "avril",
      },
      {
        ref: "DIF40",
        label: "Interrupteur différentiel 40 A",
        before: 64.9,
        after: 64.9,
        since: "",
      },
      {
        ref: "GAIN20",
        label: "Gaine ICTA 20 mm, 100 m",
        before: 27.4,
        after: 29.8,
        since: "juin",
      },
      {
        ref: "DISJ16",
        label: "Disjoncteur 16 A",
        before: 8.6,
        after: 9.15,
        since: "août",
      },
    ],
  },
  {
    supplier: "Richardson",
    kind: "Facture",
    number: "F-310772",
    date: "29/08",
    lines: [
      {
        ref: "CHA24",
        label: "Chaudière gaz condensation 24 kW",
        before: 1890,
        after: 1985,
        since: "juin",
      },
      {
        ref: "RAD600",
        label: "Radiateur acier 600×1000",
        before: 142,
        after: 149,
        since: "mai",
      },
      {
        ref: "TH01",
        label: "Thermostat d’ambiance",
        before: 54.5,
        after: 54.5,
        since: "",
      },
    ],
  },
  {
    supplier: "Brossette",
    kind: "Bon d’enlèvement",
    number: "BE-70231",
    date: "22/08",
    lines: [
      {
        ref: "WC-SUS",
        label: "Bâti-support WC suspendu",
        before: 189,
        after: 204,
        since: "juillet",
      },
      {
        ref: "MIT-LAV",
        label: "Mitigeur lavabo",
        before: 76.4,
        after: 76.4,
        since: "",
      },
      {
        ref: "SIPH40",
        label: "Siphon 40 mm",
        before: 6.9,
        after: 7.6,
        since: "mars",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Tableau de bord (démo)                                              */
/* ------------------------------------------------------------------ */

export const DASHBOARD_KPIS = [
  { value: 1284, kind: "euro" as const, label: "Impact estimé", accent: true },
  { value: 12.4, kind: "pct" as const, label: "Hausse moyenne" },
  { value: 37, kind: "count" as const, label: "Lignes lues" },
  { value: 8, kind: "count" as const, label: `Hausses > ${ALERT_THRESHOLD} %` },
] as const;

/** Indice de prix moyen sur 12 mois (base 100) — démo. */
export const DASHBOARD_SERIES = [
  100, 100.4, 101.2, 101, 102.6, 104.1, 104.8, 106.9, 108.2, 109.5, 111.1,
  112.4,
];
export const DASHBOARD_MONTHS = [
  "oct.",
  "nov.",
  "déc.",
  "janv.",
  "févr.",
  "mars",
  "avr.",
  "mai",
  "juin",
  "juil.",
  "août",
  "sept.",
];

export const DASHBOARD_ALERTS = [
  { supplier: "Cedeo", product: "Tube PER 16×20", before: 12.4, after: 14.2 },
  { supplier: "Rexel", product: "Câble R2V 3G2,5", before: 118, after: 131.5 },
  {
    supplier: "Point.P",
    product: "Ciment CEM II 35 kg",
    before: 9.8,
    after: 10.9,
  },
  {
    supplier: "Cedeo",
    product: "Vanne d’arrêt 3/4",
    before: 17.6,
    after: 19.95,
  },
  {
    supplier: "Brossette",
    product: "Bâti-support WC",
    before: 189,
    after: 204,
  },
] as const;

/* ------------------------------------------------------------------ */
/* Chantiers (démo)                                                    */
/* ------------------------------------------------------------------ */

export const CHANTIER_DEMO = {
  client: "Rénovation Martin",
  kind: "Salle de bain",
  city: "Rouen",
  steps: [
    "Visite",
    "Devis fournisseurs",
    "Devis client envoyé",
    "Travaux",
    "Facture",
  ],
  /** Étape en cours (1-indexée). */
  current: 3,
  nextAction: "Relancer M. Martin",
  purchases: 2340,
  sales: 4100,
  docs: [
    {
      id: "fournisseur",
      label: "Devis Cedeo",
      detail: "DV-24817 · 12 sept.",
      amount: 2340,
      state: "Analysé",
    },
    {
      id: "client",
      label: "Devis client",
      detail: "Envoyé à M. Martin",
      amount: 4100,
      state: "En attente",
    },
    {
      id: "facture",
      label: "Facture",
      detail: "Après acceptation",
      amount: 4100,
      state: "Ensuite",
    },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* Qui est derrière                                                    */
/* ------------------------------------------------------------------ */

export const FOUNDER = {
  name: "Noam",
  role: "Fondateur de TARINEO",
  /** Photo à déposer dans /public. Absente : un portrait neutre s'affiche à la place. */
  photo: "/landing/fondateur.jpg",
  text: "Bac Pro Travaux Publics, passé chez Colas, il a créé TARINEO pour les artisans qu’il a côtoyés sur les chantiers : des pros qui n’ont pas le temps de vérifier chaque ligne de facture, et qui méritent un outil simple pour protéger leur marge.",
  facts: [
    "Bac Pro Travaux Publics",
    "Passé chez Colas",
    "Fondateur de TARINEO",
  ],
} as const;

/* ------------------------------------------------------------------ */
/* Fournisseurs                                                        */
/* ------------------------------------------------------------------ */

export const SUPPLIERS = [
  { name: "Point.P", docs: 12, change: 6.1, share: 28, spent: 18900 },
  { name: "Rexel", docs: 11, change: 8.7, share: 26, spent: 17880 },
  { name: "Cedeo", docs: 9, change: 9.8, share: 22, spent: 15120 },
  { name: "Brossette", docs: 4, change: 3.2, share: 10, spent: 6880 },
  { name: "Richardson", docs: 3, change: 4.4, share: 8, spent: 5500 },
] as const;

export const SUPPLIERS_DISCLAIMER =
  "Noms cités à titre d’exemple de fournisseurs courants. TARINEO n’est affilié à aucun d’entre eux.";

/* ------------------------------------------------------------------ */
/* Bénéfices                                                           */
/* ------------------------------------------------------------------ */

export type FeatureId =
  "alertes" | "classement" | "depenses" | "comparateur" | "devis" | "export";

/**
 * Fonctionnalités DISPONIBLES dans l'app TARINEO (voir tarineo-app/src/lib/features.ts).
 * `soon` = annoncé mais pas encore livré : affiché avec un badge « Bientôt ».
 */
export const FEATURES: {
  id: FeatureId;
  kicker: string;
  title: string;
  text: string;
  soon?: boolean;
}[] = [
  {
    id: "alertes",
    kicker: "Alertes",
    title: "Alerte dès qu’un prix augmente.",
    text: "Chaque ligne est comparée à votre historique personnel : dernier prix payé, moyenne 12 mois, écart en € et en %. Alerte à partir de +3 %.",
  },
  {
    id: "classement",
    kicker: "Classement",
    title: "Vos factures, classées toutes seules.",
    text: "Du 1er janvier au 31 décembre. Filtrez par mois, par distributeur ou par référence : une facture retrouvée en quelques secondes.",
  },
  {
    id: "depenses",
    kicker: "Tableau de bord",
    title: "Vos achats par distributeur.",
    text: "Dépenses mensuelles et annuelles calculées à chaque facture, avec un objectif par enseigne pour préparer votre remise de fin d’année.",
  },
  {
    id: "comparateur",
    kicker: "Comparateur",
    title: "Le meilleur prix entre vos enseignes.",
    text: "Quand un prix monte, TARINEO vérifie si vous avez payé moins cher la même référence fabricant chez un autre de vos distributeurs.",
  },
  {
    id: "devis",
    kicker: "Devis client",
    title: "Un devis client en 2 minutes.",
    text: "Matériel, taux horaire, frais : PDF à votre logo et SIRET. Dictez-le à la voix, transformez-le en facture en un clic.",
  },
  {
    id: "export",
    kicker: "Prix & export",
    title: "Prix de vente suggéré, export comptable.",
    text: "TARINEO propose un prix de vente à partir de vos derniers achats et de votre marge. Export comptable de vos dépenses en un fichier.",
  },
];

export const FEATURES_SOON = [
  "Rappel de remise de fin d’année",
  "Calculateur de marge chantier",
] as const;

/* ------------------------------------------------------------------ */
/* Pour qui                                                            */
/* ------------------------------------------------------------------ */

export type TradeId =
  | "plombier"
  | "electricien"
  | "chauffagiste"
  | "climaticien"
  | "generale"
  | "multi";

export const AUDIENCE: { id: TradeId; title: string; text: string }[] = [
  {
    id: "plombier",
    title: "Plombiers",
    text: "Tubes, raccords, sanitaires : les références qui bougent le plus souvent.",
  },
  {
    id: "electricien",
    title: "Électriciens",
    text: "Câbles, gaines, appareillage : suivez les écarts au mètre près.",
  },
  {
    id: "chauffagiste",
    title: "Chauffagistes",
    text: "Chaudières, radiateurs, pompes à chaleur : des montants qui pèsent.",
  },
  {
    id: "climaticien",
    title: "Climaticiens",
    text: "Unités, liaisons frigorifiques, supports : comparez avant de chiffrer.",
  },
  {
    id: "generale",
    title: "Entreprises générales",
    text: "Plusieurs fournisseurs, plusieurs chantiers : une seule vue des achats.",
  },
  {
    id: "multi",
    title: "Multi-corps d’état",
    text: "Tous les lots au même endroit, classés par fournisseur et par produit.",
  },
];

/* ------------------------------------------------------------------ */
/* Tarifs                                                              */
/* ------------------------------------------------------------------ */

export type TarineoPlan = {
  id: "starter" | "pro" | "equipe";
  name: string;
  /** €/mois HT, facturation mensuelle. */
  month: number;
  /** €/an HT, facturation annuelle (~20 % de remise). */
  year: number;
  text: string;
  features: { label: string; soon?: boolean }[];
  cta: string;
  href: string;
  featured?: boolean;
  badge?: string;
};

/** Identique à tarineo-app/src/app/(public)/PricingSection.tsx — modifier les deux ensemble. */
export const PRICING_NOTE = `${OFFER}, sur toutes les formules. Prix HT, sans engagement.`;

export const PRICING: TarineoPlan[] = [
  {
    id: "starter",
    name: "Starter",
    month: 17,
    year: 163,
    text: "Pour démarrer et tester sur vos premiers chantiers.",
    features: [
      { label: "150 documents / mois" },
      { label: "3 distributeurs suivis" },
      { label: "Historique 12 mois" },
      { label: "Alertes de hausses de prix" },
    ],
    cta: "Commencer",
    href: "/inscription?plan=starter",
  },
  {
    id: "pro",
    name: "Pro",
    month: 29,
    year: 278,
    text: "Pour les artisans qui veulent tout suivre, sans limite.",
    features: [
      { label: "400 documents / mois" },
      { label: "Tous les distributeurs" },
      { label: "Devis client inclus" },
      { label: "Calcul de marge automatique", soon: true },
      { label: "Export comptable" },
    ],
    cta: "Commencer",
    href: "/inscription?plan=pro",
    featured: true,
    badge: "Populaire",
  },
  {
    id: "equipe",
    name: "Équipe",
    month: 49,
    year: 470,
    text: "Pour les structures avec plusieurs chantiers actifs.",
    features: [
      { label: "1000 documents / mois" },
      { label: "Tout Pro inclus" },
      { label: "Support prioritaire" },
      { label: "Dashboard dirigeant", soon: true },
    ],
    cta: "Commencer",
    href: "/inscription?plan=equipe",
  },
];

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

export type FaqGroup = {
  id: string;
  label: string;
  items: { q: string; a: string }[];
};

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: "documents",
    label: "Documents",
    items: [
      {
        q: "Quels documents puis-je importer ?",
        a: "Devis, factures, bons de commande et bons d’enlèvement fournisseurs, en PDF ou en photo (JPEG, PNG, HEIC), jusqu’à 15 Mo.",
      },
      {
        q: "Puis-je importer une photo ?",
        a: "Oui, prise sur le chantier ou au comptoir. Si la lecture n’est pas assez sûre, TARINEO vous demande de vérifier les lignes concernées avant de les enregistrer.",
      },
      {
        q: "Quels fournisseurs sont compatibles ?",
        a: "TARINEO lit le contenu du document, pas un format propre à une enseigne : Point.P, Rexel, Brossette, Richardson, Aubade ou votre grossiste local. Le nom du distributeur est détecté automatiquement.",
      },
    ],
  },
  {
    id: "analyse",
    label: "Analyse",
    items: [
      {
        q: "Je n’ai pas encore d’historique, ça marche quand même ?",
        a: "Oui. Importez vos factures des 3 derniers mois en une fois, TARINEO construit votre historique automatiquement.",
      },
      {
        q: "Comment TARINEO analyse mes prix ?",
        a: "L’IA lit chaque ligne (référence, désignation, quantité, prix, remise). Le calcul, lui, est fait par TARINEO : chaque prix est comparé à vos propres achats précédents — dernier prix payé et moyenne 12 mois. Une alerte s’affiche au-delà de +3 %.",
      },
      {
        q: "Comparez-vous mes prix avec ceux d’autres artisans ?",
        a: "Non. La comparaison se fait uniquement sur votre historique personnel, jamais avec un référentiel public ni avec les prix d’autres clients.",
      },
      {
        q: "Est-ce que mes données sont conservées ?",
        a: "Vos documents et prix restent sur votre compte, hébergés dans l’Union européenne, visibles par vous seul. Vous pouvez exporter vos données ou supprimer votre compte : tout est réellement effacé, fichiers compris.",
      },
    ],
  },
  {
    id: "abonnement",
    label: "Abonnement",
    items: [
      {
        q: "L’essai est-il vraiment sans carte ?",
        a: "Oui : le 1er mois est offert, sans carte bancaire. Vous ajoutez un moyen de paiement seulement si TARINEO vous est utile.",
      },
      {
        q: "Puis-je annuler mon abonnement ?",
        a: "Oui, à tout moment depuis votre compte. L’abonnement reste actif jusqu’à la fin de la période payée.",
      },
    ],
  },
];

export const FAQ = FAQ_GROUPS.flatMap((g) => g.items);

/* ------------------------------------------------------------------ */
/* CTA final                                                           */
/* ------------------------------------------------------------------ */

export const FINAL_CTA = {
  label: "Commencer",
  title: "Construisez mieux.",
  tail: "Protégez votre marge.",
  text: "TARINEO centralise vos documents, vos achats et vos chantiers.",
  cta: "Commencer avec TARINEO",
  href: "/inscription",
  note: `${OFFER}.`,
} as const;

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

export const NAV_LINKS = [
  { href: "/#devis-ia", label: "Produit" },
  { href: "/#fonctionnalites", label: "Fonctionnalités" },
  { href: "/#comment-ca-marche", label: "Comment ça marche" },
  { href: "/#tarifs", label: "Tarifs" },
] as const;

export const FOOTER_COLS = [
  {
    title: "Produit",
    links: [
      { href: "/#devis-ia", label: "Produit" },
      { href: "/#fonctionnalites", label: "Fonctionnalités" },
      { href: "/#comment-ca-marche", label: "Comment ça marche" },
      { href: "/#tarifs", label: "Tarifs" },
    ],
  },
  {
    title: "Entreprise",
    links: [
      { href: "/#qui", label: "À propos" },
      { href: `mailto:${BRAND.contactEmail}`, label: "Contact" },
    ],
  },
  {
    title: "Légal",
    links: [
      { href: "/confidentialite", label: "Confidentialité" },
      { href: "/cgv", label: "CGV / CGU" },
      { href: "/mentions-legales", label: "Mentions légales" },
    ],
  },
] as const;

/* ------------------------------------------------------------------ */
/* Formatage                                                           */
/* ------------------------------------------------------------------ */

/*
 * Formatage manuel (pas Intl) : identique serveur / navigateur, donc aucune
 * différence d’espace insécable à l’hydratation.
 */
const NBSP = "\u00a0";

function frNumber(n: number, digits: number) {
  const [int, dec] = Math.abs(n).toFixed(digits).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return `${n < 0 ? "−" : ""}${grouped}${dec ? `,${dec}` : ""}`;
}

export const frDec = (n: number, digits = 1) => frNumber(n, digits);
export const euro = (n: number) => `${frNumber(n, 2)}${NBSP}€`;
/** Montants ronds (totaux, impact) : 1 284 €, sans centimes. */
export const euroInt = (n: number) => `${frNumber(n, 0)}${NBSP}€`;
/** Écart en euros : +1,80 € */
export const euroDelta = (n: number) => {
  const sign = n > 0.005 ? "+" : n < -0.005 ? "−" : "";
  return `${sign}${frNumber(Math.abs(n), 2)}${NBSP}€`;
};
export const variation = (before: number, after: number) =>
  ((after - before) / before) * 100;
export const signedPct = (p: number) =>
  `${p > 0.05 ? "+" : ""}${frNumber(Math.abs(p) < 0.05 ? 0 : p, 1)}${NBSP}%`;
