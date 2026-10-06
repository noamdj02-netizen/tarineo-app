/** Contenus de la landing TARINEO. */

export type IconName =
  | "mail"
  | "spark"
  | "site"
  | "doc"
  | "invoice"
  | "check"
  | "box"
  | "calendar"
  | "loupe"
  | "bell"
  | "shield"
  | "link"
  | "history";

export type NavItem = { label: string; href: string };

export type LandingNavGroup = { title: string; items: NavItem[] };

/** Ancres de la page d’accueil — barre centrale desktop. */
export const landingNavPrimary: NavItem[] = [
  { label: "Analyse", href: "#analyse" },
  { label: "Produit", href: "#produit" },
  { label: "Devis client", href: "#devis-facture" },
  { label: "Automatisations", href: "#automatisations" },
  { label: "Blog", href: "/blog" },
  { label: "Tarifs", href: "#tarifs" },
];

/** Menu tiroir — sections regroupées. */
export const landingNavGroups: LandingNavGroup[] = [
  {
    title: "Produit",
    items: [
      { label: "Analyse de devis", href: "#analyse" },
      { label: "Devis fournisseur → client", href: "#devis-facture" },
      { label: "Vue d’ensemble", href: "#produit" },
      { label: "Copilote", href: "#copilote" },
      { label: "Sécurité", href: "#securite" },
    ],
  },
  {
    title: "Automatisation",
    items: [
      { label: "Automatisations", href: "#automatisations" },
      { label: "Connexions & e-mail", href: "#connecter" },
    ],
  },
  {
    title: "Ressources",
    items: [
      { label: "Comment ça marche", href: "#devis-facture" },
      { label: "Blog", href: "/blog" },
      { label: "Tarifs", href: "#tarifs" },
      { label: "Contact", href: "#contact" },
    ],
  },
];

/** @deprecated Préférer `landingNavPrimary` + `landingNavGroups`. */
export const nav: NavItem[] = landingNavGroups.flatMap((g) => g.items);

export const heroProof = [
  "Devis fournisseurs",
  "Hausses de prix",
  "Marge",
  "Documents",
  "Factures",
  "Automatisations",
];

/* ------------------------------------------------------------------ *
 * Analyse de devis — le cœur du produit
 * ------------------------------------------------------------------ */

export type QuoteLine = {
  ref: string;
  label: string;
  qty: string;
  paid: string;
  usual: string;
  delta: string;
  status: "over" | "ok" | "good";
};

/** Version courte, affichée dès le hero. */
export const heroQuote: {
  supplier: string;
  reference: string;
  caption: string;
  lines: Pick<QuoteLine, "ref" | "label" | "paid" | "usual" | "delta">[];
  verdict: string;
  overcost: string;
} = {
  supplier: "Fournisseur",
  reference: "Devis n° 2026-014",
  caption: "3 lignes comparées à vos prix habituels.",
  lines: [
    {
      ref: "PVC100",
      label: "Tube PVC évacuation Ø 100",
      paid: "24,60 €",
      usual: "22,40 €",
      delta: "+9,8 %",
    },
    {
      ref: "U1000",
      label: "Câble U1000 R2V 3G2,5 mm²",
      paid: "3,84 €",
      usual: "3,42 €",
      delta: "+12,3 %",
    },
    {
      ref: "DISJ20",
      label: "Disjoncteur 20 A courbe C",
      paid: "15,90 €",
      usual: "14,80 €",
      delta: "+7,4 %",
    },
  ],
  verdict: "3 lignes au-dessus de vos prix habituels",
  overcost: "96,40 € de trop sur ce devis",
};

/** Version complète, section « Analyse de devis ». */
export const analysedQuote: {
  supplier: string;
  reference: string;
  date: string;
  total: string;
  gap: string;
  lines: QuoteLine[];
  verdict: string;
  advice: string;
} = {
  supplier: "Point.P",
  reference: "Devis n° 2026-014",
  date: "Reçu le 21 septembre",
  total: "1 310,00 € HT",
  gap: "+8,4 %",
  lines: [
    {
      ref: "PVC100",
      label: "Tube PVC évacuation Ø 100",
      qty: "6",
      paid: "24,60 €",
      usual: "22,40 €",
      delta: "+9,8 %",
      status: "over",
    },
    {
      ref: "U1000",
      label: "Câble U1000 R2V 3G2,5 mm²",
      qty: "25",
      paid: "3,84 €",
      usual: "3,42 €",
      delta: "+12,3 %",
      status: "over",
    },
    {
      ref: "C2S1",
      label: "Colle carrelage flexible C2 S1",
      qty: "4",
      paid: "38,50 €",
      usual: "36,20 €",
      delta: "+6,4 %",
      status: "over",
    },
    {
      ref: "DISJ20",
      label: "Disjoncteur 20 A courbe C",
      qty: "2",
      paid: "14,80 €",
      usual: "14,80 €",
      delta: "0 %",
      status: "ok",
    },
    {
      ref: "ICTA20",
      label: "Gaine ICTA Ø 20",
      qty: "50",
      paid: "0,92 €",
      usual: "0,95 €",
      delta: "−3,2 %",
      status: "good",
    },
  ],
  verdict: "Surcoût sur ce devis : 96,40 €",
  advice: "Trois lignes à renégocier avant de valider.",
};

