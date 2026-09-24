import type { IllustrationName } from "@/lib/illustrations";
import type { MascotName } from "@/lib/mascots";
import { FOUNDER, PRO, PRO_TRIAL_DAYS, STARTER } from "@/lib/billing/plans";

export const FEATURES: { mascot: MascotName; title: string; text: string }[] = [
  {
    mascot: "06-casque-focus",
    title: "Un seul projet en Focus",
    text: "Chaque projet a son étape de 1 à 6, sa prochaine action et tous ses liens. Un seul reste en Focus jusqu’à sa première vente.",
  },
  {
    mascot: "07-chat-robot",
    title: "Un copilote qui connaît tes projets",
    text: "Pose ta question : l’IA répond avec le contexte de tes projets, de tes tâches et de ton journal. Plus besoin de tout réexpliquer.",
  },
  {
    mascot: "16-presentation-graph",
    title: "Des schémas en un clic",
    text: "Parcours client, architecture, tunnel de vente : l’IA dessine le schéma, tu le retouches à la main sur une vraie toile.",
  },
  {
    mascot: "04-tableau-postit",
    title: "Composants et thèmes prêts",
    text: "Des composants, des palettes et des typos à copier dans ton projet, pour ne plus partir d’une page blanche.",
  },
  {
    mascot: "11-checklist",
    title: "L’anatomie d’une landing",
    text: "Les 12 frames d’une page qui convertit, à cocher une par une avant de lancer.",
  },
  {
    mascot: "14-taches-ordi",
    title: "Ton planning au même endroit",
    text: "Tes échéances Navpit et ton agenda Google ou Apple dans un seul calendrier, avec le bilan de ta semaine.",
  },
];

/** Bandeau défilant (stack outils), style landing Folio — domaines pour logo.dev. */
export const STACK_MARQUEE = [
  { label: "Notion", domain: "notion.so" },
  { label: "Figma", domain: "figma.com" },
  { label: "GitHub", domain: "github.com" },
  { label: "Slack", domain: "slack.com" },
  { label: "Linear", domain: "linear.app" },
  { label: "Supabase", domain: "supabase.com" },
  { label: "Vercel", domain: "vercel.com" },
  { label: "Stripe", domain: "stripe.com" },
  { label: "Google Agenda", domain: "google.com" },
  { label: "Excalidraw", domain: "excalidraw.com" },
] as const;

export type GlowTint = "glow-1" | "glow-2" | "glow-3";

export type HowWorksRow = {
  kicker: string;
  title: string;
  description: string;
  mascot: MascotName;
  tint: GlowTint;
};

/** Piliers produit (carrousel vertical, inspiration Notion). */
export const HOW_WORKS_ROWS: HowWorksRow[] = [
  {
    kicker: "Suivre l’activité",
    title: "Reste dans la boucle",
    description:
      "Accueil, projets en Focus, prochaine action et semaine : tu vois ce qui a bougé sans ouvrir dix onglets.",
    mascot: "01-ordi-check",
    tint: "glow-1",
  },
  {
    kicker: "Centraliser les liens",
    title: "Branche ta stack",
    description:
      "Liens Figma, GitHub, Notion, agenda iCal et ressources design : tout est à côté du projet, pas dans un drive perdu.",
    mascot: "13-organisation",
    tint: "glow-2",
  },
  {
    kicker: "Passer à l’action",
    title: "L’IA rédige la suite",
    description:
      "Mail de relance, post LinkedIn, schéma de parcours : le copilote propose, tu envoies ou tu retouches en un clic.",
    mascot: "07-chat-robot",
    tint: "glow-3",
  },
];

export const DISCOVER_USE_CASES: { label: string; tint: GlowTint; mascot: MascotName }[] = [
  { label: "Prochaine action cette semaine", tint: "glow-1", mascot: "02-todo-liste" },
  { label: "Rédiger un mail de relance", tint: "glow-2", mascot: "09-voyage-avion" },
  { label: "Schéma du parcours client", tint: "glow-3", mascot: "16-presentation-graph" },
  { label: "Checklist avant lancement", tint: "glow-1", mascot: "11-checklist" },
  { label: "Résumer un PDF déposé", tint: "glow-2", mascot: "15-vision-longue-vue" },
];

export type StackToolRef = { label: string; domain: string };

export type LandingTestimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  brand: string;
  photo: string;
  photoPosition?: string;
  photoScale?: number;
  /** Visuel carré exporté (plein cadre) vs photo portrait. */
  photoVariant?: "graphic" | "portrait";
  /** Fond derrière l’image (visuels sombres). */
  photoBg?: string;
  /** Source Unsplash (licence + crédit photographe). */
  photoSource?: { page: string; author: string };
  /** Logos d’outils branchés / utilisés via Navpit. */
  stackTools: readonly StackToolRef[];
};

