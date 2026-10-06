import type { IconName } from "@/lib/site/landing-v2-content";

export type MotionHubNode = {
  id: string;
  label: string;
  sub: string;
  icon: IconName;
  stateIdle: string;
};

export type MotionHubScenario = {
  id: string;
  title: string;
  inputRingIndex: number;
  outputRingIndex: number;
  hubStatus: string;
  insight: string;
  result: string;
  action: string;
  flowInGlyph: string;
  flowOutGlyph: string;
  inputStateAnalyzing: string;
  inputStateDone: string;
  outputStateTransmitting: string;
  /** Résultat métier affiché sur la carte de sortie */
  outputStateBusiness: string;
};

export const MOTION_HUB_RING_NODES: MotionHubNode[] = [
  {
    id: "invoice",
    label: "Facture fournisseur",
    sub: "PDF reçu",
    icon: "invoice",
    stateIdle: "En attente",
  },
  {
    id: "quote-supplier",
    label: "Devis fournisseur",
    sub: "Lignes & prix",
    icon: "doc",
    stateIdle: "À traiter",
  },
  {
    id: "quote-client",
    label: "Devis client",
    sub: "Marge appliquée",
    icon: "doc",
    stateIdle: "—",
  },
  {
    id: "margin-followup",
    label: "Marge & relance",
    sub: "Action suivante",
    icon: "mail",
    stateIdle: "—",
  },
];

export const MOTION_HUB_SCENARIOS: MotionHubScenario[] = [
  {
    id: "quote-margin",
    title: "Nouveau devis",
    inputRingIndex: 1,
    outputRingIndex: 2,
    hubStatus: "Analyse des lignes…",
    insight: "3 lignes au-dessus de l’habituel",
    result: "Devis client recalculé",
    action: "Marge : +18,4 %",
    flowInGlyph: "PDF",
    flowOutGlyph: "+12%",
    inputStateAnalyzing: "Analyse en cours…",
    inputStateDone: "✓ Analysé",
    outputStateTransmitting: "Marge calculée…",
    outputStateBusiness: "+12,4 % marge protégée",
  },
  {
    id: "invoice-alert",
    title: "Facture fournisseur",
    inputRingIndex: 0,
    outputRingIndex: 3,
    hubStatus: "Comparaison fournisseur…",
    insight: "Prix cuivre +8,4 %",
    result: "Impact marge : −184 €",
    action: "Réviser le devis",
    flowInGlyph: "PDF",
    flowOutGlyph: "€",
    inputStateAnalyzing: "Analyse en cours…",
    inputStateDone: "✓ Analysé",
    outputStateTransmitting: "Impact chiffré…",
    outputStateBusiness: "Écart fournisseur détecté",
  },
  {
    id: "followup",
    title: "Suivi client",
    inputRingIndex: 2,
    outputRingIndex: 3,
    hubStatus: "Délai client…",
    insight: "Aucune réponse depuis 4 jours",
    result: "Relance préparée",
    action: "Envoi dans 3 jours",
    flowInGlyph: "✓",
    flowOutGlyph: "→",
    inputStateAnalyzing: "Suivi en cours…",
    inputStateDone: "✓ Devis envoyé",
    outputStateTransmitting: "Préparation email…",
    outputStateBusiness: "Relance programmée",
  },
  {
    id: "chain",
    title: "Chaîne document",
    inputRingIndex: 1,
    outputRingIndex: 2,
    hubStatus: "Transformation…",
    insight: "Devis accepté → commande",
    result: "Facture client",
    action: "Email client",
    flowInGlyph: "PDF",
    flowOutGlyph: "✓",
    inputStateAnalyzing: "Lecture fournisseur…",
    inputStateDone: "✓ Lignes reprises",
    outputStateTransmitting: "Génération client…",
    outputStateBusiness: "Devis prêt à envoyer",
  },
];

export const MOTION_HUB_VIEW = {
  width: 520,
  height: 440,
  hub: { x: 260, y: 224 },
  radius: 158,
} as const;

function polar(angleDeg: number, radius: number, cx: number, cy: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

export const MOTION_HUB_RING_POSITIONS = [
  polar(-92, MOTION_HUB_VIEW.radius, MOTION_HUB_VIEW.hub.x, MOTION_HUB_VIEW.hub.y),
  polar(188, MOTION_HUB_VIEW.radius, MOTION_HUB_VIEW.hub.x, MOTION_HUB_VIEW.hub.y),
  polar(8, MOTION_HUB_VIEW.radius, MOTION_HUB_VIEW.hub.x, MOTION_HUB_VIEW.hub.y),
  polar(98, MOTION_HUB_VIEW.radius, MOTION_HUB_VIEW.hub.x, MOTION_HUB_VIEW.hub.y),
];

export function hubCurve(
  from: { x: number; y: number },
  to: { x: number; y: number },
) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const c1x = from.x + dx * 0.45;
  const c1y = from.y + dy * 0.08;
  const c2x = to.x - dx * 0.35;
  const c2y = to.y - dy * 0.08;
  return `M ${from.x} ${from.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${to.x} ${to.y}`;
}

export const MOTION_HUB_SOURCES = MOTION_HUB_RING_NODES;
export const MOTION_HUB_OUTPUTS = MOTION_HUB_RING_NODES;
export const MOTION_HUB_LAYOUT = {
  sources: MOTION_HUB_RING_POSITIONS,
  hub: MOTION_HUB_VIEW.hub,
  outputs: MOTION_HUB_RING_POSITIONS,
};
export const hubPath = hubCurve;
