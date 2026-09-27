export const EVENT_NAMES = [
  "user_signed_up",
  "project_created",
  "project_opened",
  "project_focus_started",
  "project_focus_changed",
  "task_created",
  "task_completed",
  "copilot_opened",
  "copilot_prompt_sent",
  "copilot_response_received",
  "copilot_error",
  "resource_opened",
  "schema_created",
  "component_opened",
  "pricing_viewed",
  "trial_started",
  "checkout_started",
  "subscription_created",
  "subscription_cancelled",
  "session_started",
  "session_ended",
  "page_viewed",
  "hero_prompt_copied",
] as const;

export type EventName = (typeof EVENT_NAMES)[number];

export function isEventName(value: string): value is EventName {
  return (EVENT_NAMES as readonly string[]).includes(value);
}

export const FEATURES = [
  "projets",
  "copilote",
  "focus",
  "ressources",
  "schemas",
  "anatomie",
  "composants",
  "themes",
  "accueil",
  "pricing",
  "heros",
  "libs",
] as const;

export type FeatureKey = (typeof FEATURES)[number];

export const FEATURE_LABEL: Record<FeatureKey, string> = {
  projets: "Projets",
  copilote: "Copilote",
  focus: "Focus",
  ressources: "Ressources",
  schemas: "Schémas",
  anatomie: "Anatomie",
  composants: "Composants",
  themes: "Thèmes",
  accueil: "Accueil",
  pricing: "Prix",
  heros: "Heros",
  libs: "Libs UI",
};

export function featureFromPath(path: string): FeatureKey | "" {
  if (path.startsWith("/projets")) return "projets";
  if (path.startsWith("/copilote")) return "copilote";
  if (path.startsWith("/ressources")) return "ressources";
  if (path.startsWith("/schemas")) return "schemas";
  if (path.startsWith("/anatomie")) return "anatomie";
  if (path.startsWith("/composants")) return "composants";
  if (path.startsWith("/themes")) return "themes";
  if (path.startsWith("/prix") || path.startsWith("/abonnement")) return "pricing";
  if (path.startsWith("/bibliotheque/heros")) return "heros";
  if (path.startsWith("/bibliotheque/libs")) return "libs";
  if (path === "/" || path.startsWith("/accueil")) return "accueil";
  return "";
}

export function classifyAgent(prompt: string): string {
  const t = prompt.toLowerCase();
  if (/prochaine action|priorit|cette semaine/.test(t)) return "Prochaine action";
  if (/mail|e-?mail|relance|client/.test(t)) return "Rédaction email";
  if (/sch[eé]ma|parcours|tunnel/.test(t)) return "Schéma parcours";
  if (/checklist|lancement/.test(t)) return "Checklist lancement";
  if (/r[eé]sum|document|fichier|pdf/.test(t)) return "Résumé document";
  return "Autres";
}