/** Historique de prix d'un article suivi dans le temps. */
export const priceHistory: { period: string; price: string; delta?: string }[] = [
  { period: "Janvier", price: "769 €" },
  { period: "Mars", price: "802 €", delta: "+4,3 %" },
  { period: "Juin", price: "834 €", delta: "+4,0 %" },
  { period: "Septembre", price: "861 €", delta: "+3,2 %" },
];

export const priceAlerts: {
  name: string;
  supplier: string;
  from: string;
  to: string;
  delta: string;
}[] = [
  { name: "Câble U1000 R2V 3G2,5 mm²", supplier: "Rexel", from: "3,42 €", to: "3,84 €", delta: "+12,3 %" },
  { name: "Tube PVC Ø 500", supplier: "Brossette", from: "22,40 €", to: "24,60 €", delta: "+9,8 %" },
  { name: "Disjoncteur 20 A courbe C", supplier: "Rexel", from: "14,80 €", to: "15,90 €", delta: "+7,4 %" },
  { name: "Colle carrelage flexible C2 S1", supplier: "Point.P", from: "36,20 €", to: "38,50 €", delta: "+6,4 %" },
];

/* ------------------------------------------------------------------ *
 * Le problème
 * ------------------------------------------------------------------ */

export type LooseDocument = { icon: IconName; title: string; detail: string };

export const looseDocuments: LooseDocument[] = [
  { icon: "mail", title: "Email client", detail: "« Pouvez-vous me chiffrer la salle de bain ? »" },
  { icon: "doc", title: "Devis fournisseur", detail: "Point.P n° 2026-014 · 1 310,00 € HT" },
  { icon: "box", title: "Document fournisseur", detail: "Point.P — chapé & collé" },
  { icon: "invoice", title: "Facture", detail: "Rexel Vénissieux · 2026-09-21" },
  { icon: "calendar", title: "Calendrier", detail: "Visite chantier jeudi 9 h" },
  { icon: "loupe", title: "Prix qui ont bougé", detail: "Câble U1000 · +12,3 %" },
];

/** Ce que l'utilisateur obtient : d'abord de la vérification, pas de l'envoi. */
export const problemOutputs = [
  "Devis vérifié ligne par ligne",
  "Écarts de prix chiffrés",
  "Marge protégée",
];

/* ------------------------------------------------------------------ *
 * Connexion des outils
 * ------------------------------------------------------------------ */

export type ConnectSourceCatalogItem = {
  icon: IconName;
  label: string;
  detail: string;
  logoDomain?: string;
};

export const sourceCatalog: ConnectSourceCatalogItem[] = [
  { icon: "mail", label: "Gmail", detail: "Emails clients et fournisseurs", logoDomain: "google.com" },
  { icon: "mail", label: "Outlook", detail: "Boîte professionnelle", logoDomain: "microsoft.com" },
  { icon: "doc", label: "Documents PDF", detail: "Devis, bons de commande, factures", logoDomain: "adobe.com" },
  { icon: "box", label: "Photos", detail: "Chantiers, plans, métrés", logoDomain: "icloud.com" },
  { icon: "doc", label: "Excel", detail: "Tableaux de suivi et références", logoDomain: "microsoft.com" },
  { icon: "box", label: "Données fournisseurs", detail: "Point.P, Rexel, Brossette…" },
  { icon: "history", label: "Historique des devis", detail: "Vos chiffrages passés", logoDomain: "dropbox.com" },
  { icon: "invoice", label: "Factures", detail: "Achats et ventes", logoDomain: "pennylane.com" },
];

export type ConnectedSourceItem = {
  label: string;
  detail: string;
  done: boolean;
  logoDomain?: string;
  icon: IconName;
};

export const connectedSources: ConnectedSourceItem[] = [
  { label: "Gmail", detail: "Boîte liée", done: true, logoDomain: "google.com", icon: "mail" },
  { label: "Documents", detail: "1 248 pièces lues", done: true, logoDomain: "drive.google.com", icon: "doc" },
  { label: "Fournisseurs", detail: "7 enseignes reconnues", done: true, icon: "box" },
  { label: "Historique", detail: "36 mois de devis", done: true, logoDomain: "dropbox.com", icon: "history" },
  { label: "Calendrier", detail: "Non connecté", done: false, logoDomain: "google.com", icon: "calendar" },
];

