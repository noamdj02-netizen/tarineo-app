"use client";

import Link from "next/link";
import { FileTextIcon, HomeIcon, PlusIcon, ReceiptIcon } from "lucide-react";
import type { FournisseurASurveiller } from "@/lib/dashboardAccueil";
import type { DocumentRecent, FournisseurCarte } from "./DashboardSections";
import { MobileAccueilHeader } from "@/components/tarineo/mobile/MobileAccueilHeader";
import { MobileASurveiller } from "@/components/tarineo/mobile/MobileASurveiller";
import { MobileAvatarFournisseur } from "@/components/tarineo/mobile/MobileAvatarFournisseur";
import { MobileEconomiesRow } from "@/components/tarineo/mobile/MobileEconomiesRow";
import { MobileScannerCard } from "@/components/tarineo/mobile/MobileScannerCard";
import { MobileSectionHeader } from "@/components/tarineo/mobile/MobileSectionHeader";
import { MascotteDashboard } from "@/components/tarineo/MascotteDashboard";
import { ImportDocument } from "@/app/(app)/documents/ImportDocument";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AppStagger, AppStaggerItem } from "@/components/tarineo/motion/AppStagger";
import { PullToRefresh } from "@/components/tarineo/motion/PullToRefresh";

const formaterEuros = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

