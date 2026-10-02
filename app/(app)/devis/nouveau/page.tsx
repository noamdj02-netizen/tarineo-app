import { Suspense } from "react";
import { DevisNouveauHub } from "@/components/metier/devis-nouveau-hub";
import { listChantiers, listParties } from "@/lib/metier/queries";

export const metadata = { title: "Nouveau devis" };

export default async function DevisNouveauPage() {
  const [chantiers, clients] = await Promise.all([listChantiers(), listParties("client")]);
  return (
    <Suspense fallback={<div className="text-[14px] text-muted-foreground">Chargement…</div>}>
      <DevisNouveauHub chantiers={chantiers} clients={clients} />
    </Suspense>
  );
}