/* ------------------------------------------------------------------ *
 * Apprentissage
 * ------------------------------------------------------------------ */

export const analysisCounts: { value: number; label: string; icon: IconName }[] = [
  { value: 42, label: "documents analysés", icon: "spark" },
  { value: 17, label: "devis", icon: "doc" },
  { value: 12, label: "factures", icon: "invoice" },
  { value: 8, label: "bons de commande", icon: "box" },
  { value: 5, label: "emails", icon: "mail" },
];

export const learningActivityFeed: { icon: IconName; text: string; meta: string }[] = [
  { icon: "doc", text: "Devis fournisseur structuré", meta: "À l'instant" },
  { icon: "invoice", text: "Facture achat classée", meta: "Il y a 3 min" },
  { icon: "mail", text: "Email client relié au chantier", meta: "Il y a 8 min" },
];

export const detectedSuppliers = ["Point.P", "Rexel", "Brossette"];

export const detectedRules: { label: string; value: string }[] = [
  { label: "Marge minimale", value: "25 %" },
  { label: "Relance devis", value: "3 jours" },
];

/* ------------------------------------------------------------------ *
 * Automatisations — l'unique chaînage de nœuds de la page
 * ------------------------------------------------------------------ */

export type WorkflowNode = {
  icon: IconName;
  title: string;
  meta?: string;
  /** « ai » marque les étapes d'analyse, « accent » les étapes décidées par l'utilisateur. */
  tone?: "plain" | "ai" | "accent";
};

export const automationFlow: WorkflowNode[] = [
  { icon: "doc", title: "Devis fournisseur reçu", meta: "Point.P n° 2026-014 · 8 h 12" },
  {
    icon: "spark",
    title: "Analyse IA",
    meta: "Chaque ligne comparée à vos prix habituels",
    tone: "ai",
  },
  { icon: "loupe", title: "Écarts chiffrés", meta: "3 lignes au-dessus · 96,40 € de trop" },
  { icon: "invoice", title: "Devis client", meta: "Recalculé avec votre marge" },
  { icon: "check", title: "Validation", meta: "Vous validez avant tout envoi", tone: "accent" },
];

/* ------------------------------------------------------------------ *
 * Copilote
 * ------------------------------------------------------------------ */

export const copilotRequest =
  "Quand je reçois un devis de Point.P, analyse les prix et préviens-moi si ma marge descend sous 25 %.";

/** La règle obtenue, présentée comme une spécification — pas comme un graphe. */
export const copilotRule: {
  name: string;
  rows: { icon: IconName; label: string; value: string }[];
} = {
  name: "Surveillance marge Point.P",
  rows: [
    { icon: "doc", label: "Se déclenche sur", value: "Un devis Point.P reçu dans Gmail" },
    { icon: "spark", label: "Vérifie", value: "La marge recalculée, ligne par ligne" },
    { icon: "bell", label: "Vous prévient si", value: "La marge passe sous 25 %" },
  ],
};

export const copilotSuggestions = [
  "Débriefer un chantier",
  "Rédiger un mail",
  "Lire un document",
  "Lignes du document",
];

/* ------------------------------------------------------------------ *
 * Devis → facture
 * ------------------------------------------------------------------ */

export const quoteSteps = [
  { label: "Devis fournisseur", detail: "Point.P n° 2026-014 · 1 310,00 € HT" },
  { label: "Analyse", detail: "2 lignes lues, références retrouvées" },
  { label: "Marge", detail: "Marge appliquée : 25 %" },
  { label: "Devis client", detail: "Rénovation SDB — Dupont · 1 529,00 € HT" },
  { label: "Facture", detail: "Prête à envoyer, sans ressaisie" },
];

export const transformOptions = [
  "Devis client",
  "Bon de commande client",
  "Bon d'enlèvement",
  "Facture client",
];

/* ------------------------------------------------------------------ *
 * Dashboard
 * ------------------------------------------------------------------ */

export const dashboardKpis: { label: string; value: string; detail: string; tone?: "accent" | "plain" }[] = [
  { label: "Devis", value: "1 529,00 €", detail: "1 devis en cours", tone: "accent" },
  { label: "Achats", value: "2 598,00 €", detail: "2 achats ce mois" },
  { label: "Marge", value: "−1 069,00 €", detail: "−69,9 % à corriger" },
  { label: "Documents", value: "3", detail: "pièces rattachées" },
];

export const dashboardTodo: { kind: "Action" | "Pièce"; title: string; detail: string }[] = [
  { kind: "Action", title: "3 lignes du devis Point.P sont au-dessus du prix habituel", detail: "96,40 € de trop · à renégocier" },
  { kind: "Action", title: "Relancer le devis client — Rénovation SDB Dupont", detail: "En attente depuis 4 jours" },
  { kind: "Pièce", title: "Facture Rexel — commande SDB", detail: "Devis d'achat à transformer" },
];

