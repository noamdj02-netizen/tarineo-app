/** Contenus landing Tarineo — structure 6 écrans (brief conversion). */

import { PRO_TRIAL_DAYS } from "@/lib/billing/plans";

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

export const landingNavPrimary: NavItem[] = [
  { label: "Parcours", href: "#parcours" },
  { label: "Preuve", href: "#preuve" },
  { label: "Terrain", href: "#terrain" },
  { label: "Produit", href: "#produit" },
  { label: "Tarifs", href: "#tarifs" },
  { label: "FAQ", href: "#faq" },
  { label: "Blog", href: "/blog" },
];

export const landingNavGroups: LandingNavGroup[] = [
  {
    title: "Page",
    items: [
      { label: "Parcours", href: "/#parcours" },
      { label: "Tableau de preuve", href: "/#preuve" },
      { label: "Sur le terrain", href: "/#terrain" },
      { label: "Tarifs", href: "/#tarifs" },
      { label: "FAQ", href: "/#faq" },
      { label: "Blog", href: "/blog" },
    ],
  },
];

export const heroProof = [
  "Devis fournisseurs",
  "Hausses de prix",
  "Marge",
  "Documents",
  "Factures",
  "Automatisations",
];

export type QuoteLine = {
  ref: string;
  label: string;
  qty?: string;
  paid: string;
  usual: string;
  delta: string;
  status: "over" | "ok" | "good";
};

/** Tableau de preuve (écran 3) — chiffres étiquetés Exemple. */
export const proofTable = {
  supplier: "Fournisseur",
  reference: "Devis n° 2026-014",
  exampleLabel: "Exemple",
  lines: [
    {
      ref: "PVC100",
      label: "Tube PVC évacuation Ø 100",
      paid: "24,60 €",
      usual: "22,40 €",
      delta: "+9,8 %",
      status: "over" as const,
    },
    {
      ref: "U1000",
      label: "Câble U1000 R2V 3G2,5 mm²",
      paid: "3,84 €",
      usual: "3,42 €",
      delta: "+12,3 %",
      status: "over" as const,
    },
    {
      ref: "DISJ20",
      label: "Disjoncteur 20 A courbe C",
      paid: "15,90 €",
      usual: "14,80 €",
      delta: "+7,4 %",
      status: "over" as const,
    },
    {
      ref: "ICTA20",
      label: "Gaine ICTA Ø 20",
      paid: "0,92 €",
      usual: "0,95 €",
      delta: "−3,2 %",
      status: "good" as const,
    },
  ],
  overcost: "Surcoût identifié : 96,40 €",
};

/** Hero démo — mêmes lignes, version courte pour l’animation. */
export const heroQuote = {
  supplier: proofTable.supplier,
  reference: proofTable.reference,
  caption: "Exemple · 4 lignes comparées à vos prix habituels.",
  lines: proofTable.lines.map(({ ref, label, paid, usual, delta }) => ({
    ref,
    label,
    paid,
    usual,
    delta,
  })),
  verdict: "3 hausses repérées sur ce devis",
  overcost: proofTable.overcost,
};

export const journeySteps = [
  {
    step: 1,
    title: "Importez votre historique",
    detail: "PDF ou photo : Tarineo apprend vos prix habituels.",
  },
  {
    step: 2,
    title: "Scannez un document fournisseur",
    detail: "Devis, bon d’enlèvement, bon de commande ou facture. L’IA lit chaque ligne.",
  },
  {
    step: 3,
    title: "Voyez chaque hausse et chaque baisse",
    detail: "En % et en euros, comparé à vos achats.",
  },
  {
    step: 4,
    title: "Validez ou renégociez",
    detail: "Un clic pour valider, ou un mail déjà rédigé pour votre commercial.",
  },
  {
    step: 5,
    title: "Transformez-le pour votre client",
    detail: "Devis client, commande client ou facture client.",
    pills: ["Devis client", "Commande client", "Facture client"],
  },
];

export const renegotiationMail = {
  title: "Renégociez en 10 secondes",
  badgeSoon: false,
  subject: "Devis n° 2026-014 — prix tube PVC",
  body: `Bonjour [Prénom],

Sur le devis n° 2026-014, le tube PVC passe de 22,40 € à 24,60 € (+9,8 % par rapport à mes derniers achats).

Pouvez-vous revoir ce prix ?

Cordialement,`,
  exampleNote: "Exemple",
};

