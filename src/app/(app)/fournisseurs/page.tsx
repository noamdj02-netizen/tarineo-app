import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { calculerDepensesParDistributeur } from "@/lib/depenses";
import { parserPayloadsAlertesHausse } from "@/lib/comparaisonPrix";
import { logoFournisseur } from "@/lib/logosFournisseurs";
import {
  chargerLogosFournisseursUtilisateur,
  resoudreLogoFournisseur,
} from "@/lib/logosFournisseursPersistants";
import { normaliserDistributeur } from "@/lib/normalisation";
import { limiteDistributeurs, messageFonctionPlanRequise } from "@/lib/planGating";
import { BIBLIOTHEQUE_FOURNISSEURS, enseigneParNorm } from "@/lib/bibliothequeFournisseurs";
import { logoDev } from "@/lib/fournisseursConnus";
import { listerEnseignesPersonnalisees } from "@/lib/rechercherFournisseur";
import { BibliothequeOnglets } from "./RechercheFournisseurIA";
import { PageHeader, PageCard } from "@/components/tarineo/PageHeader";
import { BtnPrimary, BtnGhost } from "@/components/tarineo/Actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { UploadIcon } from "lucide-react";

const formaterEuros = (valeur: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(valeur);

function Logo({
  nom,
  norm,
  logoUrl,
  size = 40,
}: {
  nom: string;
  norm: string;
  logoUrl?: string | null;
  size?: number;
}) {
  const src = logoUrl ?? logoFournisseur(norm || nom);
  if (src) {
    return (
      <Image src={src} alt="" width={size} height={size} className="shrink-0 rounded-lg object-cover" style={{ width: size, height: size }} />
    );
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-lg bg-secondary font-bold text-primary"
      style={{ width: size, height: size, fontSize: size > 36 ? 16 : 12 }}
    >
      {nom.charAt(0).toUpperCase()}
    </div>
  );
}

function normCle(valeur: string) {
  return valeur
    .toUpperCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^A-Z0-9]/g, "");
}

