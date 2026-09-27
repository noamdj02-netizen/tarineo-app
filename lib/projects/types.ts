import type { FeatureStatus, NextPriority, ProjectStatus, SchemaKind } from "@/lib/supabase/types";

export type { NextPriority };

export type ProjectSchemaLink = {
  id: string;
  title: string;
  kind: SchemaKind;
};

export type ProjectAssetItem = {
  id: string;
  title: string;
  html: string;
  theme_id: string | null;
  kind?: "component" | "landing";
  created_at: string;
};

export type ProjectNoteItem = {
  id: string;
  title: string;
  content: string;
  source: string | null;
  created_at: string;
};

export type { FeatureStatus, ProjectStatus };

export type Feature = { id: string; title: string; status: FeatureStatus; position: number };
export type Task = { id: string; title: string; done: boolean; position: number };
export type LogEntry = { id: string; date: string; text: string; created_at: string };

/** Carte de la liste : le projet + ses compteurs. */
export type ProjectSummary = {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: ProjectStatus;
  stage: number;
  next: string;
  nextDueDate: string | null;
  nextPriority: NextPriority | null;
  nextEstimatedMinutes: number | null;
  blocked: boolean;
  blockerReason: string;
  site: string;
  github: string;
  figma: string;
  notion: string;
  theme: string;
  featuresDone: number;
  featuresTotal: number;
  tasksDone: number;
  tasksTotal: number;
};

/** Fiche détaillée : tout le projet. */
export type ProjectFull = Omit<
  ProjectSummary,
  "featuresDone" | "featuresTotal" | "tasksDone" | "tasksTotal"
> & {
  partner: string;
  pitch: string;
  target: string;
  problem: string;
  business: Record<string, string>;
  stack: string[];
  team: string[];
  risks: string[];
  notes: string;
  updated_at: string;
  features: Feature[];
  tasks: Task[];
  log: LogEntry[];
};

/** Libellés et ordre des statuts, repris du HTML d'origine. */
export const FEATURE_LABELS: Record<FeatureStatus, string> = {
  fait: "Fait",
  encours: "En cours",
  afaire: "À faire",
  verif: "À vérifier",
};

/** Un clic fait tourner : À faire → En cours → Fait → À vérifier → À faire */
export const FEATURE_ORDER: FeatureStatus[] = ["afaire", "encours", "fait", "verif"];

export function nextFeatureStatus(s: FeatureStatus): FeatureStatus {
  return FEATURE_ORDER[(FEATURE_ORDER.indexOf(s) + 1) % FEATURE_ORDER.length];
}

/** Champs modifiables depuis la carte (bouton « Modifier »). */
export const EDITABLE_FIELDS = [
  "stage",
  "status",
  "next",
  "nextDueDate",
  "nextPriority",
  "nextEstimatedMinutes",
  "blocked",
  "blockerReason",
  "site",
  "github",
  "figma",
  "notion",
] as const;

export type ProjectPatch = Partial<{
  stage: number;
  status: ProjectStatus;
  next: string;
  nextDueDate: string | null;
  nextPriority: NextPriority | null;
  nextEstimatedMinutes: number | null;
  blocked: boolean;
  blockerReason: string;
  site: string;
  github: string;
  figma: string;
  notion: string;
  notes: string;
}>;

/** N'accepte que les liens http(s), comme safeUrl() dans le HTML d'origine. */
export function safeUrl(u: string | null | undefined) {
  if (!u) return null;
  try {
    const url = new URL(u.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

/** « 2026-08-28 » → « 28/08/2026 » */
export function formatFrDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return d && m && y ? `${d}/${m}/${y}` : iso;
}

/** Nom → slug d'URL (« Optérieur » → « opterieur ») */
export function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}
