import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AccueilErreur() {
  return (
    <section className="rounded-[24px] border border-amber-200 bg-amber-50 p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-amber-950">Tableau de bord temporairement indisponible</h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-amber-900">
        La connexion à la base de données a échoué ou le chargement a été interrompu. Réessayez dans quelques secondes
        — si vous venez de redémarrer le serveur de dev, rechargez la page avec un rafraîchissement complet (Cmd+Shift+R).
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button render={<Link href="/accueil" />} className="rounded-full">
          Réessayer
        </Button>
        <Button variant="outline" render={<Link href="/documents" />} className="rounded-full">
          Importer un document
        </Button>
      </div>
    </section>
  );
}
