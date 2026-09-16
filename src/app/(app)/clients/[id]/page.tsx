import Image from "next/image";
import { notFound } from "next/navigation";
import { PageCard, PageHeader } from "@/components/tarineo/PageHeader";
import { StatusBadge } from "@/components/tarineo/StatusBadge";
import { PageTabs } from "@/components/tarineo/PageTabs";
import { BrandMark } from "@/components/tarineo/BrandMark";
import { BtnOrangeOutline, BtnPrimary } from "@/components/tarineo/Actions";
import { DEMO_CLIENTS, DEMO_CLIENT_CEDEO, formaterEurosDemo } from "@/lib/uiDemo";

export default async function ClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ onglet?: string }>;
}) {
  const { id } = await params;
  const { onglet = "vue" } = await searchParams;
  const client = DEMO_CLIENTS.find((c) => c.id === id);
  if (!client) notFound();

  return (
    <div>
      <PageHeader
        backHref="/clients"
        title={
          <span className="flex flex-wrap items-center gap-3">
            <BrandMark nom={client.nom} logo={client.logo} size={48} />
            {client.nom}
            <StatusBadge statut="actif" />
            <StatusBadge statut="professionnel" />
          </span>
        }
        actions={
          <>
            <BtnOrangeOutline href="/devis-clients/nouveau">+ Créer un devis</BtnOrangeOutline>
            <BtnPrimary href="/devis-clients/nouveau">+ Créer un devis</BtnPrimary>
          </>
        }
      />
      <div className="mb-5">
        <PageTabs
          actif={onglet}
          items={[
            { id: "vue", label: "Vue d'ensemble", href: `/clients/${id}` },
            { id: "contacts", label: "Contacts", href: `/clients/${id}?onglet=contacts` },
            { id: "devis", label: "Devis", href: `/clients/${id}?onglet=devis` },
            { id: "factures", label: "Factures", href: `/clients/${id}?onglet=factures` },
            { id: "historique", label: "Historique", href: `/clients/${id}?onglet=historique` },
          ]}
        />
      </div>
      {onglet === "vue" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <PageCard>
            <h2 className="mb-4 text-base font-semibold">Informations générales</h2>
            <dl className="grid grid-cols-[140px_1fr] gap-y-2.5 text-sm">
              <dt className="text-muted-foreground">Adresse</dt>
              <dd className="whitespace-pre-line">{DEMO_CLIENT_CEDEO.adresse}</dd>
              <dt className="text-muted-foreground">TVA</dt>
              <dd>{DEMO_CLIENT_CEDEO.tva}</dd>
              <dt className="text-muted-foreground">SIRET</dt>
              <dd>{DEMO_CLIENT_CEDEO.siret}</dd>
            </dl>
          </PageCard>
          <PageCard>
            <h2 className="mb-4 text-base font-semibold">Statistiques</h2>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-[28px] font-semibold leading-none">{client.devis}</p>
                <p className="mt-1 text-xs text-muted-foreground">Devis reçus</p>
              </div>
              <div>
                <p className="text-[28px] font-semibold leading-none">{formaterEurosDemo(client.ca)}</p>
                <p className="mt-1 text-xs text-muted-foreground">CA généré</p>
              </div>
              <div>
                <p className="text-[28px] font-semibold leading-none">3 072 €</p>
                <p className="mt-1 text-xs text-muted-foreground">En cours</p>
              </div>
            </div>
          </PageCard>
          <PageCard>
            <h2 className="mb-4 text-base font-semibold">Contact principal</h2>
            <div className="flex items-center gap-3">
              <Image src="/dashboard/avatar-2.png" alt="" width={44} height={44} className="size-11 rounded-full object-cover" />
              <div>
                <p className="font-medium">{DEMO_CLIENT_CEDEO.contact.nom}</p>
                <p className="text-sm text-muted-foreground">{DEMO_CLIENT_CEDEO.contact.role}</p>
                <p className="text-sm text-[#3B6AE1]">{DEMO_CLIENT_CEDEO.contact.email}</p>
              </div>
            </div>
          </PageCard>
          <PageCard>
            <h2 className="mb-4 text-base font-semibold">Notes</h2>
            <p className="text-sm leading-6 text-muted-foreground">{DEMO_CLIENT_CEDEO.notes}</p>
          </PageCard>
        </div>
      )}
      {onglet !== "vue" && (
        <PageCard>
          <p className="text-sm text-muted-foreground">Aucun élément dans cet onglet pour le moment.</p>
        </PageCard>
      )}
    </div>
  );
}
