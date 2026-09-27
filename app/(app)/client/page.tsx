import { redirect } from "next/navigation";
import { pieceListHref } from "@/lib/routes";

export default async function ClientHub({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; chantier?: string }>;
}) {
  const q = await searchParams;
  const dest = pieceListHref("out", q.kind ?? "devis");
  const p = new URLSearchParams();
  if (q.chantier) p.set("chantier", q.chantier);
  redirect(p.size ? `${dest}?${p}` : dest);
}