export const transformBlock = {
  title: "De votre achat à votre facture client",
  body:
    "Un bon d’enlèvement rapporté du comptoir ? Un devis de Point P ? Transformez-le en devis, en commande ou en facture pour votre client, avec vos prix d’achat réels, votre marge, votre logo et vos mentions légales.",
  supplierPills: ["Devis", "Bon d’enlèvement", "Bon de commande", "Facture"],
  clientPills: ["Devis client", "Commande client", "Facture client"],
  combinationsNote: "Et plus encore",
};

export type PastilleChip = { label: string; soon?: boolean };

export type PastilleRow = {
  id: string;
  label: string;
  /** Une phrase pour expliquer le pilier aux artisans. */
  summary: string;
  dotClass: string;
  chips: PastilleChip[];
};

export const pastilleRows: PastilleRow[] = [
  {
    id: "achats",
    label: "Achats fournisseurs",
    summary: "Comparez les enseignes, suivez les hausses et gardez un historique de prix par référence.",
    dotClass: "bg-tarineo-orange",
    chips: [
      { label: "Comparateur d’enseignes" },
      { label: "Hausses de prix" },
      { label: "Historique des prix" },
      { label: "Objectifs et BFA fournisseurs", soon: true },
      { label: "Doublons détectés", soon: true },
    ],
  },
  {
    id: "chantiers",
    label: "Chantiers & clients",
    summary: "Chaque dossier regroupe documents, marge et prochaines actions — relances comprises.",
    dotClass: "bg-emerald-600",
    chips: [
      { label: "Gestion des chantiers" },
      { label: "Marge par chantier" },
      { label: "Devis à la voix", soon: true },
      { label: "Relances clients" },
      { label: "Planning" },
    ],
  },
  {
    id: "quotidien",
    label: "Au quotidien",
    summary: "Export compta, copilote et paramètres entreprise : le reste de l’admin sans tableur.",
    dotClass: "bg-sky-600",
    chips: [
      { label: "Export comptable" },
      { label: "Copilote IA" },
      { label: "Score de confiance IA", soon: true },
      { label: "Logo et mentions légales" },
      { label: "Prix suggérés", soon: true },
    ],
  },
];

export const captureSection = {
  title: "Votre atelier numérique,",
  titleMuted: "organisé comme sur le terrain.",
  subtitle:
    "Un tableau de bord par chantier : ce qui a bougé chez vos fournisseurs, ce qu’il reste à valider, ce qu’il faut envoyer au client. Ci-dessous, l’interface réelle de l’app (données d’exemple).",
};

export const pricingIntro = {
  title: "Tarifs",
  headline: "Des formules claires pour le terrain.",
  headlineMuted: "Vous payez pour protéger vos marges, pas pour des options floues.",
  founder: `${PRO_TRIAL_DAYS} jours gratuits — sans carte`,
};

export const pricingTrust = [
  "Vous validez toujours avant envoi",
  "Données hébergées en Europe (RGPD)",
  "Prix HT, sans engagement",
];

export const faqItems: { q: string; a: string }[] = [
  {
    q: "À qui s’adresse Tarinéo ?",
    a: "Aux artisans et petites entreprises du bâtiment qui reçoivent des devis et factures fournisseurs et veulent suivre leurs achats, leurs chantiers et leur marge sans ressaisir tout dans un tableur.",
  },
  {
    q: "Et si je n’ai pas d’historique ?",
    a: "Vous pouvez commencer avec un seul devis ou une facture : Tarineo structure le document et enrichit la comparaison au fil des pièces importées.",
  },
  {
    q: "Quels documents peut-on importer ?",
    a: "Devis, factures, bons de commande et bons d’enlèvement fournisseur en PDF ou en photo. L’extraction lit la mise en page de vos distributeurs habituels (Point P, Cedeo, Rexel, etc.).",
  },
  {
    q: "Comment la marge est-elle suivie ?",
    a: "Les achats sont rattachés aux chantiers ; vous définissez votre coefficient sur les lignes transformées en devis client. Les hausses fournisseur sont comparées à vos prix habituels pour agir avant de signer ou d’envoyer au client.",
  },
  {
    q: "Est-ce que ça remplace mon logiciel de devis ?",
    a: "Non : Tarineo vérifie vos achats, prépare la renégociation et produit vos documents client à partir des pièces fournisseur — vous gardez la main sur l’envoi.",
  },
  {
    q: "Mes données sont-elles sécurisées ?",
    a: "Connexion chiffrée, hébergement en Europe, aucun envoi sans votre validation. Vos documents restent rattachés à votre compte.",
  },
  {
    q: "Comment commencer ?",
    a: "Créez un compte, importez un premier document fournisseur et laissez Tarineo le comparer à vos références. Les tarifs Starter, Pro et Équipe sont détaillés plus haut sur la page.",
  },
];

