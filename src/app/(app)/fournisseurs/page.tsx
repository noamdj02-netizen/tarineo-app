import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { calculerDepensesParDistributeur } from "@/lib/depenses";
import { parserPayloadsAlertesHausse } from "@/lib/comparaisonPrix";
import { logoFournisseur } from "@/lib/logosFournisseurs";
import { normaliserDistributeur } from "@/lib/normalisation";
import { BIBLIOTHEQUE_FOURNISSEURS, enseigneParNorm } from "@/lib/bibliothequeFournisseurs";
import { PageHeader, PageCard } from "@/components/tarineo/PageHeader";
import { BtnPrimary } from "@/components/tarineo/Actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { UploadIcon } from "lucide-react";

const formaterEuros = (valeur: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(valeur);

function Logo({ nom, norm, size = 40 }: { nom: string; norm: string; size?: number }) {
  const src = logoFournisseur(norm || nom);
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

  const [depenses, documents, alertes] = await Promise.all([
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

  const suivis = [...suivisMap.values()].sort((a, b) => b.depenses - a.depenses || b.nbDocs - a.nbDocs);

  const normsSuivis = new Set(suivis.map((s) => normCle(s.distributorNorm)));
  const bibliotheque = BIBLIOTHEQUE_FOURNISSEURS.filter((e) => {
    const hint = normCle(e.normHint);
    return ![...normsSuivis].some((n) => n.includes(hint) || hint.includes(n));
  });

  return (
    <div>
      <PageHeader
        title="Fournisseurs"
        subtitle="Vos enseignes déjà suivies, puis une bibliothèque pour démarrer un import."
        actions={<BtnPrimary href="/documents">Importer un devis</BtnPrimary>}
      />

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Mes fournisseurs</h2>
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
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {suivis.map((f) => (
              <Link
                key={f.distributorNorm}
                href={`/fournisseurs/${encodeURIComponent(f.distributorNorm)}`}
                className="flex flex-col gap-4 rounded-[24px] bg-card p-5 transition-colors hover:bg-secondary/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Logo nom={f.distributor} norm={f.distributorNorm} />
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
                <div className="flex items-end justify-between border-t border-border/60 pt-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Dépenses période</p>
                    <p className="text-lg font-medium">{formaterEuros(f.depenses)}</p>
                  </div>
                  <span className="text-sm text-primary">Voir →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-foreground">Bibliothèque d&apos;enseignes</h2>
        <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
          Pas un catalogue de prix publics : choisissez une enseigne pour importer un de ses devis et le comparer à{" "}
          <strong className="font-medium text-foreground">votre</strong> historique.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {bibliotheque.map((e) => (
            <div key={e.id} className="flex flex-col gap-3 rounded-[20px] border border-border/70 bg-card p-4">
              <div className="flex items-center gap-3">
                <Logo nom={e.nom} norm={e.normHint} size={36} />
                <div>
                  <p className="font-medium text-foreground">{e.nom}</p>
                  <p className="text-xs text-muted-foreground">{e.metiers}</p>
                </div>
              </div>
              <p className="flex-1 text-xs leading-relaxed text-muted-foreground">{e.description}</p>
              <Button
                size="sm"
                variant="outline"
                render={<Link href={`/fournisseurs/${e.id}`} />}
                className="w-full rounded-full"
              >
                Voir la fiche {e.nom}
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
