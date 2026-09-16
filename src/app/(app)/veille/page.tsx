import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader, PageCard } from "@/components/tarineo/PageHeader";
import { DataTable, TableRow, TableCell } from "@/components/tarineo/DataTable";
import { BrandMark } from "@/components/tarineo/BrandMark";
import { EmptyState } from "@/components/tarineo/EmptyState";
import { BtnPrimary } from "@/components/tarineo/Actions";
import { detecterDerivesSilencieuses } from "@/lib/derivePrix";
import { logoFournisseur } from "@/lib/logosFournisseurs";
import { trouverFournisseurConnu } from "@/lib/fournisseursConnus";

const euros = (v: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(v);
const date = (d: Date) => d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

export default async function VeillePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  let derives: Awaited<ReturnType<typeof detecterDerivesSilencieuses>>;
  try {
    derives = await detecterDerivesSilencieuses(session.user.id);
  } catch {
    return (
      <EmptyState
        title="Veille"
        subtitle="Les hausses trop petites pour déclencher une alerte, mais qui s'accumulent."
        heading="Connexion à la base temporairement indisponible"
        description="Réessayez dans quelques secondes. Si le problème persiste, vérifiez que votre projet Supabase n'est pas en pause."
        primary={{ href: "/accueil", label: "Retour au dashboard" }}
        variant="document"
      />
    );
  }

  if (derives.length === 0) {
    return (
      <EmptyState
        title="Veille"
        subtitle="Les hausses trop petites pour déclencher une alerte, mais qui s'accumulent."
        heading="Aucune dérive détectée"
        description="Tarineo surveille les références que vous rachetez régulièrement chez la même enseigne. Une hausse de 2 % ne déclenche pas d'alerte, mais répétée quatre fois elle vous coûte 8 % de plus. Il faut au moins trois achats d'une même référence chez un même distributeur pour que la détection démarre."
        primary={{ href: "/documents", label: "Importer un document" }}
        secondary={{ href: "/accueil", label: "Retour au dashboard" }}
        variant="document"
      />
    );
  }

  const surcoutTotal = derives.reduce((somme, d) => somme + (d.surcoutAnnuelEstime ?? 0), 0);

  return (
    <div>
      <PageHeader
        title="Veille"
        subtitle="Les hausses passées sous le seuil d'alerte, mais répétées assez souvent pour peser sur votre marge."
        actions={<BtnPrimary href="/documents">Importer un document</BtnPrimary>}
      />

      <PageCard className="mb-5">
        <p className="text-sm text-muted-foreground">
          {derives.length === 1
            ? "1 référence a augmenté par petits pas sur les 12 derniers mois"
            : `${derives.length} références ont augmenté par petits pas sur les 12 derniers mois`}
          {surcoutTotal > 0 ? (
            <>
              {" "}— à volume identique, cela représente{" "}
              <span className="font-semibold text-foreground">{euros(surcoutTotal)}</span> de plus sur une année.
            </>
          ) : (
            "."
          )}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Aucune de ces hausses n&apos;a dépassé 3 % d&apos;un achat à l&apos;autre : prises une par une elles sont
          invisibles, c&apos;est leur répétition qui coûte. Calculé uniquement sur vos propres documents.
        </p>
      </PageCard>

      <PageCard>
        <DataTable
          columns={["Référence", "Enseigne", "Prix d'avant", "Prix actuel", "Dérive", "Achats", "Surcoût annuel"]}
        >
          {derives.map((d) => {
            const connu = trouverFournisseurConnu(d.distributor);
            return (
              <TableRow key={`${d.referenceNorm}|${d.distributorNorm}`}>
                <TableCell>
                  <span className="block font-medium">{d.designation}</span>
                  <span className="block text-xs text-muted-foreground">Réf. {d.reference}</span>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/fournisseurs/${encodeURIComponent(d.distributorNorm)}`}
                    className="inline-flex items-center gap-2.5 hover:text-primary"
                  >
                    <BrandMark nom={connu?.nom ?? d.distributor} logo={logoFournisseur(d.distributor)} size={24} />
                    <span className="truncate">{connu?.nom ?? d.distributor}</span>
                  </Link>
                </TableCell>
                <TableCell>
                  <span className="block">{euros(d.premierPrixHt)}</span>
                  <span className="block text-xs text-muted-foreground">{date(d.premiereDate)}</span>
                </TableCell>
                <TableCell>
                  <span className="block">{euros(d.dernierPrixHt)}</span>
                  <span className="block text-xs text-muted-foreground">{date(d.derniereDate)}</span>
                </TableCell>
                <TableCell className="font-medium text-primary">
                  +{d.ecartPourcent.toFixed(1)}%
                  <span className="block text-xs font-normal text-muted-foreground">
                    +{euros(d.ecartEuros)} l&apos;unité
                  </span>
                </TableCell>
                <TableCell>
                  {d.nombreAchats}
                  <span className="block text-xs text-muted-foreground">
                    max +{d.plusForteHaussePct.toFixed(1)}% d&apos;un coup
                  </span>
                </TableCell>
                <TableCell className="font-medium">
                  {d.surcoutAnnuelEstime !== null ? euros(d.surcoutAnnuelEstime) : "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </DataTable>
      </PageCard>
    </div>
  );
}
