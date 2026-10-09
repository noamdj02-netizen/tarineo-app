export type WidgetKey =
  | "prompt"
  | "calendar"
  | "week"
  | "focus"
  | "actions"
  | "postits"
  | "projects"
  | "schemas"
  | "metier";

export type PostItColor = "peach" | "lavender" | "blue" | "white";

export type PostIt = {
  id: string;
  text: string;
  color: PostItColor;
};

export type DashboardPrefs = {
  widgets: Record<WidgetKey, boolean>;
  postits: PostIt[];
  /** Ordre des blocs, colonne gauche / droite (desktop). */
  leftColumn: WidgetKey[];
  rightColumn: WidgetKey[];
  /** Largeur colonne gauche en % (30–70). */
  columnSplit: number;
};

/** v4 = Accueil triage-first (plus de prompt/planning/hausses en widgets par défaut). */
const STORAGE_KEY = "navpit:home-dashboard-v4";

export const WIDGET_LABELS: Record<WidgetKey, string> = {
  prompt: "Analyser un document",
  calendar: "Planning",
  week: "Cette semaine",
  focus: "Chantier en cours",
  actions: "Actions rapides",
  postits: "Notes",
  projects: "Mes chantiers",
  schemas: "Dernières analyses",
  metier: "Sections métier",
};

/** Widgets déjà rendus en bandeau triage fixe (hors colonnes personnalisables). */
export const TRIAGE_PINNED_WIDGETS: WidgetKey[] = ["prompt", "actions", "projects", "schemas"];

export const DEFAULT_LEFT_COLUMN: WidgetKey[] = [];
export const DEFAULT_RIGHT_COLUMN: WidgetKey[] = [];

const DEFAULT_POSTITS: PostIt[] = [
  {
    id: "welcome",
    text: "Dépose un devis pour voir les hausses",
    color: "lavender",
  },
];

export const DEFAULT_DASHBOARD_PREFS: DashboardPrefs = {
  widgets: {
    prompt: true,
    calendar: false,
    week: false,
    focus: false,
    actions: true,
    postits: false,
    projects: true,
    schemas: true,
    metier: false,
  },
  postits: DEFAULT_POSTITS,
  leftColumn: DEFAULT_LEFT_COLUMN,
  rightColumn: DEFAULT_RIGHT_COLUMN,
  columnSplit: 58,
};

const ALL_WIDGETS: WidgetKey[] = [
  "prompt",
  "calendar",
  "week",
  "focus",
  "actions",
  "postits",
  "projects",
  "schemas",
  "metier",
];

const DEFAULT_COLUMN: Record<WidgetKey, "left" | "right"> = {
  prompt: "left",
  calendar: "right",
  week: "left",
  focus: "left",
  actions: "left",
  postits: "right",
  projects: "left",
  schemas: "right",
  metier: "left",
};

/** Chaque widget actif apparaît une seule fois : gauche ou droite. */
function partitionColumns(
  left: WidgetKey[] | undefined,
  right: WidgetKey[] | undefined,
  widgets: Record<WidgetKey, boolean>,
): { leftColumn: WidgetKey[]; rightColumn: WidgetKey[] } {
  const seen = new Set<WidgetKey>();
  const leftOut: WidgetKey[] = [];
  const rightOut: WidgetKey[] = [];

  const push = (col: "left" | "right", k: WidgetKey) => {
    if (!ALL_WIDGETS.includes(k) || seen.has(k) || !widgets[k]) return;
    seen.add(k);
    (col === "left" ? leftOut : rightOut).push(k);
  };

  for (const k of left ?? []) push("left", k);
  for (const k of right ?? []) push("right", k);

  for (const k of DEFAULT_LEFT_COLUMN) {
    if (!seen.has(k)) push("left", k);
  }
  for (const k of DEFAULT_RIGHT_COLUMN) {
    if (!seen.has(k)) push("right", k);
  }

  return { leftColumn: leftOut, rightColumn: rightOut };
}

function mergeWidgets(raw: Partial<Record<WidgetKey, boolean>> | undefined): Record<WidgetKey, boolean> {
  const widgets = { ...DEFAULT_DASHBOARD_PREFS.widgets };
  if (!raw) return widgets;
  for (const k of ALL_WIDGETS) {
    if (k in raw && typeof raw[k] === "boolean") widgets[k] = raw[k]!;
  }
  return widgets;
}

/** Retire les blocs désactivés et rattache les blocs actifs oubliés à leur colonne par défaut. */
function syncColumnsWithWidgets(
  widgets: Record<WidgetKey, boolean>,
  left: WidgetKey[],
  right: WidgetKey[],
): { leftColumn: WidgetKey[]; rightColumn: WidgetKey[] } {
  const seen = new Set<WidgetKey>();
  const leftOut: WidgetKey[] = [];
  const rightOut: WidgetKey[] = [];

  for (const k of left) {
    if (!widgets[k] || seen.has(k)) continue;
    seen.add(k);
    leftOut.push(k);
  }
  for (const k of right) {
    if (!widgets[k] || seen.has(k)) continue;
    seen.add(k);
    rightOut.push(k);
  }
  for (const k of ALL_WIDGETS) {
    if (!widgets[k] || seen.has(k)) continue;
    seen.add(k);
    const col = DEFAULT_COLUMN[k];
    (col === "left" ? leftOut : rightOut).push(k);
  }
  return { leftColumn: leftOut, rightColumn: rightOut };
}

