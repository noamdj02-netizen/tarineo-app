import Link from "next/link";
import { PageHeader, PageCard, SearchField } from "@/components/tarineo/PageHeader";
import { DataTable, TableRow, TableCell, RowActions } from "@/components/tarineo/DataTable";
import { BrandMark } from "@/components/tarineo/BrandMark";
import { BtnGhost, BtnPrimary } from "@/components/tarineo/Actions";
import { IconFilter } from "@/components/tarineo/NavIcons";
import { DEMO_FOURNISSEURS } from "@/lib/uiDemo";

export default function FournisseursPage() {
  return (
    <div>
      <PageHeader
        title="Fournisseurs"
        subtitle="Suivez vos fournisseurs et l'évolution des tarifs."
        actions={
          <>
            <BtnGhost>
              <IconFilter /> Filtrer
            </BtnGhost>
            <BtnPrimary href="/documents">Rechercher l&apos;historique</BtnPrimary>
          </>
        }
      />
      <PageCard>
        <SearchField placeholder="Rechercher un fournisseur..." className="mb-4" />
        <DataTable columns={["Nom", "Contact", "Ville", "Produits suivis", "Évolution", "Dernier imp.", "Actions"]}>
          {DEMO_FOURNISSEURS.map((f) => (
            <TableRow key={f.id}>
              <TableCell>
                <Link href={`/fournisseurs/${f.id}`} className="inline-flex items-center gap-2.5 font-medium hover:text-primary">
                  <BrandMark nom={f.nom} logo={f.logo} size={28} />
                  {f.nom}
                </Link>
              </TableCell>
              <TableCell>{f.contact}</TableCell>
              <TableCell>{f.ville}</TableCell>
              <TableCell>{f.produits}</TableCell>
              <TableCell className={f.evolution.startsWith("-") ? "text-[#1F9D55]" : "text-primary"}>{f.evolution}</TableCell>
              <TableCell>{f.dernier}</TableCell>
              <TableCell>
                <RowActions />
              </TableCell>
            </TableRow>
          ))}
        </DataTable>
      </PageCard>
    </div>
  );
}
