import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader, PageCard } from "@/components/tarineo/PageHeader";
import { DataTable, TableRow, TableCell, RowActions } from "@/components/tarineo/DataTable";
import { BrandMark } from "@/components/tarineo/BrandMark";
import { BtnPrimary } from "@/components/tarineo/Actions";
import { construireBibliothequeComplete } from "@/lib/fournisseursPage";
import { BibliothequeFournisseurs } from "./BibliothequeFournisseurs";

const formaterEuros = (v: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);

const formaterDate = (d: Date | null) =>
  d ? d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "—";

export default async function FournisseursPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const bibliotheque = await construireBibliothequeComplete(session.user.id);
  const importes = bibliotheque.filter((f) => f.importe);

  return (
    <div>
      <PageHeader
        title="Bibliothèque fournisseurs"
        subtitle={`${bibliotheque.length} enseignes du bâtiment référencées — ${importes.length} déjà suivie${importes.length > 1 ? "s" : ""} dans vos imports.`}
        actions={<BtnPrimary href="/documents">Importer un document</BtnPrimary>}
      />
      <BibliothequeFournisseurs fournisseurs={bibliotheque} />

      {importes.length > 0 && (
        <PageCard>
          <h2 className="mb-4 text-base font-semibold text-foreground">Vos enseignes importées</h2>
          <DataTable
            columns={["Enseigne", "Dépenses période", "Documents", "Hausses", "Objectif BFA", "Dernier import", "Actions"]}
          >
            {importes.map((f) => (
              <TableRow key={f.slug}>
                <TableCell>
                  <Link
                    href={`/fournisseurs/${encodeURIComponent(f.slug)}`}
                    className="inline-flex items-center gap-2.5 font-medium hover:text-primary"
                  >
                    <BrandMark nom={f.nom} logo={f.logo} size={28} />
                    <span className="min-w-0">
                      <span className="block truncate">{f.nom}</span>
                      {f.groupe && (
                        <span className="block text-xs font-normal text-muted-foreground">Groupe {f.groupe}</span>
                      )}
                    </span>
                  </Link>
                </TableCell>
                <TableCell>{formaterEuros(f.depenses)}</TableCell>
                <TableCell>{f.documents}</TableCell>
                <TableCell className={f.hausses > 0 ? "font-medium text-primary" : ""}>{f.hausses}</TableCell>
                <TableCell>{f.pourcentageBfa !== null ? `${Math.round(f.pourcentageBfa)}%` : "—"}</TableCell>
                <TableCell>{formaterDate(f.dernierImport)}</TableCell>
                <TableCell>
                  <RowActions href={`/fournisseurs/${encodeURIComponent(f.slug)}`} />
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
        </PageCard>
      )}
    </div>
  );
}
