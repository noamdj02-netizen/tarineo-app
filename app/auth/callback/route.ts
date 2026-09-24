import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { WelcomeEmail } from "@/emails/welcome";
import { sendEmail } from "@/lib/email/send";
import { safeNext } from "@/lib/safe-next";
import { createClient } from "@/lib/supabase/server";

/**
 * Arrivée depuis le lien magique de l'email.
 * Gère les deux formats de lien Supabase : ?code=… (PKCE) et ?token_hash=…&type=…
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNext(searchParams.get("next"));
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();
  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: new Error("Lien incomplet") };

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=lien`);
  }
  await welcomeOnce(supabase, origin);
  return NextResponse.redirect(`${origin}${next}`);
}

/** Email de bienvenue au premier passage (confirmation d'inscription ou premier Google). */
async function welcomeOnce(supabase: Awaited<ReturnType<typeof createClient>>, origin: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email || user.user_metadata?.welcomed) return;
  // comptes créés avant l'envoi des bienvenues : pas d'email surprise
  if (Date.now() - new Date(user.created_at).getTime() > 864e5) return;
  // marque d'abord : un double clic sur le lien n'envoie pas deux emails
  await supabase.auth.updateUser({ data: { welcomed: true } });
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