export const LANDING_TESTIMONIALS: LandingTestimonial[] = [
  {
    id: "noam",
    brand: "Navpit",
    quote:
      "J’avais dix projets ouverts et aucun ne sortait. Un seul en Focus jusqu’à la première vente — c’est la règle qui a tout changé.",
    name: "Noam",
    role: "Créateur de Navpit",
    photo: "/landing/testimonials/noam.jpg",
    photoVariant: "graphic",
    photoBg: "#0b1220",
    photoPosition: "center",
    stackTools: [
      { label: "GitHub", domain: "github.com" },
      { label: "Linear", domain: "linear.app" },
      { label: "Figma", domain: "figma.com" },
    ],
  },
  {
    id: "marcus",
    brand: "Studio solo",
    quote:
      "Le copilote connaît mon projet en cours. Je ne recolle plus le contexte dans ChatGPT à chaque session.",
    name: "Marcus",
    role: "Fondateur · Studio Devis",
    photo: "/landing/testimonials/marcus.jpg",
    photoVariant: "portrait",
    photoPosition: "center 22%",
    photoSource: {
      page: "https://unsplash.com/photos/bYvCRHzsLrk",
      author: "Daniel Alexander",
    },
    stackTools: [
      { label: "Notion", domain: "notion.so" },
      { label: "Slack", domain: "slack.com" },
      { label: "Stripe", domain: "stripe.com" },
    ],
  },
  {
    id: "lea",
    brand: "Side project",
    quote:
      "Planning, schémas et prochaine action au même endroit. J’ai enfin lâché le tableur + dix onglets.",
    name: "Léa",
    role: "Indie maker",
    photo: "/landing/testimonials/lea.jpg",
    photoVariant: "portrait",
    photoPosition: "center 35%",
    photoSource: {
      page: "https://unsplash.com/photos/f4PtmD-sfiw",
      author: "Sammy Swae",
    },
    stackTools: [
      { label: "Notion", domain: "notion.so" },
      { label: "Figma", domain: "figma.com" },
      { label: "Google Agenda", domain: "google.com" },
    ],
  },
  {
    id: "sarah",
    brand: "Product design",
    quote:
      "Les liens Figma et la checklist landing sont sur le projet. Je sais ce qui bloque avant chaque release.",
    name: "Sarah",
    role: "Designer · SaaS B2B",
    photo: "/landing/testimonials/sarah.jpg",
    photoVariant: "graphic",
    photoPosition: "center",
    stackTools: [
      { label: "Figma", domain: "figma.com" },
      { label: "Linear", domain: "linear.app" },
      { label: "Notion", domain: "notion.so" },
    ],
  },
  {
    id: "karim",
    brand: "Ship fast",
    quote:
      "Repo, preview Vercel et tâches du jour : je n’ouvre plus cinq apps pour savoir où j’en suis.",
    name: "Karim",
    role: "Dev · side project",
    photo: "/landing/testimonials/karim.jpg",
    photoVariant: "graphic",
    photoPosition: "center",
    stackTools: [
      { label: "GitHub", domain: "github.com" },
      { label: "Vercel", domain: "vercel.com" },
      { label: "Supabase", domain: "supabase.com" },
    ],
  },
  {
    id: "ines",
    brand: "Consulting",
    quote:
      "Chaque client a son cockpit : prochaine action, docs et agenda. Je facture plus vite, je zappe moins de relances.",
    name: "Inès",
    role: "Consultante indépendante",
    photo: "/landing/testimonials/ines.jpg",
    photoVariant: "portrait",
    photoPosition: "center 18%",
    photoSource: {
      page: "https://unsplash.com/photos/rDEOVtE7vOs",
      author: "Christina @ wocintechchat.com",
    },
    stackTools: [
      { label: "Google Agenda", domain: "google.com" },
      { label: "Notion", domain: "notion.so" },
      { label: "Stripe", domain: "stripe.com" },
    ],
  },
];

export type CompareColumn = {
  title: string;
  subtitle: string;
  points: string[];
  highlight?: boolean;
  muted?: boolean;
  mascot?: MascotName;
};

export const COMPARE_COLUMNS: CompareColumn[] = [
  {
    title: "Onglets éparpillés",
    subtitle: "Notion + Figma + ChatGPT + agenda",
    points: ["Contexte à recoller à chaque fois", "Pas de règle Focus", "Planning ailleurs"],
    muted: true,
    mascot: "05-detente",
  },
  {
    title: "Navpit",
    subtitle: "Cockpit fondateur",
    points: ["Un Focus, une prochaine action", "Copilote avec ton contexte", "Planning + projets + schémas"],
    highlight: true,
    mascot: "10-objectif-cible",
  },
  {
    title: "Chat seul",
    subtitle: "IA générique",
    points: ["Réponses sans tes projets", "Pas de suivi des tâches", "Tu refais le brief"],
    muted: true,
    mascot: "03-idee",
  },
];

