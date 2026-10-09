"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { isLocale } from "@/lib/i18n";
import { createChantier, listChantiers } from "@/lib/metier/queries";

type Result = { ok: true } | { ok: false; error: string };

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

export async function saveOnboardingStep(step: string): Promise<Result> {
  return patchMeta({ onboarding_step: step });
}

/** Un chantier par défaut pour ranger le premier PDF sans formulaire dédié. */
export async function ensureOnboardingChantier(): Promise<Result> {
  const existing = await listChantiers();
  if (existing.length > 0) return { ok: true };
  try {
    await createChantier({ name: "Chantier principal" });
    return { ok: true };
  } catch {
    return fail("Impossible de préparer un chantier.");
  }
}

export async function finishOnboarding(): Promise<Result> {
  return patchMeta({
    onboarding_done: true,
    onboarding_required: false,
    onboarding_step: "done",
    /** Tour différé : pas d’overlay juste après le wizard (option A). */
    dashboard_tour_done: true,
  });
}

export async function finishDashboardTour(): Promise<Result> {
  const res = await patchMeta({ dashboard_tour_done: true });
  if (res.ok) revalidatePath("/accueil");
  return res;
}
