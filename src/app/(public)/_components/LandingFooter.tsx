"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { NAV_LANDING_FOOTER_PRODUIT, NAV_LANDING_FOOTER_RAPIDES } from "@/lib/landingNavigation";
import { LandingLogo } from "./LandingLogo";

type LegalModal = "legal" | "privacy" | null;

const LIENS_ENTREPRISE: Array<{ label: string; href?: string; modal?: LegalModal }> = [
  { href: "/a-propos", label: "À propos" },
  { href: "/legal/confidentialite", label: "Politique de confidentialité" },
  { href: "mailto:contact@tarineo.com", label: "Support" },
  { href: "/legal/cgu", label: "Conditions d'utilisation" },
];

export function LandingFooter() {
  const [legalModal, setLegalModal] = useState<LegalModal>(null);

  return (
    <footer className="bg-white">
      <div className="landing-container pt-10 sm:pt-12">
        <div className="landing-gradient-bg relative overflow-hidden rounded-[40px] px-6 py-12 text-center sm:px-12 sm:py-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
              backgroundSize: "96px 96px",
            }}
            aria-hidden="true"
          />
          <div className="relative">
            <h2 className="landing-display mb-4 text-2xl font-bold text-white sm:text-[2rem]">
              Utilisez Tarineo depuis votre navigateur
            </h2>
            <p className="landing-body mx-auto mb-8 max-w-xl text-sm leading-normal text-white/90 sm:text-base">
              Importez vos devis depuis le chantier sur mobile — aucune installation requise. Application native
              bientôt disponible.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/inscription"
                className="rounded-xl bg-[var(--landing-accent)] px-6 py-2.5 text-sm font-semibold text-white shadow-[var(--landing-shadow-btn)]"
              >
                Créer un compte gratuit
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 bg-[var(--landing-footer-bg)] px-4 pb-8 pt-12 sm:px-6 sm:pt-16">
        <div className="landing-container">
          <div className="flex flex-col gap-12 border-b border-black/[0.08] pb-12 lg:flex-row lg:justify-between">
            <div className="max-w-[439px]">
              <LandingLogo className="mb-8" />
              <div className="mb-5">
                <p className="landing-display mb-3 text-base font-semibold text-[var(--landing-text)]">Abonnez-vous</p>
                <p className="landing-body text-base text-[var(--landing-muted)]">
                  Recevez nos actus produit directement par email.
                </p>
              </div>
              <form
                className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:rounded-full sm:bg-white sm:p-2"
                onSubmit={(e) => e.preventDefault()}
              >
                <label className="flex flex-1 items-center gap-3 rounded-full bg-white px-3.5 py-2 sm:bg-transparent">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--landing-chip)]">
                    <Image src="/landing/email.svg" alt="" width={24} height={24} className="h-6 w-6" />
                  </span>
                  <span className="sr-only">Votre email</span>
                  <input
                    type="email"
                    placeholder="Votre email"
                    className="landing-body min-w-0 flex-1 bg-transparent text-base text-[var(--landing-muted)] outline-none placeholder:text-[var(--landing-muted)]"
                  />
                </label>
                <button
                  type="submit"
                  className="landing-display rounded-full bg-[var(--landing-text)] px-8 py-3.5 text-base font-medium text-white shadow-[var(--landing-shadow-btn)]"
                >
                  S&apos;abonner
                </button>
              </form>
              <p className="landing-body text-xs text-[var(--landing-muted)]">
                En vous abonnant, vous acceptez notre politique de confidentialité.
              </p>
            </div>

            <div className="grid gap-10 sm:grid-cols-3 sm:gap-[130px]">
              <div>
                <p className="landing-display mb-5 text-base font-bold text-[var(--landing-text)]">Liens rapides</p>
                <ul className="landing-body space-y-5 text-base text-[var(--landing-muted)]">
                  {NAV_LANDING_FOOTER_RAPIDES.map((l) => (
                    <li key={l.id}>
                      <Link
                        href={l.hrefApp.startsWith("mailto:") ? l.hrefApp : l.hrefLanding}
                        className="transition-colors hover:text-[var(--landing-text)]"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="landing-display mb-5 text-base font-bold text-[var(--landing-text)]">Produit</p>
                <ul className="landing-body space-y-5 text-base text-[var(--landing-muted)]">
                  {NAV_LANDING_FOOTER_PRODUIT.map((l) => (
                    <li key={l.id}>
                      <Link href={l.hrefApp} className="transition-colors hover:text-[var(--landing-text)]">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="landing-display mb-5 text-base font-bold text-[var(--landing-text)]">Entreprise</p>
                <ul className="landing-body space-y-5 text-base text-[var(--landing-muted)]">
                  {LIENS_ENTREPRISE.map((l) => (
                    <li key={l.label}>
                      {l.modal ? (
                        <button
                          type="button"
                          onClick={() => setLegalModal(l.modal!)}
                          className="transition-colors hover:text-[var(--landing-text)]"
                        >
                          {l.label}
                        </button>
                      ) : l.href?.startsWith("mailto:") ? (
                        <a href={l.href} className="transition-colors hover:text-[var(--landing-text)]">
                          {l.label}
                        </a>
                      ) : (
                        <Link href={l.href!} className="transition-colors hover:text-[var(--landing-text)]">
                          {l.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="landing-body text-[15px] text-[var(--landing-muted)]">
              Copyright © 2026 Tarineo. Tous droits réservés
            </p>
            <a
              href="mailto:contact@tarineo.com"
              className="landing-body text-[15px] text-[var(--landing-muted)] transition-colors hover:text-[var(--landing-text)]"
            >
              contact@tarineo.com
            </a>
          </div>
        </div>
      </div>

      {legalModal && (
        <div
          className="fixed inset-0 z-[200] overflow-y-auto bg-black/70 px-6 py-16"
          onClick={(e) => {
            if (e.target === e.currentTarget) setLegalModal(null);
          }}
        >
          <div className="relative mx-auto max-w-xl rounded-2xl border border-[var(--landing-border)] bg-white p-8">
            <button
              type="button"
              onClick={() => setLegalModal(null)}
              aria-label="Fermer"
              className="absolute right-4 top-4 text-xl text-[var(--landing-muted)] hover:text-[var(--landing-text)]"
            >
              ✕
            </button>
            {legalModal === "legal" && (
              <div className="landing-body space-y-4 text-sm leading-relaxed text-[var(--landing-muted)]">
                <h3 className="landing-display text-xl font-bold text-[var(--landing-text)]">Conditions d&apos;utilisation</h3>
                <p>Consultez les mentions légales complètes via contact@tarineo.com.</p>
              </div>
            )}
            {legalModal === "privacy" && (
              <div className="landing-body space-y-4 text-sm leading-relaxed text-[var(--landing-muted)]">
                <h3 className="landing-display text-xl font-bold text-[var(--landing-text)]">Politique de confidentialité</h3>
                <p>
                  Vos données sont utilisées uniquement pour la gestion de votre compte Tarineo. Contact :
                  contact@tarineo.com
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </footer>
  );
}
