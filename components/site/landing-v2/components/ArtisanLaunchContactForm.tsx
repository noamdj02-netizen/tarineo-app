"use client";

import { useId, useState } from "react";

import type { ArtisanContactFields } from "@/lib/site/artisan-contact-validation";
import { validateArtisanContact } from "@/lib/site/artisan-contact-validation";
import { LAUNCH_CONTACT_FORM_ID } from "@/lib/site/launch-offer";
import { cn } from "@/lib/utils";

const fieldClass =
  "h-11 w-full rounded-xl border border-black/[0.06] bg-paper-0 px-3.5 text-[15px] text-ink-900 shadow-[0_1px_0_rgba(0,0,0,0.03)] outline-none transition-[border-color,box-shadow] placeholder:text-ink-300 focus-visible:border-accent/35 focus-visible:ring-2 focus-visible:ring-accent/25";

type FormState = ArtisanContactFields;

const emptyForm: FormState = {
  prenom: "",
  metier: "",
  telephone: "",
  email: "",
};

export function ArtisanLaunchContactForm({ className }: { className?: string }) {
  const formId = useId();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldError(null);
    setSubmitError(null);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (success || pending) return;

    const validated = validateArtisanContact(form);
    if (!validated.ok) {
      setFieldError(validated.message);
      return;
    }

    setPending(true);
    setSubmitError(null);
    setFieldError(null);

    try {
      const res = await fetch("/api/demandes-artisans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...validated.data, website: honeypot }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };

      if (!res.ok || !data.ok) {
        setSubmitError(
          data.message ?? "Une erreur est survenue. Vos informations sont conservées, réessayez.",
        );
        return;
      }

      setSuccess(true);
    } catch {
      setSubmitError("Connexion impossible. Vérifiez votre réseau et réessayez.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section
      id={LAUNCH_CONTACT_FORM_ID}
      className={cn("scroll-mt-24 w-full", className)}
      aria-labelledby={`${formId}-title`}
    >
      <div className="mx-auto w-full max-w-lg rounded-[24px] border border-black/[0.06] bg-paper-0 p-6 shadow-[0_2px_8px_rgba(97,44,0,0.06)] sm:p-8">
        <h3
          id={`${formId}-title`}
          className="text-center text-xl font-semibold tracking-tight text-ink-900"
        >
          Rejoindre l&apos;offre de lancement
        </h3>
        <p className="mt-2 text-center text-sm leading-relaxed text-ink-500">
          Laissez vos coordonnées : nous vous rappelons sous 24&nbsp;h.
        </p>

        {success ? (
          <p
            className="mt-6 rounded-xl border border-success/20 bg-success-soft px-4 py-3 text-center text-sm font-medium text-success"
            role="status"
          >
            Merci ! On vous appelle sous 24&nbsp;h.
          </p>
        ) : (
          <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit} noValidate>
            <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden>
              <label htmlFor={`${formId}-website`}>Site web</label>
              <input
                id={`${formId}-website`}
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${formId}-prenom`} className="text-sm font-medium text-ink-700">
                Prénom <span className="text-accent">*</span>
              </label>
              <input
                id={`${formId}-prenom`}
                name="prenom"
                type="text"
                required
                autoComplete="given-name"
                className={fieldClass}
                value={form.prenom}
                disabled={pending}
                onChange={(e) => update("prenom", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${formId}-metier`} className="text-sm font-medium text-ink-700">
                Métier <span className="text-accent">*</span>
              </label>
              <input
                id={`${formId}-metier`}
                name="metier"
                type="text"
                required
                autoComplete="organization-title"
                placeholder="Ex. plombier, électricien, maçon…"
                className={fieldClass}
                value={form.metier}
                disabled={pending}
                onChange={(e) => update("metier", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${formId}-telephone`} className="text-sm font-medium text-ink-700">
                Téléphone <span className="text-accent">*</span>
              </label>
              <input
                id={`${formId}-telephone`}
                name="telephone"
                type="tel"
                required
                autoComplete="tel"
                inputMode="tel"
                placeholder="06 12 34 56 78"
                className={fieldClass}
                value={form.telephone}
                disabled={pending}
                onChange={(e) => update("telephone", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${formId}-email`} className="text-sm font-medium text-ink-700">
                E-mail <span className="text-accent">*</span>
              </label>
              <input
                id={`${formId}-email`}
                name="email"
                type="email"
                required
                autoComplete="email"
                className={fieldClass}
                value={form.email}
                disabled={pending}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>

            {(fieldError ?? submitError) ? (
              <p className="text-sm font-medium text-red-600" role="alert">
                {fieldError ?? submitError}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={pending}
              className={cn(
                "inline-flex min-h-11 w-full items-center justify-center rounded-md bg-ink-900 px-6 text-[0.9375rem] font-medium text-paper-0 shadow-sm outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-paper-100 disabled:opacity-70",
              )}
            >
              {pending ? "Envoi en cours…" : "Envoyer ma demande"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
