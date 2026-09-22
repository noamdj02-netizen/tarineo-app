import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  calculerStatsDevis,
  filtrerDevis,
  formaterDateDevis,
  formaterMontantDevis,
  listerDevisUtilisateur,
} from "@/lib/devisClients";
import { PageHeader, PageCard } from "@/components/tarineo/PageHeader";
import { MobilePageHeader } from "@/components/tarineo/mobile/MobilePageHeader";
import { MobileMenuRow } from "@/components/tarineo/mobile/MobileMenuRow";
import { DataTable, TableRow, TableCell } from "@/components/tarineo/DataTable";
import { EmptyState } from "@/components/tarineo/EmptyState";
import { BtnPrimary } from "@/components/tarineo/Actions";
import { IconPlus } from "@/components/tarineo/NavIcons";
import { StatusBadge } from "@/components/tarineo/StatusBadge";
import { CarteResumeMotion, GrilleStatsMotion } from "@/components/tarineo/motion/GrilleStatsMotion";
import { RechercheDevis } from "./RechercheDevis";

export default async function DevisClientsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const { q = "" } = await searchParams;
  const tousLesDevis = await listerDevisUtilisateur(session.user.id);

  if (tousLesDevis.length === 0) {
    return (
      <div>
        <MobilePageHeader title="Devis clients" subtitle="Créer, modifier, transformer" />
        <div className="flex flex-col gap-3 lg:hidden">
          <MobileMenuRow href="/devis-clients/nouveau" title="Nouveau devis" description="Manuel ou assisté par IA" />
          <p className="px-1 text-center text-sm text-muted-foreground">
            Aucun devis pour le moment — commencez par en créer un.
          </p>
        </div>
        <div className="hidden lg:block">
          <EmptyState
            title="Devis clients"
            subtitle="Créez et gérez vos devis pour vos clients."
            heading="Aucun devis pour le moment"
            description="Créez votre premier devis (manuel ou assisté par IA) pour envoyer une proposition à votre client."
            primary={{ href: "/devis-clients/nouveau", label: "+ Créer votre premier devis" }}
            secondary={{ href: "/documents", label: "D'abord importer un devis fournisseur" }}
            variant="document"
          />
        </div>
      </div>
    );
  }

  const stats = calculerStatsDevis(tousLesDevis);
  const devis = filtrerDevis(tousLesDevis, q);

  return (
    <div>
      <MobilePageHeader title="Devis clients" subtitle="Créer, modifier, transformer" />
      <div className="mb-4 lg:hidden">
        <BtnPrimary href="/devis-clients/nouveau" className="w-full justify-center rounded-full">
          <IconPlus /> Nouveau devis
        </BtnPrimary>
      </div>
      <div className="hidden lg:block">
        <PageHeader
          title="Devis clients"
          subtitle="Propositions envoyées à vos clients — distinctes des devis fournisseurs."
          actions={
            <BtnPrimary href="/devis-clients/nouveau">
              <IconPlus /> Nouveau devis
            </BtnPrimary>
          }
        />
      </div>

      <div className="mb-4 flex flex-col gap-2 lg:hidden">
        {devis.slice(0, 20).map((d) => (
          <MobileMenuRow
            key={d.id}
            href={`/devis-clients/${d.id}`}
            title={d.clientNom}
            description={`${d.numero} · ${formaterMontantDevis(d.montantHt)}`}
          />
        ))}
      </div>

      <GrilleStatsMotion className="mb-5 hidden gap-3 sm:grid-cols-2 xl:grid-cols-4 lg:grid">
        <CarteResumeMotion label="Devis" valeur={String(stats.total)} />
        <CarteResumeMotion label="En cours" valeur={String(stats.enCours)} hint={`${stats.expires} expiré${stats.expires > 1 ? "s" : ""}`} />
        <CarteResumeMotion label="Transformés" valeur={String(stats.acceptes)} hint={`${stats.tauxTransformation} % du total`} />
        <CarteResumeMotion label="Montant total HT" valeur={formaterMontantDevis(stats.totalHt)} />
      </GrilleStatsMotion>

      <div className="mb-4 hidden lg:block">
        <Suspense fallback={null}>
          <RechercheDevis valeurInitiale={q} />
        </Suspense>
      </div>

      <div className="hidden lg:block">
      <PageCard>
        {devis.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Aucun devis ne correspond à « {q} ».</p>
        ) : (
          <DataTable columns={["N° de devis", "Client", "Montant HT", "Statut", "Émission"]}>
            {devis.map((d) => (
              <TableRow key={d.id}>
                <TableCell>
                  <Link href={`/devis-clients/${d.id}`} className="font-medium hover:text-primary">
                    {d.numero}
                  </Link>
                </TableCell>
                <TableCell>{d.clientNom}</TableCell>
                <TableCell>{formaterMontantDevis(d.montantHt)}</TableCell>
                <TableCell>
                  <StatusBadge statut={d.statut} />
                </TableCell>
                <TableCell className="text-muted-foreground">{formaterDateDevis(d.dateEmission)}</TableCell>
              </TableRow>
            ))}
          </DataTable>
        )}
      </PageCard>
      </div>
    </div>
  );
}