/* ------------------------------------------------------------------ *
 * Human in the loop
 * ------------------------------------------------------------------ */

export const controlLevels: { title: string; caption: string; items: string[] }[] = [
  {
    title: "Automatique",
    caption: "Tarinéo fait, vous n'y pensez plus.",
    items: ["Classement", "Analyse", "Extraction", "Création de données"],
  },
  {
    title: "Validation",
    caption: "Tarinéo prépare, vous validez.",
    items: ["Devis", "Emails", "Factures"],
  },
  {
    title: "Vous décidez",
    caption: "Tarinéo s'arrête et vous demande.",
    items: ["Actions sensibles"],
  },
];

/* ------------------------------------------------------------------ *
 * Sécurité
 * ------------------------------------------------------------------ */

export const securityItems: { icon: IconName; title: string; detail: string }[] = [
  {
    icon: "link",
    title: "Connexions sécurisées",
    detail: "Vos outils se connectent via OAuth : aucun mot de passe ne transite par Tarinéo.",
  },
  {
    icon: "shield",
    title: "Permissions explicites",
    detail: "Vous choisissez ce que Tarinéo peut lire, et rien de plus.",
  },
  {
    icon: "check",
    title: "Validation humaine",
    detail: "Les envois de devis, d'emails et de factures attendent votre accord.",
  },
  {
    icon: "history",
    title: "Journal des actions",
    detail: "Chaque lecture, extraction et envoi est tracé et consultable.",
  },
  {
    icon: "box",
    title: "Séparation des données",
    detail: "Les données de votre entreprise restent rattachées à votre compte.",
  },
  {
    icon: "spark",
    title: "Contrôle utilisateur",
    detail: "Une automatisation se met en pause ou s'arrête à tout moment.",
  },
];

/* ------------------------------------------------------------------ *
 * Tarifs
 * ------------------------------------------------------------------ */

export const plans: {
  name: string;
  tagline: string;
  price: string;
  priceNote: string;
  features: { label: string; soon?: boolean }[];
  featured?: boolean;
  cta: string;
}[] = [
  {
    name: "Tarinéo Start",
    tagline: "Pour démarrer.",
    price: "49 €",
    priceNote: "par mois, sans engagement",
    features: [
      { label: "Analyse des devis fournisseurs ligne par ligne" },
      { label: "Connexion de la boîte email et des documents" },
      { label: "Suivi des hausses de prix fournisseurs" },
      { label: "Relances de devis" },
      { label: "Analyse IA", soon: true },
    ],
    cta: "Commencer avec Tarinéo",
  },
  {
    name: "Tarinéo Pro",
    tagline: "Pour automatiser son activité.",
    price: "99 €",
    priceNote: "par mois, sans engagement",
    featured: true,
    features: [
      { label: "Tout Tarinéo Start" },
      { label: "Devis fournisseur transformés en devis client" },
      { label: "Automatisations personnalisées" },
      { label: "Copilote : décrivez, Tarinéo construit le workflow" },
      { label: "Export comptable programmé" },
    ],
    cta: "Commencer avec Tarinéo",
  },
  {
    name: "Tarinéo Business",
    tagline: "Pour les entreprises et équipes.",
    price: "Sur devis",
    priceNote: "plusieurs utilisateurs, plusieurs sociétés",
    features: [
      { label: "Tout Tarinéo Pro" },
      { label: "Plusieurs utilisateurs et rôles" },
      { label: "Séparation des données par société" },
      { label: "Accompagnement à la mise en place" },
      { label: "Authentification d'entreprise (SSO)", soon: true },
    ],
    cta: "Parler à l'équipe",
  },
];

/* ------------------------------------------------------------------ *
 * Pied de page
 * ------------------------------------------------------------------ */

export const footerColumns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Produit",
    links: [
      { label: "Analyse de devis", href: "#analyse" },
      { label: "Hausses de prix", href: "#analyse" },
      { label: "Automatisations", href: "#automatisations" },
      { label: "Copilote", href: "#copilote" },
      { label: "Tarifs", href: "#tarifs" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { label: "Comment ça marche", href: "#devis-facture" },
      { label: "Du devis à la facture", href: "#devis-facture" },
      { label: "Blog", href: "/blog" },
      { label: "Sécurité", href: "#securite" },
      { label: "Vue d'ensemble", href: "#produit" },
    ],
  },
  {
    title: "Entreprise",
    links: [
      { label: "Créer un compte", href: "/inscription" },
      { label: "Connexion", href: "/login" },
      { label: "Contact", href: "mailto:contact@tarineo.com" },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "Conditions d'utilisation", href: "/cgv" },
      { label: "Confidentialité", href: "/confidentialite" },
      { label: "Mentions légales", href: "/mentions-legales" },
    ],
  },
];