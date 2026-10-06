"use client";

import { useCallback, useRef, useState } from "react";

import { LANDING_SIGNUP } from "@/lib/site/landing-v2-auth";
import { transformOptions } from "@/lib/site/landing-v2-content";
import {
  downloadClientQuoteDemo,
  downloadSupplierQuoteDemo,
  LANDING_QUOTE_DEMO,
} from "@/lib/site/landing-quote-transform-demo";
import {
  LANDING_EXAMPLE_SUPPLIER_FILE,
  runSimulatedExtraction,
  type SimulatedExtractionStep,
} from "@/lib/site/landing-quote-extract-sim";
import { Button } from "@/components/site/landing-v2/components/ui/Button";
import { Badge } from "@/components/site/landing-v2/components/ui/Badge";
import { Icon } from "@/components/site/landing-v2/components/ui/Icon";
import { LandingUploadDropzone } from "@/components/site/landing-v2/components/ui/LandingUploadDropzone";
import { LANDING_EASE } from "@/components/site/landing-v2/lib/landing-motion";
import { motion, useReducedMotion } from "framer-motion";

type Props = {
  marginPct: number;
  onMarginChange: (value: number) => void;
  onTransform: () => void;
  fileLabel: string | null;
  onFileSelect: (name: string | null) => void;
  readyToDownload: boolean;
  extracted: boolean;
  onExtractedChange: (value: boolean) => void;
  sourceRef: string | null;
  onSourceRefChange: (value: string | null) => void;
  demoUsed: boolean;
  onDemoConsumed: () => void;
  onExtractingChange?: (value: boolean) => void;
};

const EXTRACT_COPY: Record<SimulatedExtractionStep, string> = {
  reading: "Lecture du PDF…",
  lines: "Repérage des lignes et des prix…",
  done: "Extraction terminée.",
};

