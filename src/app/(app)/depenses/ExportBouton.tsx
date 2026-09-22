"use client";

import { useState } from "react";
import { BadgePlanPro, LienPasserPro } from "@/components/tarineo/BadgePlanPro";
import { messageFonctionPlanRequise } from "@/lib/planGating";

type TypeDocumentExport = "FACTURE" | "BON_COMMANDE" | "BON_ENLEVEMENT";

const TYPES: { valeur: TypeDocumentExport; label: string }[] = [
  { valeur: "FACTURE", label: "Factures" },
  { valeur: "BON_COMMANDE", label: "Bons de commande" },
  { valeur: "BON_ENLEVEMENT", label: "Bons d'enlèvement" },
];

function moisActuelISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function dateISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function debutMoisActuelISO(): string {
  const d = new Date();
  return dateISO(new Date(d.getFullYear(), d.getMonth(), 1));
}

const optionClasse = (selectionne: boolean) =>
  `flex-1 cursor-pointer rounded-md border px-3 py-1.5 text-center text-xs font-medium transition-colors ${
    selectionne
      ? "border-accent bg-accent/10 text-accent"
      : "border-[var(--border)] bg-white text-muted-foreground hover:border-[var(--accent)]/40"
  }`;

interface Props {
  distributeurs: { norm: string; label: string }[];
  accesExport?: boolean;
}

