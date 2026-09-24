"use client";

import { KeyRound, Mail } from "lucide-react";
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
import { safeNext } from "@/lib/safe-next";
import { createClient } from "@/lib/supabase/client";

type Mode = "password" | "link" | "code";

/** Jeton du lien magique collé depuis l'email (`…/verify?token=…`), sinon null (code tapé). */
function linkToken(input: string) {
  const match = input.trim().match(/[?&]token=([^&\s]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function LoginForm({ next, linkError }: { next?: string; linkError: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(
    linkError ? "Ce lien ne marche plus. Demande un nouveau lien." : null,
  );

  const target = safeNext(next);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const { error } = await createClient().auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (error) {
      setMsg(
        error.code === "email_not_confirmed"
          ? "Confirme d’abord ton email : clique sur le lien reçu à l’inscription."
          : "Email ou mot de passe incorrect.",
      );
      return;
    }
    router.replace(target);
    router.refresh();
  }

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const { error } = await createClient().auth.signInWithOtp({
      email: email.trim(),
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
    const tokenHash = linkToken(code);
    let { error } = tokenHash
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "email" })
      : await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    if (error && tokenHash?.startsWith("pkce_")) {
      ({ error } = await supabase.auth.verifyOtp({ token_hash: tokenHash.slice(5), type: "email" }));
    }
    setBusy(false);
    if (error) {
      setMsg("Lien ou code faux, déjà utilisé ou expiré. Demande un nouvel email.");
      return;
    }
    router.replace(target);
    router.refresh();
  }

  if (mode === "code") {
    return (
      <form onSubmit={verifyCode} className="flex flex-col gap-4">
        <div className="flex items-start gap-3 rounded-[16px] bg-surface-2 p-4 text-[14px] leading-relaxed">
          <Illustration name="feedback-envoye" className="-my-1 size-12 flex-none" />
          <span>
            Email envoyé à <b>{email}</b>. Clique sur le lien. Dans l’app iPhone : appui long sur le
            lien, « Copier », puis colle-le ici.
          </span>
        </div>
        <Field
          label="Lien ou code reçu"
          autoComplete="one-time-code"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          required
          placeholder="Colle le lien de l’email"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="font-mono"
        />
        {msg ? <FormMessage>{msg}</FormMessage> : null}
        <SubmitButton busy={busy}>
          <KeyRound className="size-4" aria-hidden />
          Me connecter
        </SubmitButton>
        <button
          type="button"
          onClick={() => setMode("link")}
          className="text-[14px] text-muted underline-offset-4 hover:text-ink hover:underline"
        >
          Changer d’email
        </button>
      </form>
    );
  }

  const byLink = mode === "link";
  return (
    <div className="flex flex-col gap-4">
      <GoogleButton next={target} />
      <Divider />
      <form onSubmit={byLink ? sendLink : signIn} className="flex flex-col gap-4">
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
              className="self-end text-[13px] text-muted underline-offset-4 hover:text-ink hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        )}
        {msg ? <FormMessage>{msg}</FormMessage> : null}
        <SubmitButton busy={busy}>{byLink ? "Recevoir mon lien" : "Me connecter"}</SubmitButton>
      </form>
      <button
        type="button"
        onClick={() => {
          setMsg(null);
          setMode(byLink ? "password" : "link");
        }}
        className="inline-flex items-center justify-center gap-2 text-[14px] text-muted underline-offset-4 hover:text-ink hover:underline"
      >
        {byLink ? <KeyRound className="size-3.5" aria-hidden /> : <Mail className="size-3.5" aria-hidden />}
        {byLink ? "Utiliser mon mot de passe" : "Recevoir un lien par email à la place"}
      </button>
    </div>
  );
}
