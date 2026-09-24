"use client";

import { Loader2, Mail, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { safeNext } from "@/lib/safe-next";
import { createClient } from "@/lib/supabase/client";

type Step = "email" | "code";

export function LoginForm({ next, linkError }: { next?: string; linkError: boolean }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(
    linkError ? "Ce lien ne marche plus. Demande un nouveau lien." : null,
  );

  const target = safeNext(next);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        // Pas de création de compte depuis cette page : seul ton compte existe.
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(target)}`,
      },
    });
    setBusy(false);
    if (error) {
      setMsg("Envoi impossible. Vérifie l’adresse, puis réessaie.");
      return;
    }
    setStep("code");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "email",
    });
    setBusy(false);
    if (error) {
      setMsg("Code faux ou expiré.");
      return;
    }
    router.replace(target);
    router.refresh();
  }

  if (step === "code") {
    return (
      <form onSubmit={verifyCode} className="edit">
        <p className="next">
          <Mail aria-hidden />
          <span>
            Email envoyé à <b>{email}</b>. Clique sur le lien, ou tape le code reçu ici (pratique
            dans l’app iPhone).
          </span>
        </p>
        <label>
          Code à 6 chiffres
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6,10}"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="min-h-11 font-mono text-lg tracking-[.3em]"
          />
        </label>
        {msg ? (
          <p className="status" role="alert">
            {msg}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button className="btn pri min-h-11" type="submit" disabled={busy}>
            {busy ? <Loader2 className="animate-spin" aria-hidden /> : <KeyRound aria-hidden />}
            Me connecter
          </button>
          <button className="btn min-h-11" type="button" onClick={() => setStep("email")}>
            Changer d’email
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={sendLink} className="edit">
      <label>
        Ton email
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-h-11"
        />
      </label>
      {msg ? (
        <p className="status" role="alert">
          {msg}
        </p>
      ) : null}
      <button className="btn pri min-h-11 w-fit" type="submit" disabled={busy}>
        {busy ? <Loader2 className="animate-spin" aria-hidden /> : <Mail aria-hidden />}
        Recevoir mon lien
      </button>
    </form>
  );
}
