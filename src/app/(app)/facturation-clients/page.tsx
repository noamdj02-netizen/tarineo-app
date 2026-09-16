import Link from "next/link";
import { PageHeader, PageCard } from "@/components/tarineo/PageHeader";
import { BtnPrimary } from "@/components/tarineo/Actions";

/**
 * La facturation électronique (Chorus Pro / PDP) n'est pas encore branchée.
 * On affiche un état honnête plutôt que des chiffres démo.
 */
export default function FacturationClientsPage() {
  return (
    <div>
      <PageHeader
        title="Facturation électronique"
        subtitle="Conformité et transmission automatisée — bientôt disponible."
        actions={<BtnPrimary href="/factures-clients">Voir mes factures clients</BtnPrimary>}
      />
      <PageCard>
        <h2 className="text-lg font-semibold text-foreground">Bientôt disponible</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          La transmission électronique (réforme 2026) arrivera dans une prochaine version. Pour l&apos;instant, créez
          vos devis clients, transformez-les en facture PDF, et protégez votre marge en important vos devis
          fournisseurs.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/devis-clients/nouveau" className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white">
            Créer un devis client
          </Link>
          <Link
            href="/documents"
            className="rounded-full border border-border bg-white px-5 py-2.5 text-sm font-medium hover:bg-secondary"
          >
            Importer un devis fournisseur
          </Link>
        </div>
      </PageCard>
    </div>
  );
}
