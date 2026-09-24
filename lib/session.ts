import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type Viewer = {
  /** Prénom affiché (« Bon retour, Noam ») */
  firstName: string;
  email: string;
  initial: string;
};

function firstNameFrom(email: string, meta: Record<string, unknown> | undefined) {
  const fromMeta = [meta?.first_name, meta?.full_name, meta?.name].find(
    (v): v is string => typeof v === "string" && v.trim().length > 0,
  );
  const raw = fromMeta?.trim().split(/\s+/)[0] ?? email.split("@")[0].split(/[._\-+0-9]/)[0];
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase() : "";
}

/** L'utilisateur connecté, ou null. Mis en cache pour la durée d'une requête. */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;
  const firstName = firstNameFrom(user.email, user.user_metadata);
  return {
    firstName,
    email: user.email,
    initial: (firstName || user.email).charAt(0).toUpperCase(),
  };
});
