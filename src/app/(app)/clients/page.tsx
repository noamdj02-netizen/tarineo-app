import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { agregerClientsUtilisateur, filtrerClients, hrefClient } from "@/lib/clients";
import { PageHeader, PageCard } from "@/components/tarineo/PageHeader";
import { MobilePageHeader } from "@/components/tarineo/mobile/MobilePageHeader";
import { EmptyState } from "@/components/tarineo/EmptyState";
import { MobileEmptyState } from "@/components/tarineo/mobile/MobileEmptyState";
import { BtnPrimary } from "@/components/tarineo/Actions";
import { DataTable, RowActions, TableCell, TableRow } from "@/components/tarineo/DataTable";
import { IconPlus } from "@/components/tarineo/NavIcons";
import { RechercheClients } from "./RechercheClients";
import { CarteResumeMotion, GrilleStatsMotion } from "@/components/tarineo/motion/GrilleStatsMotion";

const formaterEuros = (valeur: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(valeur);

const formaterDate = (date: Date | null) => {
  if (!date) return "—";
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
};

function AvatarClient({ nom }: { nom: string }) {
  const initiale = nom.replace(/[^A-Za-zÀ-ÿ0-9]/g, "").charAt(0).toUpperCase() || "?";
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#FFF0E8] text-sm font-bold text-primary">
      {initiale}
    </div>
  );
}

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const { q = "" } = await searchParams;
  const tousLesClients = await agregerClientsUtilisateur(session.user.id);

  if (tousLesClients.length === 0) {
    return (
      <div>
        <MobilePageHeader title="Clients" subtitle="Carnet regroupé" />
        <div className="lg:hidden">
          <MobileEmptyState
            title="Aucun client pour le moment"
            description="Créez un devis client : le nom apparaît ici automatiquement. Aucun client n’est inventé."
            primary={{ type: "link", href: "/devis-clients/nouveau", label: "Créer un devis client" }}
            secondary={{ type: "link", href: "/devis-clients", label: "Voir mes devis" }}
          />
        </div>
        <div className="hidden lg:block">
          <EmptyState
            title="Clients"
            subtitle="Tarinéo crée vos fiches à partir de vos devis et factures."
            heading="Aucun client pour le moment"
            description="Créez un devis client : le nom apparaît ici automatiquement. Aucun client n'est inventé."
            primary={{ href: "/devis-clients/nouveau", label: "+ Créer un devis client" }}
            secondary={{ href: "/devis-clients", label: "Voir mes devis" }}
            variant="user"
          />
        </div>
      </div>
    );
  }

  const clients = filtrerClients(tousLesClients, q);
  const totalFacture = tousLesClients.reduce((s, c) => s + c.totalFactureHt, 0);
  const totalDevis = tousLesClients.reduce((s, c) => s + c.devis, 0);
  const totalFactures = tousLesClients.reduce((s, c) => s + c.factures, 0);

  return (
    <div>
      <MobilePageHeader title="Clients" subtitle="Carnet regroupé" />
      <div className="mb-4 lg:hidden">
        <BtnPrimary href="/devis-clients/nouveau" className="w-full justify-center rounded-full">
          <IconPlus /> Nouveau devis
        </BtnPrimary>
      </div>
      <div className="hidden lg:block">
        <PageHeader
          title="Clients"
          subtitle="Carnet alimenté par vos devis et factures — jamais inventé, toujours à jour."
          actions={
            <BtnPrimary href="/devis-clients/nouveau">
              <IconPlus /> Nouveau devis
            </BtnPrimary>
          }
        />
      </div>

      <GrilleStatsMotion className="mb-5 hidden gap-3 sm:grid-cols-2 xl:grid-cols-4 lg:grid">
        <CarteResumeMotion label="Clients" valeur={String(tousLesClients.length)} />
        <CarteResumeMotion label="Devis émis" valeur={String(totalDevis)} />
        <CarteResumeMotion label="Factures émises" valeur={String(totalFactures)} />
        <CarteResumeMotion label="Facturé (HT)" valeur={formaterEuros(totalFacture)} />
      </GrilleStatsMotion>

      <div className="mb-4 lg:hidden">
        <Suspense fallback={null}>
          <RechercheClients valeurInitiale={q} />
        </Suspense>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-[20px] bg-secondary px-4 py-10 text-center lg:hidden">
          <p className="font-medium text-foreground">Aucun client ne correspond.</p>
          <p className="mt-2 text-sm text-muted-foreground">Essayez un autre nom, SIRET ou e-mail.</p>
        </div>
      ) : (
        <div className="mb-4 flex flex-col gap-2.5 lg:hidden">
          {clients.map((c) => (
            <Link
              key={c.cle}
              href={hrefClient(c.nom)}
              className="flex min-h-[64px] items-center gap-3 rounded-[20px] bg-white px-4 py-3.5 shadow-[0_4px_14px_rgba(15,28,40,0.04)] ring-1 ring-foreground/8 active:bg-muted/40"
            >
              <AvatarClient nom={c.nom} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-[#0f1c28]">{c.nom}</p>
                <p className="text-[12px] text-[#8a96a3]">
                  {c.devis} devis · {c.factures} facture{c.factures > 1 ? "s" : ""}
                </p>
              </div>
              <p className="shrink-0 text-[14px] font-semibold text-[#0f1c28]">
                {c.totalFactureHt > 0 ? formaterEuros(c.totalFactureHt) : "—"}
              </p>
            </Link>
          ))}
        </div>
      )}

      <PageCard className="hidden lg:block">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Suspense fallback={null}>
            <RechercheClients valeurInitiale={q} />
          </Suspense>
          <p className="text-sm text-muted-foreground">
            {clients.length} client{clients.length > 1 ? "s" : ""}
            {q.trim() ? ` pour « ${q.trim()} »` : ""}
          </p>
        </div>

        {clients.length === 0 ? (
          <div className="rounded-[20px] bg-secondary px-4 py-10 text-center">
            <p className="font-medium text-foreground">Aucun client ne correspond à votre recherche.</p>
            <p className="mt-2 text-sm text-muted-foreground">Essayez un autre nom, SIRET ou e-mail.</p>
          </div>
        ) : (
          <DataTable columns={["Client", "SIRET", "Devis", "Factures", "Facturé HT", "Dernière activité", ""]}>
            {clients.map((c) => (
              <TableRow key={c.cle}>
                <TableCell>
                  <Link href={hrefClient(c.nom)} className="flex items-center gap-3 hover:opacity-90">
                    <AvatarClient nom={c.nom} />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{c.nom}</p>
                      {c.email && <p className="truncate text-xs text-muted-foreground">{c.email}</p>}
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{c.siret ?? "—"}</TableCell>
                <TableCell>{c.devis}</TableCell>
                <TableCell>{c.factures}</TableCell>
                <TableCell className="font-medium">{c.totalFactureHt > 0 ? formaterEuros(c.totalFactureHt) : "—"}</TableCell>
                <TableCell className="text-muted-foreground">{formaterDate(c.derniereActivite)}</TableCell>
                <TableCell>
                  <RowActions href={hrefClient(c.nom)} label="Ouvrir" />
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
        )}
      </PageCard>
    </div>
  );
}
