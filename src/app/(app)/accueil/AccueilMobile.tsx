"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRightIcon, PlusIcon } from "lucide-react";
import type { FournisseurASurveiller } from "@/lib/dashboardAccueil";
import type { DocumentRecent, FournisseurCarte } from "./DashboardSections";
import { MobileAccueilHeader } from "@/components/tarineo/mobile/MobileAccueilHeader";
import { MobileASurveiller } from "@/components/tarineo/mobile/MobileASurveiller";
import { MobileAvatarFournisseur } from "@/components/tarineo/mobile/MobileAvatarFournisseur";
import { MobileEconomiesRow } from "@/components/tarineo/mobile/MobileEconomiesRow";
import { MobileScannerCard } from "@/components/tarineo/mobile/MobileScannerCard";
import { MobileSectionHeader } from "@/components/tarineo/mobile/MobileSectionHeader";
import { ImportDocument } from "@/app/(app)/documents/ImportDocument";

const formaterEuros = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

function formaterDate(doc: DocumentRecent) {
  if (!doc.documentDate) return "—";
  return doc.documentDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function libelleVariation(doc: DocumentRecent) {
  if (doc.haussePositive) {
    return { texte: doc.hausseLabel.replace(" hausse", ""), classe: "text-[#ec5821]" };
  }
  if (doc.hausseNegative) {
    return { texte: doc.hausseLabel.replace(" baisse", ""), classe: "text-[#1F9D55]" };
  }
  return { texte: "Stable", classe: "text-[#8a96a3]" };
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
    <div className="flex flex-col gap-6 pb-2 lg:hidden">
      <MobileAccueilHeader />

      <MobileScannerCard />

      <MobileASurveiller items={aSurveiller} />

      <section className="flex flex-col gap-2.5">
        <MobileSectionHeader title="Devis récents" href="/documents" />
        {documents.length === 0 ? (
          <div className="flex flex-col items-center rounded-[20px] border border-[#eceef1] bg-white px-5 py-8 text-center shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
            <Image
              src="/dashboard/mascottes/loupe.png"
              alt=""
              width={88}
              height={88}
              className="size-[72px] object-contain"
            />
            <p className="mt-3 text-[16px] font-semibold text-[#0f1c28]">Aucun devis pour le moment</p>
            <p className="mt-1 max-w-[260px] text-[13px] text-[#8a96a3]">
              Scannez votre premier devis pour commencer.
            </p>
            <ImportDocument
              preferCamera
              className="mt-4 h-auto rounded-full px-5 py-2.5"
              label="Scanner un devis"
            />
          </div>
        ) : (
          documents.slice(0, 5).map((doc) => {
            const variation = libelleVariation(doc);
            return (
              <Link
                key={doc.id}
                href={`/documents/${doc.id}`}
                className="flex items-center gap-3 rounded-[18px] bg-white py-3.5 pl-3.5 pr-3 shadow-[0_4px_12px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] active:scale-[0.99] motion-reduce:active:scale-100"
              >
                <MobileAvatarFournisseur
                  nom={doc.distributor}
                  norm={doc.distributorNorm}
                  logoUrl={doc.logoUrl}
                  size="sm"
                  variant="square"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold text-[#0f1c28]">{doc.distributor}</p>
                  <p className="text-xs text-[#8a96a3]">{formaterDate(doc)}</p>
                </div>
                <div className="shrink-0 text-right">
                  {doc.totalHt !== null && (
                    <p className="text-[15px] font-bold text-[#0f1c28]">{formaterEuros(doc.totalHt)}</p>
                  )}
                  <p className={`text-[11px] font-semibold ${variation.classe}`}>
                    {doc.haussePositive ? `↗ ${variation.texte}` : variation.texte}
                  </p>
                </div>
                <ChevronRightIcon className="size-4 shrink-0 text-[#c5ccd4]" aria-hidden />
              </Link>
            );
          })
        )}
      </section>

      <section className="flex flex-col gap-3">
        <MobileSectionHeader title="Fournisseurs suivis" href="/fournisseurs" />
        {fournisseurs.length === 0 ? (
          <div className="flex flex-col items-center rounded-[20px] border border-[#eceef1] bg-white px-5 py-7 text-center shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
            <p className="text-[15px] font-semibold text-[#0f1c28]">Aucun fournisseur suivi</p>
            <p className="mt-1 text-[13px] text-[#8a96a3]">
              Importez un document pour suivre vos enseignes.
            </p>
            <Link
              href="/fournisseurs"
              className="mt-4 inline-flex h-auto items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white"
            >
              Ajouter un fournisseur
            </Link>
          </div>
        ) : (
          <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {fournisseurs.map((f) => (
              <Link
                key={f.distributorNorm}
                href={`/fournisseurs/${encodeURIComponent(f.distributorNorm)}`}
                className="flex w-[68px] shrink-0 flex-col items-center gap-2"
              >
                <MobileAvatarFournisseur nom={f.distributor} norm={f.distributorNorm} logoUrl={f.logoUrl} />
                <span className="max-w-full truncate text-center text-[11px] font-medium text-[#0f1c28]">
                  {f.distributor}
                </span>
              </Link>
            ))}
            <Link
              href="/fournisseurs"
              className="flex w-[68px] shrink-0 flex-col items-center gap-2"
              aria-label="Ajouter un fournisseur"
            >
              <span className="flex size-[52px] items-center justify-center rounded-full border border-dashed border-[#d5dae0] bg-[#f8f9fb] text-[#8a96a3]">
                <PlusIcon className="size-5" aria-hidden />
              </span>
              <span className="text-[11px] font-medium text-[#8a96a3]">Ajouter</span>
            </Link>
          </div>
        )}
      </section>

      <MobileEconomiesRow montant={economies} evolutionPct={evolutionPct} />
    </div>
  );
}
