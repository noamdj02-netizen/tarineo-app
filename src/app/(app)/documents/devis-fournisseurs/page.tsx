import { DocumentsPage } from "../page";

export default function DevisFournisseursPage(props: { searchParams: Promise<Record<string, string | undefined>> }) {
  return DocumentsPage({ ...props, typeFixe: "DEVIS" });
}
