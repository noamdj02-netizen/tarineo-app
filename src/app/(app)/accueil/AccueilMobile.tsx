"use client";

import Link from "next/link";
import { FileTextIcon, HomeIcon, PlusIcon } from "lucide-react";
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
}: {
  economies: number;
  evolutionPct: number | null;
  aSurveiller: FournisseurASurveiller[];
  fournisseurs: FournisseurCarte[];
  documents: DocumentRecent[];
}) {
  return (
    <div className="flex flex-col gap-5 pb-2 lg:hidden">
      <MobileAccueilHeader />

      <MobileScannerCard />

      <MobileASurveiller items={aSurveiller} />

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
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {fournisseurs.map((f) => (
              <Link
                key={f.distributorNorm}
                href={`/fournisseurs/${encodeURIComponent(f.distributorNorm)}`}
                className="flex w-[64px] shrink-0 flex-col items-center gap-2"
              >
                <MobileAvatarFournisseur
                  nom={f.distributor}
                  norm={f.distributorNorm}
                  logoUrl={f.logoUrl}
                  variant="square"
                  className="!size-[52px] !rounded-[14px] !border !border-border !shadow-none"
                />
                <span className="max-w-full truncate text-center text-[11px] font-medium text-foreground">
                  {f.distributor}
                </span>
              </Link>
            ))}
            <Link
              href="/fournisseurs"
              className="flex w-[64px] shrink-0 flex-col items-center gap-2"
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

      <MobileEconomiesRow montant={economies} evolutionPct={evolutionPct} />
    </div>
  );
}
