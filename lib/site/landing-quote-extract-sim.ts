import { LANDING_QUOTE_DEMO } from "@/lib/site/landing-quote-transform-demo";

export const LANDING_EXAMPLE_SUPPLIER_FILE = "devis-fournisseur-exemple-tarineo.pdf";

export type SimulatedExtractionStep = "reading" | "lines" | "done";

export function supplierRefFromFileName(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/i, "").trim().slice(0, 72);
  if (!base) return LANDING_QUOTE_DEMO.supplierSubtitle;
  return `Extrait de « ${base} »`;
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/** Extraction simulée côté navigateur — mêmes lignes que l’exemple Tarinéo. */
export async function runSimulatedExtraction(
  fileName: string,
  onStep?: (step: SimulatedExtractionStep) => void,
): Promise<{ sourceRef: string; lineCount: number }> {
  onStep?.("reading");
  await wait(520);
  onStep?.("lines");
  await wait(680);
  onStep?.("done");
  return {
    sourceRef: supplierRefFromFileName(fileName),
    lineCount: LANDING_QUOTE_DEMO.lines.length,
  };
}
