import type { SupabaseClient } from "@supabase/supabase-js";
import { WelcomeEmail } from "@/emails/welcome";
import { signupSkipsProTrial, startProTrial } from "@/lib/billing/trial";
import { sendEmail } from "@/lib/email/send";
import { safeNext } from "@/lib/safe-next";
import type { Database } from "@/lib/supabase/types";

type Sb = SupabaseClient<Database>;

/** Après une session valide : email de bienvenue, essai, puis la page à ouvrir. */
export async function settleAuthSession(supabase: Sb, origin: string, nextRaw: string | null) {
  const next = safeNext(nextRaw);
  const {
    data: { user: beforeWelcome },
  } = await supabase.auth.getUser();
  const firstAuth = Boolean(beforeWelcome && !beforeWelcome.user_metadata?.welcomed);
  await welcomeOnce(supabase, origin);
  if (firstAuth && !signupSkipsProTrial(next, origin)) {
    await startProTrial(supabase);
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const meta = user?.user_metadata ?? {};
  if (meta.onboarding_done === true) return next;
  if (next.startsWith("/nouveau-mot-de-passe")) return next;
  if (next === "/onboarding" || next.startsWith("/onboarding?")) return next;

  if (meta.onboarding_required !== true) {
    await supabase.auth.updateUser({ data: { onboarding_required: true } });
  }
  const dest = new URL("/onboarding", origin);
  if (next !== "/accueil") dest.searchParams.set("next", next);
  const ask = new URL(next, origin).searchParams.get("ask");
  if (ask) dest.searchParams.set("ask", ask);
  return `${dest.pathname}${dest.search}`;
}

/** Email de bienvenue au premier passage (confirmation d'inscription ou premier Google). */
async function welcomeOnce(supabase: Sb, origin: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email || user.user_metadata?.welcomed) return;
  if (Date.now() - new Date(user.created_at).getTime() > 864e5) return;
  const extra = user.user_metadata?.onboarding_done === true ? {} : { onboarding_required: true };
  await supabase.auth.updateUser({ data: { welcomed: true, ...extra } });
  const meta = user.user_metadata ?? {};
  const name = [meta.first_name, meta.full_name, meta.name].find(
    (v): v is string => typeof v === "string" && v.trim().length > 0,
  );
  await sendEmail(
    user.email,
    "Bienvenue sur Navpit",
    WelcomeEmail({ firstName: name?.trim().split(/\s+/)[0] ?? "", appUrl: origin }),
  );
}
