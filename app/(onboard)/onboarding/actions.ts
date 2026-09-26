"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { isLocale } from "@/lib/i18n";
import {
  isGoalId,
  isPainId,
  type OnboardingAnswers,
} from "@/lib/onboarding/catalog";
import { getTrendApp } from "@/lib/onboarding/trend-apps";
import {
  DEFAULT_DASHBOARD_PREFS,
  normalizeDashboardPrefs,
  type WidgetKey,
} from "@/lib/home/dashboard-prefs";
import { slugify } from "@/lib/projects/types";

type Result = { ok: true } | { ok: false; error: string };

export type OnboardProject = {
  id: string;
  name: string;
  slug: string;
  status: string;
};

function fail(error: string): Result {
  return { ok: false, error };
}

async function patchMeta(patch: Record<string, unknown>): Promise<Result> {
  const db = await getDb();
  if (!db) return fail("Pas connecté");
  const { error } = await db.supabase.auth.updateUser({
    data: { ...db.user.user_metadata, ...patch },
  });
  if (error) return fail(error.message);
  return { ok: true };
}

export async function saveWelcome(
  firstName: string,
  locale: string,
  lastName = "",
): Promise<Result> {
  const first = firstName.trim().slice(0, 40);
  const last = lastName.trim().slice(0, 40);
  if (first.length < 2) return fail("Prénom trop court");
  if (!isLocale(locale)) return fail("Langue inconnue");
  return patchMeta({
    first_name: first,
    last_name: last,
    locale,
    onboarding_step: "identite",
  });
}

export async function saveOnboardingAnswers(raw: OnboardingAnswers): Promise<Result> {
  const goal = raw.goal && isGoalId(raw.goal) ? raw.goal : undefined;
  const pains = (raw.pains ?? []).filter(isPainId).slice(0, 6);
  const swipes = Array.isArray(raw.swipes)
    ? raw.swipes.slice(0, 3).map((v) => Boolean(v))
    : [];
  return patchMeta({
    onboarding: { goal, pains, swipes },
    onboarding_step: "answers",
  });
}

export async function listMyProjects(): Promise<OnboardProject[]> {
  const db = await getDb();
  if (!db) return [];
  const { data } = await db.supabase
    .from("projects")
    .select("id, name, slug, status")
    .eq("user_id", db.user.id)
    .order("updated_at", { ascending: false })
    .limit(20);
  return (data ?? []) as OnboardProject[];
}

export async function chooseProject(id: string): Promise<Result> {
  const db = await getDb();
  if (!db) return fail("Pas connecté");
  const { data } = await db.supabase
    .from("projects")
    .select("id")
    .eq("id", id)
    .eq("user_id", db.user.id)
    .maybeSingle();
  if (!data) return fail("Projet introuvable");
  await db.supabase
    .from("projects")
    .update({ status: "pause" })
    .eq("user_id", db.user.id)
    .eq("status", "focus")
    .neq("id", id);
  const { error } = await db.supabase
    .from("projects")
    .update({ status: "focus" })
    .eq("id", id)
    .eq("user_id", db.user.id);
  if (error) return fail(error.message);
  return patchMeta({ onboarding_step: "projet" });
}

async function insertFocus(name: string): Promise<Result> {
  const db = await getDb();
  if (!db) return fail("Pas connecté");
  const trimmed = name.trim().slice(0, 80);
  if (trimmed.length < 2) return fail("Nom trop court");
  await db.supabase
    .from("projects")
    .update({ status: "pause" })
    .eq("user_id", db.user.id)
    .eq("status", "focus");
  const { error } = await db.supabase.from("projects").insert({
    user_id: db.user.id,
    name: trimmed,
    slug: slugify(trimmed),
    status: "focus",
  });
  if (error) return fail(error.message);
  return patchMeta({ onboarding_step: "projet" });
}

export async function saveProjects(names: string[]): Promise<Result> {
  const first = names.map((n) => n.trim()).find((n) => n.length >= 2);
  if (!first) return fail("Donne au moins un nom");
  return insertFocus(first);
}

export async function createProjectFromIdea(ideaId: string, customName?: string): Promise<Result> {
  const custom = customName?.trim() ?? "";
  if (custom.length >= 2) return insertFocus(custom);
  const idea = getTrendApp(ideaId);
  if (!idea) return fail("Idée inconnue");
  return insertFocus(idea.n);
}

export async function saveCockpit(input: {
  widgets: Record<string, boolean>;
  avatar?: string | null;
}): Promise<Result> {
  const widgets = { ...DEFAULT_DASHBOARD_PREFS.widgets };
  for (const [k, v] of Object.entries(input.widgets ?? {})) {
    if (k in widgets && typeof v === "boolean") widgets[k as WidgetKey] = v;
  }
  const layout = normalizeDashboardPrefs({ ...DEFAULT_DASHBOARD_PREFS, widgets });
  const db = await getDb();
  if (!db) return fail("Pas connecté");
  const { error: dashError } = await db.supabase.from("user_dashboard").upsert(
    {
      user_id: db.user.id,
      layout,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (dashError) return fail(dashError.message);
  const patch: Record<string, unknown> = {
    dashboard: { widgets },
    onboarding_step: "cockpit",
  };
  if (input.avatar) patch.avatar_url = input.avatar;
  return patchMeta(patch);
}

export async function finishOnboarding(): Promise<Result> {
  return patchMeta({
    onboarding_done: true,
    onboarding_required: false,
    dashboard_tour_done: false,
  });
}

export async function finishDashboardTour(): Promise<Result> {
  const res = await patchMeta({ dashboard_tour_done: true });
  if (res.ok) revalidatePath("/accueil");
  return res;
}
