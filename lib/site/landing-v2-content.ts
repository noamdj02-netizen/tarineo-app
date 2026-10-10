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

/** Nav mobile / drawer — groupes. Desktop = mega-menu (header/nav-data). */
export const landingNavPrimary: NavItem[] = [
  { label: "Produit", href: "#produit" },
  { label: "Tarifs", href: "#tarifs" },
  { label: "FAQ", href: "#faq" },
  { label: "Blog", href: "/blog" },
];

export const landingNavGroups: LandingNavGroup[] = [
  {
    title: "Produit",
    items: [
      { label: "Comment ça marche", href: "/#parcours" },
      { label: "Fonctionnalités", href: "/#preuve" },
      { label: "Hausses de prix", href: "/#hausses" },
      { label: "Alertes", href: "/#alertes" },
      { label: "Relances", href: "/#relances" },
      { label: "Fiches chantier", href: "/#produit" },
    ],
  },
  {
    title: "Aller plus loin",
    items: [
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

/** Launch UI — bandeau compatibilité (texte, pas logos enseignes). */
export const launchCompatStrip = [
  "Point P",
  "Cedeo",
  "Rexel",
  "Brossette",
  "Richardson",
  "Aubade",
];

export const launchBento = {
  title: "Protégez votre marge, plus vite.",
  items: [
    {
      title: "Scannez n’importe quel devis",
      text: "Photo, PDF ou mail : Tarineo lit la mise en page de vos distributeurs et structure les lignes.",
      icon: "scan" as const,
    },
    {
      title: "Vous gardez la main",
      text: "Chaque alerte est vérifiable. Rien n’est envoyé au client sans votre validation.",
      icon: "alert" as const,
    },
    {
      title: "S’intègre à votre routine",
      text: "Importez depuis le comptoir ou le bureau. Pas de migration lourde ni de formation d’une journée.",
      icon: "history" as const,
    },
    {
      title: "Historique qui parle métier",
      text: "Comparez chaque référence à vos prix habituels — pas à un indice abstrait.",
      icon: "margin" as const,
    },
  ],
};

export const launchFeatureIcons = {
  title: "Tout ce qu’il faut. Rien de superflu.",
  items: [
    {
      title: "Lecture de devis",
      text: "OCR + structure lignes, quantités et prix unitaires.",
    },
    {
      title: "Alertes de hausses",
      text: "Dès qu’une référence sort de vos habitudes d’achat.",
    },
    {
      title: "Devis client",
      text: "Reprenez les pièces fournisseur avec votre marge.",
    },
    {
      title: "Parcours chantier",
      text: "Documents rattachés au bon dossier, sans tableur.",
    },
    {
      title: "Temps d’analyse court",
      text: "Quelques secondes par pièce pour une première lecture.",
    },
    {
      title: "Données en Europe",
      text: "Hébergement RGPD, session chiffrée.",
    },
    {
      title: "Mobile & bureau",
      text: "Même compte sur téléphone, tablette et ordinateur.",
    },
    {
      title: "Sans engagement",
      text: "Changez de formule selon votre volume de devis.",
    },
  ],
};

export const launchSpotlight = {
  title: "Faites la bonne impression — sur vos marges.",
  points: [
    {
      title: "Intuitif, moderne",
      text: "Une interface claire pour lire une hausse en un coup d’œil.",
    },
    {
      title: "Fait pour l’artisan",
      text: "Vocabulaire métier, pas de jargon SaaS inutile.",
    },
    {
      title: "Prêt pour la prod",
      text: "Compte sécurisé, exports et devis client inclus selon la formule.",
    },
  ],
};

/** Trois chantiers démo — même logique que le dashboard (Exemple). */
export const landingChantierCards = [
  {
    title: "Rénovation SDB — Dupont",
    client: "Dupont",
    address: "Lyon 3e",
    status: "focus" as const,
    lastUpdated: "Il y a 2 j",
    description:
      "Devis Cedeo rattaché : 3 hausses vs votre historique. Relance fournisseur prête.",
    tags: ["Plomberie", "Cedeo", "12 docs"],
    docsCount: 12,
    people: [{ initials: "ND" }, { initials: "MD" }],
    coverMetric: "+12 %",
    coverLabel: "Hausse max",
    coverLines: ["Chauffe-eau 200 L", "Mitigeur therm.", "Tube PER Ø16"],
  },
  {
    title: "Mise aux normes — Martin",
    client: "Martin",
    address: "Tassin",
    status: "focus" as const,
    lastUpdated: "Il y a 5 j",
    description:
      "Devis Rexel analysé. Marge chantier à 31 % sur les lignes validées.",
    tags: ["Électricité", "Rexel", "8 docs"],
    docsCount: 8,
    people: [{ initials: "AM" }, { initials: "ND" }, { initials: "+1" }],
    coverMetric: "31 %",
    coverLabel: "Marge chantier",
    coverLines: ["Câble U1000", "Disjoncteur 20 A", "Tableau 3 rangées"],
  },
  {
    title: "Réfection cuisine — Benali",
    client: "Benali",
    address: "Vénissieux",
    status: "pause" as const,
    lastUpdated: "Il y a 12 j",
    description:
      "En pause client. Documents Point P classés — reprise en un clic.",
    tags: ["Cuisine", "Point P", "5 docs"],
    docsCount: 5,
    people: [{ initials: "KB" }],
    coverMetric: "5",
    coverLabel: "Docs classés",
    coverLines: ["Devis Point P", "Plan cuisine", "Photos avant"],
  },
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
    title: "Importez l’historique",
    detail: "PDF ou photo — Tarineo apprend vos prix habituels.",
  },
  {
    step: 2,
    title: "Scannez un devis",
    detail: "Fournisseur lu ligne à ligne, tout de suite.",
  },
  {
    step: 3,
    title: "Hausses & baisses",
    detail: "En % et en euros, face à vos achats.",
  },
  {
    step: 4,
    title: "Validez ou renégociez",
    detail: "Un clic, ou un mail déjà prêt pour le commercial.",
  },
  {
    step: 5,
    title: "Facturez le client",
    detail: "Devis, commande ou facture — avec votre marge.",
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
  headline: "Un tarif adapté à la taille de votre activité",
  headlineMuted: "",
  founder: `${PRO_TRIAL_DAYS} jours gratuits — sans carte`,
  subtitle:
    "Sans engagement. Changez de formule à tout moment, en fonction de votre volume de devis.",
};

export const pricingTrust = [
  "Vous validez toujours avant envoi",
  "Données hébergées en Europe (RGPD)",
  "Prix HT, sans engagement",
];

/** FAQ calquée sur Figma `22:802` (questions reconstruites — le fichier mélangeait parfois réponses et titres). */
export const faqItems: { q: string; a: string }[] = [
  {
    q: "Puis-je utiliser Tarineo pour plusieurs chantiers ?",
    a: "Oui, vous pouvez suivre les devis de tous vos chantiers depuis un seul compte, avec un historique complet par fournisseur.",
  },
  {
    q: "Quels distributeurs sont compatibles ?",
    a: "Cedeo, Point P, Rexel, Brossette, Richardson, Aubade et plus de 30 enseignes. Photo, PDF ou mail : Tarineo lit le format de vos devis.",
  },
  {
    q: "Comment personnaliser mon entreprise ?",
    a: "Depuis Mon entreprise dans votre espace : logo, SIRET, marge par défaut et coordonnées. Modifiable à tout moment.",
  },
  {
    q: "Que se passe-t-il si je dépasse mon volume de documents ?",
    a: "Le plan Équipe couvre jusqu’à 1000 documents par mois. Pour des volumes supérieurs, contactez-nous pour une offre sur mesure.",
  },
  {
    q: "Tarineo fonctionne-t-il sur mobile ?",
    a: "Oui. Votre compte est accessible depuis ordinateur, tablette et téléphone avec la même session sécurisée.",
  },
];

export const finalCta = {
  title: "Commencez à protéger votre marge.",
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