function formaterDate(doc: DocumentRecent) {
  if (!doc.documentDate) return "—";
  return doc.documentDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function BadgeVariation({ doc }: { doc: DocumentRecent }) {
  if (doc.haussePositive) {
    const texte = doc.hausseLabel.replace(" hausse", "").replace(/\s/g, "");
    return (
      <Badge
        variant="destructive"
        className="rounded-full bg-[#FEE2E2] font-bold text-[#B91C1C] hover:bg-[#FEE2E2]"
      >
        ↗ {texte.startsWith("+") ? texte : `+${texte}`}
      </Badge>
    );
  }
  if (doc.hausseNegative) {
    const texte = doc.hausseLabel.replace(" baisse", "");
    return (
      <Badge
        variant="secondary"
        className="rounded-full bg-[#D1FAE5] font-bold text-[#047857] hover:bg-[#D1FAE5]"
      >
        {texte}
      </Badge>
    );
  }
  return (
    <Badge
      variant="secondary"
      className="rounded-full bg-[#ECFDF5] font-bold text-[#047857] hover:bg-[#ECFDF5]"
    >
      — Stable
    </Badge>
  );
}

export function AccueilMobile({
  economies,
  evolutionPct,
  aSurveiller,
  fournisseurs,
  documents,
  banniereReprise,
  documentsEnCours,
}: {
  economies: number;
  evolutionPct: number | null;
  aSurveiller: FournisseurASurveiller[];
  fournisseurs: FournisseurCarte[];
  documents: DocumentRecent[];
  banniereReprise?: boolean;
  documentsEnCours?: number;
}) {
  return (
    <PullToRefresh>
    <AppStagger className="flex flex-col gap-5 pb-8 lg:hidden" stagger={0.035} delayChildren={0}>
      <AppStaggerItem>
        <MobileAccueilHeader />
      </AppStaggerItem>

      {banniereReprise && (
        <AppStaggerItem>
          <Link
            href="/documents?scanner=1"
            className="flex min-h-[48px] items-center justify-between gap-3 rounded-[16px] bg-[#FFF8F5] px-4 py-3 ring-1 ring-primary/20 active:bg-[#FFF1EA]"
          >
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-[#0f1c28]">Import en attente</p>
              <p className="text-[12px] text-[#8a96a3]">Un scan suffit pour démarrer</p>
            </div>
            <span className="shrink-0 text-[13px] font-semibold text-primary">Importer</span>
          </Link>
        </AppStaggerItem>
      )}

      {documentsEnCours != null && documentsEnCours > 0 && (
        <AppStaggerItem>
          <div className="flex min-h-[44px] items-center gap-3 rounded-[16px] bg-[#FFF8F5] px-4 py-3 ring-1 ring-[#FFE4D6]">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary/12 text-[13px] font-bold text-primary">
              {documentsEnCours}
            </span>
            <p className="text-[13px] text-[#53616a]">Analyse IA en cours…</p>
          </div>
        </AppStaggerItem>
      )}

      <AppStaggerItem>
        <MobileScannerCard />
      </AppStaggerItem>

      <AppStaggerItem>
        <Link
          href="/devis-clients/nouveau"
          className="flex min-h-[52px] items-center gap-3 rounded-[20px] bg-white px-4 py-3.5 shadow-[0_4px_14px_rgba(15,28,40,0.04)] ring-1 ring-foreground/8 active:scale-[0.99] motion-reduce:active:scale-100"
        >
          <span className="flex size-10 items-center justify-center rounded-[12px] bg-primary/10 text-primary">
            <ReceiptIcon className="size-5" strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-[#0f1c28]">Créer un devis client</p>
            <p className="text-[12px] text-[#8a96a3]">PDF pro avec votre logo</p>
          </div>
          <PlusIcon className="size-5 shrink-0 text-[#C5CCD3]" aria-hidden />
        </Link>
      </AppStaggerItem>

      <AppStaggerItem>
        <MobileASurveiller items={aSurveiller} />
      </AppStaggerItem>

      <AppStaggerItem>
        <section className="flex flex-col gap-3">
          <MobileSectionHeader
            title="Devis récents"
            href="/documents"
            icon={<FileTextIcon className="size-4" aria-hidden />}
          />
          {documents.length === 0 ? (
            <Card className="items-center rounded-[20px] border-0 py-8 text-center shadow-[0_4px_14px_rgba(15,28,40,0.04)] ring-1 ring-foreground/8">
              <CardHeader className="items-center">
                <MascotteDashboard variant="loupe" width={72} height={76} />
                <CardTitle className="mt-2 text-[16px] font-semibold">Aucun devis pour le moment</CardTitle>
                <CardDescription className="max-w-[260px]">
                  Scannez votre premier devis pour commencer.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImportDocument preferCamera className="h-auto rounded-full px-5 py-2.5" label="Scanner un devis" />
              </CardContent>
            </Card>
          ) : (
            <Card className="gap-0 overflow-hidden rounded-[20px] border-0 py-0 shadow-[0_4px_14px_rgba(15,28,40,0.04)] ring-1 ring-foreground/8">
              {documents.slice(0, 5).map((doc, i) => (
                <div key={doc.id}>
                  {i > 0 && <Separator />}
                  <Link
                    href={`/documents/${doc.id}`}
                    className="flex items-center gap-3 px-3.5 py-3.5 active:bg-muted/50 motion-reduce:active:bg-transparent"
                  >
                    <MobileAvatarFournisseur
                      nom={doc.distributor}
                      norm={doc.distributorNorm}
                      logoUrl={doc.logoUrl}
                      size="sm"
                      variant="square"
                      className="!size-11 !rounded-[12px] !border-0 !shadow-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold text-foreground">{doc.distributor}</p>
                      <p className="text-[12px] text-muted-foreground">{formaterDate(doc)}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {doc.totalHt !== null && (
                        <p className="text-[15px] font-bold text-foreground">{formaterEuros(doc.totalHt)}</p>
                      )}
                      <BadgeVariation doc={doc} />
                    </div>
                  </Link>
                </div>
              ))}
            </Card>
          )}
        </section>
      </AppStaggerItem>

      <AppStaggerItem>
        <section className="flex flex-col gap-3">
          <MobileSectionHeader
            title="Fournisseurs suivis"
            href="/fournisseurs"
            icon={<HomeIcon className="size-4" aria-hidden />}
          />
          {fournisseurs.length === 0 ? (
            <Card className="items-center rounded-[20px] border-0 py-7 text-center shadow-[0_4px_14px_rgba(15,28,40,0.04)] ring-1 ring-foreground/8">
              <CardHeader className="items-center">
                <CardTitle className="text-[15px] font-semibold">Aucun fournisseur suivi</CardTitle>
                <CardDescription>Importez un document pour suivre vos enseignes.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="rounded-full px-5" render={<Link href="/fournisseurs" />} nativeButton={false}>
                  Ajouter un fournisseur
                </Button>
              </CardContent>
            </Card>
          ) : (
          <div className="-mx-0 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {fournisseurs.map((f) => (
                <Link
                  key={f.distributorNorm}
                  href={`/fournisseurs/${encodeURIComponent(f.distributorNorm)}`}
                  className="flex w-[72px] shrink-0 flex-col items-center gap-2 active:scale-[0.97] motion-reduce:active:scale-100"
                  title={f.distributor}
                >
                  <MobileAvatarFournisseur
                    nom={f.distributor}
                    norm={f.distributorNorm}
                    logoUrl={f.logoUrl}
                    variant="square"
                    className="!size-[52px] !rounded-[14px] !border !border-border !shadow-none"
                  />
                  <span className="max-w-full truncate text-center text-[11px] font-medium leading-tight text-foreground">
                    {f.distributor}
                  </span>
                </Link>
              ))}
              <Link
                href="/fournisseurs"
                className="flex w-[72px] shrink-0 flex-col items-center gap-2 active:scale-[0.97] motion-reduce:active:scale-100"
                aria-label="Ajouter un fournisseur"
              >
                <span className="flex size-[52px] items-center justify-center rounded-[14px] border border-dashed border-border bg-muted/40 text-muted-foreground">
                  <PlusIcon className="size-5" aria-hidden />
                </span>
                <span className="text-[11px] font-medium text-muted-foreground">Ajouter</span>
              </Link>
            </div>
          )}
        </section>
      </AppStaggerItem>

      <AppStaggerItem>
        <MobileEconomiesRow montant={economies} evolutionPct={evolutionPct} />
      </AppStaggerItem>
    </AppStagger>
    </PullToRefresh>
  );
}
