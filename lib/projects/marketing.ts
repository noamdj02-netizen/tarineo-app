export const MARKET_CHANNELS = [
  { id: "linkedin", n: "LinkedIn", stay: "/copilote?role=launch" },
  { id: "tiktok", n: "TikTok", stay: "/copilote?role=launch" },
  { id: "instagram", n: "Instagram", stay: "/copilote?role=launch" },
  { id: "email", n: "Email", stay: "/copilote?role=launch" },
] as const;

export type MarketChannel = (typeof MARKET_CHANNELS)[number]["id"];

export type ProjectMarketing = {
  offer: string;
  channel: MarketChannel;
  hook: string;
  cta: string;
  post: string;
};

export const EMPTY_MARKETING: ProjectMarketing = {
  offer: "",
  channel: "linkedin",
  hook: "",
  cta: "",
  post: "",
};

const KEYS = {
  offer: "__offre",
  channel: "__canal",
  hook: "__hook",
  cta: "__cta",
  post: "__post",
} as const;

function isChannel(v: string): v is MarketChannel {
  return MARKET_CHANNELS.some((c) => c.id === v);
}

export function marketingFromBusiness(business: Record<string, string> | null | undefined) {
  const b = business ?? {};
  const channel = b[KEYS.channel];
  return {
    offer: b[KEYS.offer] ?? "",
    channel: isChannel(channel) ? channel : "linkedin",
    hook: b[KEYS.hook] ?? "",
    cta: b[KEYS.cta] ?? "",
    post: b[KEYS.post] ?? "",
  } satisfies ProjectMarketing;
}

export function mergeMarketing(
  business: Record<string, string> | null | undefined,
  m: ProjectMarketing,
) {
  const next = { ...(business ?? {}) };
  next[KEYS.offer] = m.offer.slice(0, 240);
  next[KEYS.channel] = m.channel;
  next[KEYS.hook] = m.hook.slice(0, 400);
  next[KEYS.cta] = m.cta.slice(0, 120);
  next[KEYS.post] = m.post.slice(0, 2000);
  return next;
}

export function publicBusiness(business: Record<string, string> | null | undefined) {
  return Object.entries(business ?? {}).filter(([k]) => !k.startsWith("__"));
}

export const MARKET_STUDIO = [
  {
    id: "mascot",
    n: "Mascotte",
    prompt: (name: string, offer: string) =>
      `Projet ${name}. Offre : ${offer || "à préciser"}. Écris un prompt ChatGPT/image pour une mascotte (1 personnage, 4 poses, pas de violet IA, pas de 3D plastique). 8 lignes max.`,
  },
  {
    id: "mockup",
    n: "Mockup",
    prompt: (name: string, offer: string) =>
      `Projet ${name}. Offre : ${offer || "à préciser"}. Prompt pour un mockup device (laptop + téléphone) de la landing réelle. Pas de faux dashboard.`,
  },
  {
    id: "motion",
    n: "Animation",
    prompt: (name: string, offer: string) =>
      `Projet ${name}. Offre : ${offer || "à préciser"}. Brief d’une anim 6 s pour le hero (easing, 1 accent, pas de mesh). Prêt à coller dans Cursor.`,
  },
] as const;

export function marketingPrompt(p: { id: string; name: string; current: ProjectMarketing }) {
  const m = p.current;
  const canal = MARKET_CHANNELS.find((c) => c.id === m.channel)?.n ?? m.channel;
  return [
    `Projet ${p.name} (id ${p.id}). Canal ${canal}.`,
    `Offre : ${m.offer || "à préciser"}. CTA : ${m.cta || "à préciser"}.`,
    m.hook ? `Hook : ${m.hook}.` : "",
    "Écris 1 post prêt à coller, 8 lignes max, copy réelle, pas d’emoji, pas d’em-dash.",
    "Appelle save_marketing avec le champ post tout de suite. Sans cet appel, le post n’existe pas.",
    "N’ouvre pas Canva tant que le post n’est pas enregistré.",
    "Ensuite propose produce_asset (canva / schema / figma).",
  ]
    .filter(Boolean)
    .join(" ");
}

export function marketingIdeasPrompt(p: {
  id: string;
  name: string;
  pitch: string;
  target: string;
  problem: string;
  site: string;
  current: ProjectMarketing;
}) {
  return [
    `Projet ${p.name} (id ${p.id}).`,
    p.pitch || p.problem || "Pas de pitch noté.",
    `Cible : ${p.target || "—"}. Site : ${p.site || "—"}.`,
    p.current.offer ? `Offre déjà notée : ${p.current.offer}.` : "Les 4 champs marketing sont vides ou à compléter.",
    "Propose 1 offre (une phrase), 1 canal (linkedin|tiktok|instagram|email), 1 hook, 1 CTA.",
    "Ancré à CE projet, copy réelle, pas de lorem, pas d’em-dash, pas de Relais générique.",
    "Puis save_marketing avec les 4 champs. Résume en 4 lignes.",
  ].join(" ");
}
