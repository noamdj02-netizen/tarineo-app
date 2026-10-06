"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { LANDING_SIGNUP } from "@/lib/site/landing-v2-auth";
import { emitEvent } from "@/lib/analytics/client";
import { landingExtractToDemoLines } from "@/lib/site/landing-quote-extract-map";
import type { LandingExtractPayload } from "@/lib/site/landing-quote-extract.types";
import {
  LANDING_DEMO_MAX_BYTES,
  LANDING_DEMO_MAX_SIZE_LABEL,
} from "@/lib/site/landing-demo-file";
import {
  downloadClientQuoteDemo,
  downloadSupplierQuoteDemo,
  formatEuroHt,
  LANDING_DEMO_OUTPUT_OPTIONS,
  LANDING_DEMO_SOURCE_OPTIONS,
  LANDING_EXAMPLE_SUPPLIER_FILE,
  LANDING_QUOTE_DEMO,
  sumExtractLines,
  uploadLandingDemoExtract,
  type LandingDemoLine,
} from "@/lib/site/landing-quote-transform-demo";
import { Button } from "@/components/site/landing-v2/components/ui/Button";
import { LandingPillButton } from "@/components/site/landing-v2/components/ui/LandingPillButton";
import { Badge } from "@/components/site/landing-v2/components/ui/Badge";
import { Icon } from "@/components/site/landing-v2/components/ui/Icon";
import { LandingAlert } from "@/components/site/landing-v2/components/ui/LandingAlert";
import { LandingUploadDropzone } from "@/components/site/landing-v2/components/ui/LandingUploadDropzone";
import { LANDING_EASE } from "@/components/site/landing-v2/lib/landing-motion";
import { motion, useReducedMotion } from "framer-motion";

type Props = {
  marginPct: number;
  onMarginChange: (value: number) => void;
  fileLabel: string | null;
  onFileSelect: (name: string | null) => void;
  extracted: boolean;
  onExtractedChange: (value: boolean) => void;
  sourceRef: string | null;
  onSourceRefChange: (value: string | null) => void;
  demoUsed: boolean;
  onDemoConsumed: () => void;
  onExtractingChange?: (value: boolean) => void;
  onPreviewLinesChange?: (lines: LandingDemoLine[] | null) => void;
};

type ExtractStep = "upload" | "reading" | "lines" | "margin" | "done";

const STEP_COPY: Record<ExtractStep, string> = {
  upload: "Import du document…",
  reading: "TARINEO analyse votre document…",
  lines: "Extraction des lignes et informations client…",
  margin: "Calcul de votre prix client…",
  done: "Analyse terminée — prêt pour le PDF.",
};

const DEFAULT_CLIENT = "";

