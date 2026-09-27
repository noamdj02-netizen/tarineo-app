import type { DocumentCard } from "@/lib/metier/types";

function norm(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function totalBuy(doc: DocumentCard) {
  return doc.lines.reduce((s, l) => s + Number(l.buy_price) * Number(l.qty), 0);
}

function matchLabel(a: string, b: string) {
  const na = norm(a);
  const nb = norm(b);
  if (!na || !nb) return false;
  return na === nb || na.includes(nb) || nb.includes(na);
}

export function compareQuotes(a: DocumentCard, b: DocumentCard) {
  const usedB = new Set<string>();
  const rows: { label: string; priceA: number | null; priceB: number | null; flag: "ok" | "ecart" | "seul" }[] = [];

  for (const la of a.lines) {
    const hit = b.lines.find((lb) => !usedB.has(lb.id) && matchLabel(la.label, lb.label));
    if (hit) {
      usedB.add(hit.id);
      const pa = Number(hit.buy_price) ? Number(la.buy_price) : Number(la.buy_price);
      const pb = Number(hit.buy_price);
      const lo = Math.min(pa, pb);
      const hi = Math.max(pa, pb);
      const flag = lo > 0 && (hi - lo) / lo >= 0.2 ? "ecart" : "ok";
      rows.push({ label: la.label, priceA: pa, priceB: pb, flag });
    } else {
      rows.push({ label: la.label, priceA: Number(la.buy_price), priceB: null, flag: "seul" });
    }
  }
  for (const lb of b.lines) {
    if (usedB.has(lb.id)) continue;
    rows.push({ label: lb.label, priceA: null, priceB: Number(lb.buy_price), flag: "seul" });
  }

  const totalA = totalBuy(a);
  const totalB = totalBuy(b);
  const winner = Math.abs(totalA - totalB) < 1 ? "tie" : totalA < totalB ? "a" : "b";
  const onlyA = rows.filter((r) => r.priceB == null).length;
  const onlyB = rows.filter((r) => r.priceA == null).length;
  const gaps = rows.filter((r) => r.flag === "ecart").length;
  const nameA = a.party_name || a.title;
  const nameB = b.party_name || b.title;
  const cheaper = winner === "a" ? nameA : winner === "b" ? nameB : "À égalité";
  const safer =
    onlyA === onlyB
      ? "Couverture comparable"
      : onlyA < onlyB
        ? `${nameA} liste plus d’articles communs (moins d’oublis)`
        : `${nameB} liste plus d’articles communs (moins d’oublis)`;
  const note =
    winner === "tie"
      ? `Totaux proches. ${safer}.${gaps ? ` ${gaps} écart${gaps > 1 ? "s" : ""} > 20 % à vérifier.` : ""}`
      : `${cheaper} est moins cher au total (${Math.round(Math.abs(totalA - totalB))} € d’écart). ${safer}.${gaps ? ` ${gaps} ligne${gaps > 1 ? "s" : ""} avec un écart fort : à recouper avant de commander.` : ""}`;

  return { totalA, totalB, winner, rows, onlyA, onlyB, gaps, note, nameA, nameB };
}
