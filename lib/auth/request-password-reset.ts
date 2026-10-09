"use server";

import { getAuthAppOrigin, sendRecoveryCode } from "@/lib/email/auth-mail";
import { isResendSendEnabled } from "@/lib/email/send";
import { createClient } from "@/lib/supabase/server";

export type PasswordResetResult =
  | { ok: true; delivery: "tarineo" | "supabase" }
  | { ok: false; error: "rate_limit" | string };

/** Un seul email de recovery par demande (Supabase ou TARINEO via Resend). */
export async function requestPasswordReset(emailRaw: string): Promise<PasswordResetResult> {
  const email = emailRaw.trim().toLowerCase();
  if (!email.includes("@")) return { ok: true, delivery: "supabase" };

  if (isResendSendEnabled() && process.env.AUTH_PASSWORD_RESET_SUPABASE_ONLY !== "true") {
    const mailed = await sendRecoveryCode(email);
    if (mailed.ok) return { ok: true, delivery: "tarineo" };
    if (mailed.error !== "fallback") return { ok: false, error: mailed.error };
  }

  const origin = await getAuthAppOrigin();
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/nouveau-mot-de-passe`,
  });
  if (error?.status === 429) return { ok: false, error: "rate_limit" };
  return { ok: true, delivery: "supabase" };
}
