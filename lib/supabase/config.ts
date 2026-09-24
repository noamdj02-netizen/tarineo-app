export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Accès libre (sans connexion) : l'app travaille directement sur le compte SEED_USER_EMAIL.
 * Pratique pendant le développement. À remettre à false avant d'ouvrir l'app au public.
 */
export function isOpenAccess() {
  return process.env.NAVPIT_OPEN_ACCESS === "true";
}
