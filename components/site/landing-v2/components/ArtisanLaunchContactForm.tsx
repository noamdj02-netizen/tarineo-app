"use client";

import { useId, useState } from "react";

import type { ArtisanContactFields } from "@/lib/site/artisan-contact-validation";
import { validateArtisanContact } from "@/lib/site/artisan-contact-validation";
import { LAUNCH_CONTACT_FORM_ID } from "@/lib/site/launch-offer";
import { cn } from "@/lib/utils";

const fieldClassDefault =
  "h-11 w-full rounded-xl border border-black/[0.06] bg-paper-0 px-3.5 text-[15px] text-ink-900 shadow-[0_1px_0_rgba(0,0,0,0.03)] outline-none transition-[border-color,box-shadow] placeholder:text-ink-300 focus-visible:border-accent/35 focus-visible:ring-2 focus-visible:ring-accent/25";

const fieldClassFigma =
  "h-11 w-full rounded-md border border-black/[0.1] bg-white px-3.5 text-[15px] text-[#111827] shadow-[0_1px_0_rgba(0,0,0,0.04)] outline-none transition-[border-color,box-shadow] placeholder:text-[#6b7280] focus-visible:border-[#fd7327]/45 focus-visible:ring-2 focus-visible:ring-[#fd7327]/25";

type FormState = ArtisanContactFields;

const emptyForm: FormState = {
  prenom: "",
  metier: "",
  telephone: "",
  email: "",
};

export function ArtisanLaunchContactForm({
  className,
  embedded = false,
  variant = "default",
}: {
  className?: string;
  /** Dans le panneau contact Figma — pas de carte interne ni titre lancement. */
  embedded?: boolean;
  variant?: "default" | "figma";
}) {
  const fieldClass = variant === "figma" ? fieldClassFigma : fieldClassDefault;
  const labelClass =
    variant === "figma" ? "text-sm font-medium text-[#111827]" : "text-sm font-medium text-ink-700";
  const requiredMarkClass = variant === "figma" ? "text-[#fd7327]" : "text-accent";
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

  const shellClass = embedded
    ? "w-full"
    : "mx-auto w-full max-w-lg rounded-[24px] border border-black/[0.06] bg-paper-0 p-6 shadow-[0_2px_8px_rgba(97,44,0,0.06)] sm:p-8";

  return (
    <section
      id={embedded ? undefined : LAUNCH_CONTACT_FORM_ID}
      className={cn("scroll-mt-24 w-full", className)}
      aria-labelledby={`${formId}-title`}
    >
      <div className={shellClass}>
        {!embedded ? (
          <>
            <h3
              id={`${formId}-title`}
              className="text-center text-xl font-semibold tracking-tight text-ink-900"
            >
              Être rappelé
            </h3>
            <p className="mt-2 text-center text-sm leading-relaxed text-ink-500">
              Laissez vos coordonnées : nous vous rappelons sous 24&nbsp;h.
            </p>
          </>
        ) : variant === "figma" ? (
          <div className="mb-2">
            <h3 id={`${formId}-title`} className="text-lg font-semibold text-[#111827]">
              Votre demande
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-[#4d4d4d]">
              Prénom, métier, téléphone et e-mail — réponse sous 24&nbsp;h ouvrées.
            </p>
          </div>
        ) : (
          <h3 id={`${formId}-title`} className="sr-only">
            Formulaire de contact
          </h3>
        )}

        {success ? (
          <p
            className="mt-6 rounded-xl border border-success/20 bg-success-soft px-4 py-3 text-center text-sm font-medium text-success"
            role="status"
          >
            Merci ! On vous appelle sous 24&nbsp;h.
          </p>
        ) : (
          <form
            className={cn(
              "flex flex-col gap-4",
              embedded ? "mt-0" : "mt-6",
              variant === "figma" && "gap-5 sm:max-w-[485px]",
            )}
            onSubmit={onSubmit}
            noValidate
          >
            <input
              id={`${formId}-website`}
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              className="pointer-events-none absolute size-0 opacity-0"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${formId}-prenom`} className={labelClass}>
                Prénom <span className={requiredMarkClass}>*</span>
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
              <label htmlFor={`${formId}-email`} className={labelClass}>
                E-mail <span className={requiredMarkClass}>*</span>
              </label>
              <input
                id={`${formId}-email`}
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="vous@exemple.fr"
                className={fieldClass}
                value={form.email}
                disabled={pending}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${formId}-metier`} className={labelClass}>
                Métier <span className={requiredMarkClass}>*</span>
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
              <label htmlFor={`${formId}-telephone`} className={labelClass}>
                Téléphone <span className={requiredMarkClass}>*</span>
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

            {(fieldError ?? submitError) ? (
              <p
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium",
                  variant === "figma"
                    ? "border border-red-200 bg-red-50 text-red-800"
                    : "text-red-600",
                )}
                role="alert"
              >
                {fieldError ?? submitError}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={pending}
              className={cn(
                "inline-flex min-h-11 items-center justify-center px-6 text-base font-semibold text-white outline-none transition-opacity disabled:opacity-70",
                variant === "figma"
                  ? "w-full rounded-[31px] bg-[#fd7327] shadow-[0_4px_2px_rgba(0,0,0,0.15),inset_0_4px_4px_rgba(0,0,0,0.15)] focus-visible:ring-2 focus-visible:ring-[#fd7327]/45 sm:w-auto sm:min-w-[220px]"
                  : "w-full rounded-md bg-ink-900 text-[0.9375rem] font-medium text-paper-0 shadow-sm focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-paper-100",
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
