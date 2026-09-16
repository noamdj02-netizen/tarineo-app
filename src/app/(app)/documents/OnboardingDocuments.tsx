"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { XIcon } from "lucide-react";
import { BtnPrimary } from "@/components/tarineo/Actions";

const CLE_DISMISS_ONBOARDING = "tarineo-documents-onboarding-dismissed";

type Props = {
  documentsTotal: number;
  historiqueSuffisant: boolean;
  alertesCount: number;
  forceAffichage?: boolean;
};

function etapeCourante(documentsTotal: number, historiqueSuffisant: boolean, alertesCount: number) {
  if (alertesCount > 0) return 3;
  if (historiqueSuffisant) return 2;
  if (documentsTotal > 0) return 1;
  return 1;
}

export function OnboardingDocuments({
  documentsTotal,
  historiqueSuffisant,
  alertesCount,
  forceAffichage = false,
}: Props) {
  const [masque, setMasque] = useState(false);

  useEffect(() => {
    try {
      // Lecture d'un système externe (localStorage), impossible au premier rendu
      // puisqu'il n'existe pas côté serveur — exception assumée à la règle, ce n'est
      // pas un état dérivé d'un autre état React.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMasque(localStorage.getItem(CLE_DISMISS_ONBOARDING) === "1");
    } catch {
      // localStorage indisponible (mode privé strict) — on affiche quand même
    }
  }, []);

  function fermer() {
    setMasque(true);
    try {
      localStorage.setItem(CLE_DISMISS_ONBOARDING, "1");
    } catch {
      // ignore
    }
  }

  const etape = etapeCourante(documentsTotal, historiqueSuffisant, alertesCount);
  const termine = alertesCount > 0;
  const afficher = !masque && (forceAffichage || documentsTotal < 3 || !historiqueSuffisant);

  const progression = useMemo(() => {
    if (etape === 1) return documentsTotal >= 2 ? 66 : documentsTotal >= 1 ? 33 : 8;
    if (etape === 2) return 75;
    return 100;
  }, [documentsTotal, etape]);

  if (!afficher || termine) return null;

  const titres = [
    "Construisez votre base de comparaison",
    "Testez sur un devis récent",
    "Vos alertes sont prêtes",
  ];

  const descriptions = [
    "Importez au moins 2 devis ou factures du même fournisseur (ex. Cedeo, Point P). Tarineo compare vos prix à votre historique personnel.",
    "Votre base est prête. Importez un nouveau devis reçu récemment pour voir si un prix a augmenté.",
    "Tarineo surveille désormais vos hausses. Consultez le tableau de bord pour suivre vos économies.",
  ];

  return (
    <section className="relative mb-6 overflow-hidden rounded-[24px] border border-primary/15 bg-gradient-to-br from-[#FFF7F2] to-white p-6 shadow-sm">
      <button
        type="button"
        onClick={fermer}
        className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground"
        aria-label="Masquer ce guide"
      >
        <XIcon className="size-4" />
      </button>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary">
            <span>Activation</span>
            <span className="text-muted-foreground">·</span>
            <span>Étape {etape} sur 3</span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-[#FFE8DC]">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progression}%` }}
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground">{titres[etape - 1]}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{descriptions[etape - 1]}</p>
          </div>

          <ul className="grid gap-2 text-sm sm:grid-cols-3">
            <li className={`rounded-xl px-3 py-2 ${documentsTotal >= 2 ? "bg-[#E8F8EE] text-[#1F7A3D]" : "bg-secondary text-foreground"}`}>
              {documentsTotal >= 2 ? "✓" : "1."} 2 docs même enseigne
            </li>
            <li className={`rounded-xl px-3 py-2 ${historiqueSuffisant ? "bg-[#E8F8EE] text-[#1F7A3D]" : "bg-secondary text-muted-foreground"}`}>
              {historiqueSuffisant ? "✓" : "2."} Comparaison activée
            </li>
            <li className={`rounded-xl px-3 py-2 ${alertesCount > 0 ? "bg-[#E8F8EE] text-[#1F7A3D]" : "bg-secondary text-muted-foreground"}`}>
              {alertesCount > 0 ? "✓" : "3."} Première alerte
            </li>
          </ul>

          <div className="flex flex-wrap gap-3">
            <BtnPrimary href="#formulaire-upload">Importer un document</BtnPrimary>
            {historiqueSuffisant && (
              <Link
                href="/accueil"
                className="inline-flex h-11 items-center rounded-full border border-[#E6E9EB] bg-white px-5 text-sm font-medium text-foreground hover:bg-[#F8F8F8]"
              >
                Voir le tableau de bord
              </Link>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-2 lg:pt-1">
          <div className="relative flex size-24 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-primary/10">
            <Image
              src="/landing/logo-icon.png"
              alt=""
              width={56}
              height={56}
              className="size-14 animate-pulse"
            />
          </div>
          <p className="text-center text-xs text-muted-foreground">Analyse en 30 secondes</p>
        </div>
      </div>
    </section>
  );
}