export default async function FournisseursPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/connexion");
  const userId = session.user.id;

  const [depenses, documents, alertes, utilisateur, enseignesPerso] = await Promise.all([
    calculerDepensesParDistributeur(userId),
    prisma.document.findMany({
      where: { userId, distributorNorm: { not: null } },
      select: {
        distributor: true,
        distributorNorm: true,
        documentDate: true,
        createdAt: true,
      },
      orderBy: [{ documentDate: "desc" }, { createdAt: "desc" }],
    }),
    prisma.alert.findMany({
      where: { userId, type: "PRICE_INCREASE" },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, subscriptionStatus: true },
    }),
    listerEnseignesPersonnalisees(userId),
  ]);

  const metaParNorm = new Map<string, { distributor: string; count: number; dernier: Date | null }>();
  for (const doc of documents) {
    if (!doc.distributorNorm) continue;
    const existant = metaParNorm.get(doc.distributorNorm);
    if (existant) {
      existant.count += 1;
    } else {
      metaParNorm.set(doc.distributorNorm, {
        distributor: doc.distributor ?? doc.distributorNorm,
        count: 1,
        dernier: doc.documentDate ?? doc.createdAt,
      });
    }
  }

  const hausseParNorm = new Map<string, number>();
  for (const p of parserPayloadsAlertesHausse(alertes)) {
    const norm = normaliserDistributeur(p.distributor);
    if (p.ecartPourcent == null) continue;
    const actuel = hausseParNorm.get(norm);
    if (actuel === undefined || Math.abs(p.ecartPourcent) > Math.abs(actuel)) {
      hausseParNorm.set(norm, p.ecartPourcent);
    }
  }

  type CarteSuivi = {
    distributor: string;
    distributorNorm: string;
    depenses: number;
    nbDocs: number;
    hausse: number | undefined;
  };

  const suivisMap = new Map<string, CarteSuivi>();
  for (const d of depenses) {
    const meta = metaParNorm.get(d.distributorNorm);
    suivisMap.set(d.distributorNorm, {
      distributor: d.distributor,
      distributorNorm: d.distributorNorm,
      depenses: d.depenses,
      nbDocs: meta?.count ?? 0,
      hausse: hausseParNorm.get(d.distributorNorm),
    });
  }
  for (const [norm, meta] of metaParNorm) {
    if (suivisMap.has(norm)) continue;
    suivisMap.set(norm, {
      distributor: meta.distributor,
      distributorNorm: norm,
      depenses: 0,
      nbDocs: meta.count,
      hausse: hausseParNorm.get(norm),
    });
  }

  const suivisTous = [...suivisMap.values()].sort((a, b) => b.depenses - a.depenses || b.nbDocs - a.nbDocs);
  const limitePlan = limiteDistributeurs(utilisateur?.plan ?? null, utilisateur?.subscriptionStatus ?? null);
  const suivis = limitePlan ? suivisTous.slice(0, limitePlan) : suivisTous;
  const fournisseursMasques = limitePlan ? Math.max(0, suivisTous.length - limitePlan) : 0;

  const logosImportes = await chargerLogosFournisseursUtilisateur(
    userId,
    suivis.map((s) => s.distributorNorm),
  );

  const normsSuivis = new Set(suivis.map((s) => normCle(s.distributorNorm)));
  const slugsPerso = new Set(enseignesPerso.map((e) => e.slug));
  const bibliotheque = BIBLIOTHEQUE_FOURNISSEURS.filter((e) => {
    const hint = normCle(e.normHint);
    if (slugsPerso.has(e.id)) return false;
    return ![...normsSuivis].some((n) => n.includes(hint) || hint.includes(n));
  });

  const enseignesAjoutees = enseignesPerso.map((e) => ({
    slug: e.slug,
    nom: e.nom,
    metiers: e.metiers,
    logoUrl: e.domaineLogo ? logoDev(e.domaineLogo) : null,
  }));

  return (
    <div>
      <PageHeader
        title="Fournisseurs"
        subtitle="Vos enseignes déjà suivies, puis une bibliothèque pour démarrer un import."
        actions={
          <>
            <BtnGhost href="/veille">Veille prix</BtnGhost>
            <BtnPrimary href="/documents">Importer un devis</BtnPrimary>
          </>
        }
      />

      <section className="mb-6">
        <h2 className="mb-3 text-base font-semibold text-foreground">Mes fournisseurs</h2>
        {fournisseursMasques > 0 && (
          <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {messageFonctionPlanRequise("distributeurs")} ({fournisseursMasques} fournisseur
            {fournisseursMasques > 1 ? "s" : ""} masqué{fournisseursMasques > 1 ? "s" : ""}).
            <Link href="/parametres?onglet=abonnement" className="ml-1 font-semibold underline">
              Passer à Pro
            </Link>
          </p>
        )}
        {suivis.length === 0 ? (
          <PageCard>
            <Empty className="py-8">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <UploadIcon />
                </EmptyMedia>
                <EmptyTitle>Aucun fournisseur suivi</EmptyTitle>
                <EmptyDescription>
                  Importez un devis ou une facture : l&apos;enseigne apparaît ici automatiquement, avec vos dépenses et
                  hausses détectées.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button render={<Link href="/documents" />}>Importer mon premier document</Button>
              </EmptyContent>
            </Empty>
          </PageCard>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {suivis.map((f) => (
              <Link
                key={f.distributorNorm}
                href={`/fournisseurs/${encodeURIComponent(f.distributorNorm)}`}
                className="flex flex-col gap-3 rounded-[20px] bg-card p-4 transition-colors hover:bg-secondary/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Logo
                      nom={f.distributor}
                      norm={f.distributorNorm}
                      logoUrl={resoudreLogoFournisseur(f.distributor, f.distributorNorm, logosImportes)}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">{f.distributor}</p>
                      <p className="text-xs text-muted-foreground">
                        {f.nbDocs} document{f.nbDocs > 1 ? "s" : ""}
                        {enseigneParNorm(f.distributorNorm)?.metiers
                          ? ` · ${enseigneParNorm(f.distributorNorm)!.metiers}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  {f.hausse != null && Math.abs(f.hausse) > 3 && (
                    <Badge variant={f.hausse > 0 ? "destructive" : "secondary"}>
                      {f.hausse > 0 ? "+" : ""}
                      {f.hausse.toFixed(0)}%
                    </Badge>
                  )}
                </div>
                <div className="border-t border-border/60 pt-3">
                  <p className="text-xs text-muted-foreground">Dépenses période</p>
                  <p className="text-base font-medium">{formaterEuros(f.depenses)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <BibliothequeOnglets
        enseignesAjoutees={enseignesAjoutees}
        catalogue={
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {bibliotheque.map((e) => (
              <Link
                key={e.id}
                href={`/fournisseurs/${e.id}`}
                className="flex items-center gap-3 rounded-[20px] border border-dashed border-border/80 bg-card p-4 transition-colors hover:border-primary/40 hover:bg-[#FFF8F5]"
              >
                <Logo nom={e.nom} norm={e.normHint} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{e.nom}</p>
                  <p className="text-xs text-muted-foreground">{e.metiers}</p>
                  <p className="mt-1 text-xs font-medium text-primary">Importer un devis →</p>
                </div>
              </Link>
            ))}
          </div>
        }
      />
    </div>
  );
}
