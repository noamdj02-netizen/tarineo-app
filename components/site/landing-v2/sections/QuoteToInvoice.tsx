"use client";

import { useState } from "react";

import {
  formatEuroHt,
  LANDING_QUOTE_DEMO,
  sumLines,
  type LandingDemoLine,
} from "@/lib/site/landing-quote-transform-demo";
import { Badge } from "@/components/site/landing-v2/components/ui/Badge";
import { DocumentTransformScene } from "@/components/site/landing-v2/components/ui/scenes/DocumentTransformScene";
import { LandingQuoteDemoSteps } from "@/components/site/landing-v2/components/ui/LandingQuoteDemoSteps";
import { LandingQuoteTransformPanel } from "@/components/site/landing-v2/components/ui/LandingQuoteTransformPanel";
import { SectionHeading } from "@/components/site/landing-v2/components/ui/SectionLabel";
import { useLandingQuoteDemoQuota } from "@/components/site/landing-v2/hooks/useLandingQuoteDemoQuota";
import { LandingFloatCard, LandingReveal } from "@/components/site/landing-v2/lib/landing-motion";

export function QuoteToInvoice() {
  const { used: demoUsed, markUsed: onDemoConsumed } = useLandingQuoteDemoQuota();
  const [marginPct, setMarginPct] = useState<number>(LANDING_QUOTE_DEMO.defaultMarginPct);
  const [fileLabel, setFileLabel] = useState<string | null>(null);
  const [extracted, setExtracted] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [sourceRef, setSourceRef] = useState<string | null>(null);
  const [previewLines, setPreviewLines] = useState<LandingDemoLine[] | null>(null);

  const displayLines = previewLines ?? LANDING_QUOTE_DEMO.lines;
  const supplierHt = sumLines(displayLines, marginPct, "supplier");
  const clientHt = sumLines(displayLines, marginPct, "client");

  return (
    <section
      id="devis-facture"
      className="relative scroll-mt-24 border-b border-line bg-paper-0 pt-8 pb-16 sm:scroll-mt-28 sm:pt-10 sm:pb-20 lg:pt-12"
      aria-labelledby="devis-facture-title"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/22 to-transparent"
      />
      <div className="shell relative">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="accent">Générateur de devis PDF · Essai gratuit</Badge>
          <span className="text-xs font-medium text-ink-400">Sans compte · extraction IA · PDF A4</span>
        </div>

        <div className="mt-5">
          <SectionHeading
            label="Outil d'essai"
            title="Transformez un devis fournisseur en devis client."
            subtitle="Déposez votre document. TARINEO extrait les lignes, applique votre marge et génère votre PDF client automatiquement — idéal pour les artisans qui veulent un logiciel de devis simple et rapide."
            id="devis-facture-title"
          />
        </div>

        <LandingReveal className="mt-10">
          <div className="grid gap-4 rounded-lg border border-line bg-paper-100/80 p-5 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center sm:gap-3">
            <div className="text-center sm:text-left">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Avant</p>
              <p className="mt-1 text-sm font-semibold text-ink-900">Devis fournisseur</p>
              <p className="nums text-lg font-semibold text-ink-900">{formatEuroHt(supplierHt)} HT</p>
            </div>
            <span className="hidden text-accent sm:inline" aria-hidden>↓</span>
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-accent-700">TARINEO</p>
              <p className="mt-1 text-sm text-ink-600">Analyse + marge</p>
              <p className="nums text-sm font-medium text-ink-900">+{marginPct} %</p>
            </div>
            <span className="hidden text-accent sm:inline" aria-hidden>↓</span>
            <div className="text-center sm:text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Après</p>
              <p className="mt-1 text-sm font-semibold text-ink-900">Devis client</p>
              <p className="nums text-lg font-semibold text-ink-900">{formatEuroHt(clientHt)} HT</p>
            </div>
          </div>
        </LandingReveal>

        <LandingFloatCard
          className="mt-12 overflow-visible border border-line bg-paper-100/80 p-4 shadow-card sm:mt-14 sm:p-6 lg:p-8"
          delay={0.05}
        >
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10">
            <div className="flex min-w-0 flex-col gap-4 overflow-visible pt-2 lg:sticky lg:top-28 lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto lg:overflow-x-visible lg:pr-1 lg:pt-3">
              <LandingReveal>
                <LandingQuoteDemoSteps
                  activeIndex={extracting ? 1 : extracted ? 3 : 0}
                  marginPct={marginPct}
                  supplierHt={supplierHt}
                  clientHt={clientHt}
                  sourceRef={sourceRef}
                  extracted={extracted}
                  extracting={extracting}
                />
              </LandingReveal>

              <LandingReveal>
                <div className="rounded-lg border border-line bg-paper-0 p-3 shadow-sm sm:p-4">
                  <DocumentTransformScene
                    compact
                    marginPct={marginPct}
                    pulseKey={extracted ? 1 : 0}
                    transforming={extracting}
                    supplierSubtitle={sourceRef ?? undefined}
                    extracting={extracting}
                    extracted={extracted}
                    previewLines={previewLines ?? undefined}
                  />
                </div>
              </LandingReveal>
            </div>

            <LandingQuoteTransformPanel
              marginPct={marginPct}
              onMarginChange={setMarginPct}
              fileLabel={fileLabel}
              onFileSelect={setFileLabel}
              extracted={extracted}
              onExtractedChange={setExtracted}
              sourceRef={sourceRef}
              onSourceRefChange={setSourceRef}
              demoUsed={demoUsed}
              onDemoConsumed={onDemoConsumed}
              onExtractingChange={setExtracting}
              onPreviewLinesChange={(lines) => {
                setPreviewLines(lines);
              }}
            />
          </div>
        </LandingFloatCard>

        <LandingReveal className="mt-16 max-w-3xl">
          <h3 className="text-heading font-semibold text-ink-900">
            Comment TARINEO transforme votre devis fournisseur
          </h3>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-ink-600">
            <li>Analyse du document (PDF ou photo) et repérage des lignes utiles.</li>
            <li>Calcul du prix de vente avec votre marge — comme dans l&apos;app métier.</li>
            <li>Génération d&apos;un devis client PDF prêt à envoyer (facture ou bon de commande sur demande).</li>
          </ol>
          <p className="mt-4 text-sm text-ink-500">
            Essai gratuit : une transformation par appareil, sans inscription. Créez un compte pour
            automatiser vos devis, factures et relances sur vos vrais chantiers.
          </p>
        </LandingReveal>
      </div>
    </section>
  );
}
