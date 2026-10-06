"use client";

import { useCallback, useState } from "react";

import { quoteSteps } from "@/lib/site/landing-v2-content";
import { LANDING_QUOTE_DEMO } from "@/lib/site/landing-quote-transform-demo";
import { Badge } from "@/components/site/landing-v2/components/ui/Badge";
import { DocumentTransformScene } from "@/components/site/landing-v2/components/ui/scenes/DocumentTransformScene";
import { LandingQuoteTransformPanel } from "@/components/site/landing-v2/components/ui/LandingQuoteTransformPanel";
import { SectionHeading } from "@/components/site/landing-v2/components/ui/SectionLabel";
import { useLandingQuoteDemoQuota } from "@/components/site/landing-v2/hooks/useLandingQuoteDemoQuota";
import { LandingFloatCard, LandingReveal } from "@/components/site/landing-v2/lib/landing-motion";

export function QuoteToInvoice() {
  const { used: demoUsed, markUsed: onDemoConsumed } = useLandingQuoteDemoQuota();
  const [marginPct, setMarginPct] = useState<number>(LANDING_QUOTE_DEMO.defaultMarginPct);
  const [pulseKey, setPulseKey] = useState(0);
  const [transforming, setTransforming] = useState(false);
  const [readyToDownload, setReadyToDownload] = useState(false);
  const [fileLabel, setFileLabel] = useState<string | null>(null);
  const [extracted, setExtracted] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [sourceRef, setSourceRef] = useState<string | null>(null);

  const onTransform = useCallback(() => {
    setTransforming(true);
    setPulseKey((k) => k + 1);
    setReadyToDownload(true);
    window.setTimeout(() => setTransforming(false), 900);
  }, []);

  return (
    <section
      id="devis-facture"
      className="relative scroll-mt-24 border-y border-line bg-paper-0 py-20 sm:scroll-mt-28 sm:py-28"
      aria-labelledby="devis-facture-title"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/22 to-transparent"
      />
      <div className="shell relative">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="accent">Essai interactif · 1 PDF client gratuit</Badge>
          <span className="text-xs font-medium text-ink-400">Sans compte · extraction simulée locale</span>
        </div>

        <div className="mt-5">
          <SectionHeading
            label="Du document au document"
            title="Du devis fournisseur au devis client, sans ressaisie."
            subtitle="Déposez un PDF (ou téléchargez notre exemple fournisseur), voyez les lignes extraites, appliquez votre marge et récupérez un devis client PDF A4 — une transformation gratuite par appareil."
            id="devis-facture-title"
          />
        </div>

        <LandingFloatCard
          className="mt-12 overflow-hidden border border-line bg-paper-100/80 p-4 shadow-card sm:mt-14 sm:p-6 lg:p-8"
          delay={0.05}
        >
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10">
            <div className="flex min-w-0 flex-col gap-4">
              <LandingReveal>
                <ol className="flex flex-wrap items-center gap-x-2.5 gap-y-2 text-sm text-ink-400">
                  {quoteSteps.map((step, index) => (
                    <li key={step.label} className="flex items-center gap-2.5">
                      {index > 0 ? (
                        <span aria-hidden="true" className="text-accent">→</span>
                      ) : null}
                      <span className={index === 3 ? "font-medium text-ink-900" : undefined}>
                        {step.label}
                      </span>
                    </li>
                  ))}
                </ol>
              </LandingReveal>

              <LandingFloatCard className="p-4 sm:p-5" delay={0.08}>
                <DocumentTransformScene
                  marginPct={marginPct}
                  pulseKey={pulseKey}
                  transforming={transforming}
                  supplierSubtitle={sourceRef ?? undefined}
                  extracting={extracting}
                  extracted={extracted}
                />
              </LandingFloatCard>
            </div>

            <LandingQuoteTransformPanel
              marginPct={marginPct}
              onMarginChange={setMarginPct}
              onTransform={onTransform}
              fileLabel={fileLabel}
              onFileSelect={setFileLabel}
              readyToDownload={readyToDownload}
              extracted={extracted}
              onExtractedChange={setExtracted}
              sourceRef={sourceRef}
              onSourceRefChange={setSourceRef}
              demoUsed={demoUsed}
              onDemoConsumed={onDemoConsumed}
              onExtractingChange={setExtracting}
            />
          </div>
        </LandingFloatCard>
      </div>
    </section>
  );
}
