import type { InvoiceExportKind } from "@/components/tarineo/types";
import type { DocumentCard } from "@/lib/metier/types";

export function filterInvoicesForExport(
  documents: DocumentCard[],
  input: {
    invoiceKinds: InvoiceExportKind[];
    periodStart?: string;
    periodEnd?: string;
    distributorNames?: string[];
  },
): DocumentCard[] {
  let docs = documents.filter((d) => d.kind === "facture");
  const kinds = input.invoiceKinds.length ? input.invoiceKinds : (["distributor"] as InvoiceExportKind[]);
  if (kinds.includes("distributor") && !kinds.includes("client")) {
    docs = docs.filter((d) => d.direction === "in");
  } else if (kinds.includes("client") && !kinds.includes("distributor")) {
    docs = docs.filter((d) => d.direction === "out");
  }
  if (input.periodStart) {
    docs = docs.filter((d) => d.created_at.slice(0, 10) >= input.periodStart!);
  }
  if (input.periodEnd) {
    docs = docs.filter((d) => d.created_at.slice(0, 10) <= input.periodEnd!);
  }
  const names = (input.distributorNames ?? []).map((n) => n.toLowerCase()).filter(Boolean);
  if (names.length) {
    docs = docs.filter((d) => names.includes((d.party_name ?? "").toLowerCase()));
  }
  return docs.sort((a, b) => b.created_at.localeCompare(a.created_at));
}