export const AUTOMATION_SUGGESTIONS = [
  "Prochaine action cette semaine",
  "Rédiger un mail de relance",
  "Schéma du parcours client",
  "Checklist avant lancement",
  "Post LinkedIn sur le Focus",
  "Résumer un PDF déposé",
];

export const STEPS: { title: string; text: string; mascot: MascotName }[] = [
  {
    title: "Ajoute tes projets",
    text: "Nom, lien du site, GitHub, Figma, Notion : tout est rangé en une minute.",
    mascot: "03-idee",
  },
  {
    title: "Choisis ton Focus",
    text: "Un seul projet avance à la fois. Les autres attendent sagement, sans culpabilité.",
    mascot: "06-casque-focus",
  },
  {
    title: "Avance chaque jour",
    text: "La prochaine action est toujours visible, et le copilote t’aide à la faire.",
    mascot: "01-ordi-check",
  },
];

export type FaqGroup = { id: string; label: string; items: { q: string; a: string }[] };

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: "general",
    label: "Général",
    items: [
      {
        q: "Mes données sont-elles privées ?",
        a: "Oui. Chaque compte ne voit que ses propres données, protégées au niveau de la base. Ton agenda externe est lu en lecture seule.",
      },
    ],
  },
  {
    id: "produit",
    label: "Produit",
    items: [
      {
        q: "C’est quoi l’offre Fondateur ?",
        a: `Un seul paiement de ${FOUNDER.price} € pour Pro à vie. Réservée aux ${FOUNDER.seats} premiers soutiens.`,
      },
      {
        q: "Je peux annuler quand je veux ?",
        a: "Oui, depuis ton compte. Tu gardes Pro jusqu’à la fin de la période payée.",
      },
    ],
  },
  {
    id: "prix",
    label: "Prix",
    items: [
      {
        q: "Quelle différence entre Création et Pro ?",
        a: `Création : ${STARTER.month} €/mois (6 projets, 300 questions IA, 100 schémas). Pro : ${PRO.month} €/mois, projets et schémas illimités + agenda synchronisé.`,
      },
      {
        q: "Le prix baisse après un an d’abonnement ?",
        a: `Oui, pour Création et Pro : tu paies le tarif affiché la 1re année, puis moins à chaque anniversaire — automatiquement, sur ta prochaine facture. Ex. Création : ${STARTER.month} € → 12 € → 9 €/mois (ou ${STARTER.year} → 120 → 90 €/an). Pro : ${PRO.month} € → 24 € → 18 €/mois (ou ${PRO.year} → 240 → 180 €/an).`,
      },
    ],
  },
];

export const FAQ: { q: string; a: string }[] = [
  {
    q: "L’essai Pro est-il vraiment sans carte ?",
    a: `Oui : ${PRO_TRIAL_DAYS} jours avec tout Pro, sans saisir de carte à l’inscription. Avant la fin de l’essai, tu peux ajouter un moyen de paiement depuis ton compte. Sans paiement, le compte et les données associées sont supprimés automatiquement à l’issue de l’essai.`,
  },
  {
    q: "Quelle différence entre Création et Pro ?",
    a: `Création (${STARTER.month} €/mois) suffit pour un side project structuré : 6 projets, 300 questions IA et 100 schémas. Pro (${PRO.month} €/mois) enlève les plafonds et ajoute l’agenda Google ou Apple.`,
  },
  {
    q: "Le prix baisse après un an d’abonnement ?",
    a: `Oui. Création et Pro deviennent moins chers à chaque anniversaire d’abonnement, sans code promo : Création ${STARTER.month} € → 12 € → 9 €/mois ; Pro ${PRO.month} € → 24 € → 18 €/mois (équivalent annuel : ${STARTER.year}/120/90 € et ${PRO.year}/240/180 €). La baisse s’applique au renouvellement suivant.`,
  },
  {
    q: "C’est quoi l’offre Fondateur ?",
    a: `Un seul paiement de ${FOUNDER.price} € pour Pro à vie. Elle est réservée aux ${FOUNDER.seats} premiers, pour remercier ceux qui soutiennent Navpit dès le début.`,
  },
  {
    q: "Mes données sont-elles privées ?",
    a: "Oui. Chaque compte ne voit que ses propres données, protégées au niveau de la base. Ton agenda externe est lu en lecture seule et n’est jamais modifié.",
  },
  {
    q: "Je peux annuler quand je veux ?",
    a: "Oui, en deux clics depuis ton compte. Tu gardes Pro jusqu’à la fin de la période payée.",
  },
];
