import {
  buildLandingDemoDevisPdf,
  buildLandingSupplierDemoPdf,
} from "@/lib/site/landing-quote-pdf.server";
import { LANDING_QUOTE_DEMO_COOKIE } from "@/lib/site/landing-quote-demo-quota";
import { sanitizeLandingExtractLines } from "@/lib/site/landing-quote-extract-map";
import {
  demoPdfDownloadName,
  LANDING_QUOTE_DEMO,
  type LandingDemoOutputKind,
} from "@/lib/site/landing-quote-transform-demo";

export const runtime = "nodejs";
export const maxDuration = 30;

const OUTPUT_KINDS = new Set<LandingDemoOutputKind>([
  "devis",
  "facture",
  "bon_commande",
  "bon_enlevement",
]);

type Body = {
  kind?: "client" | "supplier";
  marginPct?: number;
  clientName?: string;
  clientAddress?: string;
  sourceRef?: string;
  documentKind?: LandingDemoOutputKind;
  lines?: unknown;
  documentNumber?: string;
  issueDate?: string;
};

function hasDemoQuotaCookie(req: Request): boolean {
  const cookie = req.headers.get("cookie") ?? "";
  return new RegExp(`(?:^|;\\s*)${LANDING_QUOTE_DEMO_COOKIE}=1(?:;|$)`).test(cookie);
}

const quotaCookieHeader = `${LANDING_QUOTE_DEMO_COOKIE}=1; Path=/; Max-Age=31536000; SameSite=Lax; HttpOnly`;

export async function GET(req: Request) {
  const kind = new URL(req.url).searchParams.get("kind");
  if (kind !== "supplier") {
    return new Response("Utilisez POST pour le devis client.", { status: 405 });
  }

  try {
    const buffer = await buildLandingSupplierDemoPdf();
    if (!buffer?.length) {
      return new Response("PDF vide.", { status: 500 });
    }
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="devis-fournisseur-exemple-tarineo.pdf"',
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[landing/devis-demo] supplier", err);
    return new Response("Génération PDF impossible.", { status: 500 });
  }
}

export async function POST(req: Request) {
  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    return new Response("Corps JSON invalide.", { status: 400 });
  }

  if (body.kind === "supplier") {
    return GET(new Request(new URL("?kind=supplier", req.url).toString()));
  }

  if (hasDemoQuotaCookie(req)) {
    return new Response("Essai gratuit déjà utilisé sur cet appareil.", {
      status: 403,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const marginPct =
    typeof body.marginPct === "number" && Number.isFinite(body.marginPct)
      ? body.marginPct
      : LANDING_QUOTE_DEMO.defaultMarginPct;

  const clientName =
    typeof body.clientName === "string" && body.clientName.trim()
      ? body.clientName.trim().slice(0, 120)
      : LANDING_QUOTE_DEMO.clientName;

  const sourceRef =
    typeof body.sourceRef === "string" && body.sourceRef.trim()
      ? body.sourceRef.trim().slice(0, 160)
      : undefined;

  const documentKind =
    body.documentKind && OUTPUT_KINDS.has(body.documentKind) ? body.documentKind : "devis";

  const clientAddress =
    typeof body.clientAddress === "string" && body.clientAddress.trim()
      ? body.clientAddress.trim().slice(0, 240)
      : undefined;

  const extractLines = sanitizeLandingExtractLines(body.lines);
  if (!extractLines) {
    return new Response("Lignes d’extraction manquantes ou invalides. Analysez d’abord votre document.", {
      status: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const filename = demoPdfDownloadName(documentKind, clientName);

  const documentNumber =
    typeof body.documentNumber === "string" ? body.documentNumber.trim().slice(0, 40) : undefined;
  const issueDate = typeof body.issueDate === "string" ? body.issueDate.trim().slice(0, 32) : undefined;

  try {
    const buffer = await buildLandingDemoDevisPdf(
      marginPct,
      clientName,
      sourceRef,
      documentKind,
      clientAddress,
      extractLines,
      { documentNumber, issueDate },
    );
    if (!buffer?.length) {
      return new Response("PDF vide.", { status: 500 });
    }
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "public, max-age=0, must-revalidate",
        "X-Content-Type-Options": "nosniff",
        "Set-Cookie": quotaCookieHeader,
      },
    });
  } catch (err) {
    console.error("[landing/devis-demo] client", err);
    return new Response("Génération PDF impossible.", { status: 500 });
  }
}
