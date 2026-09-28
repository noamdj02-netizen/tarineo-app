import { Suspense } from "react";
import { DevisAnalyserHub } from "@/components/metier/devis-analyser-hub";
import { listChantiers, listParties } from "@/lib/metier/queries";

export const metadata = { title: "Créer un devis" };

export default async function DevisAnalyserPage() {
  const [chantiers, clients] = await Promise.all([listChantiers(), listParties("client")]);
  return (
    <Suspense fallback={<div className="text-[14px] text-muted-foreground">Chargement…</div>}>
      <DevisAnalyserHub chantiers={chantiers} clients={clients} />
    </Suspense>
  );
}
