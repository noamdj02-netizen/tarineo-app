import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, PageCard } from "@/components/tarineo/PageHeader";
import { PageTabs } from "@/components/tarineo/PageTabs";
import { DataTable, TableRow, TableCell } from "@/components/tarineo/DataTable";
import { StatusBadge } from "@/components/tarineo/StatusBadge";
import { DEMO_TRANSMISSIONS } from "@/lib/uiDemo";
import { AnalyserSiteEntreprise } from "@/app/(app)/entreprise/AnalyserSiteEntreprise";

export default async function FacturationClientsPage({ searchParams }: { searchParams: Promise<{ onglet?: string }> }) {
  const { onglet = "vue" } = await searchParams;
  const session = await auth();
  let profilComplet = false;
  if (session?.user?.id) {
    try {
      const profil = await prisma.companyProfile.findUnique({
        where: { userId: session.user.id },
        select: { siret: true, raisonSociale: true },
      });
      profilComplet = Boolean(profil?.siret && profil?.raisonSociale);
    } catch {
      profilComplet = false;
    }
  }

  return (
    <div>
      <PageHeader title="Facturation électronique" subtitle="Suivez et gérez vos factures électroniques en toute conformité." />
      <div className="mb-5">
        <PageTabs
          actif={onglet}
          items={[
            { id: "vue", label: "Vue d'ensemble", href: "/facturation-clients" },
            { id: "a-transmettre", label: "Factures à transmettre", href: "/facturation-clients?onglet=a-transmettre" },
            { id: "transmises", label: "Transmises", href: "/facturation-clients?onglet=transmises" },
            { id: "erreurs", label: "Erreurs", href: "/facturation-clients?onglet=erreurs" },
            { id: "parametres", label: "Paramètres", href: "/facturation-clients?onglet=parametres" },
          ]}
        />
      </div>
      {onglet === "vue" && (
        <>
          {!profilComplet && (
            <div className="mb-5">
              <AnalyserSiteEntreprise />
            </div>
          )}
          <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <PageCard>
              <p className="text-sm text-muted-foreground">Statut de conformité</p>
              <p className="mt-3 flex items-center gap-2 text-lg font-semibold">
                <span className="grid size-8 place-items-center rounded-full bg-[#E9F8EE] text-[#1F9D55]">✓</span>
                Conforme
              </p>
              <Link href="/parametres" className="mt-3 inline-block text-sm text-[#3B6AE1]">
                Voir les paramètres
              </Link>
            </PageCard>
            <PageCard>
              <p className="text-sm text-muted-foreground">À transmettre</p>
              <p className="mt-3 text-[28px] font-semibold leading-none">4 factures</p>
              <p className="mt-2 text-sm text-muted-foreground">En attente de dépôt</p>
            </PageCard>
            <PageCard>
              <p className="text-sm text-muted-foreground">Transmises cette semaine</p>
              <p className="mt-3 text-[28px] font-semibold leading-none">12 factures</p>
              <p className="mt-2 text-sm text-[#1F9D55]">Toutes acceptées</p>
            </PageCard>
            <PageCard>
              <p className="text-sm text-muted-foreground">Erreurs</p>
              <p className="mt-3 text-[28px] font-semibold leading-none text-primary">2 factures</p>
              <p className="mt-2 text-sm text-muted-foreground">À corriger</p>
            </PageCard>
          </div>
          <PageCard>
            <h2 className="mb-3 text-base font-semibold">Dernières transmissions</h2>
            <DataTable columns={["N°", "Client", "Statut", "Date de transmission"]}>
              {DEMO_TRANSMISSIONS.map((t) => (
                <TableRow key={t.numero}>
                  <TableCell className="font-medium">{t.numero}</TableCell>
                  <TableCell>{t.client}</TableCell>
                  <TableCell>
                    <StatusBadge statut={t.statut === "Erreur" ? "erreur" : "transmise"} />
                  </TableCell>
                  <TableCell>{t.date}</TableCell>
                </TableRow>
              ))}
            </DataTable>
          </PageCard>
        </>
      )}
      {onglet === "parametres" && (
        <div className="space-y-5">
          <AnalyserSiteEntreprise />
          <PageCard>
            <p className="text-sm text-muted-foreground">
              Pour modifier en détail le profil repris sur vos devis et factures, ouvrez{" "}
              <Link href="/parametres" className="font-medium text-primary underline-offset-2 hover:underline">
                Paramètres → Profil entreprise
              </Link>
              .
            </p>
          </PageCard>
        </div>
      )}
      {onglet !== "vue" && onglet !== "parametres" && (
        <PageCard>
          <p className="text-sm text-muted-foreground">Aucun élément dans cet onglet pour le moment.</p>
        </PageCard>
      )}
    </div>
  );
}
