import type { IllustrationName } from "@/lib/illustrations";

export type PreviewMode = "idle" | "typing" | "context" | "copilot" | "projects" | "focus";

export type AiStoryStep = {
  id: string;
  scene: "accueil" | "projets";
  path: string;
  label: string;
  title: string;
  body: string;
  art: IllustrationName;
  mode: PreviewMode;
};

/** Scénario « comment l’IA fonctionne » pour l’aperçu landing (voix off + motion). */
export const AI_STORY: AiStoryStep[] = [
  {
    id: "ask",
    scene: "accueil",
    path: "/accueil",
    label: "Étape 1 · Demander",
    title: "Tu écris comme à un collègue",
    body:
      "Sur l’accueil, tu poses ta question ou tu déposes un PDF. Pas de prompt vide : le copilote lit ce que tu envoies.",
    art: "onboarding-premier-pas",
    mode: "typing",
  },
  {
    id: "context",
    scene: "accueil",
    path: "/accueil",
    label: "Étape 2 · Contexte",
    title: "Il connaît déjà tes projets",
    body:
      "TARINEO injecte ton projet en Focus, tes tâches, ton journal et tes fichiers. Tu n’as pas à tout recoller dans ChatGPT.",
    art: "feedback-question",
    mode: "context",
  },
  {
    id: "reply",
    scene: "accueil",
    path: "/accueil",
    label: "Étape 3 · Répondre",
    title: "Le copilote répond dans le panneau ⌘J",
    body:
      "Réponse structurée, étapes concrètes. Tu restes sur la page : projets, schémas, accueil — l’assistant suit.",
    art: "dashboard-analyse",
    mode: "copilot",
  },
  {
    id: "next",
    scene: "projets",
    path: "/projets",
    label: "Étape 4 · Agir",
    title: "La prochaine action atterrit sur la carte",
    body:
      "Tu valides ou tu ajustes. Chaque projet affiche l’étape 1→6 et la prochaine action à faire cette semaine.",
    art: "dashboard-focus",
    mode: "projects",
  },
  {
    id: "focus",
    scene: "projets",
    path: "/projets",
    label: "Étape 5 · Focus",
    title: "Un seul projet en vert",
    body:
      "Règle Mon Bureau : un Focus jusqu’à la première vente. Les autres passent en pause sans culpabilité.",
    art: "landing-progression",
    mode: "focus",
  },
];

export const DEMO_QUESTION =
  "Pour Studio Devis : quelle est la meilleure prochaine action cette semaine ?";

export const DEMO_REPLY = `**Cette semaine — Studio Devis**

1. **Recruter 5 artisans** sur LinkedIn + bouche-à-oreille (message prêt ci-dessous).
2. **Session test** : 30 min avec 2 artisans, noter les frictions sur le PDF.
3. **Ajuster le modèle de devis** selon leurs retours, puis rouvrir la bêta.

Je peux rédiger le message LinkedIn si tu veux.`;