export function LandingQuoteTransformPanel({
  marginPct,
  onMarginChange,
  onTransform,
  fileLabel,
  onFileSelect,
  readyToDownload,
  extracted,
  onExtractedChange,
  sourceRef,
  onSourceRefChange,
  demoUsed,
  onDemoConsumed,
  onExtractingChange,
}: Props) {
  const reduce = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const [optionIndex, setOptionIndex] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractStep, setExtractStep] = useState<SimulatedExtractionStep | null>(null);
  const [supplierPdfLoading, setSupplierPdfLoading] = useState(false);

  const runExtraction = useCallback(
    async (fileName: string) => {
      setExtracting(true);
      onExtractingChange?.(true);
      onExtractedChange(false);
      setExtractStep("reading");
      setStatus(EXTRACT_COPY.reading);
      try {
        const result = await runSimulatedExtraction(fileName, (step) => {
          setExtractStep(step);
          setStatus(EXTRACT_COPY[step]);
        });
        onSourceRefChange(result.sourceRef);
        onExtractedChange(true);
        setStatus(
          `${result.lineCount} lignes extraites (démo locale — mêmes montants que l’exemple Tarinéo).`,
        );
      } finally {
        setExtracting(false);
        onExtractingChange?.(false);
        setExtractStep(null);
      }
    },
    [onExtractedChange, onExtractingChange, onSourceRefChange],
  );

  const handleFile = useCallback(
    (file: File | null) => {
      if (!file) {
        onFileSelect(null);
        onSourceRefChange(null);
        onExtractedChange(false);
        return;
      }
      if (demoUsed) {
        setStatus("Essai gratuit déjà utilisé. Créez un compte pour transformer vos vrais devis.");
        return;
      }
      onFileSelect(file.name);
      void runExtraction(file.name);
    },
    [demoUsed, onExtractedChange, onFileSelect, onSourceRefChange, runExtraction],
  );

  const loadExample = () => {
    if (demoUsed) {
      setStatus("Essai gratuit déjà utilisé. Téléchargez encore l’exemple fournisseur ou passez à Tarinéo.");
      return;
    }
    onFileSelect(LANDING_EXAMPLE_SUPPLIER_FILE);
    void runExtraction(LANDING_EXAMPLE_SUPPLIER_FILE);
  };

  const handleCreate = () => {
    if (demoUsed) {
      setStatus("Vous avez déjà généré votre devis client gratuit sur cet appareil.");
      return;
    }
    if (!extracted) {
      if (!fileLabel) loadExample();
      else setStatus("Attendez la fin de l’extraction simulée.");
      return;
    }
    onTransform();
    setStatus("Lignes recopiées, marge appliquée. Téléchargez votre devis client (PDF).");
  };

  const handleDownload = async () => {
    if (demoUsed) return;
    setDownloading(true);
    setStatus("Génération du PDF…");
    try {
      const result = await downloadClientQuoteDemo(
        marginPct,
        LANDING_QUOTE_DEMO.clientName,
        sourceRef,
      );
      if (result === "quota_exceeded") {
        onDemoConsumed();
        setStatus("Essai gratuit déjà utilisé sur cet appareil. Passez à Tarinéo pour continuer.");
        return;
      }
      if (result === "pdf_failed") {
        setStatus("Impossible de générer le PDF. Réessayez dans un instant.");
        return;
      }
      onDemoConsumed();
      setStatus("Devis client PDF téléchargé. C’était votre essai gratuit sur cette page.");
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
          ? "PDF fournisseur exemple téléchargé — vous pouvez le déposer pour tester l’extraction."
          : "Téléchargement impossible pour le moment.",
      );
    } finally {
      setSupplierPdfLoading(false);
    }
  };

  const locked = demoUsed;

  return (
    <div className="surface flex flex-col border border-line-strong p-6 shadow-card sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-heading font-semibold text-ink-900">Générer le devis client</h3>
        <div className="flex flex-wrap gap-2">
          <Badge tone="accent">1 essai gratuit</Badge>
          <Badge tone="muted">Sortie PDF A4</Badge>
        </div>
      </div>
      <p className="mt-3 text-sm text-ink-600">
        Déposez un devis fournisseur (ou notre PDF exemple), laissez Tarinéo simuler l’extraction,
        ajustez la marge puis téléchargez un vrai devis client — une fois par appareil, sans compte.
      </p>

      {locked ? (
        <div className="mt-5 rounded-md border border-line bg-paper-50 px-4 py-3">
          <p className="text-sm font-medium text-ink-900">Essai gratuit utilisé</p>
          <p className="mt-1 text-sm text-ink-600">
            Vous avez déjà transformé et téléchargé un devis client ici. Avec un compte Tarinéo,
            faites-le sur vos vrais documents, sans limite.
          </p>
          <Button href={LANDING_SIGNUP} className="mt-3" size="md">
            Voir les offres
          </Button>
        </div>
      ) : null}

      <LandingUploadDropzone
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
          {fileLabel ?? "Déposer un PDF fournisseur"}
        </span>
        <span className="text-xs text-ink-400">
          PDF · JPEG · max. 15 Mo — fichier non envoyé au serveur
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
        <p className="mt-3 text-xs font-medium text-ink-500" role="status">{EXTRACT_COPY[extractStep]}</p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        {transformOptions.map((option, index) => (
          <button
            key={option}
            type="button"
            disabled={locked}
            onClick={() => setOptionIndex(index)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40 ${
              index === optionIndex
                ? "bg-ink-900 text-white"
                : "border border-line bg-paper-0 text-ink-600"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <div>
          <p className="text-sm text-ink-600">Client</p>
          <div className="mt-2 flex items-center justify-between rounded-md border border-line bg-paper-0 px-4 py-3">
            <span className="text-sm text-ink-900">{LANDING_QUOTE_DEMO.clientName}</span>
          </div>
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

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <motion.button
          type="button"
          disabled={locked || extracting || !extracted}
          onClick={handleCreate}
          className="inline-flex items-center rounded-full bg-ink-900 px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          whileHover={reduce ? undefined : { y: -2 }}
          whileTap={reduce ? undefined : { scale: 0.98 }}
          transition={{ duration: 0.2, ease: LANDING_EASE }}
        >
          Créer devis client
        </motion.button>

        <motion.button
          type="button"
          disabled={!readyToDownload || downloading || locked}
          onClick={() => void handleDownload()}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-paper-0 px-5 py-2.5 text-sm font-medium text-ink-900 disabled:cursor-not-allowed disabled:opacity-40"
          whileHover={reduce || !readyToDownload || downloading ? undefined : { y: -2 }}
          whileTap={reduce ? undefined : { scale: 0.98 }}
        >
          {downloading ? "PDF…" : "Télécharger le PDF client"}
        </motion.button>
      </div>

      {status ? (
        <p className="mt-4 text-sm text-ink-600" role="status">{status}</p>
      ) : null}
    </div>
  );
}
