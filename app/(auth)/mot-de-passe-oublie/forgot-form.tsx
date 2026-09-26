"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthFieldGroup, Field, FormMessage, SubmitButton } from "@/components/auth/auth-ui";
import { FollowAuthTab } from "@/components/auth/follow-auth";
import { continueAfterAuth } from "@/lib/auth/continue-after-auth";
import { sendRecoveryCode } from "@/lib/email/auth-mail";
import { createClient } from "@/lib/supabase/client";

export function ForgotForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const mailed = await sendRecoveryCode(email.trim());
    if (mailed.ok) {
      setBusy(false);
      setSent(true);
      return;
    }
    if (mailed.error !== "fallback") {
      setBusy(false);
      setError(mailed.error);
      return;
    }
    const { error } = await createClient().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/nouveau-mot-de-passe`,
    });
    setBusy(false);
    // Même message que l'email existe ou non : on ne révèle pas qui a un compte.
    if (error && error.status === 429) {
      setError("Trop de demandes. Réessaie dans quelques minutes.");
      return;
    }
    setSent(true);
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: otpError } = await createClient().auth.verifyOtp({
      email: email.trim(),
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
      <SubmitButton busy={busy}>Envoyer le lien</SubmitButton>
      </AuthFieldGroup>
    </form>
  );
}
