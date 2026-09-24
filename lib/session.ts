import "server-only";
import { cache } from "react";
import { getDb } from "@/lib/db";
import { isOpenAccess } from "@/lib/supabase/config";

export type Viewer = {
  /** Prénom affiché (« Bon retour, Noam ») */
  firstName: string;
  email: string;
  initial: string;
  avatarUrl: string | null;
  locale: "fr" | "en";
  /** false en accès libre : pas de bouton « Se déconnecter » */
  canSignOut: boolean;
  /** Inscription récente : le wizard d’accueil n’est pas encore fini. */
  needsOnboarding: boolean;
  theme: string | null;
};

function firstNameFrom(email: string, meta: Record<string, unknown> | undefined) {
  const fromMeta = [meta?.first_name, meta?.full_name, meta?.name].find(
    (v): v is string => typeof v === "string" && v.trim().length > 0,
  );
  const raw = fromMeta?.trim().split(/\s+/)[0] ?? email.split("@")[0].split(/[._\-+0-9]/)[0];
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase() : "";
}

/** L'utilisateur courant, ou null. Mis en cache pour la durée d'une requête. */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const db = await getDb();
  const email = db?.user.email;
  if (!email) return null;
  const meta = db.user.user_metadata ?? {};
  const firstName = firstNameFrom(email, meta);
  const avatar =
    [meta.avatar_url, meta.picture].find(
      (v): v is string => typeof v === "string" && v.startsWith("http"),
    ) ?? null;
  return {
    firstName,
    email,
    initial: (firstName || email).charAt(0).toUpperCase(),
    avatarUrl: avatar,
    locale: meta.locale === "en" ? "en" : "fr",
    canSignOut: !isOpenAccess(),
    needsOnboarding: meta.onboarding_required === true && meta.onboarding_done !== true,
    theme: typeof meta.theme === "string" ? meta.theme : null,
  };
});
