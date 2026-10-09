"use server";

import { headers } from "next/headers";
import { AuthMagicLinkEmail } from "@/emails/auth-magic-link";
import { AuthResetPasswordEmail } from "@/emails/auth-reset-password";
import { AuthSignupEmail } from "@/emails/auth-signup";
import { authEmailShouldUseSupabaseFallback, isResendSendEnabled, sendEmail } from "@/lib/email/send";
import { getSiteUrl } from "@/lib/site-url";
import { createAdminClient } from "@/lib/supabase/admin";

const MIN_PASSWORD = 8;

export type AuthMailResult =
  | { ok: true; mode: "signup" | "email" | "recovery"; already?: boolean }
  | { ok: false; error: string };

function originFrom(host: string | null) {
  if (!host) return getSiteUrl();
  const value = host.split(",")[0]?.trim() ?? "";
  const bare = value.split(":")[0];
  const deployed = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === "preview";
  const local = !deployed && (bare === "localhost" || bare === "127.0.0.1");
  const allowed =
    local ||
    bare === "tarineo.fr" ||
    bare.endsWith(".tarineo.fr") ||
    bare === "tarineo.com" ||
    bare.endsWith(".tarineo.com") ||
    bare === "app.tarineo.com" ||
    bare.endsWith(".vercel.app");
  if (!allowed) return getSiteUrl();
  return `${local ? "http" : "https"}://${value}`;
}

export async function getAuthAppOrigin() {
  const h = await headers();
  return originFrom(h.get("x-forwarded-host") ?? h.get("host"));
}

/** `null` = pas de compte ; `undefined` = lookup impossible (pas de service role). */
async function findUser(email: string): Promise<{ email?: string | null } | null | undefined> {
  const needle = email.trim().toLowerCase();
  let admin: ReturnType<typeof createAdminClient> | null = null;
  try {
    admin = createAdminClient();
  } catch {
    return undefined;
  }

  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) return undefined;
  const hit = data.users.find((user) => user.email?.toLowerCase() === needle);
  return hit ?? null;
}

/** Lien sur notre site : la session se pose ici, pas dans un fragment perdu après supabase.co. */
function confirmUrl(
  origin: string,
  properties: { hashed_token?: string; verification_type?: string } | null | undefined,
  next: string,
) {
  if (!properties?.hashed_token || !properties.verification_type) return null;
  const params = new URLSearchParams({
    token_hash: properties.hashed_token,
    type: properties.verification_type,
    next,
  });
  return `${origin}/auth/callback?${params.toString()}`;
}

function alreadyRegistered(error: { message?: string; code?: string } | null) {
  const text = `${error?.code ?? ""} ${error?.message ?? ""}`.toLowerCase();
  return text.includes("already") || text.includes("registered") || text.includes("exists");
}

function authMailSendFailure(sent: { ok: false; skipped?: boolean; error?: string }): AuthMailResult {
  if (authEmailShouldUseSupabaseFallback(sent)) {
    return { ok: false, error: "fallback" };
  }
  return {
    ok: false,
    error: sent.error ?? "L’email n’est pas parti. Réessaie dans un moment.",
  };
}

/** Lien + code de connexion. Ne crée pas de compte si l’email est inconnu. */
export async function sendLoginCode(emailRaw: string, next: string): Promise<AuthMailResult> {
  const email = emailRaw.trim().toLowerCase();
  if (!email.includes("@")) return { ok: false, error: "Vérifie l’adresse, puis réessaie." };
  const known = await findUser(email);
  if (known === null) {
    return { ok: false, error: "Aucun compte avec cet email. Crée un compte pour commencer." };
  }

  const origin = await getAuthAppOrigin();
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });
  const confirmationUrl = confirmUrl(origin, data?.properties, next);
  if (error || !data.properties?.email_otp || !confirmationUrl) {
    return { ok: false, error: "Envoi impossible. Vérifie l’adresse, puis réessaie." };
  }
  const sent = await sendEmail(
    email,
    "Votre code de connexion TARINEO",
    AuthMagicLinkEmail({
      appUrl: getSiteUrl(),
      confirmationUrl,
      token: data.properties.email_otp,
    }),
    `login/${email}/${data.properties.email_otp}`,
  );
  if (!sent.ok) return authMailSendFailure(sent);
  return { ok: true, mode: "email" };
}

