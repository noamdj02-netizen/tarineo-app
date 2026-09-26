export const STUDIO_TARGETS = [
  { id: "canva", n: "Canva", href: "https://www.canva.com" },
  { id: "schema", n: "Schéma", href: "/schemas" },
  { id: "figma", n: "Figma", href: "https://www.figma.com/files" },
] as const;

export type StudioTarget = (typeof STUDIO_TARGETS)[number]["id"];

export function isStudioTarget(v: string): v is StudioTarget {
  return STUDIO_TARGETS.some((t) => t.id === v);
}

export function studioHref(target: StudioTarget, figma?: string | null) {
  if (target === "figma" && figma?.startsWith("http")) return figma;
  return STUDIO_TARGETS.find((t) => t.id === target)?.href ?? "/";
}

/** Après le post : le copilote crée le livrable, il ne le décrit pas. */
export function producePrompt(p: {
  id: string;
  name: string;
  target: StudioTarget;
  title?: string;
  offer?: string;
  post?: string;
  figma?: string;
}) {
  const quoi = p.title || "le post marketing";
  const ctx = [p.offer, p.post].filter(Boolean).join(" — ");
  if (p.target === "schema") {
    return `Projet ${p.name} (id ${p.id}). ${quoi}. ${ctx}. produce_asset target=schema kind=parcours. Crée le schéma maintenant.`;
  }
  if (p.target === "figma") {
    return [
      `Projet ${p.name} (id ${p.id}). ${quoi}. ${ctx}.`,
      p.post ? "" : "Le post est vide : rédige-le (8 lignes) et save_marketing champ post.",
      `Puis produce_asset target=figma. Le brief doit contenir le post. Ouvre Figma${p.figma ? " du projet" : ""}.`,
    ]
      .filter(Boolean)
      .join(" ");
  }
  return [
    `Projet ${p.name} (id ${p.id}). ${quoi}. ${ctx}.`,
    p.post
      ? "Le post existe : enregistre-le si tu le retouches (save_marketing champ post)."
      : "Le post est vide : rédige-le maintenant (8 lignes, copy réelle) et save_marketing champ post.",
    "Interdit d’ouvrir Canva sans post enregistré.",
    "Ensuite produce_asset target=canva : le brief DOIT contenir le post rédigé.",
  ].join(" ");
}

/** Une feature : propose les 3, exécute le plus juste. */
export function featureProducePrompt(p: { id: string; name: string; feature: string; figma?: string }) {
  return [
    `Projet ${p.name} (id ${p.id}). Feature : ${p.feature}.`,
    "Propose Canva (visuel), Schéma Navpit (parcours), Figma (écran).",
    "Si Canva : rédige le post, save_marketing champ post, puis produce_asset. Canva sans post = interdit.",
    "Sinon produce_asset : schema si parcours, figma si UI.",
    "Exécute tout de suite. Ne dis pas à l’user de le faire lui-même.",
  ].join(" ");
}
