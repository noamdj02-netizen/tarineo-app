import { redirect } from "next/navigation";
import { pieceListHref } from "@/lib/routes";

export default async function DistributeurHub({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; chantier?: string; party?: string }>;
}) {
  const q = await searchParams;
  const dest = pieceListHref("in", q.kind ?? "devis");
  const p = new URLSearchParams();
  if (q.chantier) p.set("chantier", q.chantier);
  if (q.party) p.set("party", q.party);
  redirect(p.size ? `${dest}?${p}` : dest);
}
