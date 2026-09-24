"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { Illustration } from "@/components/illustration";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import type { IllustrationName } from "@/lib/illustrations";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function AuthCard({
  art,
  label,
  title,
  text,
  children,
  footer,
}: {
  art: IllustrationName;
  label: string;
  title: string;
  text?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <RevealGroup className="flex flex-col gap-4">
      <Reveal className="rounded-[28px] border border-line bg-surface p-6 shadow-lift sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <p className="mono-label">{`/ ${label} ///`}</p>
            <h1 className="font-display text-[30px] leading-[1.05] font-semibold tracking-tightest">
              {title}
            </h1>
            {text ? <p className="text-[14.5px] leading-relaxed text-muted">{text}</p> : null}
          </div>
          <Illustration name={art} className="-mt-2 -mr-2 size-16 flex-none" />
        </div>
        {children}
      </Reveal>
      {footer ? (
        <Reveal className="text-center text-[14px] text-muted">{footer}</Reveal>
      ) : null}
    </RevealGroup>
  );
}

const inputCls =
  "min-h-12 w-full rounded-[14px] border border-line bg-surface-2 px-4 text-[15px] outline-none transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-muted focus:border-ink/25 focus:bg-surface focus:shadow-[0_0_0_4px_rgba(17,17,17,0.06)]";

export function Field({
  label,
  hint,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-[13.5px] font-medium">
      {label}
      <input {...props} className={cn(inputCls, props.className)} />
      {hint ? <span className="text-[12.5px] font-normal text-muted">{hint}</span> : null}
    </label>
  );
}

export function PasswordField({
  label = "Mot de passe",
  hint,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string }) {
  const [show, setShow] = useState(false);
  return (
    <label className="flex flex-col gap-1.5 text-[13.5px] font-medium">
      {label}
      <span className="relative">
        <input {...props} type={show ? "text" : "password"} className={cn(inputCls, "pr-12")} />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          className="absolute top-1/2 right-1.5 grid size-9 -translate-y-1/2 place-items-center rounded-pill text-muted hover:bg-accent-soft hover:text-ink"
        >
          {show ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
        </button>
      </span>
      {hint ? <span className="text-[12.5px] font-normal text-muted">{hint}</span> : null}
    </label>
  );
}

export function SubmitButton({ busy, children }: { busy: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="btn-dark inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill px-5 text-[15px] font-medium disabled:translate-y-0 disabled:opacity-60"
    >
      {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}

export function FormMessage({ tone = "error", children }: { tone?: "error" | "ok"; children: React.ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-[12px] px-3.5 py-2.5 text-[13.5px] leading-snug",
        tone === "error" ? "bg-st-fini-soft text-st-fini-ink" : "bg-st-focus-soft text-st-focus-ink",
      )}
    >
      {children}
    </p>
  );
}

export function Divider() {
  return (
    <div className="my-1 flex items-center gap-3 font-mono text-[10.5px] tracking-[0.12em] text-muted uppercase">
      <span className="h-px flex-1 bg-line" />
      ou
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

/** Bouton Google : redirige vers Google puis revient par /auth/callback. */
export function GoogleButton({ next }: { next: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  async function go() {
    setBusy(true);
    setError(false);
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      setBusy(false);
      setError(true);
    }
  }
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={go}
        disabled={busy}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-pill border border-line bg-surface px-5 text-[15px] font-medium shadow-soft transition-transform duration-300 ease-out-soft hover:-translate-y-0.5 disabled:opacity-60"
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7Z" />
            <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z" />
            <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
            <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9Z" />
          </svg>
        )}
        Continuer avec Google
      </button>
      {error ? <FormMessage>Google n’est pas encore activé. Utilise ton email.</FormMessage> : null}
    </div>
  );
}