/** Code + bouton pour choisir un nouveau mot de passe. */
export async function sendRecoveryCode(emailRaw: string): Promise<AuthMailResult> {
  const email = emailRaw.trim().toLowerCase();
  if (!email.includes("@")) return { ok: true, mode: "recovery" };

  /**
   * Sans Resend valide : un seul envoi via Supabase (évite generateLink + reset = double quota).
   * Si Resend renvoie 403 en local, retire RESEND_API_KEY ou mets AUTH_PASSWORD_RESET_SUPABASE_ONLY=true.
   */
  if (!isResendSendEnabled() || process.env.AUTH_PASSWORD_RESET_SUPABASE_ONLY === "true") {
    return { ok: false, error: "fallback" };
  }

  const known = await findUser(email);
  if (known === null) return { ok: true, mode: "recovery" };

  const origin = await getAuthAppOrigin();
  const redirectTo = `${origin}/auth/callback?next=/nouveau-mot-de-passe`;
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo },
  });
  const confirmationUrl = confirmUrl(origin, data?.properties, "/nouveau-mot-de-passe");
  if (error || !data.properties?.email_otp || !confirmationUrl) {
    return { ok: false, error: "Envoi impossible. Réessaie dans un moment." };
  }
  const sent = await sendEmail(
    email,
    "Nouveau mot de passe TARINEO",
    AuthResetPasswordEmail({
      appUrl: getSiteUrl(),
      confirmationUrl,
      token: data.properties.email_otp,
    }),
    `recovery/${email}/${data.properties.email_otp}`,
  );
  if (!sent.ok) return authMailSendFailure(sent);
  return { ok: true, mode: "recovery" };
}

/** Crée le compte et envoie le mail TARINEO (code + bouton). */
export async function sendSignupCode(input: {
  email: string;
  password: string;
  firstName: string;
  next: string;
  honeypot?: string;
}): Promise<AuthMailResult> {
  if (input.honeypot?.trim()) return { ok: true, mode: "signup" };
  const email = input.email.trim().toLowerCase();
  if (!email.includes("@") || input.password.length < MIN_PASSWORD) {
    return { ok: false, error: "Vérifie l’email et le mot de passe (8 caractères minimum)." };
  }

  const origin = await getAuthAppOrigin();
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(input.next)}`;
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "signup",
    email,
    password: input.password,
    options: {
      data: { first_name: input.firstName.trim(), onboarding_required: true, locale: "fr" },
      redirectTo,
    },
  });

  const confirmationUrl = confirmUrl(origin, data?.properties, input.next);
  if (error || !data?.properties?.email_otp || !confirmationUrl) {
    if (alreadyRegistered(error)) {
      const login = await sendLoginCode(email, input.next);
      if (login.ok) return { ...login, already: true };
      return { ok: false, error: "Un compte existe déjà avec cet email. Connecte-toi." };
    }
    return { ok: false, error: "Inscription impossible. Vérifie ton email, puis réessaie." };
  }

  const sent = await sendEmail(
    email,
    "Confirmez votre compte TARINEO",
    AuthSignupEmail({
      appUrl: getSiteUrl(),
      confirmationUrl,
      token: data.properties.email_otp,
    }),
    `signup/${data.user.id}/${data.properties.email_otp}`,
  );
  if (!sent.ok) {
    if (data.user?.id) await admin.auth.admin.deleteUser(data.user.id);
    return authMailSendFailure(sent);
  }
  return { ok: true, mode: "signup" };
}
