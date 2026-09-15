import ExcelJS from "exceljs";
import type { DocumentType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { LABELS_TYPE } from "@/lib/documentLabels";

export const TYPES_EXPORT_COMPTABLE = ["FACTURE", "BON_COMMANDE", "BON_ENLEVEMENT"] as const;
export type TypeExportComptable = (typeof TYPES_EXPORT_COMPTABLE)[number];

export interface LigneExportComptable {
  date: Date | null;
  distributor: string;
  type: TypeExportComptable;
  reference: string;
  totalHt: number;
  tva: number;
  totalTtc: number;
}

export interface FiltresExportComptable {
  userId: string;
  debut: Date;
  fin: Date;
  /** distributorNorm — absent/vide = tous les distributeurs. */
  distributorNorms?: string[];
  /** Sous-ensemble de TYPES_EXPORT_COMPTABLE à inclure — jamais DEVIS (jamais un achat engagé). */
  types: TypeExportComptable[];
}

export async function recupererLignesExportComptable(
  filtres: FiltresExportComptable
): Promise<LigneExportComptable[]> {
  const { userId, debut, fin, distributorNorms, types } = filtres;

  const documents = await prisma.document.findMany({
    where: {
      userId,
      status: "VALIDATED",
      type: { in: types as DocumentType[] },
      documentDate: { gte: debut, lt: fin },
      ...(distributorNorms && distributorNorms.length > 0 ? { distributorNorm: { in: distributorNorms } } : {}),
    },
    orderBy: { documentDate: "asc" },
  });

  return documents.map((doc) => {
    const totalHt = Number(doc.totalHt ?? 0);
    const totalTtc = Number(doc.totalTtc ?? 0);
    // rawExtraction.numero (numéro de facture/BC extrait par l'IA) n'est jamais mis à
    // jour après validation, mais reste fiable : contrairement aux montants, l'artisan
    // ne le corrige pas dans le formulaire de validation.
    const extraction = doc.rawExtraction as { numero?: string | null } | null;

    return {
      date: doc.documentDate,
      distributor: doc.distributor ?? "",
      type: doc.type as TypeExportComptable,
      reference: extraction?.numero?.trim() || "",
      totalHt,
      // Recalculée à partir des montants validés (potentiellement corrigés par
      // l'artisan) plutôt que rawExtraction.tva, qui peut devenir obsolète après édition.
      tva: Math.round((totalTtc - totalHt) * 100) / 100,
      totalTtc,
    };
  });
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function isoDateUTC(d: Date): string {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

// Filename-safe : minuscules, sans accents, espaces/ponctuation remplacés par des
// tirets (ex. "Point P" -> "point-p").
function slugifier(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function nomFichierExport(params: {
  format: "csv" | "xlsx";
  periodeType: "mensuelle" | "annuelle" | "personnalisee";
  debut: Date;
  /** Borne exclusive (lendemain du dernier jour inclus) — utilisée pour reconstituer
   *  la date de fin réelle affichée dans le nom de fichier en période personnalisée. */
  fin: Date;
  /** Résumé déjà formaté côté client (ExportBouton.tsx) : label unique, plusieurs
   *  labels joints par "+", "plusieurs-distributeurs" au-delà de 3, ou absent/null
   *  quand tous les distributeurs sont inclus (pas de suffixe). */
  distributorLabel?: string | null;
}): string {
  const { format, periodeType, debut, fin, distributorLabel } = params;

  let suffixePeriode: string;
  if (periodeType === "mensuelle") {
    suffixePeriode = `${debut.getUTCFullYear()}-${pad2(debut.getUTCMonth() + 1)}`;
  } else if (periodeType === "annuelle") {
    suffixePeriode = `${debut.getUTCFullYear()}`;
  } else {
    const finInclusive = new Date(fin.getTime() - 24 * 60 * 60 * 1000);
    suffixePeriode = `${isoDateUTC(debut)}_${isoDateUTC(finInclusive)}`;
  }

  const suffixeDistributeur = distributorLabel ? `-${slugifier(distributorLabel)}` : "";
  return `tarineo-export-${suffixePeriode}${suffixeDistributeur}.${format}`;
}

function formaterDateFr(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC" }).format(date);
}

function formaterMontantFr(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const ENTETES = ["Date", "Distributeur", "Type", "Référence", "Montant HT", "TVA", "Montant TTC"];

function echapperCsv(valeur: string): string {
  if (/[;"\n]/.test(valeur)) {
    return `"${valeur.replace(/"/g, '""')}"`;
  }
  return valeur;
}

// Séparateur point-virgule + BOM UTF-8 : Excel en locale française n'auto-détecte le
// délimiteur virgule qu'en anglais, et affiche les caractères accentués de travers
// sans le BOM. Les nombres sont formatés en chaîne à la française (virgule
// décimale) pour qu'Excel les reconnaisse directement comme des nombres.
export function genererCsv(lignes: LigneExportComptable[]): string {
  const corps = [
    ENTETES,
    ...lignes.map((l) => [
      formaterDateFr(l.date),
      l.distributor,
      LABELS_TYPE[l.type],
      l.reference,
      formaterMontantFr(l.totalHt),
      formaterMontantFr(l.tva),
      formaterMontantFr(l.totalTtc),
    ]),
  ]
    .map((ligne) => ligne.map(echapperCsv).join(";"))
    .join("\r\n");
  const BOM = String.fromCharCode(0xfeff);
  return BOM + corps;
}

export async function genererXlsx(lignes: LigneExportComptable[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Tarineo";
  workbook.created = new Date();

  const feuille = workbook.addWorksheet("Export comptable");
  feuille.columns = [
    { header: "Date", key: "date", width: 14 },
    { header: "Distributeur", key: "distributor", width: 24 },
    { header: "Type", key: "type", width: 16 },
    { header: "Référence", key: "reference", width: 16 },
    { header: "Montant HT", key: "totalHt", width: 14 },
    { header: "TVA", key: "tva", width: 12 },
    { header: "Montant TTC", key: "totalTtc", width: 14 },
  ];
  feuille.getRow(1).font = { bold: true };

  for (const l of lignes) {
    feuille.addRow({
      date: l.date,
      distributor: l.distributor,
      type: LABELS_TYPE[l.type],
      reference: l.reference,
      totalHt: l.totalHt,
      tva: l.tva,
      totalTtc: l.totalTtc,
    });
  }

  feuille.getColumn("date").numFmt = "dd/mm/yyyy";
  for (const cle of ["totalHt", "tva", "totalTtc"]) {
    feuille.getColumn(cle).numFmt = '#,##0.00 "€"';
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
