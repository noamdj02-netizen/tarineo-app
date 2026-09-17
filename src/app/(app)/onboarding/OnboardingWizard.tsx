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

const ETAPES = ["Bienvenue", "Import", "Analyse", "Entreprise", "Votre espace"];

type EtapeId = "accueil" | "import" | "analyse" | "entreprise" | "reveal";

type Props = {
  prenom: string;
  email: string;
  telephone?: string;
  entrepriseNom?: string;
  maxFichiersImport: number;
};

export function OnboardingWizard({ prenom, email, telephone, entrepriseNom, maxFichiersImport }: Props) {
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
          <MascotteOnboarding />
          <p className="text-sm font-medium uppercase tracking-[0.07em] text-primary">Bienvenue</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            Bonjour {prenom}.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Importez vos devis et factures fournisseurs — Tarinéo construit automatiquement votre espace :
            fournisseurs, produits, historique de prix.
          </p>

          <p className="mt-10 text-lg font-medium text-foreground">Importez vos documents</p>

          <button
            type="button"
            onClick={() => allerA("import")}
            className="mt-6 flex h-14 w-full items-center justify-center rounded-full bg-primary text-base font-semibold text-white hover:opacity-95"
          >
            Importer mes documents
          </button>

          <form action={choisirImportPlusTard} className="mt-3">
            <button
              type="submit"
              className="flex h-14 w-full items-center justify-center rounded-full border border-border bg-card text-base font-medium text-foreground hover:bg-secondary"
            >
              Je le ferai plus tard
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Factures, devis, bons de commande — PDF ou photos. Jusqu&apos;à {maxFichiersImport} documents en une
            fois.
          </p>
        </div>
      )}

      {etape === "import" && (
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Choisissez vos documents</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Glissez-déposez ou parcourez vos dossiers — jusqu&apos;à {maxFichiersImport} fichiers d&apos;un coup (PDF,
            JPEG, PNG, HEIC).
          </p>
          <div className="mt-6">
            <FormulaireUpload
              modeOnboarding
              variantPc
              variantCompact
              maxFichiers={maxFichiersImport}
              onImportReussi={(count) => {
                setNbDocuments(count);
                allerA("analyse");
              }}
            />
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
