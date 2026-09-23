import Link from "next/link";
import { redirect } from "next/navigation";
import { FolderArchiveIcon } from "lucide-react";
import { getSession, idDonneesUtilisateur } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, PageCard } from "@/components/tarineo/PageHeader";
import { MobilePageHeader } from "@/components/tarineo/mobile/MobilePageHeader";
import { LABELS_TYPE } from "@/lib/documentLabels";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ImportDocument } from "../documents/ImportDocument";

function cleMois(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function labelMois(cle: string): string {
  const [annee, mois] = cle.split("-").map(Number);
  const d = new Date(Date.UTC(annee, mois - 1, 1));
  return d.toLocaleDateString("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" });
}

export default async function CoffrePage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/connexion");

  const donneesUserId = await idDonneesUtilisateur(session.user.id);
  const documents = await prisma.document.findMany({
    where: { userId: donneesUserId },
    orderBy: [{ documentDate: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
    select: {
      id: true,
      type: true,
      distributor: true,
      documentDate: true,
      createdAt: true,
      totalTtc: true,
      status: true,
    },
  });

  const parMois = new Map<string, typeof documents>();
  for (const doc of documents) {
    const date = doc.documentDate ?? doc.createdAt;
    const cle = cleMois(date);
    const liste = parMois.get(cle) ?? [];
    liste.push(doc);
    parMois.set(cle, liste);
  }

  const moisTries = [...parMois.keys()].sort((a, b) => b.localeCompare(a));

  return (
    <div>
      <MobilePageHeader title="Mon coffre" subtitle="Archives par mois" backHref="/plus" />
      <div className="mb-4 lg:hidden">
        <ImportDocument label="Ajouter un document" className="w-full justify-center rounded-full" />
      </div>
      <div className="hidden lg:block">
        <PageHeader
          title="Mon coffre"
          subtitle="Tous vos documents classés par mois — devis, factures et bons d'achat."
          actions={<ImportDocument label="Ajouter un document" />}
        />
      </div>

      {documents.length === 0 ? (
        <PageCard>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderArchiveIcon />
              </EmptyMedia>
              <EmptyTitle>Votre coffre est vide</EmptyTitle>
              <EmptyDescription>
                Importez vos premiers documents pour les retrouver ici, classés par mois.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </PageCard>
      ) : (
        <div className="space-y-6">
          {moisTries.map((cle) => {
            const docs = parMois.get(cle) ?? [];
            const totalTtc = docs.reduce((s, d) => s + Number(d.totalTtc ?? 0), 0);
            return (
              <PageCard key={cle}>
                <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-lg font-semibold capitalize">{labelMois(cle)}</h2>
                  <p className="text-sm text-muted-foreground">
                    {docs.length} document{docs.length > 1 ? "s" : ""}
                    {totalTtc > 0 &&
                      ` · ${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(totalTtc)} TTC`}
                  </p>
                </div>
                <ul className="divide-y divide-border">
                  {docs.map((doc) => (
                    <li key={doc.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                      <Link href={`/documents/${doc.id}`} className="min-w-0 font-medium hover:text-primary">
                        {LABELS_TYPE[doc.type]} {doc.distributor ? `· ${doc.distributor}` : ""}
                      </Link>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <span>{(doc.documentDate ?? doc.createdAt).toLocaleDateString("fr-FR")}</span>
                        <Link
                          href={`/api/documents/${doc.id}/fichier`}
                          className="text-primary hover:underline"
                          prefetch={false}
                        >
                          Télécharger
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </PageCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
