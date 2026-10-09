"use client";

import type { EmailOtpType } from "@supabase/supabase-js";
import { KeyRound, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FollowAuthTab, publishAuthLanding } from "@/components/auth/follow-auth";
import { continueAfterAuth } from "@/lib/auth/continue-after-auth";
import { loginErrorMessage } from "@/lib/auth/login-errors";
import { kindFromEmailType } from "@/lib/auth/verified";
import {
  AuthFieldGroup,
  Divider,
  Field,
  FormMessage,
  GoogleButton,
  PasswordField,
  SubmitButton,
} from "@/components/auth/auth-ui";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TarineoHdMascot } from "@/components/tarineo-hd-mascot";
import { Button } from "@/components/ui/button";
import { sendLoginCode } from "@/lib/email/auth-mail";
import { safeNext } from "@/lib/safe-next";
import { createClient } from "@/lib/supabase/client";

type Mode = "password" | "link" | "code";

/** Lien collé depuis l'email, sinon null (code tapé). */
function pastedLink(input: string) {
  const raw = input.trim();
  let url: URL | null = null;
  try {
    if (raw.startsWith("http")) url = new URL(raw);
    else if (raw.startsWith("/")) url = new URL(raw, "http://local");
  } catch {
    url = null;
  }
  if (url) {
    const tokenHash = url.searchParams.get("token_hash") || url.searchParams.get("token");
    if (!tokenHash) return null;
    return {
      tokenHash,
      type: (url.searchParams.get("type") || "email") as EmailOtpType,
      next: url.searchParams.get("next"),
    };
  }
  const legacy = raw.match(/[?&]token=([^&\s]+)/);
  if (!legacy) return null;
  return { tokenHash: decodeURIComponent(legacy[1]), type: "email" as const, next: null };
}

export function LoginForm({
  next,
  linkError,
  signedOut,
}: {
  next?: string;
  linkError: boolean;
  signedOut?: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(
    linkError
      ? "Ce lien ne marche plus. Demande un nouveau lien."
      : signedOut
        ? "Tu es déconnecté. Connecte-toi avec Google ou ton email pour continuer."
        : null,
  );

  const target = safeNext(next);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const { error } = await createClient().auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) {
      setBusy(false);
      setMsg(loginErrorMessage(error));
      return;
    }
    const settled = await continueAfterAuth(target, "login");
    setBusy(false);
    if (!settled.ok) {
      window.location.assign(`/auth/callback?next=${encodeURIComponent(target)}&verified=login`);
      return;
    }
    publishAuthLanding(settled.path);
    router.replace(settled.path);
    router.refresh();
  }

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const mailed = await sendLoginCode(email.trim().toLowerCase(), target);
    if (mailed.ok) {
      setBusy(false);
      setMode("code");
      return;
    }
    if (mailed.error !== "fallback") {
      setBusy(false);
      setMsg(mailed.error);
      return;
    }
    const { error } = await createClient().auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        // le lien ne crée pas de compte : on passe par /inscription pour ça
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(target)}`,
      },
    });
    setBusy(false);
    if (error) {
      setMsg(
        error.status === 429
          ? "Trop d’emails envoyés d’un coup. Utilise le dernier email reçu, ou réessaie dans une heure."
          : "Envoi impossible. Vérifie l’adresse, puis réessaie.",
      );
      return;
    }
    setMode("code");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    const pasted = pastedLink(code);
    const otpType = pasted?.type ?? "email";
    let { error } = pasted
      ? await supabase.auth.verifyOtp({ token_hash: pasted.tokenHash, type: otpType })
      : await supabase.auth.verifyOtp({
          email: email.trim().toLowerCase(),
          token: code.trim(),
          type: "email",
        });
    if (error && pasted?.tokenHash.startsWith("pkce_")) {
      ({ error } = await supabase.auth.verifyOtp({ token_hash: pasted.tokenHash.slice(5), type: otpType }));
    }
    if (error) {
      setBusy(false);
      setMsg("Lien ou code faux, déjà utilisé ou expiré. Demande un nouvel email.");
      return;
    }
    const dest = pasted?.type === "recovery" ? "/nouveau-mot-de-passe" : safeNext(pasted?.next, target);
    const kind = pasted?.type === "recovery" ? null : (kindFromEmailType(pasted?.type) ?? "login");
    const settled = await continueAfterAuth(dest, kind);
    if (!settled.ok) {
      const verified = kind ? `&verified=${kind}` : "";
      window.location.assign(`/auth/callback?next=${encodeURIComponent(dest)}${verified}`);
      return;
    }
    publishAuthLanding(settled.path);
    router.replace(settled.path);
    router.refresh();
  }

  if (mode === "code") {
    return (
      <form onSubmit={verifyCode} className="flex flex-col gap-4">
        <FollowAuthTab />
        <Alert className="border-line bg-surface-2">
          <TarineoHdMascot name="14-bulle" className="h-12 w-14" label="" />
          <AlertDescription className="text-[14px] leading-relaxed">
            Email envoyé à <b>{email}</b>. Entre le code à 6 chiffres, ou colle le lien. Dans l’app
            iPhone : appui long sur le lien, « Copier ».
          </AlertDescription>
        </Alert>
        <Field
          label="Lien ou code reçu"
          autoComplete="one-time-code"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          required
          placeholder="Code ou lien"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="font-mono"
        />
        {msg ? <FormMessage>{msg}</FormMessage> : null}
        <SubmitButton busy={busy}>
          <KeyRound className="size-4" aria-hidden />
          Me connecter
        </SubmitButton>
        <Button type="button" variant="link" onClick={() => setMode("link")} className="h-auto p-0">
          Changer d’email
        </Button>
      </form>
    );
  }

  const byLink = mode === "link";
  return (
    <div className="flex flex-col gap-4">
      <GoogleButton next={target} />
      <Divider />
      <form onSubmit={byLink ? sendLink : signIn}>
        <AuthFieldGroup>
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {byLink ? null : (
          <div className="flex flex-col gap-1.5">
            <PasswordField
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Link
              href="/mot-de-passe-oublie"
              className="self-end text-[13px] text-muted-foreground underline-offset-4 hover:text-ink hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        )}
        {msg ? <FormMessage>{msg}</FormMessage> : null}
        <SubmitButton busy={busy}>{byLink ? "Recevoir mon lien" : "Me connecter"}</SubmitButton>
        </AuthFieldGroup>
      </form>
      <Button
        type="button"
        variant="link"
        onClick={() => {
          setMsg(null);
          setMode(byLink ? "password" : "link");
        }}
        className="h-auto gap-2 p-0 text-[14px] font-medium text-ink"
      >
        {byLink ? <KeyRound aria-hidden /> : <Mail aria-hidden />}
        {byLink ? "Utiliser mon mot de passe" : "Recevoir un lien par email à la place"}
      </Button>
    </div>
  );
}
