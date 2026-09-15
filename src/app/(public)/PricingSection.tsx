"use client";

import { useState } from "react";
import Link from "next/link";
import { RevealOnScroll } from "./RevealOnScroll";
import { ContactEntrepriseModal } from "./ContactEntrepriseModal";

type Periode = "mensuel" | "annuel";

interface PlanFeature {
  label: string;
  bientotDisponible?: boolean;
}

interface Plan {
  nom: string;
  prixMensuel: number;
  prixAnnuel: number;
  desc: string;
  features: PlanFeature[];
  misEnAvant: boolean;
}

// Prix annuels réglés en une fois, ~20% sous le cumul des 12 mois au tarif mensuel —
// quotas et fonctionnalités identiques entre les deux fréquences pour un même plan.
const PLANS: Plan[] = [
  {
    nom: "Starter",
    prixMensuel: 17,
    prixAnnuel: 163,
    desc: "Pour débuter et tester",
    features: [
      { label: "150 documents analysés / mois" },
      { label: "Historique 12 mois" },
      { label: "3 distributeurs comparés" },
      { label: "Alertes hausse de prix" },
    ],
    misEnAvant: false,
  },
  {
    nom: "Pro",
    prixMensuel: 29,
    prixAnnuel: 278,
    desc: "Pour les artisans actifs",
    features: [
      { label: "400 documents analysés / mois" },
      { label: "Historique complet sans limite" },
      { label: "Tous les distributeurs" },
      { label: "Alertes hausse sur votre historique" },
      { label: "Devis client avec votre logo et SIRET" },
      { label: "Calculateur de marge chantier", bientotDisponible: true },
      { label: "Export comptable" },
    ],
    misEnAvant: true,
  },
  {
    nom: "Équipe",
    prixMensuel: 49,
    prixAnnuel: 470,
    desc: "Pour les entreprises artisanales",
    features: [
      { label: "1 000 documents analysés / mois" },
      { label: "Tout le plan Pro" },
      { label: "Tableau de bord dirigeant", bientotDisponible: true },
      { label: "Support prioritaire" },
    ],
    misEnAvant: false,
  },
];

function formatMensualise(prixAnnuel: number): string {
  return (prixAnnuel / 12).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function PricingSection({ cta, ctaLabel }: { cta: string; ctaLabel: string }) {
  const [periode, setPeriode] = useState<Periode>("mensuel");
  const annuel = periode === "annuel";
  const [contactOuvert, setContactOuvert] = useState(false);

  // Style partagé par les 3 boutons de la pilule — Mensuel/Annuel changent `periode`
  // (donc s'affichent actifs quand sélectionnés), "Entreprise" est un raccourci vers la
  // modale de contact plutôt qu'une 3ème option de tarification : il ne mémorise aucun
  // état sélectionné, mais garde exactement le même style/gabarit que les deux autres.
  const boutonPilleClasse = (actif: boolean) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
      actif ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground"
    }`;

  return (
    <>
      <div className="mt-8 flex justify-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1">
          <button
            type="button"
            onClick={() => setPeriode("mensuel")}
            aria-pressed={!annuel}
            className={boutonPilleClasse(!annuel)}
          >
            Mensuel
          </button>
          <button
            type="button"
            onClick={() => setPeriode("annuel")}
            aria-pressed={annuel}
            className={`flex items-center gap-1.5 ${boutonPilleClasse(annuel)}`}
          >
            Annuel
            <span
              className={`rounded-full px-1.5 py-0.5 text-[0.65rem] font-bold ${
                annuel ? "bg-accent-foreground/20 text-accent-foreground" : "bg-green-500/15 text-green-400"
              }`}
            >
              -20%
            </span>
          </button>
          <button
            type="button"
            onClick={() => setContactOuvert(true)}
            aria-haspopup="dialog"
            className={boutonPilleClasse(false)}
          >
            Entreprise
          </button>
        </div>
      </div>

      <ContactEntrepriseModal ouvert={contactOuvert} onFermer={() => setContactOuvert(false)} />

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {PLANS.map((p) => (
          <RevealOnScroll
            key={p.nom}
            variant="vertical"
            delay={p.misEnAvant ? 150 : 0}
            className={`relative rounded-2xl border p-8 text-center ${
              p.misEnAvant ? "border-accent bg-gradient-to-b from-accent/[0.06] to-background" : "border-border bg-background"
            }`}
          >
            {p.misEnAvant && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-accent px-4 py-1 text-xs font-bold text-accent-foreground">
                ⭐ Le plus populaire
              </span>
            )}
            <p className="mb-4 text-sm font-bold uppercase tracking-wider text-muted">{p.nom}</p>
            <span className="mb-3 inline-block rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wide text-accent">
              {annuel ? `1 mois offert, puis ${p.prixAnnuel}€/an` : "1er mois offert"}
            </span>
            <p className="font-extrabold text-white">
              <span className="align-top text-2xl">€</span>
              <span className="text-5xl">{annuel ? formatMensualise(p.prixAnnuel) : p.prixMensuel}</span>
              <span className="text-base font-normal text-muted">/mois</span>
            </p>
            {annuel && <p className="mt-1 text-xs text-muted">Facturé {p.prixAnnuel}€/an</p>}
            <p className="my-3 text-sm text-muted">{p.desc}</p>
            <ul className="mb-7 space-y-0.5 text-left">
              {p.features.map((feat) => (
                <li
                  key={feat.label}
                  className="flex items-start gap-2.5 border-b border-border/60 py-1.5 text-sm text-foreground"
                >
                  <span className="shrink-0 font-bold text-green-400">✓</span>
                  <span className="flex flex-wrap items-center gap-1.5">
                    {feat.label}
                    {feat.bientotDisponible && (
                      <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-muted">
                        Bientôt disponible
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href={cta}
              className={`block w-full rounded-full py-3 text-sm font-bold transition-opacity active:scale-[0.98] ${
                p.misEnAvant
                  ? "bg-accent text-accent-foreground hover:opacity-90"
                  : "border border-border text-foreground hover:border-accent hover:text-accent"
              }`}
            >
              {ctaLabel}
            </Link>
          </RevealOnScroll>
        ))}
      </div>
    </>
  );
}