/** Si tout est à gauche, replace planning / post-its (etc.) à droite pour éviter la colonne vide. */
function repairColumnBalance(
  widgets: Record<WidgetKey, boolean>,
  left: WidgetKey[],
  right: WidgetKey[],
): { leftColumn: WidgetKey[]; rightColumn: WidgetKey[] } {
  const active = (col: WidgetKey[]) => col.filter((k) => widgets[k]);
  const leftActive = active(left);
  const rightActive = active(right);
  if (rightActive.length > 0) return { leftColumn: left, rightColumn: right };

  const shouldRight = leftActive.filter((k) => DEFAULT_COLUMN[k] === "right");
  if (shouldRight.length === 0) return { leftColumn: left, rightColumn: right };

  const leftOut = leftActive.filter((k) => DEFAULT_COLUMN[k] === "left");
  const rightOut = [...shouldRight];
  for (const k of right) {
    if (widgets[k] && !rightOut.includes(k)) rightOut.push(k);
  }
  return { leftColumn: leftOut, rightColumn: rightOut };
}

export function activeWidgetsInColumn(
  prefs: DashboardPrefs,
  column: "left" | "right",
): WidgetKey[] {
  const list = column === "left" ? prefs.leftColumn : prefs.rightColumn;
  return list.filter((k) => prefs.widgets[k]);
}

export function normalizeDashboardPrefs(raw: Partial<DashboardPrefs> | null | undefined): DashboardPrefs {
  if (!raw) return DEFAULT_DASHBOARD_PREFS;
  const split = raw.columnSplit;
  const widgets = mergeWidgets(raw.widgets);
  const partitioned = partitionColumns(raw.leftColumn, raw.rightColumn, widgets);
  const synced = syncColumnsWithWidgets(
    widgets,
    partitioned.leftColumn,
    partitioned.rightColumn,
  );
  const { leftColumn, rightColumn } = repairColumnBalance(
    widgets,
    synced.leftColumn,
    synced.rightColumn,
  );
  return {
    widgets,
    postits: raw.postits?.length ? raw.postits : DEFAULT_POSTITS,
    leftColumn,
    rightColumn,
    columnSplit:
      typeof split === "number" && split >= 30 && split <= 70
        ? Math.round(split)
        : DEFAULT_DASHBOARD_PREFS.columnSplit,
  };
}

export function loadDashboardPrefsLocal(): DashboardPrefs {
  if (typeof window === "undefined") return DEFAULT_DASHBOARD_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Pas de migration v3 → v4 : on repart du layout triage (évite warehouse local).
      return DEFAULT_DASHBOARD_PREFS;
    }
    return normalizeDashboardPrefs(JSON.parse(raw) as Partial<DashboardPrefs>);
  } catch {
    return DEFAULT_DASHBOARD_PREFS;
  }
}

export function saveDashboardPrefsLocal(prefs: DashboardPrefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // quota
  }
}

/** Déplace un widget dans la même colonne ou vers l'autre. */
/** Insère `dragged` avant `before` dans la colonne cible (glisser-déposer). */
export function reorderWidget(
  prefs: DashboardPrefs,
  dragged: WidgetKey,
  before: WidgetKey,
  targetColumn: "left" | "right",
): DashboardPrefs {
  if (dragged === before) return prefs;
  let left = prefs.leftColumn.filter((k) => k !== dragged);
  let right = prefs.rightColumn.filter((k) => k !== dragged);
  const list = targetColumn === "left" ? left : right;
  const at = list.indexOf(before);
  const insertAt = at >= 0 ? at : list.length;
  list.splice(insertAt, 0, dragged);
  if (targetColumn === "left") left = list;
  else right = list;
  return { ...prefs, leftColumn: left, rightColumn: right };
}

/** Affiche le widget et le place en tête de colonne (import « devant »). */
export function activateWidget(
  prefs: DashboardPrefs,
  key: WidgetKey,
  opts?: { column?: "left" | "right"; front?: boolean },
): DashboardPrefs {
  const column = opts?.column ?? DEFAULT_COLUMN[key];
  const front = opts?.front ?? true;
  const widgets = { ...prefs.widgets, [key]: true };
  let left = prefs.leftColumn.filter((k) => k !== key);
  let right = prefs.rightColumn.filter((k) => k !== key);
  if (column === "left") left = front ? [key, ...left] : [...left, key];
  else right = front ? [key, ...right] : [...right, key];
  return normalizeDashboardPrefs({ ...prefs, widgets, leftColumn: left, rightColumn: right });
}

export function deactivateWidget(prefs: DashboardPrefs, key: WidgetKey): DashboardPrefs {
  const widgets = { ...prefs.widgets, [key]: false };
  const leftColumn = prefs.leftColumn.filter((k) => k !== key);
  const rightColumn = prefs.rightColumn.filter((k) => k !== key);
  return normalizeDashboardPrefs({ ...prefs, widgets, leftColumn, rightColumn });
}

/** Replace les colonnes par l’ordre par défaut, en gardant uniquement les blocs actifs. */
export function autoArrangeDashboard(prefs: DashboardPrefs): DashboardPrefs {
  const widgets = prefs.widgets;
  const leftColumn = DEFAULT_LEFT_COLUMN.filter((k) => widgets[k]);
  const rightColumn = DEFAULT_RIGHT_COLUMN.filter((k) => widgets[k]);
  for (const k of ALL_WIDGETS) {
    if (!widgets[k]) continue;
    if (leftColumn.includes(k) || rightColumn.includes(k)) continue;
    const col = DEFAULT_COLUMN[k];
    (col === "left" ? leftColumn : rightColumn).push(k);
  }
  return normalizeDashboardPrefs({
    ...prefs,
    leftColumn,
    rightColumn,
    columnSplit: DEFAULT_DASHBOARD_PREFS.columnSplit,
  });
}
