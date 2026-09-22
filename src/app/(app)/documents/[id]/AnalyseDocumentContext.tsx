"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { FiltreLigne, LineReviews } from "@/lib/analyseDocument";

type Contexte = {
  filtre: FiltreLigne;
  setFiltre: (filtre: FiltreLigne) => void;
  lineReviews: LineReviews;
  setLineReviews: (reviews: LineReviews) => void;
  documentId: string;
};

const AnalyseDocumentCtx = createContext<Contexte | null>(null);

export function AnalyseDocumentProvider({
  children,
  documentId,
  lineReviewsInitial,
}: {
  children: ReactNode;
  documentId: string;
  lineReviewsInitial: LineReviews;
}) {
  const [filtre, setFiltre] = useState<FiltreLigne>("toutes");
  const [lineReviews, setLineReviews] = useState<LineReviews>(lineReviewsInitial);

  const valeur = useMemo(
    () => ({ filtre, setFiltre, lineReviews, setLineReviews, documentId }),
    [filtre, lineReviews, documentId],
  );

  return <AnalyseDocumentCtx.Provider value={valeur}>{children}</AnalyseDocumentCtx.Provider>;
}

export function useAnalyseDocument() {
  const ctx = useContext(AnalyseDocumentCtx);
  if (!ctx) {
    throw new Error("useAnalyseDocument doit être utilisé dans AnalyseDocumentProvider");
  }
  return ctx;
}
