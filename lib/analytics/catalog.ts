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
  "copilot_tool_started",
  "copilot_tool_success",
  "copilot_tool_failed",
  "copilot_action_confirmed",
  "copilot_action_rejected",
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
  "demo_started",
  "demo_file_uploaded",
  "demo_document_analyzed",
  "demo_margin_applied",
  "demo_pdf_generated",
  "demo_pdf_downloaded",
  "demo_signup_clicked",
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
  if (path.startsWith("/chantiers") || path.startsWith("/projets")) return "projets";
  if (path.startsWith("/copilote")) return "copilote";
  if (path.startsWith("/distributeur") || path.startsWith("/ressources")) return "ressources";
  if (path.startsWith("/hausses") || path.startsWith("/schemas")) return "schemas";
  if (path.startsWith("/achats") || path.startsWith("/anatomie")) return "anatomie";
  if (path.startsWith("/client") || path.startsWith("/composants")) return "composants";
  if (path.startsWith("/fournisseurs") || path.startsWith("/outils")) return "ressources";
  if (path.startsWith("/comparateur") || path.startsWith("/audit")) return "anatomie";
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
