import type { NextPriority } from "@/lib/supabase/types";

export type { NextPriority };

/** Priorité de la prochaine action (3 niveaux max). */
export const NEXT_PRIORITY_LABELS: Record<NextPriority, string> = {
  faible: "Priorité faible",
  normale: "Priorité normale",
  elevee: "Priorité élevée",
};

export function isNextPriority(v: unknown): v is NextPriority {
  return v === "faible" || v === "normale" || v === "elevee";
}

/** « Mardi » / « Aujourd’hui » / « 29 septembre » / « En retard · 2 jours ». */
export function formatNextDue(iso: string | null | undefined, now = new Date()): string | null {
  if (!iso) return null;
  const due = parseLocalDate(iso);
  if (!due) return null;

  const today = startOfDay(now);
  const diff = Math.round((due.getTime() - today.getTime()) / 86_400_000);

  if (diff < 0) {
    const days = Math.abs(diff);
    return days === 1 ? "En retard · 1 jour" : `En retard · ${days} jours`;
  }
  if (diff === 0) return "Aujourd’hui";
  if (diff === 1) return "Demain";

  const weekday = due.toLocaleDateString("fr-FR", { weekday: "long" });
  const capitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1);

  // Même semaine civile : jour seul
  if (diff < 7 && due.getDay() !== today.getDay()) {
    return capitalized;
  }

  return due.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

export function isNextOverdue(iso: string | null | undefined, now = new Date()): boolean {
  if (!iso) return false;
  const due = parseLocalDate(iso);
  if (!due) return false;
  return due.getTime() < startOfDay(now).getTime();
}

/** ~15 min · ~1 h — rien si absente. */
export function formatEstimatedMinutes(mins: number | null | undefined): string | null {
  if (mins == null || !Number.isFinite(mins) || mins <= 0) return null;
  const m = Math.round(mins);
  if (m < 60) return `~${m} min`;
  const h = m / 60;
  if (Number.isInteger(h)) return `~${h} h`;
  const whole = Math.floor(h);
  const rem = m % 60;
  return rem === 30 ? `~${whole},5 h` : `~${whole} h ${rem} min`;
}

export function progressPercent(featuresDone: number, featuresTotal: number, tasksDone: number, tasksTotal: number) {
  const total = featuresTotal + tasksTotal;
  if (total <= 0) return null;
  const done = featuresDone + tasksDone;
  return Math.min(100, Math.round((done / total) * 100));
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function parseLocalDate(iso: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}
