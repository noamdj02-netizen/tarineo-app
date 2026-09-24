import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export function signupSkipsProTrial(next: string, origin: string) {
  try {
    const url = new URL(next, origin);
    if (url.searchParams.get("plan") === "founder") return true;
  } catch {
    /* ignore */
  }
  return /(?:\?|&)plan=founder(?:&|$)/.test(next);
}

export async function startProTrial(supabase: SupabaseClient<Database>) {
  await supabase.rpc("start_pro_trial");
}

export async function enforceProTrialExpiry(supabase: SupabaseClient<Database>) {
  await supabase.rpc("enforce_pro_trial_expiry");
}
