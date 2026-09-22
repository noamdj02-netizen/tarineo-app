import Link from "next/link";
import type { DocumentRecent, FournisseurCarte } from "./DashboardSections";
import { MobileAccueilHeader } from "@/components/tarineo/mobile/MobileAccueilHeader";
import { MobileEconomiesCard } from "@/components/tarineo/mobile/MobileEconomiesCard";
import { MobileSectionHeader } from "@/components/tarineo/mobile/MobileSectionHeader";
import { MobileAvatarFournisseur } from "@/components/tarineo/mobile/MobileAvatarFournisseur";

const formaterEuros = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

function formaterDate(doc: DocumentRecent) {
  if (!doc.documentDate) return "—";
  return doc.documentDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export function AccueilMobile({
  economies,
  fournisseurs,
  documents,
}: {
  economies: number;
  fournisseurs: FournisseurCarte[];
  documents: DocumentRecent[];
}) {
  return (
    <div className="flex flex-col gap-6 pb-2 lg:hidden">
      <MobileAccueilHeader />
      <MobileEconomiesCard montant={economies} />

      {fournisseurs.length > 0 && (
        <section className="flex flex-col gap-4">
          <MobileSectionHeader title="Fournisseurs suivis" href="/fournisseurs" />
          <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {fournisseurs.map((f) => (
              <Link
                key={f.distributorNorm}
                href={`/fournisseurs/${encodeURIComponent(f.distributorNorm)}`}
                className="flex w-[62px] shrink-0 flex-col items-center gap-2.5"
              >
                <MobileAvatarFournisseur nom={f.distributor} norm={f.distributorNorm} logoUrl={f.logoUrl} />
                <span className="max-w-full truncate text-center text-[11px] font-medium text-[#0f1c28]">
                  {f.distributor}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {documents.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <MobileSectionHeader title="Devis récents" href="/documents" />
          {documents.slice(0, 5).map((doc) => (
            <Link
              key={doc.id}
              href={`/documents/${doc.id}`}
              className="flex items-center justify-between rounded-[18px] bg-white py-3.5 pl-3.5 pr-4 shadow-[0_4px_12px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <MobileAvatarFournisseur
                  nom={doc.distributor}
                  norm={doc.distributorNorm}
                  logoUrl={doc.logoUrl}
                  size="sm"
                  variant="square"
                />
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-[#0f1c28]">{doc.distributor}</p>
                  <p className="text-xs text-[#8a96a3]">{formaterDate(doc)}</p>
                </div>
              </div>
              {doc.totalHt !== null && (
                <p className="shrink-0 text-[15px] font-bold text-[#0f1c28]">{formaterEuros(doc.totalHt)}</p>
              )}
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
