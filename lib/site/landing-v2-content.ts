/** Contenus landing Tarineo — structure 6 écrans (brief conversion). */

/** Date de gel prod landing Figma v2 (`main` + Vercel production). */
export const LANDING_V2_PRODUCTION_RELEASE = "2026-10-14";

import { PRO_TRIAL_DAYS } from "@/lib/billing/plans";
import { ARTISAN_LANDING_REVIEWS } from "@/lib/site/content";

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

/** Nav mobile / drawer — groupes. Desktop = `site-nav` + `marketingNavItems`. */
export const landingNavPrimary: NavItem[] = [
  { label: "Terrain", href: "#terrain" },
  { label: "Tarifs", href: "#tarifs" },
  { label: "FAQ", href: "#faq" },
  { label: "Blog", href: "/blog" },
];

export const landingNavGroups: LandingNavGroup[] = [
  {
    title: "Navigation",
    items: [
      { label: "Accueil", href: "/#top" },
      { label: "Fonctionnalités", href: "/#fonctionnalites" },
      { label: "Terrain", href: "/#terrain" },
      { label: "Tarifs", href: "/#tarifs" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Sur la page",
    items: [
      { label: "Film", href: "/#film" },
      { label: "Relances", href: "/#relances" },
      { label: "FAQ", href: "/#faq" },
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

/** Hero Designs-28 (Figma 235:33212) — titres visuels ; CTA inscription = `HERO.primary`. */
export const heroDesigns28 = {
  /** Figma `235:33481` / `235:33482` — trois lignes visuelles. */
  titleLine1: "Vos fournisseurs",
  titleLine2: "augmentent leurs prix.",
  titleAccent: "Vous le voyez ?",
  /** @deprecated Utiliser `titleLine1` + `titleLine2`. */
  line1: "Vos fournisseurs augmentent leurs prix.",
  /** @deprecated Utiliser `titleAccent`. */
  line2: "Vous le voyez ?",
  text:
    "TARINEO lit vos factures et vous alerte dès qu'une référence augmente, avant que ça mange la marge de vos chantiers.",
  primaryCta: "Tester gratuitement",
  /** Figma hero `235:33488` */
  launchPrimaryCta: "Rejoindre les 30 premiers artisans",
  demoCta: "Voir la démo",
  trustLead: "Ils nous font confiance pour optimiser leur rentabilité :",
  searchTitle: "Rechercher un produit",
  searchCategories: ["Menuiserie", "Plomberie", "Électricité", "Quincaillerie"],
  alertTitle: "Alerte hausse",
  alertSample: { product: "Tube PER 16×20", delta: "+12,4 %", supplier: "Cedeo" },
  contactsTitle: "12 contacts fournisseurs",
  contacts: [
    { name: "Commercial Cedeo", status: "actif" as const },
    { name: "Agence Point P", status: "actif" as const },
    { name: "Rexel — suivi prix", status: "inactif" as const },
  ],
} as const;

/** @deprecated Alias Designs-27 */
export const heroDesigns27 = heroDesigns28;

/** Figma section film — node `235:34129`. */
export const landingFilm = {
  badge: "Film",
  title: "Voir Tarineo en action",
  subtitle:
    "Le parcours devis → alertes → validation, sans tableur ni ressaisie.",
  blockTitle: "Devis → alertes → validation",
  blockText:
    "Importez un document, comparez aux prix habituels et validez les lignes à risque avant d’envoyer au client.",
  steps: [
    "Lecture PDF ou photo",
    "Alertes de hausses et lignes à valider",
    "Validation finale avant envoi client",
  ],
  cta: "Voir le film",
  staticHint: "Lire avec le son",
  poster: "/landing/film-motion-v2-poster.jpg",
  mock: "/landing/film-motion-v2-poster.jpg",
  video: "/landing/film-motion-v2.mp4",
  videoSectionId: "film-preview",
} as const;

/** Section Fonctionnalités — fiches chantier (export UI designer). */
export const landingFeaturesFiches = {
  badge: "Suivi chantier",
  titleLead: "Faites la bonne ",
  titleAccent: "Action",
  titleTail: " — sur vos marges.",
  subtitle: "Aperçu des fiches chantier de l’app",
  defaultId: "dupont",
  /** Mêmes 3 chantiers / photos que `landingChantierCards`. */
  items: [
    {
      id: "benali",
      title: "Réfection cuisine — Benali",
      excerpt: "En pause client. Documents Point P classés — reprise en un clic.",
      cover: "/illustrations/landing-chantiers/renovation-equipe.jpg",
      clientLine: "Benali · Vénissieux",
      body: "En pause client. Documents Point P classés — reprise en un clic.",
      tags: ["Cuisine", "Point P", "5 docs"],
      status: "En pause",
      statusTone: "pause" as const,
    },
    {
      id: "dupont",
      title: "Rénovation SDB — Dupont",
      excerpt:
        "Devis Cedeo rattaché : 3 hausses vs votre historique. Relance fournisseur prête.",
      cover: "/illustrations/landing-chantiers/renovation-interieur.jpg",
      clientLine: "Dupont · Lyon 3e",
      body: "Devis Cedeo rattaché : 3 hausses vs votre historique. Relance fournisseur prête.",
      tags: ["Plomberie", "Cedeo", "12 docs"],
      status: "En cours",
      statusTone: "focus" as const,
    },
    {
      id: "martin",
      title: "Mise aux normes — Martin",
      excerpt: "Devis Rexel analysé. Marge chantier à 31 % sur les lignes validées.",
      cover: "/illustrations/landing-chantiers/chantier-exterieur.jpg",
      clientLine: "Martin · Tassin",
      body: "Devis Rexel analysé. Marge chantier à 31 % sur les lignes validées.",
      tags: ["Électricité", "Rexel", "8 docs"],
      status: "En cours",
      statusTone: "focus" as const,
    },
  ],
} as const;

/** Panneau contact Figma 223:2271 — copy produit (pas offre lancement). */
export const landingContactPanel = {
  title: "Une question avant de commencer ?",
  points: [
    "Réponse sous 24 h ouvrées",
    "Démo sur vos vrais formats PDF",
    "Sans engagement — vous gardez la main sur chaque envoi",
  ],
} as const;

/** Contact lancement — Figma 235:34915 */
export const sectionContact = {
  badge: "Contact",
  title: "Contact lancement",
  subtitle:
    "Coordonnées, réponse sous 24 h. Envoyez votre demande pour être contacté rapidement.",
  panelTitle: "Réponse sous 24 h",
  panelText:
    "Prénom, métier, téléphone et e-mail. Nous revenons vers vous rapidement pour discuter de votre besoin.",
  panelPhoto: "/landing/figma/contact/panel-photo.jpg",
  panelOverlay: "/landing/figma/contact/panel-overlay.svg",
  lines: [
    { label: "Réponse sous 24 h ouvrées", icon: "phone" as const },
    { label: "contact@tarineo.com", icon: "email" as const, href: "mailto:contact@tarineo.com" },
    { label: "Support en ligne — France (UE)", icon: "location" as const },
  ],
} as const;

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

/** Board Figma « Isometric Team » (235:34328) — 3 cartes preuve. */
export const launchFeatureIcons = {
  badge: "Fonctionnalités",
  title: "Tout ce qu’il faut pour piloter votre activité.",
  subtitle: "Moins d’administratif. Plus de chantiers.",
  cards: [
    {
      kicker: "Analyse IA",
      title: "PDF fournisseurs, lus au même endroit",
      text: "Importez un devis ou une facture : Tarineo structure les lignes, quantités et PU pour comparer à votre historique — sans ressaisie dans un tableur.",
    },
    {
      kicker: "Copilote",
      title: "Réponses nettes sur vos devis",
      text: "Posez une question sur une pièce fournisseur : Tarineo résume les hausses, les lignes à risque et ce qu’il faut valider avant envoi client.",
    },
    {
      kicker: "Transformez vos devis fournisseurs en devis clients",
      title: "De vos documents à vos chantiers.",
      text: "Centralisez vos documents, automatisez vos devis et gardez le contrôle sur vos coûts. Tarineo simplifie votre gestion pour vous concentrer sur l’essentiel.",
    },
  ],
};

/** Section terrain — scénarios illustratifs (`ARTISAN_LANDING_REVIEWS`), pas d’avis tiers certifiés. */
export const launchTerrain = {
  badge: "Terrain",
  title: "Sur le terrain, avant d’envoyer le devis client.",
  disclaimer:
    "Parcours types rédigés avec des artisans — illustrés pour montrer l’usage. Pas d’avis Trustpilot ni de notes agrégées.",
  socialProof: {
    eyebrow: "Preuve d’usage (lancement)",
    stats: [
      { value: "30", label: "places offre de lancement" },
      { value: "4", label: "métiers du BTP représentés" },
      { value: "PDF", label: "import devis fournisseur" },
    ],
    trustLine:
      "Chaque carte décrit un cas métier réaliste. Vous pourrez remplacer ces exemples par vos retours clients vérifiés.",
  },
  reviews: ARTISAN_LANDING_REVIEWS.map((r) => ({
    id: r.id,
    brand: r.brand,
    quote: r.quote,
    name: r.name,
    role: r.role,
    photo: r.photo,
    photoPosition: r.photoPosition,
    insight: r.insight,
    stackTools: r.stackTools.map((t) => t.label),
    /** Étoiles = lisibilité du parcours type, pas une note publiée. */
    scenarioRating: 5,
  })),
};

/** Hero Figma `235:33614` — liste chantiers dans la carte produit. */
export const heroChantiersCard = {
  title: "Un dossier par chantier",
  srLabel:
    "Un dossier par chantier — Réfection cuisine Benali, Mise aux normes Martin, Rénovation SDB Dupont, statut Active.",
  rows: [
    {
      id: "benali",
      title: "Réfection cuisine — Benali",
      meta: "Benali · Vénissieux",
      status: "Active",
      avatar: "/landing/figma/hero/assets/rectangle-1888.jpg",
    },
    {
      id: "martin",
      title: "Mise aux normes — Martin",
      meta: "Martin · Tassin",
      status: "Active",
      avatar: "/landing/figma/hero/assets/rectangle-1888-2.jpg",
    },
    {
      id: "dupont",
      title: "Rénovation SDB — Dupont",
      meta: "Dupont · Lyon 3e",
      status: "Active",
      avatar: "/landing/figma/hero/assets/rectangle-1888-3.jpg",
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
    coverImage: "/illustrations/landing-chantiers/renovation-interieur.jpg",
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
    coverImage: "/illustrations/landing-chantiers/chantier-exterieur.jpg",
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
    coverImage: "/illustrations/landing-chantiers/renovation-equipe.jpg",
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
  headline: "Tarifs mensuels HT",
  headlineMuted: "",
  founder: `${PRO_TRIAL_DAYS} jours d’essai Pro — sans carte bancaire`,
  subtitle:
    "14 jours d’essai Pro, sans engagement. Offre de lancement : 1 mois gratuit pour les 30 premiers artisans.",
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

/** Bandeau CTA sous la FAQ — Figma 235:34983 */
export const sectionCta = {
  badge: "Découvrez",
  title: "Vous travaillez sur votre entreprise. Tarineo travaille dans votre entreprise.",
  subtitle:
    "Importer un devis ou une facture, comparer aux prix habituels, sans journée d’installation ni engagement sur le logiciel actuel.",
  primaryLabel: "Commencer avec Tarineo",
  secondaryLabel: "Poser une question",
  background: "/landing/figma/section-cta-chantier.jpg",
} as const;

export const footerColumns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Produit",
    links: [
      { label: "Film", href: "/#film" },
      { label: "Fonctionnalités", href: "/#fonctionnalites" },
      { label: "Tarifs", href: "/#tarifs" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Compte",
    links: [
      { label: "Créer un compte", href: "/inscription" },
      { label: "Connexion", href: "/login" },
      { label: "Contact", href: "/#contact" },
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
