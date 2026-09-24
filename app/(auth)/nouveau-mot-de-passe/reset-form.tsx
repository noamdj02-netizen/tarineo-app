"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthFieldGroup, FormMessage, PasswordField, SubmitButton } from "@/components/auth/auth-ui";
import { createClient } from "@/lib/supabase/client";
import { MIN_PASSWORD } from "../inscription/signup-form";

export function ResetForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<React.ReactNode>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < MIN_PASSWORD) {
      setError(`Au moins ${MIN_PASSWORD} caractères.`);
      return;
    }
    if (password !== confirm) {
      setError("Les deux mots de passe ne sont pas identiques.");
      return;
    }
    setBusy(true);
    setError(null);
    const { error } = await createClient().auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setError(
        error.code === "same_password" ? (
          "C’est déjà ton mot de passe actuel."
        ) : (
          <>
            Ce lien a expiré.{" "}
            <Link href="/mot-de-passe-oublie" className="underline">
              Demande un nouveau lien
            </Link>
            .
          </>
        ),
      );
      return;
    }
    router.replace("/accueil");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit}>
      <AuthFieldGroup>
      <PasswordField
        label="Nouveau mot de passe"
        autoComplete="new-password"
        required
        minLength={MIN_PASSWORD}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <PasswordField
        label="Confirme-le"
        autoComplete="new-password"
        required
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />
      {error ? <FormMessage>{error}</FormMessage> : null}
      <SubmitButton busy={busy}>Enregistrer</SubmitButton>
      </AuthFieldGroup>
    </form>
  );
}
