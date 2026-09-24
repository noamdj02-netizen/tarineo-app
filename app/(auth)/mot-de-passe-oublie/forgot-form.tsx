"use client";

import { useState } from "react";
import { Field, FormMessage, SubmitButton } from "@/components/auth/auth-ui";
import { createClient } from "@/lib/supabase/client";

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
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

  if (sent) {
    return (
      <FormMessage tone="ok">
        Si un compte existe pour <b>{email}</b>, un lien vient de partir. Pense à regarder tes spams.
      </FormMessage>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
    </form>
  );
}
