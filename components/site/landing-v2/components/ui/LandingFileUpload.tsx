"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FileText, UploadCloud, X } from "lucide-react";

import { Badge } from "@/components/site/landing-v2/components/ui/Badge";
import { cn } from "@/lib/utils";
import { DEMO_MARK } from "@/lib/site/tarineo";

type FileStatus = "idle" | "dragging" | "uploading" | "error" | "done";

type FileError = {
  message: string;
  code: string;
};

type LandingFileUploadProps = {
  onUploadSuccess?: (file: File) => void;
  onUploadError?: (error: FileError) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
  uploadDelay?: number;
  className?: string;
  /** Affiché après simulation (CTA parent). */
  successSlot?: ReactNode;
};

const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024;
const UPLOAD_STEP_SIZE = 5;
const FILE_SIZES = ["octets", "Ko", "Mo", "Go"] as const;

function formatBytes(bytes: number, decimals = 1): string {
  if (!+bytes) return "0 octets";
  const k = 1024;
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), FILE_SIZES.length - 1);
  return `${Number.parseFloat((bytes / k ** i).toFixed(decimals))} ${FILE_SIZES[i]}`;
}

function UploadIllustration({ reduce }: { reduce: boolean }) {
  return (
    <div className="relative size-16" aria-hidden>
      <svg viewBox="0 0 100 100" fill="none" className="size-full" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="50"
          cy="50"
          r="45"
          className="stroke-line"
          strokeWidth="2"
          strokeDasharray="4 4"
        >
          {!reduce ? (
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 50 50"
              to="360 50 50"
              dur="60s"
              repeatCount="indefinite"
            />
          ) : null}
        </circle>
        <path
          d="M30 35H70C75 35 75 40 75 40V65C75 70 70 70 70 70H30C25 70 25 65 25 65V40C25 35 30 35 30 35Z"
          className="fill-accent-soft stroke-accent"
          strokeWidth="2"
        />
        <path
          d="M30 35C30 35 35 35 40 35C45 35 45 30 50 30C55 30 55 35 60 35C65 35 70 35 70 35"
          className="stroke-accent"
          strokeWidth="2"
          fill="none"
        />
        <g className="translate-y-1">
          <line
            x1="50"
            y1="45"
            x2="50"
            y2="60"
            className="stroke-accent"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {!reduce ? (
              <animate attributeName="y2" values="60;55;60" dur="2s" repeatCount="indefinite" />
            ) : null}
          </line>
          <polyline
            points="42,52 50,45 58,52"
            className="stroke-accent"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            {!reduce ? (
              <animate
                attributeName="points"
                values="42,52 50,45 58,52;42,47 50,40 58,47;42,52 50,45 58,52"
                dur="2s"
                repeatCount="indefinite"
              />
            ) : null}
          </polyline>
        </g>
      </svg>
    </div>
  );
}

