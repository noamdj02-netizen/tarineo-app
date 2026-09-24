import type { IllustrationName } from "@/lib/illustrations";
import { FOUNDER, LIMITS, LOYALTY_TIERS } from "@/lib/billing/plans";

export const FEATURES: { art: IllustrationName; title: string; text: string }[] = [
  {
    art: "dashboard-focus",
    title: "Un seul projet en Focus",
    text: "Chaque projet a son étape de 1 à 6, sa prochaine action et tous ses liens. Un seul reste en Focus jusqu’à sa première vente.",
  },
  {
    art: "feedback-question",
    title: "Un copilote qui connaît tes projets",
    text: "Pose ta question : l’IA répond avec le contexte de tes projets, de tes tâches et de ton journal. Plus besoin de tout réexpliquer.",
  },
  {
    art: "dashboard-analyse",
    title: "Des schémas en un clic",
    text: "Parcours client, architecture, tunnel de vente : l’IA dessine le schéma, tu le retouches à la main sur une vraie toile.",
  },
  {
    art: "onboarding-decouvrir",
    title: "Composants et thèmes prêts",
    text: "Des composants, des palettes et des typos à copier dans ton projet, pour ne plus partir d’une page blanche.",
  },
  {
    art: "landing-progression",
    title: "L’anatomie d’une landing",
    text: "Les 12 frames d’une page qui convertit, à cocher une par une avant de lancer.",
  },
  {
    art: "dashboard-deadline",
    title: "Ton planning au même endroit",
    text: "Tes échéances Navpit et ton agenda Google ou Apple dans un seul calendrier, avec le bilan de ta semaine.",
  },
];

export const STEPS: { title: string; text: string }[] = [
  {
    title: "Ajoute tes projets",
    text: "Nom, lien du site, GitHub, Figma, Notion : tout est rangé en une minute.",
  },
  {
    title: "Choisis ton Focus",
    text: "Un seul projet avance à la fois. Les autres attendent sagement, sans culpabilité.",
  },
  {
    title: "Avance chaque jour",
    text: "La prochaine action est toujours visible, et le copilote t’aide à la faire.",
  },
];

const [y1, y2, y3] = LOYALTY_TIERS;

export const FAQ: { q: string; a: string }[] = [
  {
    q: "Comment marche le prix fidélité ?",
    a: `Pro coûte ${y1.month} € par mois la première année, ${y2.month} € la deuxième, puis ${y3.month} € par mois pour toujours. Le prix baisse tout seul à la date anniversaire de ton abonnement. Si tu résilies puis reviens, l’ancienneté repart de zéro.`,
  },
  {
    q: "Le plan gratuit est-il vraiment gratuit ?",
    a: `Oui, sans carte bancaire. Tu as ${LIMITS.free.projects} projets, ${LIMITS.free.aiPerMonth} questions au copilote par mois et ${LIMITS.free.schemas} schémas. Tu passes Pro quand tu en as besoin.`,
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
    a: "Oui, en deux clics depuis ton compte. Tu gardes Pro jusqu’à la fin de la période payée, puis tu repasses en gratuit sans rien perdre.",
  },
];
