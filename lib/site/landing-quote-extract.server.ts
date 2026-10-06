import "server-only";

import { ExtractError } from "@/lib/metier/extract-parse";
import { ingestDocumentWithAgent } from "@/lib/metier/document-agent/extract-with-agent";
import { LANDING_DEMO_MAX_SIZE_LABEL, validateLandingDemoFile } from "@/lib/site/landing-demo-file";
import { mapExtractToLandingPayload } from "@/lib/site/landing-quote-extract-map";
import type { LandingExtractPayload } from "@/lib/site/landing-quote-extract.types";

export type LandingExtractErrorCode =
  | "empty"
  | "too_large"
  | "invalid_type"
  | "unreadable"
  | "no_lines"
  | "incompatible"
  | "rate_limited"
  | "server";

export class LandingExtractError extends Error {
  code: LandingExtractErrorCode;
  constructor(code: LandingExtractErrorCode, message: string) {
    super(message);
    this.name = "LandingExtractError";
    this.code = code;
  }
}

export function landingExtractUserMessage(code: LandingExtractErrorCode): string {
  switch (code) {
    case "empty":
      return "Le fichier est vide. Choisissez un PDF ou une image contenant votre devis.";
    case "invalid_type":
      return "Ce document n’est pas encore compatible avec la transformation automatique.";
    case "too_large":
      return `Fichier trop volumineux (max. ${LANDING_DEMO_MAX_SIZE_LABEL}).`;
    case "unreadable":
      return "Nous n’arrivons pas à lire ce document. Essayez avec un PDF plus net.";
    case "no_lines":
      return "TARINEO n’a pas trouvé de lignes de produits dans ce document.";
    case "incompatible":
      return "Ce document n’est pas encore compatible avec la transformation automatique.";
    case "rate_limited":
      return "Trop d’analyses en peu de temps. Réessayez dans une heure.";
    case "server":
    default:
      return "Une erreur est survenue pendant l’analyse. Votre essai n’a pas été consommé.";
  }
}

function mapThrown(err: unknown): LandingExtractError {
  if (err instanceof LandingExtractError) return err;
  if (err instanceof ExtractError) {
    const msg = err.message.toLowerCase();
    if (msg.includes("ligne") || msg.includes("lu")) {
      return new LandingExtractError("no_lines", landingExtractUserMessage("no_lines"));
    }
    if (msg.includes("pdf") || msg.includes("image") || msg.includes("lisible")) {
      return new LandingExtractError("unreadable", landingExtractUserMessage("unreadable"));
    }
    return new LandingExtractError("unreadable", landingExtractUserMessage("unreadable"));
  }
  return new LandingExtractError("server", landingExtractUserMessage("server"));
}

export async function extractLandingDemoDocument(input: {
  fileName: string;
  declaredMime: string;
  buffer: Buffer;
}): Promise<LandingExtractPayload> {
  const validated = validateLandingDemoFile(input.fileName, input.declaredMime, input.buffer);
  if (!validated.ok) {
    const code =
      validated.message.includes("15 Mo")
        ? "too_large"
        : validated.message.includes("vide")
          ? "empty"
          : "invalid_type";
    throw new LandingExtractError(code, validated.message);
  }

  try {
    const { extracted } = await ingestDocumentWithAgent({
      fileName: input.fileName,
      mime: validated.mime,
      base64: input.buffer.toString("base64"),
    });

    const payload = mapExtractToLandingPayload(extracted, input.fileName);
    if (!payload.lines.length) {
      throw new LandingExtractError("no_lines", landingExtractUserMessage("no_lines"));
    }
    return payload;
  } catch (err) {
    throw mapThrown(err);
  }
}
