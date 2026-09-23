import Link from "next/link";
import type { DocumentRecent, FournisseurCarte } from "./DashboardSections";
import { MobileAccueilHeader } from "@/components/tarineo/mobile/MobileAccueilHeader";
import { MobileEconomiesCard } from "@/components/tarineo/mobile/MobileEconomiesCard";
import { MobileSectionHeader } from "@/components/tarineo/mobile/MobileSectionHeader";
import { MobileAvatarFournisseur } from "@/components/tarineo/mobile/MobileAvatarFournisseur";
import { MobileStagger, MobileStaggerItem } from "@/components/tarineo/mobile/MobileStagger";
import { MOBILE_BORDER_SOFT, MOBILE_TEXT_PRIMARY, MOBILE_TEXT_SECONDARY } from "@/components/tarineo/mobile/mobileTokens";
import { cn } from "@/lib/utils";

const formaterEuros = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

function formaterDate(doc: DocumentRecent) {
  if (!doc.documentDate) return "—";
  return doc.documentDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function libelleFournisseurCourt(nom: string) {
  const court: Record<string, string> = {
    "leroy merlin": "Leroy M.",
    "brico dépôt": "Brico D.",
    "brico depot": "Brico D.",
  };
  const cle = nom.trim().toLowerCase();
  return court[cle] ?? nom;
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
  const listeFournisseurs = fournisseurs.slice(0, 5);
  const grilleFournisseurs = listeFournisseurs.length <= 5;

  return (
    <MobileStagger className="gap-[30px] pb-2 lg:hidden">
      <MobileStaggerItem>
        <MobileAccueilHeader />
      </MobileStaggerItem>

      <MobileStaggerItem>
        <MobileEconomiesCard montant={economies} />
      </MobileStaggerItem>

      <MobileStaggerItem className="flex flex-col gap-5">
        <MobileSectionHeader title="Fournisseurs suivis" href="/fournisseurs" />
        {listeFournisseurs.length > 0 ? (
          <div
            className={cn(
              "w-full",
              grilleFournisseurs
                ? "flex items-start justify-between gap-2"
                : "-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            )}
          >
            {listeFournisseurs.map((f) => (
              <Link
                key={f.distributorNorm}
                href={`/fournisseurs/${encodeURIComponent(f.distributorNorm)}`}
                className={cn(
                  "flex flex-col items-center gap-2 active:opacity-80",
                  grilleFournisseurs ? "w-[55px] shrink-0" : "w-[68px] shrink-0",
                )}
              >
                <MobileAvatarFournisseur nom={f.distributor} norm={f.distributorNorm} logoUrl={f.logoUrl} />
                <span
                  className="max-w-[72px] truncate text-center text-[11px] font-medium leading-tight"
                  style={{ color: MOBILE_TEXT_PRIMARY }}
                >
                  {libelleFournisseurCourt(f.distributor)}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-relaxed" style={{ color: MOBILE_TEXT_SECONDARY }}>
            Importez un devis ou une facture — vos enseignes apparaîtront ici.
          </p>
        )}
      </MobileStaggerItem>

      <MobileStaggerItem className="flex flex-col gap-5">
        <MobileSectionHeader title="Documents récents" href="/documents" />
        {documents.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {documents.slice(0, 3).map((doc) => (
              <Link
                key={doc.id}
                href={`/documents/${doc.id}`}
                className="flex items-center justify-between rounded-[20px] border-2 bg-white px-[15px] py-[17px] active:scale-[0.99] transition-transform"
                style={{ borderColor: MOBILE_BORDER_SOFT }}
              >
                <div className="flex min-w-0 items-center gap-[15px]">
                  <MobileAvatarFournisseur
                    nom={doc.distributor}
                    norm={doc.distributorNorm}
                    logoUrl={doc.logoUrl}
                    size="md"
                  />
                  <div className="min-w-0 flex flex-col gap-1">
                    <p className="truncate text-[15px] font-semibold" style={{ color: MOBILE_TEXT_PRIMARY }}>
                      {doc.distributor}
                    </p>
                    <p className="text-[15px]" style={{ color: MOBILE_TEXT_SECONDARY }}>{formaterDate(doc)}</p>
                  </div>
                </div>
                {doc.totalHt !== null && (
                  <p className="shrink-0 pl-2 text-[15px] font-semibold" style={{ color: MOBILE_TEXT_PRIMARY }}>
                    {formaterEuros(doc.totalHt)}
                  </p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-relaxed" style={{ color: MOBILE_TEXT_SECONDARY }}>
            Aucun document pour l&apos;instant. Utilisez Scanner pour importer votre premier devis.
          </p>
        )}
      </MobileStaggerItem>
    </MobileStagger>
  );
}
