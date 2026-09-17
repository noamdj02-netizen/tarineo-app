import { DocumentsPage } from "../page";

export default function FacturesFournisseursPage(props: { searchParams: Promise<Record<string, string | undefined>> }) {
  return DocumentsPage({ ...props, typeFixe: "FACTURE" });
}
