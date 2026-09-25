"use client";

import { useState } from "react";
import { WizardSteps } from "@/components/tarineo/WizardSteps";
import { FormulaireUpload } from "../documents/FormulaireUpload";
import { AnimationAnalyse } from "./analyse/AnimationAnalyse";
import { EtapeEntreprise } from "./EtapeEntreprise";
import { EtapeReveal } from "./EtapeReveal";
import type { ResumeAnalyse } from "@/lib/onboarding";
import { choisirImportPlusTard, chargerResumeOnboarding } from "./actions";
import { MascotteOnboarding } from "./MascotteOnboarding";
import { QuotaStrip } from "@/components/tarineo/QuotaStrip";
import { DashboardCartesZero } from "@/components/tarineo/DashboardCartesZero";
import type { EtatQuota } from "@/lib/quota";

const ETAPES = ["Bienvenue", "Import", "Analyse", "Entreprise", "Votre espace"];

type EtapeId = "accueil" | "import" | "analyse" | "entreprise" | "reveal";

type Props = {
  prenom: string;
  email: string;
  telephone?: string;
  entrepriseNom?: string;
  maxFichiersImport: number;
  etatQuota: EtatQuota;
};

export function OnboardingWizard({
  prenom,
  email,
  telephone,
  entrepriseNom,
  maxFichiersImport,
  etatQuota,
}: Props) {
  const [etape, setEtape] = useState<EtapeId>("accueil");
  const [etapeMax, setEtapeMax] = useState(1);
  const [nbDocuments, setNbDocuments] = useState(0);
  const [resume, setResume] = useState<ResumeAnalyse | null>(null);

  const indexEtape = { accueil: 1, import: 2, analyse: 3, entreprise: 4, reveal: 5 }[etape];

  function allerA(nouvelle: EtapeId) {
    setEtape(nouvelle);
    const idx = { accueil: 1, import: 2, analyse: 3, entreprise: 4, reveal: 5 }[nouvelle];
    setEtapeMax((m) => Math.max(m, idx));
  }

  async function apresAnalyse() {
    const data = await chargerResumeOnboarding();
    if (data) setResume(data);
    allerA("entreprise");
  }

  async function apresEntreprise() {
    const data = await chargerResumeOnboarding();
    if (data) setResume(data);
    allerA("reveal");
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-2 py-6 lg:py-10">
      {etape !== "accueil" && (
        <WizardSteps
          steps={ETAPES}
          actif={indexEtape}
          etapeMaxAtteinte={etapeMax}
          onSelect={(n) => {
            const map: EtapeId[] = ["accueil", "import", "analyse", "entreprise", "reveal"];
            if (n <= etapeMax) allerA(map[n - 1]);
          }}
        />
      )}

      {etape === "accueil" && (
        <div className="flex min-h-[60vh] flex-col justify-center">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MascotteOnboarding />
            <QuotaStrip etat={etatQuota} />
          </div>
          <p className="text-sm font-medium uppercase tracking-[0.07em] text-primary">Bienvenue</p>
          <h1 className="mt-3 text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
            Bonjour {prenom}.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Importez votre historique — Tarinéo construit fournisseurs, produits et alertes de hausse.
          </p>

          <div className="mt-5">
            <DashboardCartesZero />
          </div>

          <button
            type="button"
            onClick={() => allerA("import")}
            className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-white hover:opacity-95"
          >
            Importer mes documents
          </button>

          <form action={choisirImportPlusTard} className="mt-2">
            <button
              type="submit"
              className="flex h-12 w-full items-center justify-center rounded-full border border-border bg-card text-sm font-medium text-foreground hover:bg-secondary"
            >
              Je le ferai plus tard
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Jusqu&apos;à {maxFichiersImport} fichiers · PDF, JPEG, PNG, HEIC
          </p>
        </div>
      )}

      {etape === "import" && (
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Choisissez vos documents</h2>
              <p className="mt-1 text-sm text-muted-foreground">Jusqu&apos;à {maxFichiersImport} fichiers d&apos;un coup.</p>
            </div>
            <QuotaStrip etat={etatQuota} />
          </div>
          <div className="mt-5">
            <FormulaireUpload modeOnboarding variantPc variantCompact maxFichiers={maxFichiersImport} />
          </div>
        </div>
      )}

      {etape === "analyse" && (
        <AnimationAnalyse nbDocuments={nbDocuments} onTermine={apresAnalyse} />
      )}

      {etape === "entreprise" && (
        <EtapeEntreprise
          email={email}
          telephoneInitial={telephone}
          nomInitial={entrepriseNom}
          onContinuer={apresEntreprise}
          onPasser={apresEntreprise}
        />
      )}

      {etape === "reveal" && resume && <EtapeReveal resume={resume} />}
    </div>
  );
}
