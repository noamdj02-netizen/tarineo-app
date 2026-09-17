import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const globalForSupabase = globalThis as unknown as {
  supabaseAdmin?: SupabaseClient;
};

export function isSupabaseConfigured(): boolean {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return Boolean(url && key);
}

/** Client service role — créé à la demande, jamais à l'import du module. */
export function getSupabaseAdmin(): SupabaseClient {
  if (globalForSupabase.supabaseAdmin) {
    return globalForSupabase.supabaseAdmin;
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Stockage Supabase non configuré : renseignez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env"
    );
  }

  const client = createClient(url, key, {
    auth: { persistSession: false },
  });

  if (process.env.NODE_ENV !== "production") {
    globalForSupabase.supabaseAdmin = client;
  }

  return client;
}

export const DOCUMENTS_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "documents";
