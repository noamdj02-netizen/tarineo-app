import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { isOpenAccess, isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type Db = {
  supabase: SupabaseClient<Database>;
  user: Pick<User, "id" | "email" | "user_metadata">;
};

/** Compte utilisé en accès libre, retrouvé une fois par processus. */
let openUser: Promise<Db["user"] | null> | null = null;

async function findOpenAccessUser(admin: SupabaseClient<Database>) {
  const email = process.env.SEED_USER_EMAIL?.trim().toLowerCase();
  if (!email) throw new Error("Accès libre : SEED_USER_EMAIL manquant dans .env.local");
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`Accès libre : ${error.message}`);
    const u = data.users.find((x) => x.email?.toLowerCase() === email);
    if (u) return { id: u.id, email: u.email, user_metadata: u.user_metadata };
    if (data.users.length < 200) return null;
  }
}

/**
 * Accès aux données de l'utilisateur courant, côté serveur uniquement.
 * - Accès libre : client service role + compte SEED_USER_EMAIL (filtrer par user.id !).
 * - Sinon : client lié à la session, protégé par la RLS.
 * Renvoie null si Supabase n'est pas configuré ou si personne n'est connecté.
 */
export const getDb = cache(async (): Promise<Db | null> => {
  if (!isSupabaseConfigured()) return null;

  if (isOpenAccess()) {
    const admin = createAdminClient();
    openUser ??= findOpenAccessUser(admin).catch((e) => {
      openUser = null;
      throw e;
    });
    const user = await openUser;
    return user ? { supabase: admin, user } : null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { supabase, user } : null;
});