export const finalCta = {
  title: "Votre prochain devis fournisseur mérite d’être vérifié.",
};

export const footerColumns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Produit",
    links: [
      { label: "Parcours", href: "/#parcours" },
      { label: "Tarifs", href: "/#tarifs" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Compte",
    links: [
      { label: "Créer un compte", href: "/inscription" },
      { label: "Connexion", href: "/login" },
      { label: "Contact", href: "mailto:contact@tarineo.com" },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "CGV", href: "/cgv" },
      { label: "Confidentialité", href: "/confidentialite" },
      { label: "Mentions légales", href: "/mentions-legales" },
    ],
  },
];

/** @deprecated Conservé pour démos transform. */
export const transformOptions = [
  "Devis client",
  "Bon de commande client",
  "Bon d'enlèvement",
  "Facture client",
];

export const dashboardKpis: { label: string; value: string; detail: string; tone?: "accent" | "plain" }[] = [
  { label: "Devis", value: "1 529,00 €", detail: "1 devis en cours", tone: "accent" },
  { label: "Achats", value: "2 598,00 €", detail: "2 achats ce mois" },
  { label: "Marge", value: "24 %", detail: "sur le dernier dossier" },
  { label: "Documents", value: "12", detail: "pièces ce mois" },
];

/** Stubs — anciennes sections (non montées sur `/`). */
export const analysedQuote = {
  supplier: proofTable.supplier,
  reference: proofTable.reference,
  date: "Exemple",
  total: "1 310,00 € HT",
  gap: "+8,4 %",
  lines: proofTable.lines.map((l) => ({ ...l, qty: "1" })),
  verdict: proofTable.overcost,
  advice: "Trois lignes à renégocier avant de valider.",
};
export const priceHistory: { period: string; price: string; delta?: string }[] = [];
export const priceAlerts: { name: string; supplier: string; from: string; to: string; delta: string }[] = [];
export const looseDocuments: { icon: IconName; title: string; detail: string }[] = [];
export const problemOutputs: string[] = [];
export const sourceCatalog: { icon: IconName; label: string; detail: string; logoDomain?: string }[] = [];
export const connectedSources: { label: string; detail: string; done: boolean; logoDomain?: string; icon: IconName }[] = [];
export const analysisCounts: { value: number; label: string; icon: IconName }[] = [];
export const learningActivityFeed: { icon: IconName; text: string; meta: string }[] = [];
export const detectedSuppliers: string[] = [];
export const detectedRules: { label: string; value: string }[] = [];
export type WorkflowNode = { icon: IconName; title: string; meta?: string; tone?: "plain" | "ai" | "accent" };
export const automationFlow: WorkflowNode[] = [];
export const copilotRequest = "";
export const copilotRule = { name: "", rows: [] as { icon: IconName; label: string; value: string }[] };
export const copilotSuggestions: string[] = [];
export const quoteSteps: { label: string; detail: string }[] = [];
export const controlLevels: { title: string; caption: string; items: string[] }[] = [];
export const securityItems: { icon: IconName; title: string; detail: string }[] = [];

export const dashboardTodo: { kind: "Action" | "Pièce"; title: string; detail: string }[] = [
  {
    kind: "Action",
    title: "3 lignes du devis fournisseur au-dessus du prix habituel",
    detail: "96,40 € · Exemple",
  },
  { kind: "Action", title: "Relancer le devis client — Rénovation SDB", detail: "En attente depuis 4 jours" },
  { kind: "Pièce", title: "Facture Rexel — commande SDB", detail: "À transformer en facture client" },
];
