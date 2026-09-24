/** Modèles Claude proposés dans le sélecteur. La route /api/assistant n'accepte que ceux-là. */
export const MODELS = [
  { id: "claude-sonnet-5", label: "Sonnet 5", hint: "Équilibré" },
  { id: "claude-haiku-4-5", label: "Haiku 4.5", hint: "Rapide" },
  { id: "claude-opus-5-5", label: "Opus 5.5", hint: "Le plus fort" },
] as const;

export type ModelId = (typeof MODELS)[number]["id"];

export const DEFAULT_MODEL: ModelId = "claude-sonnet-5";

export function isModelId(v: unknown): v is ModelId {
  return MODELS.some((m) => m.id === v);
}
