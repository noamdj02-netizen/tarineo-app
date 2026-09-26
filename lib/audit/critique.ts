/** Critique Open Design : 5 axes, scores 0–10. */

export const CRITIQUE_AXES = [
  {
    id: "philosophy",
    n: "Philosophie",
    q: "Une direction claire, tenue partout ?",
  },
  {
    id: "hierarchy",
    n: "Hiérarchie",
    q: "L’œil sait où regarder en 2 secondes ?",
  },
  {
    id: "detail",
    n: "Détail",
    q: "Espacements, type, alignements : propres ?",
  },
  {
    id: "function",
    n: "Fonction",
    q: "CTA, preuve, parcours : ça convertit ?",
  },
  {
    id: "innovation",
    n: "Innovation",
    q: "Un geste mémorable, pas un template ?",
  },
] as const;

export type CritiqueAxisId = (typeof CRITIQUE_AXES)[number]["id"];

export type CritiqueState = {
  scores: Record<CritiqueAxisId, number>;
  keep: string;
  fix: string;
  win: string;
};

const AXIS_IDS = CRITIQUE_AXES.map((a) => a.id);

export const EMPTY_CRITIQUE: CritiqueState = {
  scores: { philosophy: 0, hierarchy: 0, detail: 0, function: 0, innovation: 0 },
  keep: "",
  fix: "",
  win: "",
};

export function clampScore(n: unknown) {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(10, Math.round(v)));
}

export function normalizeCritique(raw: unknown): CritiqueState {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const scoresIn =
    obj.scores && typeof obj.scores === "object"
      ? (obj.scores as Record<string, unknown>)
      : obj;
  const scores = { ...EMPTY_CRITIQUE.scores };
  for (const id of AXIS_IDS) {
    scores[id] = clampScore(scoresIn[id]);
  }
  return {
    scores,
    keep: typeof obj.keep === "string" ? obj.keep.slice(0, 240) : "",
    fix: typeof obj.fix === "string" ? obj.fix.slice(0, 240) : "",
    win: typeof obj.win === "string" ? obj.win.slice(0, 240) : "",
  };
}

export function critiqueTotal(c: CritiqueState) {
  return AXIS_IDS.reduce((sum, id) => sum + c.scores[id], 0);
}

export function critiqueBand(score: number) {
  if (score <= 4) return { label: "Cassé", tone: "fini" as const };
  if (score <= 6) return { label: "Fonctionne", tone: "pause" as const };
  if (score <= 8) return { label: "Fort", tone: "focus" as const };
  return { label: "Exceptionnel", tone: "focus" as const };
}

export function weakestAxis(c: CritiqueState) {
  return CRITIQUE_AXES.reduce((best, axis) =>
    c.scores[axis.id] < c.scores[best.id] ? axis : best,
  );
}

/** Points d’un pentagone radar (viewBox 0 0 100 100). */
export function radarPoints(c: CritiqueState) {
  const cx = 50;
  const cy = 50;
  const r = 36;
  return AXIS_IDS.map((id, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const t = c.scores[id] / 10;
    return `${cx + Math.cos(angle) * r * t},${cy + Math.sin(angle) * r * t}`;
  }).join(" ");
}

export function radarGrid() {
  const cx = 50;
  const cy = 50;
  const r = 36;
  return [0.4, 0.7, 1].map((t) =>
    AXIS_IDS.map((_, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
      return `${cx + Math.cos(angle) * r * t},${cy + Math.sin(angle) * r * t}`;
    }).join(" "),
  );
}

export function filmLandingBrief(name: string, site: string) {
  return `Filmer la landing ${name} (${site}) en 12 plans, un par frame Navpit (Navbar → CTA). HTML → MP4, tokens du DESIGN.md. Pas de voice-over stock, pas de mesh violet.`;
}
