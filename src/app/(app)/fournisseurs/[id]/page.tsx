import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageCard, PageHeader } from "@/components/tarineo/PageHeader";
import { PageTabs } from "@/components/tarineo/PageTabs";
import { DataTable, TableRow, TableCell } from "@/components/tarineo/DataTable";
import { BrandMark } from "@/components/tarineo/BrandMark";
import { BtnGhost, BtnPrimary } from "@/components/tarineo/Actions";
import { LABELS_TYPE } from "@/lib/documentLabels";
import { calculerDepensesParDistributeur } from "@/lib/depenses";
import { ficheFournisseur } from "@/lib/fichesFournisseurs";
import { trouverFournisseurParSlug } from "@/lib/fournisseursConnus";
import { listerFournisseursUtilisateur, trouverFournisseurImporte } from "@/lib/fournisseursPage";
import { ObjectifDistributeur } from "../../depenses/ObjectifDistributeur";

const formaterEuros = (v: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(v);

export default async function FournisseurDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ onglet?: string }>;
}) {
  const { id } = await params;
  const slug = decodeURIComponent(id);
  const { onglet = "vue" } = await searchParams;

  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");
  const userId = session.user.id;

  const connu = trouverFournisseurParSlug(slug);
  if (!connu) notFound();

  const fiche = ficheFournisseur(connu);

  const [importes, depenses] = await Promise.all([
    listerFournisseursUtilisateur(userId),
    calculerDepensesParDistributeur(userId),
  ]);
  const donnees = trouverFournisseurImporte(importes, slug);
  const importe = donnees !== null;
  const depensesFournisseur = importe
    ? depenses.find((d) => d.distributorNorm === donnees!.distributorNorm)
    : null;
  const distributorNorm = donnees?.distributorNorm ?? slug;
  const nom = connu.nom;
  const logo = connu.logo ?? null;

  const documents = importe
    ? await prisma.document.findMany({
        where: { userId, distributorNorm: donnees!.distributorNorm, status: "VALIDATED" },
        orderBy: [{ documentDate: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
        take: 20,
        select: { id: true, type: true, documentDate: true, totalHt: true },
      })
    : [];

  const referencesPerso = importe
    ? await prisma.priceHistory.findMany({
        where: { userId, distributorNorm: donnees!.distributorNorm },
        orderBy: { documentDate: "desc" },
        take: 8,
        select: { referenceNorm: true, unitPriceHt: true, documentDate: true },
      })
    : [];

  const urlBase = `/fournisseurs/${encodeURIComponent(slug)}`;

  return (
    <div>
      <PageHeader
        backHref="/fournisseurs"
        title={
          <span className="flex items-center gap-3">
            <BrandMark nom={nom} logo={logo} size={48} rounded="xl" />
            <span>{nom}</span>
          </span>
        }
        subtitle={[connu.specialite, connu.groupe ? `Groupe ${connu.groupe}` : null].filter(Boolean).join(" · ")}
        actions={
          importe ? (
            <>
              <BtnGhost href={`/documents?distributeur=${encodeURIComponent(distributorNorm)}`}>Tous les documents</BtnGhost>
              <BtnPrimary href={`/documents?distributeur=${encodeURIComponent(distributorNorm)}`}>Importer</BtnPrimary>
            </>
          ) : (
            <BtnPrimary href="/documents">Importer un premier document</BtnPrimary>
          )
        }
      />

      <div className="mb-5">
        <PageTabs
          actif={onglet}
          items={[
            { id: "vue", label: "Vue d'ensemble", href: urlBase },
            ...(importe
              ? [
                  {
                    id: "documents",
                    label: `Documents (${documents.length})`,
                    href: `${urlBase}?onglet=documents`,
                  },
                ]
              : []),
          ]}
        />
      </div>

      {onglet === "documents" && importe ? (
        <PageCard>
          <DataTable columns={["Type", "Date", "Montant HT", ""]}>
            {documents.map((d) => (
              <TableRow key={d.id}>
                <TableCell>{LABELS_TYPE[d.type] ?? d.type}</TableCell>
                <TableCell>
                  {d.documentDate
                    ? d.documentDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
                    : "—"}
                </TableCell>
                <TableCell>{d.totalHt !== null ? formaterEuros(Number(d.totalHt)) : "—"}</TableCell>
                <TableCell>
                  <Link href={`/documents/${d.id}`} className="text-sm text-primary hover:underline">Ouvrir</Link>
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
        </PageCard>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="flex flex-col gap-4 lg:col-span-2">
            {importe && donnees && (
              <PageCard>
                <h2 className="mb-4 text-base font-semibold">Vos achats chez {nom}</h2>
                <dl className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-[16px] bg-[#F8F8F8] p-4">
                    <dt className="text-xs text-muted-foreground">Dépenses période</dt>
                    <dd className="mt-1 text-2xl font-semibold text-foreground">{formaterEuros(donnees.depenses)}</dd>
                  </div>
                  <div className="rounded-[16px] bg-[#F8F8F8] p-4">
                    <dt className="text-xs text-muted-foreground">Documents validés</dt>
                    <dd className="mt-1 text-2xl font-semibold text-foreground">{documents.length}</dd>
                  </div>
                  <div className="rounded-[16px] bg-[#F8F8F8] p-4">
                    <dt className="text-xs text-muted-foreground">Alertes hausse</dt>
                    <dd className="mt-1 text-2xl font-semibold text-primary">{donnees.hausses}</dd>
                  </div>
                </dl>
                {referencesPerso.length > 0 && (
                  <div className="mt-5">
                    <h3 className="text-sm font-semibold text-foreground">Derniers prix que vous avez payés</h3>
                    <ul className="mt-2 space-y-2">
                      {referencesPerso.map((r, i) => (
                        <li
                          key={`${r.referenceNorm}-${i}`}
                          className="flex flex-wrap items-baseline justify-between gap-2 rounded-[12px] border border-[#F0F1F1] px-3 py-2 text-sm"
                        >
                          <span className="font-medium text-foreground">{r.referenceNorm}</span>
                          <span className="text-muted-foreground">
                            {formaterEuros(Number(r.unitPriceHt))} HT ·{" "}
                            {r.documentDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </PageCard>
            )}

            <PageCard>
              <h2 className="mb-3 text-base font-semibold">À propos de {nom}</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {fiche.avantages.map((a) => (
                  <li key={a} className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-[12px] bg-[#F8F8F8] p-3">
                  <dt className="text-xs text-muted-foreground">Livraison</dt>
                  <dd className="mt-1 text-foreground">{fiche.livraison}</dd>
                </div>
                <div className="rounded-[12px] bg-[#F8F8F8] p-3">
                  <dt className="text-xs text-muted-foreground">BFA / remise annuelle</dt>
                  <dd className="mt-1 text-foreground">{fiche.bfa}</dd>
                </div>
              </dl>
              <a
                href={fiche.siteWeb}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
              >
                Site officiel {nom} →
              </a>
            </PageCard>

            <PageCard className="border border-[#E6E9EB] bg-[#FAFBFC]">
              <h2 className="text-base font-semibold text-foreground">Promos en cours</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Tarineo ne scrape pas les sites fournisseurs. Les promos de {nom} apparaîtront ici quand vous
                transférerez vos newsletters enseigne (agent fournisseur — bientôt), ou dès qu&apos;une promo est
                détectée dans un devis que vous importez.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/veille" className="rounded-full bg-[#FFF0E8] px-4 py-2 text-sm font-medium text-primary">
                  Veille &amp; dérives silencieuses
                </Link>
                <Link
                  href="/documents"
                  className="rounded-full border border-[#E6E9EB] bg-white px-4 py-2 text-sm text-foreground hover:bg-[#F8F8F8]"
                >
                  Importer un devis {nom}
                </Link>
              </div>
            </PageCard>
          </div>

          <PageCard>
            <h2 className="mb-4 text-base font-semibold">Objectif BFA</h2>
            {importe && depensesFournisseur && depensesFournisseur.objectif !== null ? (
              <ObjectifDistributeur
                distributor={nom}
                distributorNorm={depensesFournisseur.distributorNorm}
                depenses={depensesFournisseur.depenses}
                objectif={depensesFournisseur.objectif}
                pourcentageAtteinte={depensesFournisseur.pourcentageAtteinte}
                encoursRestant={depensesFournisseur.encoursRestant}
                periodStartMonth={depensesFournisseur.periodStartMonth}
                periodStartDay={depensesFournisseur.periodStartDay}
                periodeLabel={`Période à partir du ${depensesFournisseur.periodStartDay}/${depensesFournisseur.periodStartMonth}`}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {importe
                  ? `Aucun objectif annuel défini pour ${nom}. `
                  : `Importez des factures chez ${nom} pour suivre un objectif BFA. `}
                <Link href="/accueil#objectifs" className="text-primary hover:underline">Configurer sur le dashboard</Link>.
              </p>
            )}
          </PageCard>
        </div>
      )}
    </div>
  );
}