// Export comptable de /depenses : factures, bons de commande et bons d'enlèvement
// validés sur la période et les filtres choisis, en CSV ou Excel. Formulaire GET natif
// vers la route /depenses/export — le navigateur gère le téléchargement directement,
// pas besoin de fetch/blob côté client.
export function ExportBouton({ distributeurs, accesExport = true }: Props) {
  const [ouvert, setOuvert] = useState(false);
  const [format, setFormat] = useState<"csv" | "xlsx">("csv");
  const [periodeType, setPeriodeType] = useState<"mensuelle" | "annuelle" | "personnalisee">("mensuelle");
  const [mois, setMois] = useState(moisActuelISO());
  const [annee, setAnnee] = useState(String(new Date().getFullYear()));
  const [du, setDu] = useState(debutMoisActuelISO());
  const [au, setAu] = useState(dateISO(new Date()));
  // Tous sélectionnés par défaut (équivalent à l'ancien "Tous les distributeurs").
  const [distributeurNorms, setDistributeurNorms] = useState<Set<string>>(
    new Set(distributeurs.map((d) => d.norm))
  );
  const [typesActifs, setTypesActifs] = useState<Set<TypeDocumentExport>>(
    new Set(TYPES.map((t) => t.valeur))
  );

  const tousDistributeursSelectionnes = distributeurNorms.size === distributeurs.length;
  // Résumé affiché nulle part mais utilisé pour le nom de fichier (voir nomFichierExport
  // dans src/lib/exportComptable.ts) : "" quand tous sont inclus (pas de suffixe, comme
  // avant), un ou plusieurs labels sinon.
  const labelsSelectionnes = distributeurs.filter((d) => distributeurNorms.has(d.norm)).map((d) => d.label);
  const distributeurLabel = tousDistributeursSelectionnes
    ? ""
    : labelsSelectionnes.length <= 3
      ? labelsSelectionnes.join("+")
      : "plusieurs-distributeurs";

  function basculerType(valeur: TypeDocumentExport) {
    setTypesActifs((actuels) => {
      const suivants = new Set(actuels);
      if (suivants.has(valeur)) {
        // Toujours garder au moins un type sélectionné — un export à 0 type n'a pas de sens.
        if (suivants.size === 1) return suivants;
        suivants.delete(valeur);
      } else {
        suivants.add(valeur);
      }
      return suivants;
    });
  }

  function basculerDistributeur(norm: string) {
    setDistributeurNorms((actuels) => {
      const suivants = new Set(actuels);
      if (suivants.has(norm)) {
        // Même garde-fou que pour les types : jamais 0 distributeur sélectionné.
        if (suivants.size === 1) return suivants;
        suivants.delete(norm);
      } else {
        suivants.add(norm);
      }
      return suivants;
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOuvert((o) => !o)}
        aria-expanded={ouvert}
        className="app-btn-secondary inline-flex items-center gap-2"
      >
        Exporter
        {!accesExport && <BadgePlanPro />}
      </button>

      {!accesExport && ouvert && (
        <div className="absolute right-0 top-full z-20 mt-2 w-72 app-card p-4 shadow-[var(--app-card-shadow)]">
          <p className="text-sm text-foreground">{messageFonctionPlanRequise("export")}</p>
          <p className="mt-3">
            <LienPasserPro />
          </p>
        </div>
      )}

      {accesExport && ouvert && (
        <form
          method="GET"
          action="/depenses/export"
          className="absolute right-0 top-full z-20 mt-2 w-80 space-y-3 app-card p-4 shadow-[var(--app-card-shadow)]"
        >
          <input type="hidden" name="periode" value={periodeType} />
          <input type="hidden" name="distributeurLabel" value={distributeurLabel} />

          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">Format</p>
            <div className="flex gap-2">
              {(["csv", "xlsx"] as const).map((f) => (
                <label key={f} className={optionClasse(format === f)}>
                  <input
                    type="radio"
                    name="format"
                    value={f}
                    checked={format === f}
                    onChange={() => setFormat(f)}
                    className="sr-only"
                  />
                  {f === "csv" ? "CSV" : "Excel"}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">Période</p>
            <div className="flex gap-2">
              {(["mensuelle", "annuelle", "personnalisee"] as const).map((p) => (
                <label key={p} className={optionClasse(periodeType === p)}>
                  <input
                    type="radio"
                    name="periodeAffichage"
                    value={p}
                    checked={periodeType === p}
                    onChange={() => setPeriodeType(p)}
                    className="sr-only"
                  />
                  {p === "mensuelle" ? "Mensuelle" : p === "annuelle" ? "Annuelle" : "Personnalisée"}
                </label>
              ))}
            </div>
          </div>

          {periodeType === "mensuelle" && (
            <div>
              <label htmlFor="export-mois" className="mb-1 block text-xs text-muted-foreground">
                Mois
              </label>
              <input
                id="export-mois"
                type="month"
                name="mois"
                required
                value={mois}
                onChange={(e) => setMois(e.target.value)}
                className="w-full app-input text-foreground outline-none focus:border-accent"
              />
            </div>
          )}

          {periodeType === "annuelle" && (
            <div>
              <label htmlFor="export-annee" className="mb-1 block text-xs text-muted-foreground">
                Année
              </label>
              <input
                id="export-annee"
                type="number"
                name="annee"
                required
                min={2020}
                max={2100}
                value={annee}
                onChange={(e) => setAnnee(e.target.value)}
                className="w-full app-input text-foreground outline-none focus:border-accent"
              />
            </div>
          )}

          {periodeType === "personnalisee" && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="export-du" className="mb-1 block text-xs text-muted-foreground">
                  Du
                </label>
                <input
                  id="export-du"
                  type="date"
                  name="du"
                  required
                  value={du}
                  onChange={(e) => setDu(e.target.value)}
                  className="app-input"
                />
              </div>
              <div>
                <label htmlFor="export-au" className="mb-1 block text-xs text-muted-foreground">
                  Au
                </label>
                <input
                  id="export-au"
                  type="date"
                  name="au"
                  required
                  value={au}
                  onChange={(e) => setAu(e.target.value)}
                  className="app-input"
                />
              </div>
            </div>
          )}

          {distributeurs.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs text-muted-foreground">
                Distributeur{tousDistributeursSelectionnes ? " (tous inclus)" : ""}
              </p>
              <div className="space-y-1.5">
                {distributeurs.map((d) => (
                  <label key={d.norm} className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      // Nom omis quand tous sont sélectionnés : rien n'est alors soumis
                      // pour "distributeur", exactement comme l'ancien select vide —
                      // le serveur traite l'absence du paramètre comme "tous" (voir
                      // route.ts). Évite un export qui casserait si un nouveau
                      // distributeur apparaît entre le chargement de la page et l'envoi.
                      name={tousDistributeursSelectionnes ? undefined : "distributeur"}
                      value={d.norm}
                      checked={distributeurNorms.has(d.norm)}
                      onChange={() => basculerDistributeur(d.norm)}
                      className="h-4 w-4 rounded border-border bg-background accent-accent"
                    />
                    {d.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">Type de document</p>
            <div className="space-y-1.5">
              {TYPES.map((t) => (
                <label key={t.valeur} className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    name="types"
                    value={t.valeur}
                    checked={typesActifs.has(t.valeur)}
                    onChange={() => basculerType(t.valeur)}
                    className="h-4 w-4 rounded border-border bg-background accent-accent"
                  />
                  {t.label}
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full app-btn-primary"
          >
            Télécharger
          </button>
        </form>
      )}
    </div>
  );
}
