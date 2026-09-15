import Link from "next/link";
import { notFound } from "next/navigation";
import { PageCard, PageHeader } from "@/components/tarineo/PageHeader";
import { StatusBadge } from "@/components/tarineo/StatusBadge";
import { PageTabs } from "@/components/tarineo/PageTabs";
import { LineChart } from "@/components/tarineo/Charts";
import { DataTable, TableRow, TableCell, RowActions } from "@/components/tarineo/DataTable";
import { BrandMark } from "@/components/tarineo/BrandMark";
import { BtnGhost, BtnPrimary, PeriodSelect } from "@/components/tarineo/Actions";
import { IconFile } from "@/components/tarineo/NavIcons";
import {
  DEMO_FOURNISSEURS,
  DEMO_HAUSSES_CEDEO,
  DEMO_DEVIS_CEDEO,
  DEMO_SERIES_CATEGORIES,
  formaterEurosDemo,
  formaterEurosDec,
} from "@/lib/uiDemo";

export default async function FournisseurDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ onglet?: string }>;
}) {
  const { id } = await params;
  const { onglet = "vue" } = await searchParams;
  const f = DEMO_FOURNISSEURS.find((x) => x.id === id);
  if (!f) notFound();

  return (
    <div>
      <PageHeader
        backHref="/fournisseurs"
        title={
          <span className="flex items-center gap-3">
            <BrandMark nom={f.nom} logo={f.logo} size={48} rounded="xl" />
            <span className="flex flex-col gap-1.5">
              <span>{f.nom}</span>
              <span className="flex flex-wrap items-center gap-2 text-sm font-normal">
                <StatusBadge statut="fournisseur" />
                <StatusBadge statut="fiabilite" label={`${f.fiabilite}% de fiabilité`} />
                <span className="text-muted-foreground">{f.site}</span>
              </span>
            </span>
          </span>
        }
        actions={
          <>
            <BtnGhost href="/analyses">Voir les prix</BtnGhost>
            <BtnGhost href="/documents">Importer un devis</BtnGhost>
            <BtnPrimary href="/documents">+ Suivre les prix</BtnPrimary>
          </>
        }
      />
      <div className="mb-5">
        <PageTabs
          actif={onglet}
          items={[
            { id: "vue", label: "Vue d'ensemble", href: `/fournisseurs/${id}` },
            { id: "devis", label: "Devis reçus (24)", href: `/fournisseurs/${id}?onglet=devis` },
            { id: "evolution", label: "Évolution des prix", href: `/fournisseurs/${id}?onglet=evolution` },
            { id: "categories", label: "Catégories", href: `/fournisseurs/${id}?onglet=categories` },
            { id: "infos", label: "Informations", href: `/fournisseurs/${id}?onglet=infos` },
          ]}
        />
      </div>
      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <PageCard>
          <h2 className="mb-4 text-base font-semibold">Informations générales</h2>
          <dl className="grid grid-cols-[88px_1fr] gap-y-2.5 text-sm">
            <dt className="text-muted-foreground">Adresse</dt>
            <dd>12 Rue des Artisans<br />75011 Paris</dd>
            <dt className="text-muted-foreground">Téléphone</dt>
            <dd>01 23 45 67 89</dd>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="text-[#3B6AE1]">{f.contact}</dd>
            <dt className="text-muted-foreground">Site web</dt>
            <dd className="text-[#3B6AE1]">{f.site}</dd>
          </dl>
        </PageCard>
        <PageCard>
          <h2 className="mb-4 text-base font-semibold">Statistiques (6 derniers mois)</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <StatMini icone="doc" valeur="24" label="Devis reçus" />
            <StatMini icone="euro" valeur="18 420 €" label="Montant total" />
            <StatMini icone="up" valeur="+8,2 %" label="Hausse moyenne" accent="orange" />
            <StatMini icone="ok" valeur="98 %" label="Fiabilité des prix" accent="green" />
          </div>
        </PageCard>
        <PageCard>
          <h2 className="mb-4 text-base font-semibold">Catégories les plus impactées</h2>
          <ul className="flex flex-col gap-2.5 text-sm">
            {[
              ["+24%", "Cuivre et raccords", "hausse"],
              ["+18%", "Appareillage électrique", "hausse"],
              ["+12%", "Carrelage et faïence", "hausse"],
              ["+8%", "Plomberie sanitaire", "hausse_ok"],
              ["+6%", "Chauffage et climatisation", "hausse_ok"],
            ].map(([pct, label, statut]) => (
              <li key={label} className="flex items-center gap-2.5">
                <StatusBadge statut={statut} label={pct} />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </PageCard>
      </div>
      <div className="mb-5 grid gap-5 xl:grid-cols-2">
        <PageCard>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Évolution des prix par catégorie</h2>
            <PeriodSelect className="h-9 px-3 text-xs text-muted-foreground" />
          </div>
          <div className="mb-3 flex flex-wrap gap-4 text-xs">
            {DEMO_SERIES_CATEGORIES.map((s) => (
              <span key={s.nom} className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ background: s.couleur }} />
                {s.nom}
              </span>
            ))}
          </div>
          <LineChart series={DEMO_SERIES_CATEGORIES} />
        </PageCard>
        <PageCard>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Derniers devis reçus</h2>
            <Link href="/documents" className="text-sm text-muted-foreground hover:text-primary">
              Voir tout
            </Link>
          </div>
          <ul className="flex flex-col">
            {DEMO_DEVIS_CEDEO.map((d) => (
              <li key={d.numero} className="flex items-center gap-3 border-b border-[#F3F3F3] py-3 text-sm last:border-0">
                <span className="grid size-8 place-items-center rounded-lg bg-[#F8F8F8] text-muted-foreground">
                  <IconFile />
                </span>
                <span className="min-w-[110px] font-medium">{d.numero}</span>
                <span className="flex-1 text-muted-foreground">{d.categorie}</span>
                <span className="text-muted-foreground">{d.date}</span>
                <span className="w-20 text-right font-medium">{formaterEurosDemo(d.montant)}</span>
                <RowActions />
              </li>
            ))}
          </ul>
        </PageCard>
      </div>
      <PageCard>
        <h2 className="mb-3 text-base font-semibold">Top 5 des hausses de prix détectées chez {f.nom}</h2>
        <DataTable columns={["Produit", "Ancien prix", "Nouveau prix", "Variation", "Catégorie", "Date"]}>
          {DEMO_HAUSSES_CEDEO.map((h) => (
            <TableRow key={h.produit}>
              <TableCell className="font-medium">{h.produit}</TableCell>
              <TableCell>{formaterEurosDec(h.ancien)}</TableCell>
              <TableCell>{formaterEurosDec(h.nouveau)}</TableCell>
              <TableCell>
                <StatusBadge statut="hausse" label={`+${h.variation}%`} />
              </TableCell>
              <TableCell>{h.categorie}</TableCell>
              <TableCell>{h.date}</TableCell>
            </TableRow>
          ))}
        </DataTable>
      </PageCard>
    </div>
  );
}

function StatMini({
  icone,
  valeur,
  label,
  accent,
}: {
  icone: "doc" | "euro" | "up" | "ok";
  valeur: string;
  label: string;
  accent?: "orange" | "green";
}) {
  const colors = {
    doc: "bg-[#EEF1FF] text-[#3B6AE1]",
    euro: "bg-[#F3E8FF] text-[#7C3AED]",
    up: "bg-[#FFF3E6] text-[#E67A1F]",
    ok: "bg-[#E9F8EE] text-[#1F9D55]",
  };
  return (
    <div className="flex items-start gap-2.5">
      <span className={`mt-0.5 grid size-8 place-items-center rounded-lg ${colors[icone]}`}>
        {icone === "doc" && <IconFile className="size-4" />}
        {icone === "euro" && <span className="text-sm font-semibold">€</span>}
        {icone === "up" && <span className="text-sm font-semibold">↗</span>}
        {icone === "ok" && <span className="text-sm font-semibold">✓</span>}
      </span>
      <div>
        <p className={`text-xl font-semibold leading-none ${accent === "orange" ? "text-primary" : accent === "green" ? "text-[#1F9D55]" : ""}`}>
          {valeur}
        </p>
        <p className="mt-1 text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
