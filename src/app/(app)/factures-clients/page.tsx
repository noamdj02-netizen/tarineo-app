import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, PageCard } from "@/components/tarineo/PageHeader";
import { MobilePageHeader } from "@/components/tarineo/mobile/MobilePageHeader";
import { DataTable, TableRow, TableCell } from "@/components/tarineo/DataTable";
import { EmptyState } from "@/components/tarineo/EmptyState";
import { MobileEmptyState } from "@/components/tarineo/mobile/MobileEmptyState";
import { BtnPrimary } from "@/components/tarineo/Actions";
import { StatusBadge } from "@/components/tarineo/StatusBadge";
import { CarteResumeMotion, GrilleStatsMotion } from "@/components/tarineo/motion/GrilleStatsMotion";

const formaterEuros = (valeur: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(valeur);

const formaterDate = (date: Date) =>
  date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

function statutFacture(dateEcheance: Date, maintenant = new Date()): "en_retard" | "envoyee" {
  return dateEcheance < maintenant ? "en_retard" : "envoyee";
}

export default async function FacturesClientsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const factures = await prisma.clientInvoice.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  if (factures.length === 0) {
    return (
      <div>
        <MobilePageHeader title="Factures clients" subtitle="Depuis vos devis acceptés" />
        <div className="lg:hidden">
          <MobileEmptyState
            title="Aucune facture pour le moment"
            description="Transformez un devis client accepté en facture depuis la fiche du devis."
            primary={{ type: "link", href: "/devis-clients", label: "Voir mes devis clients" }}
            secondary={{ type: "link", href: "/devis-clients/nouveau", label: "Créer un devis" }}
          />
        </div>
        <div className="hidden lg:block">
          <EmptyState
            title="Factures clients"
            subtitle="Factures émises à partir de vos devis."
            heading="Aucune facture pour le moment"
            description="Transformez un devis client accepté en facture depuis la fiche du devis."
            primary={{ href: "/devis-clients", label: "Voir mes devis clients" }}
            secondary={{ href: "/devis-clients/nouveau", label: "Créer un devis" }}
            variant="document"
          />
        </div>
      </div>
    );
  }

  const maintenant = new Date();
  const totalHt = factures.reduce((s, f) => s + Number(f.totalHt), 0);
  const enRetard = factures.filter((f) => statutFacture(f.dateEcheance, maintenant) === "en_retard").length;

  return (
    <div>
      <MobilePageHeader title="Factures clients" subtitle="Depuis vos devis acceptés" />
      <div className="mb-4 lg:hidden">
        <BtnPrimary href="/devis-clients" className="w-full justify-center rounded-full">
          Voir les devis
        </BtnPrimary>
      </div>
      <div className="hidden lg:block">
        <PageHeader
          title="Factures clients"
          subtitle="Émises par transformation d'un devis — pas de création manuelle."
          actions={<BtnPrimary href="/devis-clients">Voir les devis</BtnPrimary>}
        />
      </div>

      <GrilleStatsMotion className="mb-5 hidden gap-3 sm:grid-cols-3 lg:grid">
        <CarteResumeMotion label="Factures" valeur={String(factures.length)} />
        <CarteResumeMotion label="Montant total HT" valeur={formaterEuros(totalHt)} />
        <CarteResumeMotion
          label="Échéances dépassées"
          valeur={String(enRetard)}
          hint={enRetard > 0 ? "À relancer auprès du client" : "Tout est à jour"}
        />
      </GrilleStatsMotion>

      <div className="mb-4 flex flex-col gap-2.5 lg:hidden">
        {factures.map((f) => {
          const statut = statutFacture(f.dateEcheance, maintenant);
          return (
            <Link
              key={f.id}
              href={`/factures-clients/${f.id}`}
              className="flex min-h-[64px] items-center gap-3 rounded-[20px] bg-white px-4 py-3.5 shadow-[0_4px_14px_rgba(15,28,40,0.04)] ring-1 ring-foreground/8 active:bg-muted/40"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-[#0f1c28]">{f.clientNom}</p>
                <p className="text-[12px] text-[#8a96a3]">
                  {f.numero} · échéance {formaterDate(f.dateEcheance)}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <p className="text-[15px] font-bold text-[#0f1c28]">{formaterEuros(Number(f.totalHt))}</p>
                <StatusBadge statut={statut} label={statut === "en_retard" ? "En retard" : "Émise"} />
              </div>
            </Link>
          );
        })}
      </div>

      <PageCard className="hidden lg:block">
        <DataTable columns={["N° facture", "Client", "Montant HT", "Échéance", "Statut"]}>
          {factures.map((f) => {
            const statut = statutFacture(f.dateEcheance, maintenant);
            return (
              <TableRow key={f.id}>
                <TableCell>
                  <Link href={`/factures-clients/${f.id}`} className="font-medium hover:text-primary">
                    {f.numero}
                  </Link>
                </TableCell>
                <TableCell>{f.clientNom}</TableCell>
                <TableCell>{formaterEuros(Number(f.totalHt))}</TableCell>
                <TableCell className={statut === "en_retard" ? "text-[#D64545]" : "text-muted-foreground"}>
                  {formaterDate(f.dateEcheance)}
                </TableCell>
                <TableCell>
                  <StatusBadge statut={statut} label={statut === "en_retard" ? "Échéance dépassée" : "Émise"} />
                </TableCell>
              </TableRow>
            );
          })}
        </DataTable>
      </PageCard>
    </div>
  );
}
