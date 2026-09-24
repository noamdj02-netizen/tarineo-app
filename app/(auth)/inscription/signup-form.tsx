"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Divider,
  Field,
  FormMessage,
  GoogleButton,
  PasswordField,
  SubmitButton,
} from "@/components/auth/auth-ui";
import { Illustration } from "@/components/illustration";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export const MIN_PASSWORD = 8;

function strength(pw: string) {
  let s = 0;
  if (pw.length >= MIN_PASSWORD) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

const STRENGTH = ["Trop court", "Faible", "Correct", "Bon", "Solide"];

export function SignupForm({ next }: { next: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const score = strength(password);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < MIN_PASSWORD) {
      setMsg(`Ton mot de passe doit faire au moins ${MIN_PASSWORD} caractères.`);
      return;
    }
    if (!accepted) {
      setMsg("Accepte les conditions pour créer ton compte.");
      return;
    }
    setBusy(true);
    setMsg(null);
    const { data, error } = await createClient().auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { first_name: name.trim(), onboarding_required: true, locale: "fr" },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setBusy(false);
    if (error) {
      setMsg(
        error.code === "weak_password"
          ? "Mot de passe trop simple : ajoute des chiffres ou des majuscules."
          : error.status === 429
            ? "Trop de tentatives. Réessaie dans quelques minutes."
            : "Inscription impossible. Vérifie ton email, puis réessaie.",
      );
      return;
    }
    // Supabase renvoie un utilisateur sans identités quand l'email existe déjà.
    if (data.user && data.user.identities?.length === 0) {
      setMsg("Un compte existe déjà avec cet email. Connecte-toi.");
      return;
    }
    if (data.session) {
      router.replace(next);
      router.refresh();
      return;
    }
    setSentTo(email.trim());
  }

  if (sentTo) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <Illustration name="feedback-envoye" className="size-24" />
        <p className="text-[18px] font-semibold tracking-[-0.02em]">Vérifie ta boîte mail</p>
        <p className="text-[14.5px] leading-relaxed text-muted">
          On a envoyé un lien de confirmation à <b className="text-ink">{sentTo}</b>. Clique dessus pour
          activer ton compte.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <GoogleButton next={next} />
      <Divider />
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field
          label="Prénom"
          autoComplete="given-name"
          required
          maxLength={60}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="flex flex-col gap-2">
          <PasswordField
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {password ? (
            <div className="flex items-center gap-2" aria-live="polite">
              <div className="grid flex-1 grid-cols-4 gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <i
                    key={i}
                    className={cn(
                      "block h-1 rounded-pill transition-colors duration-300",
                      i <= score
                        ? score <= 1
                          ? "bg-st-fini"
                          : score === 2
                            ? "bg-st-pause"
                            : "bg-st-focus"
                        : "bg-line",
                    )}
                  />
                ))}
              </div>
              <span className="w-16 text-right font-mono text-[11px] text-muted">{STRENGTH[score]}</span>
            </div>
          ) : null}
        </div>
        <label className="flex items-start gap-2.5 text-[13.5px] leading-snug text-muted">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 size-4 flex-none accent-ink"
          />
          <span>
            J’accepte les{" "}
            <Link href="/cgv" className="text-ink underline underline-offset-2">
              conditions
            </Link>{" "}
            et la{" "}
            <Link href="/confidentialite" className="text-ink underline underline-offset-2">
              politique de confidentialité
            </Link>
            .
          </span>
        </label>
        {msg ? <FormMessage>{msg}</FormMessage> : null}
        <SubmitButton busy={busy}>Créer mon compte</SubmitButton>
      </form>
    </div>
  );
}
