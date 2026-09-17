import { DocumentsPage } from "../documents/page";

export default function BonsDeCommandePage(props: { searchParams: Promise<Record<string, string | undefined>> }) {
  return DocumentsPage({ ...props, typeFixe: "BON_COMMANDE" });
}
