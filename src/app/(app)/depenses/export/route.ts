import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { accesExportComptable, messageFonctionPlanRequise } from "@/lib/planGating";
import { prisma } from "@/lib/prisma";
import {
  recupererLignesExportComptable,
  genererCsv,
  genererXlsx,
  nomFichierExport,
  TYPES_EXPORT_COMPTABLE,
} from "@/lib/exportComptable";

const schema = z.object({
  format: z.enum(["csv", "xlsx"]),
  periode: z.enum(["mensuelle", "annuelle", "personnalisee"]),
  mois: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
  annee: z
    .string()
    .regex(/^\d{4}$/)
    .optional(),
  du: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  au: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  // Vide/absent = tous les distributeurs (voir ExportBouton.tsx : les cases à cocher
  // ne sont soumises que si la sélection n'est pas "tous").
  distributeur: z.array(z.string().trim()).optional(),
  distributeurLabel: z.string().trim().optional(),
  types: z.array(z.enum(TYPES_EXPORT_COMPTABLE)).optional(),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Non authentifié.", { status: 401 });
  }

  const utilisateur = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, subscriptionStatus: true },
  });
  if (!utilisateur || !accesExportComptable(utilisateur.plan, utilisateur.subscriptionStatus)) {
    return new NextResponse(messageFonctionPlanRequise("export"), { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const typesBruts = searchParams.getAll("types");
  const distributeurBruts = searchParams.getAll("distributeur");
  const parsed = schema.safeParse({
    format: searchParams.get("format"),
    periode: searchParams.get("periode"),
    mois: searchParams.get("mois") ?? undefined,
    annee: searchParams.get("annee") ?? undefined,
    du: searchParams.get("du") ?? undefined,
    au: searchParams.get("au") ?? undefined,
    distributeur: distributeurBruts.length > 0 ? distributeurBruts : undefined,
    distributeurLabel: searchParams.get("distributeurLabel") || undefined,
    types: typesBruts.length > 0 ? typesBruts : undefined,
  });
  if (!parsed.success) {
    return new NextResponse("Paramètres invalides.", { status: 400 });
  }
  const { format, periode, mois, annee, du, au, distributeur, distributeurLabel, types } = parsed.data;

  let debut: Date;
  let fin: Date;
  if (periode === "mensuelle") {
    if (!mois) return new NextResponse("Mois requis.", { status: 400 });
    const [a, m] = mois.split("-").map(Number);
    debut = new Date(Date.UTC(a, m - 1, 1));
    fin = new Date(Date.UTC(a, m, 1));
  } else if (periode === "annuelle") {
    const a = annee ? Number(annee) : new Date().getUTCFullYear();
    debut = new Date(Date.UTC(a, 0, 1));
    fin = new Date(Date.UTC(a + 1, 0, 1));
  } else {
    if (!du || !au) return new NextResponse("Dates de début et de fin requises.", { status: 400 });
    const [ad, md, jd] = du.split("-").map(Number);
    const [af, mf, jf] = au.split("-").map(Number);
    debut = new Date(Date.UTC(ad, md - 1, jd));
    // Borne exclusive : lendemain du dernier jour inclus, pour couvrir toute la
    // journée "au" (documentDate porte une heure, pas seulement une date).
    fin = new Date(Date.UTC(af, mf - 1, jf + 1));
    if (fin <= debut) {
      return new NextResponse("La date de fin doit être postérieure à la date de début.", { status: 400 });
    }
  }

  const typesRecherches = types && types.length > 0 ? types : [...TYPES_EXPORT_COMPTABLE];

  const lignes = await recupererLignesExportComptable({
    userId: session.user.id,
    debut,
    fin,
    distributorNorms: distributeur,
    types: typesRecherches,
  });

  const nomFichier = nomFichierExport({
    format,
    periodeType: periode,
    debut,
    fin,
    distributorLabel: distributeur && distributeur.length > 0 ? (distributeurLabel ?? distributeur.join("+")) : null,
  });

  if (format === "csv") {
    return new NextResponse(genererCsv(lignes), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${nomFichier}"`,
      },
    });
  }

  const buffer = await genererXlsx(lignes);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${nomFichier}"`,
    },
  });
}
