"use client";

import { useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import { InView } from "@/components/site/in-view";
import { HoneypotField } from "@/components/site/honeypot-field";
import { LandingButton } from "@/components/site/landing-button";
import { LandingSection, LandingSectionHead } from "@/components/site/landing-section";
import { BRAND } from "@/lib/brand";
import { CONTACT, CTA_TRIAL, FINAL_CTA, OFFER } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

/** Contact 2 colonnes Figma + CTA essai. Envoi via mailto. */
export function LandingClosingCta({ className }: { className?: string }) {
  const [bot, setBot] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [trade, setTrade] = useState(CONTACT.trades[0]);
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (bot) return;
    const body = [
      `Nom : ${name}`,
      `Email : ${email}`,
      `Métier : ${trade}`,
      `Entreprise : ${company}`,
      "",
      message,
    ].join("\n");
    window.location.href = `mailto:${BRAND.contactEmail}?subject=${encodeURIComponent("Contact Tarinéo")}&body=${encodeURIComponent(body)}`;
  }

  return (
    <LandingSection id="contact" className={className}>
      <LandingSectionHead label={CONTACT.badge} title={CONTACT.title} text={CONTACT.text} />
      <InView className="mx-auto grid max-w-[1180px] overflow-hidden rounded-[32px] border border-line shadow-lift lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <Reveal className="flex flex-col justify-between gap-8 bg-brand-orange p-7 text-white sm:p-10">
          <div className="flex flex-col gap-4">
            <h3 className="font-display text-[clamp(26px,3.2vw,36px)] leading-tight font-semibold text-balance">
              {CONTACT.panelTitle}
            </h3>
            <p className="text-[16px] leading-relaxed text-white/90">{CONTACT.text}</p>
            <a href={`mailto:${BRAND.contactEmail}`} className="text-[15px] font-medium underline underline-offset-4">
              {BRAND.contactEmail}
            </a>
          </div>
          <div className="flex flex-col gap-3">
            <LandingButton href={FINAL_CTA.href} variant="pillWhite" className="w-fit">
              {CTA_TRIAL.long}
            </LandingButton>
            <p className="text-[13px] text-white/80">{OFFER}.</p>
          </div>
        </Reveal>

        <Reveal>
          <form onSubmit={onSubmit} className="flex flex-col gap-4 bg-white p-7 sm:p-10">
            <HoneypotField value={bot} onChange={setBot} />
            <Field label={CONTACT.fields.name}>
              <input
                required
                name="name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label={CONTACT.fields.email}>
              <input
                required
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label={CONTACT.fields.trade}>
              <select
                name="trade"
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
                className={fieldClass}
              >
                {CONTACT.trades.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label={CONTACT.fields.company}>
              <input
                name="company"
                autoComplete="organization"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label={CONTACT.fields.message}>
              <textarea
                required
                name="message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={cn(fieldClass, "min-h-28 resize-y")}
              />
            </Field>
            <button
              type="submit"
              className="btn-orange mt-2 min-h-12 w-full rounded-pill px-6 text-[15px] font-semibold"
            >
              {CONTACT.submit}
            </button>
          </form>
        </Reveal>
      </InView>
    </LandingSection>
  );
}

const fieldClass =
  "min-h-11 w-full rounded-xl border border-line bg-bg px-3 text-[15px] text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/40";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px] font-medium text-ink">
      {label}
      {children}
    </label>
  );
}