function UploadingAnimation({ progress, maskId }: { progress: number; maskId: string }) {
  return (
    <div className="relative size-16">
      <svg
        viewBox="0 0 240 240"
        fill="none"
        className="size-full"
        aria-label={`Progression : ${Math.round(progress)} %`}
      >
        <title>Progression d’envoi</title>
        <defs>
          <mask id={maskId}>
            <rect width="240" height="240" fill="black" />
            <circle
              r="120"
              cx="120"
              cy="120"
              fill="white"
              strokeDasharray={`${(progress / 100) * 754}, 754`}
              transform="rotate(-90 120 120)"
            />
          </mask>
        </defs>
        <circle
          r="100"
          cx="120"
          cy="120"
          className="stroke-paper-200"
          strokeWidth="10"
          fill="none"
        />
        <circle
          r="100"
          cx="120"
          cy="120"
          className="stroke-accent"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${(progress / 100) * 628}, 628`}
          transform="rotate(-90 120 120)"
        />
        <circle
          r="70"
          cx="120"
          cy="120"
          className="stroke-accent/35"
          strokeWidth="8"
          fill="none"
          strokeDasharray="18% 40%"
          mask={`url(#${maskId})`}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center font-mono text-xs font-semibold text-ink-900 nums">
        {Math.round(progress)}%
      </span>
    </div>
  );
}

/**
 * Dropzone devis PDF — hero landing (simulation locale, tokens Tarineo).
 * Adapté de Viora UI FileUpload (MIT).
 */
export function LandingFileUpload({
  onUploadSuccess = () => {},
  onUploadError = () => {},
  acceptedFileTypes = ["application/pdf", "image/png", "image/jpeg", "image/webp"],
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  uploadDelay = 1800,
  className,
  successSlot,
}: LandingFileUploadProps) {
  const reduce = useReducedMotion();
  const maskId = useId().replace(/:/g, "");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<FileStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<FileError | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (uploadIntervalRef.current) clearInterval(uploadIntervalRef.current);
    };
  }, []);

  const handleError = useCallback(
    (next: FileError) => {
      setError(next);
      setStatus("error");
      onUploadError?.(next);
      window.setTimeout(() => {
        setError(null);
        setStatus("idle");
      }, 3200);
    },
    [onUploadError],
  );

  const simulateUpload = useCallback(
    (uploadingFile: File) => {
      let currentProgress = 0;
      if (uploadIntervalRef.current) clearInterval(uploadIntervalRef.current);

      uploadIntervalRef.current = setInterval(() => {
        currentProgress += UPLOAD_STEP_SIZE;
        if (currentProgress >= 100) {
          if (uploadIntervalRef.current) clearInterval(uploadIntervalRef.current);
          setProgress(100);
          setStatus("done");
          onUploadSuccess?.(uploadingFile);
        } else {
          setStatus((prev) => {
            if (prev !== "uploading") {
              if (uploadIntervalRef.current) clearInterval(uploadIntervalRef.current);
              return prev;
            }
            setProgress(currentProgress);
            return "uploading";
          });
        }
      }, uploadDelay / (100 / UPLOAD_STEP_SIZE));
    },
    [onUploadSuccess, uploadDelay],
  );

  const handleFileSelect = useCallback(
    (selectedFile: File | null) => {
      if (!selectedFile) return;
      setError(null);

      if (selectedFile.size > maxFileSize) {
        handleError({
          message: `Fichier trop lourd (max. ${formatBytes(maxFileSize)})`,
          code: "FILE_TOO_LARGE",
        });
        return;
      }

      if (acceptedFileTypes.length) {
        const ok = acceptedFileTypes.some((type) =>
          selectedFile.type.toLowerCase().includes(type.toLowerCase().replace("/*", "")),
        );
        if (!ok) {
          handleError({
            message: "Formats acceptés : PDF, PNG, JPG, WEBP",
            code: "INVALID_FILE_TYPE",
          });
          return;
        }
      }

      setFile(selectedFile);
      setStatus("uploading");
      setProgress(0);
      simulateUpload(selectedFile);
    },
    [acceptedFileTypes, handleError, maxFileSize, simulateUpload],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setStatus((prev) => (prev !== "uploading" && prev !== "done" ? "dragging" : prev));
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setStatus((prev) => (prev === "dragging" ? "idle" : prev));
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (status === "uploading" || status === "done") return;
      setStatus("idle");
      const dropped = e.dataTransfer.files?.[0];
      if (dropped) handleFileSelect(dropped);
    },
    [handleFileSelect, status],
  );

  const handleFileInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e.target.files?.[0] ?? null);
      e.target.value = "";
    },
    [handleFileSelect],
  );

  const triggerFileInput = useCallback(() => {
    if (status === "uploading") return;
    fileInputRef.current?.click();
  }, [status]);

  const resetState = useCallback(() => {
    if (uploadIntervalRef.current) clearInterval(uploadIntervalRef.current);
    setFile(null);
    setStatus("idle");
    setProgress(0);
    setError(null);
  }, []);

  const fade = reduce
    ? { duration: 0.15 }
    : { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div
      className={cn("relative mx-auto w-full max-w-md", className)}
      role="region"
      aria-label="Déposer un devis fournisseur"
    >
      <div className="group relative w-full rounded-2xl bg-paper-0 p-0.5 shadow-float ring-1 ring-ink-900/8">
        <div className="absolute inset-x-6 -top-px h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

        <div className="relative rounded-[14px] bg-paper-50/80 p-1.5">
          <div
            className={cn(
              "relative overflow-hidden rounded-xl border border-line bg-paper-0",
              error && "border-destructive/40",
            )}
          >
            <div
              className={cn(
                "pointer-events-none absolute inset-0 transition-opacity duration-300",
                status === "dragging" ? "opacity-100" : "opacity-0",
              )}
              aria-hidden
            >
              <div className="absolute inset-x-0 top-0 h-1/5 bg-gradient-to-b from-accent/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-1/5 bg-gradient-to-t from-accent/10 to-transparent" />
              <div className="absolute inset-y-0 left-0 w-1/5 bg-gradient-to-r from-accent/10 to-transparent" />
              <div className="absolute inset-y-0 right-0 w-1/5 bg-gradient-to-l from-accent/10 to-transparent" />
            </div>

            <div className="relative min-h-[260px] sm:min-h-[280px]">
              <AnimatePresence mode="wait">
                {status === "idle" || status === "dragging" || status === "error" ? (
                  <motion.div
                    key="dropzone"
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{
                      opacity: status === "dragging" ? 0.88 : 1,
                      y: 0,
                      scale: status === "dragging" && !reduce ? 0.985 : 1,
                    }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={fade}
                    className="absolute inset-0 flex flex-col items-center justify-center px-5 py-7"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="mb-1 flex w-full justify-center">
                      <Badge tone="accent" size="sm">
                        {DEMO_MARK}
                      </Badge>
                    </div>
                    <div className="mb-3">
                      <UploadIllustration reduce={!!reduce} />
                    </div>
                    <div className="mb-4 space-y-1 text-center">
                      <h3 className="text-base font-semibold tracking-tight text-ink-900 sm:text-lg">
                        Déposez un devis fournisseur
                      </h3>
                      <p className="text-xs text-ink-400 sm:text-sm">
                        PDF, PNG ou JPG · jusqu’à {formatBytes(maxFileSize)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={triggerFileInput}
                      className="flex min-h-11 w-[min(100%,16rem)] items-center justify-center gap-2 rounded-lg bg-ink-900 px-4 py-2.5 text-sm font-semibold text-paper-0 transition-colors hover:bg-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-paper-0"
                    >
                      <span>Choisir un fichier</span>
                      <UploadCloud className="size-4" aria-hidden />
                    </button>
                    <p className="mt-3 text-xs text-ink-400">ou glissez-déposez ici</p>

                    <input
                      ref={fileInputRef}
                      type="file"
                      className="sr-only"
                      onChange={handleFileInputChange}
                      accept={acceptedFileTypes.join(",")}
                      aria-label="Sélectionner un devis"
                    />
                  </motion.div>
                ) : status === "uploading" ? (
                  <motion.div
                    key="uploading"
                    initial={reduce ? false : { opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
                    transition={fade}
                    className="absolute inset-0 flex flex-col items-center justify-center px-5 py-7"
                  >
                    <div className="mb-4">
                      <UploadingAnimation progress={progress} maskId={maskId} />
                    </div>
                    <div className="mb-4 max-w-[18rem] space-y-1.5 text-center">
                      <p className="truncate text-sm font-semibold text-ink-900">{file?.name}</p>
                      <p className="text-xs text-ink-400">
                        {formatBytes(file?.size ?? 0)}
                        <span className="text-ink-300"> · </span>
                        Lecture du devis…
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={resetState}
                      className="flex min-h-11 w-[min(100%,16rem)] items-center justify-center gap-2 rounded-lg border border-line bg-paper-50 px-4 py-2.5 text-sm font-semibold text-ink-900 transition-colors hover:bg-paper-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45"
                    >
                      <X className="size-4" aria-hidden />
                      Annuler
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="done"
                    initial={reduce ? false : { opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={fade}
                    className="absolute inset-0 flex flex-col items-center justify-center px-5 py-7"
                  >
                    <div className="mb-3 grid size-14 place-items-center rounded-full bg-accent-soft text-accent">
                      <FileText className="size-6" strokeWidth={1.75} aria-hidden />
                    </div>
                    <p className="text-base font-semibold tracking-tight text-ink-900">
                      Devis prêt à analyser
                    </p>
                    <p className="mt-1 max-w-[18rem] truncate text-center text-xs text-ink-400">
                      {file?.name}
                    </p>
                    <div className="mt-5 w-full max-w-xs">{successSlot}</div>
                    <button
                      type="button"
                      onClick={resetState}
                      className="mt-3 text-xs font-medium text-ink-400 underline-offset-2 hover:text-ink-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                    >
                      Choisir un autre fichier
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {error ? (
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  role="alert"
                  className="absolute inset-x-4 bottom-4 rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-center"
                >
                  <p className="text-sm text-destructive">{error.message}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
