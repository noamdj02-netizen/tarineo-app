"use server";

import { headers } from "next/headers";
import { AuthMagicLinkEmail } from "@/emails/auth-magic-link";
import { AuthResetPasswordEmail } from "@/emails/auth-reset-password";
import { AuthSignupEmail } from "@/emails/auth-signup";
import { sendEmail } from "@/lib/email/send";
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
  const local = bare === "localhost" || bare === "127.0.0.1";
  const allowed =
    local || bare === "navpit.com" || bare.endsWith(".navpit.com") || bare.endsWith(".vercel.app");
  if (!allowed) return getSiteUrl();
  return `${local ? "http" : "https"}://${value}`;
}

async function appOrigin() {
  const h = await headers();
  return originFrom(h.get("x-forwarded-host") ?? h.get("host"));
}

async function findUser(email: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) return null;
  const res = await fetch(`${base}/auth/v1/admin/users?filter=${encodeURIComponent(email)}`, {
    headers: { Authorization: `Bearer ${key}`, apikey: key },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { users?: { email?: string | null }[] };
  return json.users?.find((user) => user.email?.toLowerCase() === email) ?? null;
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

/** Lien + code de connexion. Ne crée pas de compte si l’email est inconnu. */
export async function sendLoginCode(emailRaw: string, next: string): Promise<AuthMailResult> {
  const email = emailRaw.trim().toLowerCase();
  if (!email.includes("@")) return { ok: false, error: "Vérifie l’adresse, puis réessaie." };
  const known = await findUser(email);
  if (!known) return { ok: true, mode: "email" };

  const origin = await appOrigin();
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
    "Ton code de connexion Navpit",
    AuthMagicLinkEmail({
      appUrl: getSiteUrl(),
      confirmationUrl,
      token: data.properties.email_otp,
    }),
    `login/${email}/${data.properties.email_otp}`,
  );
  if (!sent.ok) {
    return {
      ok: false,
      error: sent.skipped ? "fallback" : "L’email n’est pas parti. Réessaie dans un moment.",
    };
  }
  return { ok: true, mode: "email" };
}

/** Code + bouton pour choisir un nouveau mot de passe. */
export async function sendRecoveryCode(emailRaw: string): Promise<AuthMailResult> {
  const email = emailRaw.trim().toLowerCase();
  if (!email.includes("@")) return { ok: true, mode: "recovery" };
  const known = await findUser(email);
  if (!known) return { ok: true, mode: "recovery" };

  const origin = await appOrigin();
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
    "Nouveau mot de passe Navpit",
    AuthResetPasswordEmail({
      appUrl: getSiteUrl(),
      confirmationUrl,
      token: data.properties.email_otp,
    }),
    `recovery/${email}/${data.properties.email_otp}`,
  );
  if (!sent.ok) {
    return {
      ok: false,
      error: sent.skipped ? "fallback" : "L’email n’est pas parti. Réessaie dans un moment.",
    };
  }
  return { ok: true, mode: "recovery" };
}

/** Crée le compte et envoie le mail Navpit (code + bouton). */
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

  const origin = await appOrigin();
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
    "Confirme ton compte Navpit",
    AuthSignupEmail({
      appUrl: getSiteUrl(),
      confirmationUrl,
      token: data.properties.email_otp,
    }),
    `signup/${data.user.id}/${data.properties.email_otp}`,
  );
  if (!sent.ok) {
    if (data.user?.id) await admin.auth.admin.deleteUser(data.user.id);
    return {
      ok: false,
      error: sent.skipped ? "fallback" : "L’email n’est pas parti. Réessaie dans un moment.",
    };
  }
  return { ok: true, mode: "signup" };
}
