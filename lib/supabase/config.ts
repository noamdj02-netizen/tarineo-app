export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Accès libre (sans connexion) : compte SEED_USER_EMAIL.
 * Uniquement en développement local. Preview et production exigent une session.
 */
export function isOpenAccess() {
  const vercel = process.env.VERCEL_ENV;
  if (vercel === "production" || vercel === "preview") return false;
  if (process.env.NODE_ENV === "production") return false;
  return process.env.TARINEO_OPEN_ACCESS === "true" || process.env.NAVPIT_OPEN_ACCESS === "true";
}
