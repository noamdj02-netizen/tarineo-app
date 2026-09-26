"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AuthFieldGroup,
  Divider,
  Field,
  FormMessage,
  GoogleButton,
  PasswordField,
  SubmitButton,
} from "@/components/auth/auth-ui";
import { Illustration } from "@/components/illustration";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field as UiField, FieldLabel } from "@/components/ui/field";
import { HoneypotField } from "@/components/site/honeypot-field";
import { FollowAuthTab } from "@/components/auth/follow-auth";
import { continueAfterAuth } from "@/lib/auth/continue-after-auth";
import { sendSignupCode } from "@/lib/email/auth-mail";
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
  const [honeypot, setHoneypot] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [otpType, setOtpType] = useState<"signup" | "email">("signup");
  const [code, setCode] = useState("");
  const [already, setAlready] = useState(false);
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
    if (honeypot.trim()) {
      setSentTo(email.trim());
      return;
    }
    setBusy(true);
    setMsg(null);
    const mailed = await sendSignupCode({
      email: email.trim(),
      password,
      firstName: name.trim(),
      next,
      honeypot,
    });
    if (mailed.ok) {
      setBusy(false);
      setAlready(Boolean(mailed.already));
      setOtpType(mailed.mode === "email" ? "email" : "signup");
      setSentTo(email.trim());
      return;
    }
    if (mailed.error !== "fallback") {
      setBusy(false);
      setMsg(mailed.error);
      return;
    }
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

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const { error } = await createClient().auth.verifyOtp({
      email: sentTo ?? email.trim(),
      token: code.trim(),
      type: otpType,
    });
    if (error) {
      setBusy(false);
      setMsg("Code faux, déjà utilisé ou expiré. Regarde le dernier email.");
      return;
    }
    const kind = already ? "login" : "signup";
    const settled = await continueAfterAuth(next, kind);
    if (!settled.ok) {
      window.location.assign(
        `/auth/callback?next=${encodeURIComponent(next)}&verified=${kind}`,
      );
      return;
    }
    router.replace(settled.path);
    router.refresh();
  }

  if (sentTo) {
    return (
      <Card className="border-0 bg-transparent shadow-none ring-0">
        <FollowAuthTab />
        <CardHeader className="items-center px-0 text-center">
          <Illustration name="feedback-envoye" className="size-24" />
          <CardTitle className="text-[18px] tracking-[-0.02em]">Vérifie ta boîte mail</CardTitle>
          <CardDescription className="text-[14.5px] leading-relaxed">
            {already
              ? "Un compte existe déjà. On a envoyé un code pour te connecter à "
              : "On a envoyé un code et un bouton à "}
            <b className="text-foreground">{sentTo}</b>.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <form onSubmit={verifyCode} className="flex flex-col gap-4">
            <Field
              label="Code reçu"
              autoComplete="one-time-code"
              inputMode="numeric"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              required
              placeholder="482913"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="text-center font-mono text-[20px] tracking-[0.28em]"
            />
            {msg ? <FormMessage>{msg}</FormMessage> : null}
            <SubmitButton busy={busy}>Activer mon compte</SubmitButton>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <GoogleButton next={next} />
      <Divider />
      <form onSubmit={onSubmit} className="relative">
        <HoneypotField value={honeypot} onChange={setHoneypot} />
        <AuthFieldGroup>
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
              <span className="w-16 text-right font-mono text-[11px] text-muted-foreground">{STRENGTH[score]}</span>
            </div>
          ) : null}
        </div>
        <UiField orientation="horizontal" data-invalid={!accepted && msg ? true : undefined}>
          <Checkbox
            checked={accepted}
            onCheckedChange={(v) => setAccepted(v === true)}
            aria-invalid={!accepted && !!msg}
          />
          <FieldLabel className="text-[13.5px] leading-snug font-normal text-muted-foreground">
            J’accepte les{" "}
            <Link href="/cgv" className="text-foreground underline underline-offset-2">
              conditions
            </Link>{" "}
            et la{" "}
            <Link href="/confidentialite" className="text-foreground underline underline-offset-2">
              politique de confidentialité
            </Link>
            .
          </FieldLabel>
        </UiField>
        {msg ? <FormMessage>{msg}</FormMessage> : null}
        <SubmitButton busy={busy}>Créer mon compte</SubmitButton>
        </AuthFieldGroup>
      </form>
    </div>
  );
}