export function LandingQuoteTransformPanel({
  marginPct,
  onMarginChange,
  fileLabel,
  onFileSelect,
  extracted,
  onExtractedChange,
  sourceRef,
  onSourceRefChange,
  demoUsed,
  onDemoConsumed,
  onExtractingChange,
  onPreviewLinesChange,
}: Props) {
  const reduce = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const [sourceTypeIndex, setSourceTypeIndex] = useState(0);
  const [outputIndex, setOutputIndex] = useState(0);
  const [clientName, setClientName] = useState(DEFAULT_CLIENT);
  const [clientAddress, setClientAddress] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractStep, setExtractStep] = useState<ExtractStep | null>(null);
  const [supplierPdfLoading, setSupplierPdfLoading] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);
  const [extraction, setExtraction] = useState<LandingExtractPayload | null>(null);
  const startedRef = useRef(false);
  const signupTrackedRef = useRef(false);

  const trackDemoSignupClick = useCallback((placement: "quota_banner" | "post_download") => {
    if (signupTrackedRef.current) return;
    signupTrackedRef.current = true;
    emitEvent("demo_signup_clicked", {
      path: "/",
      properties: { placement, section: "devis-facture" },
    });
  }, []);

  const outputKind = LANDING_DEMO_OUTPUT_OPTIONS[outputIndex]?.kind ?? "devis";
  const outputLabel = LANDING_DEMO_OUTPUT_OPTIONS[outputIndex]?.label ?? "Devis client";
  const supplierHt = extraction
    ? sumExtractLines(extraction.lines, marginPct, "supplier")
    : 0;
  const clientHt = extraction ? sumExtractLines(extraction.lines, marginPct, "client") : 0;

  useEffect(() => {
    if (!startedRef.current && !demoUsed) {
      startedRef.current = true;
      emitEvent("demo_started", { path: "/", properties: { section: "devis-facture" } });
    }
  }, [demoUsed]);

  const runExtraction = useCallback(
    async (file: File) => {
      setExtracting(true);
      onExtractingChange?.(true);
      onExtractedChange(false);
      setExtraction(null);
      onPreviewLinesChange?.(null);
      setError(null);
      setDownloadDone(false);
      const steps: ExtractStep[] = ["upload", "reading", "lines", "margin"];
      let stepIndex = 0;
      setExtractStep(steps[0]);
      setStatus(STEP_COPY[steps[0]]);
      const stepTimer = window.setInterval(() => {
        stepIndex = Math.min(stepIndex + 1, steps.length - 1);
        const step = steps[stepIndex];
        setExtractStep(step);
        setStatus(STEP_COPY[step]);
      }, 900);

      try {
        const result = await uploadLandingDemoExtract(file);
        window.clearInterval(stepTimer);
        if (!result.ok) {
          setError(result.message);
          return;
        }
        const payload = result.extraction;
        setExtraction(payload);
        onSourceRefChange(payload.sourceRef);
        onPreviewLinesChange?.(landingExtractToDemoLines(payload.lines));
        onExtractedChange(true);
        setExtractStep("done");
        setStatus(STEP_COPY.done);
        if (payload.customerName) setClientName(payload.customerName);
        if (payload.customerAddress) setClientAddress(payload.customerAddress);
        emitEvent("demo_document_analyzed", {
          path: "/",
          properties: {
            lines: payload.lines.length,
            sourceType: LANDING_DEMO_SOURCE_OPTIONS[sourceTypeIndex],
            quality: payload.quality,
          },
        });
        emitEvent("demo_margin_applied", { path: "/", properties: { marginPct } });
        if (payload.uncertain) {
          setStatus(
            "Certaines informations n’ont pas pu être détectées. Vérifiez les lignes et le client avant de générer le PDF.",
          );
        }
      } catch {
        window.clearInterval(stepTimer);
        setError("Une erreur est survenue pendant l’analyse. Votre essai n’a pas été consommé.");
      } finally {
        setExtracting(false);
        onExtractingChange?.(false);
        setExtractStep(null);
      }
    },
    [
      marginPct,
      onExtractedChange,
      onExtractingChange,
      onPreviewLinesChange,
      onSourceRefChange,
      sourceTypeIndex,
    ],
  );

  const handleFile = useCallback(
    (file: File | null) => {
      if (!file) {
        onFileSelect(null);
        onSourceRefChange(null);
        onExtractedChange(false);
        setExtraction(null);
        onPreviewLinesChange?.(null);
        return;
      }
      if (demoUsed && !downloadDone) {
        setStatus("Essai gratuit déjà utilisé. Créez un compte pour transformer vos vrais devis.");
        return;
      }
      if (file.size === 0) {
        setError("Le fichier est vide. Choisissez un PDF ou une image contenant votre devis.");
        return;
      }
      if (file.size > LANDING_DEMO_MAX_BYTES) {
        setError(`Fichier trop volumineux (max. ${LANDING_DEMO_MAX_SIZE_LABEL}).`);
        return;
      }
      emitEvent("demo_file_uploaded", {
        path: "/",
        properties: { size: file.size, type: file.type || "unknown" },
      });
      onFileSelect(file.name);
      void runExtraction(file);
    },
    [demoUsed, downloadDone, onExtractedChange, onFileSelect, onPreviewLinesChange, onSourceRefChange, runExtraction],
  );

  const loadExample = async () => {
    if (demoUsed && !downloadDone) {
      setStatus("Essai gratuit déjà utilisé. Passez à TARINEO pour continuer.");
      return;
    }
    setSupplierPdfLoading(true);
    try {
      const res = await fetch("/api/landing/devis-demo?kind=supplier", { credentials: "same-origin" });
      if (!res.ok) {
        setError("Impossible de charger l’exemple fournisseur.");
        return;
      }
      const blob = await res.blob();
      const file = new File([blob], LANDING_EXAMPLE_SUPPLIER_FILE, { type: "application/pdf" });
      onFileSelect(file.name);
      await runExtraction(file);
    } finally {
      setSupplierPdfLoading(false);
    }
  };

  const handleDownload = async () => {
    if (demoUsed || !extracted || !extraction?.lines.length) return;
    const name = clientName.trim();
    if (!name) {
      setError("Indiquez le nom du client pour personnaliser le document.");
      return;
    }
    setDownloading(true);
    setError(null);
    setStatus("Génération de votre devis client…");
    try {
      const result = await downloadClientQuoteDemo({
        marginPct,
        clientName: name,
        clientAddress: clientAddress.trim() || null,
        sourceRef: sourceRef ?? extraction.sourceRef,
        documentKind: outputKind,
        lines: extraction.lines,
        documentNumber: extraction.documentNumber,
        issueDate: extraction.issueDate,
      });
      if (result === "quota_exceeded") {
        onDemoConsumed();
        setStatus("Essai gratuit déjà utilisé sur cet appareil.");
        return;
      }
      if (result === "pdf_failed") {
        setError("Impossible de générer le PDF. Réessayez dans un instant.");
        return;
      }
      emitEvent("demo_pdf_generated", { path: "/", properties: { documentKind: outputKind } });
      emitEvent("demo_pdf_downloaded", { path: "/", properties: { documentKind: outputKind } });
      onDemoConsumed();
      setDownloadDone(true);
      setStatus(null);
    } finally {
      setDownloading(false);
    }
  };

  const handleSupplierPdf = async () => {
    setSupplierPdfLoading(true);
    try {
      const ok = await downloadSupplierQuoteDemo();
      setStatus(
        ok
          ? "PDF fournisseur exemple téléchargé — déposez-le pour tester."
          : "Téléchargement impossible pour le moment.",
      );
    } finally {
      setSupplierPdfLoading(false);
    }
  };

  const locked = demoUsed && !downloadDone;

  return (
    <div className="surface flex flex-col border border-line-strong p-6 shadow-card sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-heading font-semibold text-ink-900">
          Transformez un devis fournisseur en devis client
        </h3>
        <Badge tone="accent">1 transformation gratuite · Sans inscription</Badge>
      </div>
      <p className="mt-3 text-sm text-ink-600">
        Déposez votre document. TARINEO extrait les lignes, applique votre marge et génère votre PDF
        client automatiquement.
      </p>

      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-ink-400">
        1. Déposez → 2. TARINEO analyse → 3. Votre document est prêt
      </p>

      {locked ? (
        <LandingAlert
          variant="warning"
          className="mt-5"
          title="Essai gratuit utilisé"
          actions={
            <Button
              href={LANDING_SIGNUP}
              size="md"
              onClick={() => trackDemoSignupClick("quota_banner")}
            >
              Créer mon compte gratuitement
            </Button>
          }
        >
          Créez un compte TARINEO pour transformer vos vrais documents, sans limite.
        </LandingAlert>
      ) : null}

      {downloadDone ? (
        <LandingAlert variant="success" className="mt-6 !flex-col !items-stretch gap-4 px-5 py-5">
          <div>
            <h4 className="text-lg font-semibold text-ink-900">Votre document est prêt</h4>
            <p className="mt-2 text-sm text-ink-700">
              <span className="font-medium">{outputLabel}</span>
              {clientName.trim() ? ` — ${clientName.trim()}` : null}
            </p>
            <p className="mt-2 text-sm text-ink-600">
              Marge appliquée : <span className="font-medium nums">{marginPct} %</span> · Total client :{" "}
              <span className="font-medium nums">{formatEuroHt(clientHt)} HT</span>
            </p>
            <p className="mt-4 text-sm text-ink-600">
              Vous venez de transformer votre premier document en quelques secondes. Avec un compte TARINEO,
              conservez vos pièces, ajustez vos marges et suivez vos chantiers.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              href={LANDING_SIGNUP}
              size="md"
              onClick={() => trackDemoSignupClick("post_download")}
            >
              Créer mon compte gratuitement
            </Button>
            <Button href="#top" variant="secondary" size="md">
              Voir comment fonctionne TARINEO
            </Button>
          </div>
        </LandingAlert>
      ) : null}

      {!downloadDone ? (
        <>
          <p className="mt-6 text-sm font-medium text-ink-900">Que voulez-vous transformer ?</p>
          <div className="landing-filter mt-2">
            {LANDING_DEMO_SOURCE_OPTIONS.map((option, index) => (
              <LandingPillButton
                key={option}
                tone="compact"
                selected={index === sourceTypeIndex}
                disabled={locked || extracting}
                onClick={() => setSourceTypeIndex(index)}
              >
                {option}
              </LandingPillButton>
            ))}
          </div>

          <LandingUploadDropzone
            className="mt-5"
            disabled={locked || extracting}
            onClick={() => inputRef.current?.click()}
          >
            <motion.span
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-sm bg-paper-0 text-accent-700"
              initial={reduce ? false : { opacity: 0, scale: 0.9 }}
              whileInView={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.4, ease: LANDING_EASE, delay: 0.12 }}
            >
              <Icon name="doc" className="h-5 w-5" />
            </motion.span>
            <span className="text-sm font-medium text-ink-900">
              {fileLabel ?? "Déposez votre devis fournisseur ici"}
            </span>
            <span className="text-xs text-ink-400">
              PDF · image · max. {LANDING_DEMO_MAX_SIZE_LABEL} — analyse sur nos serveurs
            </span>
          </LandingUploadDropzone>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,image/*"
            className="sr-only"
            disabled={locked}
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />

          <div className="mt-3 flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
            <button
              type="button"
              disabled={locked || extracting}
              onClick={loadExample}
              className="text-left text-xs font-medium text-accent-700 underline-offset-2 hover:underline disabled:opacity-50"
            >
              Charger l&apos;exemple sans upload
            </button>
            <button
              type="button"
              disabled={supplierPdfLoading}
              onClick={() => void handleSupplierPdf()}
              className="text-left text-xs font-medium text-ink-600 underline-offset-2 hover:text-accent-700 hover:underline disabled:opacity-50"
            >
              {supplierPdfLoading ? "PDF…" : "Télécharger le PDF fournisseur exemple"}
            </button>
          </div>

          {extractStep ? (
            <p className="mt-3 text-xs font-medium text-ink-500" role="status">
              {STEP_COPY[extractStep]}
            </p>
          ) : null}

          <p className="mt-6 text-sm font-medium text-ink-900">Document à générer</p>
          <div className="landing-filter mt-2">
            {LANDING_DEMO_OUTPUT_OPTIONS.map((option, index) => (
              <LandingPillButton
                key={option.label}
                selected={index === outputIndex}
                disabled={locked}
                onClick={() => setOutputIndex(index)}
              >
                {option.label}
              </LandingPillButton>
            ))}
          </div>

          {extracted && extraction ? (
            <>
              <div className="mt-6 overflow-x-auto rounded-md border border-line">
                <table className="w-full min-w-[280px] text-left text-xs">
                  <thead className="bg-paper-50 text-ink-500">
                    <tr>
                      <th className="px-3 py-2 font-medium">Produit</th>
                      <th className="px-3 py-2 font-medium text-right">Qté</th>
                      <th className="px-3 py-2 font-medium text-right">Prix fourn.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extraction.lines.map((line) => (
                      <tr key={`${line.label}-${line.unitPriceHT}`} className="border-t border-line">
                        <td className="px-3 py-2 text-ink-800">{line.label}</td>
                        <td className="px-3 py-2 text-right nums text-ink-700">{line.qty}</td>
                        <td className="px-3 py-2 text-right nums text-ink-900">
                          {formatEuroHt(line.unitPriceHT)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 rounded-md border border-line bg-paper-50 px-4 py-3 text-sm text-ink-700">
                <p>
                  Prix fournisseur : <span className="font-medium nums">{formatEuroHt(supplierHt)}</span> HT
                </p>
                <p className="mt-1">
                  Marge TARINEO : <span className="font-medium nums">{marginPct} %</span>
                </p>
                <p className="mt-1">
                  Prix de vente estimé : <span className="font-medium nums">{formatEuroHt(clientHt)}</span> HT
                </p>
              </div>
              {extraction.uncertain ? (
                <p className="mt-3 text-xs text-ink-500">
                  Certaines informations n’ont pas pu être détectées. Vérifiez votre document avant de
                  générer le devis.
                </p>
              ) : null}
            </>
          ) : null}

          <div className="mt-6 flex flex-col gap-4">
            <div>
              <p className="text-sm font-medium text-ink-900">Pour qui préparez-vous ce document ?</p>
              <input
                type="text"
                value={clientName}
                disabled={locked}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nom du client ou entreprise"
                className="mt-2 w-full rounded-md border border-line bg-paper-0 px-4 py-3 text-sm text-ink-900"
              />
              <input
                type="text"
                value={clientAddress}
                disabled={locked}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder="Adresse (optionnel)"
                className="mt-2 w-full rounded-md border border-line bg-paper-0 px-4 py-3 text-sm text-ink-900"
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-ink-600">Marge (%)</p>
                <Badge tone="accent">Min. {LANDING_QUOTE_DEMO.minMarginPct} %</Badge>
              </div>
              <div className="mt-2 rounded-md border border-line bg-paper-0 px-4 py-3">
                <input
                  type="range"
                  min={LANDING_QUOTE_DEMO.minMarginPct}
                  max={45}
                  step={1}
                  value={marginPct}
                  disabled={locked}
                  onChange={(e) => onMarginChange(Number(e.target.value))}
                  className="w-full accent-[var(--color-accent)] disabled:opacity-40"
                  aria-valuenow={marginPct}
                  aria-label="Marge en pourcentage"
                />
                <p className="mt-2 text-sm font-medium text-ink-900 nums">{marginPct} %</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <motion.div
              className="w-full sm:w-auto"
              whileHover={reduce || !extracted || downloading ? undefined : { y: -2 }}
              whileTap={reduce ? undefined : { scale: 0.98 }}
            >
              <Button
                type="button"
                size="lg"
                className="w-full bg-ink-900 text-white shadow-none hover:bg-ink-800 active:bg-ink-950 sm:w-auto"
                disabled={!extracted || downloading || locked}
                loading={downloading}
                onClick={() => void handleDownload()}
              >
                {downloading ? "Génération du PDF…" : "Télécharger mon PDF"}
              </Button>
            </motion.div>
          </div>
        </>
      ) : null}

      {error ? (
        <LandingAlert variant="error" className="mt-4">{error}</LandingAlert>
      ) : null}
      {status && !error ? (
        <p className="mt-4 text-sm text-ink-600" role="status">{status}</p>
      ) : null}
    </div>
  );
}
