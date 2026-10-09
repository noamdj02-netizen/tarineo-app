"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthFieldGroup, Field, FormMessage, SubmitButton } from "@/components/auth/auth-ui";
import { FollowAuthTab } from "@/components/auth/follow-auth";
import { continueAfterAuth } from "@/lib/auth/continue-after-auth";
import { requestPasswordReset } from "@/lib/auth/request-password-reset";
import { createClient } from "@/lib/supabase/client";

type Delivery = "tarineo" | "supabase";

const RATE_LIMIT_COOLDOWN_MS = 5 * 60 * 1000;

function rateLimitMessage(secondsLeft: number) {
  const min = Math.max(1, Math.ceil(secondsLeft / 60));
  return `Trop de demandes envoyées à Supabase. Attends environ ${min} min avant de réessayer, ou connecte-toi avec Google.`;
}

export function ForgotForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [cooldownSec, setCooldownSec] = useState(0);

  useEffect(() => {
    if (!cooldownUntil) return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
      setCooldownSec(left);
      if (left <= 0) setCooldownUntil(null);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [cooldownUntil]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (cooldownUntil && cooldownUntil > Date.now()) return;
    setBusy(true);
    setError(null);
    const normalized = email.trim().toLowerCase();
    const result = await requestPasswordReset(normalized);
    setBusy(false);
    if (!result.ok) {
      if (result.error === "rate_limit") {
        setCooldownUntil(Date.now() + RATE_LIMIT_COOLDOWN_MS);
        setError(rateLimitMessage(RATE_LIMIT_COOLDOWN_MS / 1000));
        return;
      }
      setError(result.error);
      return;
    }
    setDelivery(result.delivery);
    setSent(true);
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const normalized = email.trim().toLowerCase();
    const { error: otpError } = await createClient().auth.verifyOtp({
      email: normalized,
      token: code.trim(),
      type: "recovery",
    });
    if (otpError) {
      setBusy(false);
      setError("Code faux, déjà utilisé ou expiré. Regarde le dernier email.");
      return;
    }
    const settled = await continueAfterAuth("/nouveau-mot-de-passe", null);
    if (!settled.ok) {
      setBusy(false);
      setError("Lien expiré. Demande un nouvel email.");
      return;
    }
    router.replace(settled.path);
    router.refresh();
  }

  if (sent && delivery === "supabase") {
    return (
      <div className="flex flex-col gap-4">
        <FollowAuthTab />
        <FormMessage tone="ok">
          Si un compte existe pour <b>{email}</b>, un lien de réinitialisation vient de partir. Ouvre-le sur
          cet appareil, puis choisis un nouveau mot de passe. Pense aux spams.
        </FormMessage>
        <Link
          href="/login"
          className="text-center text-[14px] font-medium text-ink underline-offset-4 hover:underline"
        >
          Retour à la connexion
        </Link>
      </div>
    );
  }

  if (sent) {
    return (
      <form onSubmit={verifyCode}>
        <FollowAuthTab />
        <AuthFieldGroup>
          <FormMessage tone="ok">
            Si un compte existe pour <b>{email}</b>, un code et un bouton viennent de partir. Pense aux
            spams.
          </FormMessage>
          <Field
            label="Code reçu"
            autoComplete="one-time-code"
            inputMode="numeric"
            required
            placeholder="482913"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="text-center font-mono text-[20px] tracking-[0.28em]"
          />
          {error ? <FormMessage>{error}</FormMessage> : null}
          <SubmitButton busy={busy}>Continuer</SubmitButton>
        </AuthFieldGroup>
      </form>
    );
  }

  const onCooldown = cooldownUntil !== null && cooldownUntil > Date.now();

  return (
    <form onSubmit={onSubmit}>
      <AuthFieldGroup>
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error ? <FormMessage>{error}</FormMessage> : null}
        {onCooldown ? (
          <p className="text-center text-[13px] text-muted-foreground">
            Nouvel envoi possible dans{" "}
            <span className="font-mono tabular-nums">
              {Math.floor(cooldownSec / 60)}:{String(cooldownSec % 60).padStart(2, "0")}
            </span>
          </p>
        ) : null}
        <SubmitButton busy={busy} disabled={onCooldown}>
          Envoyer le lien
        </SubmitButton>
        {onCooldown ? (
          <Link
            href="/login"
            className="text-center text-[14px] font-medium text-ink underline-offset-4 hover:underline"
          >
            Connexion avec Google ou mot de passe
          </Link>
        ) : null}
      </AuthFieldGroup>
    </form>
  );
}
