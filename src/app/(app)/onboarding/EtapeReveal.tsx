"use client";

import { useRouter } from "next/navigation";
import type { ResumeAnalyse } from "@/lib/onboarding";
import { terminerOnboardingEtAllerDashboard } from "./actions";

const formaterEuros = (v: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);

export function EtapeReveal({ resume }: { resume: ResumeAnalyse }) {
  const router = useRouter();

  const stats = [
    { label: "Documents analysés", valeur: String(resume.documentsAnalyses) },
    { label: "Fournisseurs identifiés", valeur: String(resume.fournisseursIdentifies) },
    { label: "Produits détectés", valeur: String(resume.produitsDetectes) },
    { label: "Clients identifiés", valeur: String(resume.clientsIdentifies) },
    { label: "Variations de prix", valeur: String(resume.variationsPrix) },
    { label: "Produits à surveiller", valeur: String(resume.produitsASurveiller) },
  ];

  async function ouvrirDashboard() {
    await terminerOnboardingEtAllerDashboard();
    router.push("/accueil");
    router.refresh();
  }

  return (
    <div className="flex flex-col">
      <p className="text-sm font-medium uppercase tracking-wider text-primary">Espace prêt</p>
      <h2 className="mt-3 text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
        Votre espace est prêt.
      </h2>
      <p className="mt-3 text-base text-muted-foreground">
        Voici ce que Tarinéo a trouvé à partir de{" "}
        <strong className="font-medium text-foreground">vos</strong> documents — aucun chiffre inventé.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-[20px] bg-card p-5 ring-1 ring-border">
            <p className="text-3xl font-semibold text-foreground">{s.valeur}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {resume.impactEuros > 0 && (
        <div className="mt-4 rounded-[20px] bg-[#FFF0E8] p-5">
          <p className="text-sm font-medium text-primary">Impact identifié</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{formaterEuros(resume.impactEuros)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Sur les hausses détectées dans votre historique personnel.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={ouvrirDashboard}
        className="mt-10 flex h-14 w-full items-center justify-center rounded-full bg-primary text-base font-semibold text-white hover:opacity-95"
      >
        Découvrir mon dashboard
      </button>
    </div>
  );
}
