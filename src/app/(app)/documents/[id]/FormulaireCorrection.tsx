"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { validerDocument } from "./actions";

const OPTIONS_TYPE = [
  { valeur: "DEVIS", label: "Devis" },
  { valeur: "FACTURE", label: "Facture" },
  { valeur: "BON_COMMANDE", label: "Bon de commande" },
  { valeur: "BON_ENLEVEMENT", label: "Bon d'enlèvement" },
] as const;

interface LigneFormulaire {
  cle: string;
  reference: string;
  manufacturerRef: string;
  designation: string;
  quantity: string;
  unitPriceHt: string;
  totalHt: string;
}

interface Props {
  documentId: string;
  type: "DEVIS" | "FACTURE" | "BON_COMMANDE" | "BON_ENLEVEMENT";
  distributor: string;
  documentDate: string;
  totalHt: string;
  totalTtc: string;
  lignes: LigneFormulaire[];
}

function ligneVide(): LigneFormulaire {
  return {
    cle: crypto.randomUUID(),
    reference: "",
    manufacturerRef: "",
    designation: "",
    quantity: "1",
    unitPriceHt: "",
    totalHt: "",
  };
}

export function FormulaireCorrection(props: Props) {
  const router = useRouter();
  const [type, setType] = useState(props.type);
  const [distributor, setDistributor] = useState(props.distributor);
  const [documentDate, setDocumentDate] = useState(props.documentDate);
  const [totalHt, setTotalHt] = useState(props.totalHt);
  const [totalTtc, setTotalTtc] = useState(props.totalTtc);
  const [lignes, setLignes] = useState<LigneFormulaire[]>(
    props.lignes.length > 0 ? props.lignes : [ligneVide()]
  );
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  // Un total à 0€ est rarement volontaire (devis/facture illisible, champ oublié) —
  // on force un aller-retour explicite plutôt que de laisser passer silencieusement
  // (voir l'audit de fiabilité /depenses).
  const [confirmationZeroRequise, setConfirmationZeroRequise] = useState(false);

  function majLigne(cle: string, patch: Partial<LigneFormulaire>) {
    setLignes((prev) => prev.map((l) => (l.cle === cle ? { ...l, ...patch } : l)));
  }

  function supprimerLigne(cle: string) {
    setLignes((prev) => (prev.length > 1 ? prev.filter((l) => l.cle !== cle) : prev));
  }

  async function enregistrer() {
    setErreur(null);

    const totalVide = totalHt.trim() === "" || Number(totalHt) === 0;
    if (totalVide && !confirmationZeroRequise) {
      setConfirmationZeroRequise(true);
      return;
    }

    setEnCours(true);

    const donnees = {
      type,
      distributor,
      documentDate,
      totalHt: Number(totalHt),
      totalTtc: Number(totalTtc),
      lignes: lignes.map((l) => ({
        reference: l.reference,
        manufacturerRef: l.manufacturerRef,
        designation: l.designation,
        quantity: Number(l.quantity),
        unitPriceHt: Number(l.unitPriceHt),
        totalHt: Number(l.totalHt),
      })),
    };

    const resultat = await validerDocument(props.documentId, donnees);

    setEnCours(false);

    if (!resultat.succes) {
      setErreur(resultat.erreur);
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-4 app-card-sm p-4">
      <fieldset>
        <legend className="mb-2 text-sm text-muted">Type de document</legend>
        <div className="flex flex-wrap gap-2">
          {OPTIONS_TYPE.map((option) => (
            <label
              key={option.valeur}
              className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                enCours ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              } ${
                type === option.valeur
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border hover:border-accent"
              }`}
            >
              <input
                type="radio"
                name="type"
                value={option.valeur}
                checked={type === option.valeur}
                onChange={() => setType(option.valeur)}
                disabled={enCours}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="distributor" className="block text-sm text-muted mb-1">
            Distributeur
          </label>
          <input
            id="distributor"
            type="text"
            value={distributor}
            onChange={(e) => setDistributor(e.target.value)}
            disabled={enCours}
            className="w-full app-input"
          />
        </div>
        <div>
          <label htmlFor="documentDate" className="block text-sm text-muted mb-1">
            Date
          </label>
          <input
            id="documentDate"
            type="date"
            value={documentDate}
            onChange={(e) => setDocumentDate(e.target.value)}
            disabled={enCours}
            className="w-full app-input"
          />
        </div>
        <div>
          <label htmlFor="totalHt" className="block text-sm text-muted mb-1">
            Total HT (€)
          </label>
          <input
            id="totalHt"
            type="number"
            step="0.01"
            min="0"
            value={totalHt}
            onChange={(e) => {
              setTotalHt(e.target.value);
              setConfirmationZeroRequise(false);
            }}
            disabled={enCours}
            className="w-full app-input"
          />
        </div>
        <div>
          <label htmlFor="totalTtc" className="block text-sm text-muted mb-1">
            Total TTC (€)
          </label>
          <input
            id="totalTtc"
            type="number"
            step="0.01"
            min="0"
            value={totalTtc}
            onChange={(e) => setTotalTtc(e.target.value)}
            disabled={enCours}
            className="w-full app-input"
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm text-muted">Lignes produits</h3>
          <button
            type="button"
            onClick={() => setLignes((prev) => [...prev, ligneVide()])}
            disabled={enCours}
            className="rounded-md border border-border px-3 py-1 text-xs hover:border-accent disabled:opacity-50"
          >
            + Ajouter une ligne
          </button>
        </div>

        <div className="space-y-2">
          {lignes.map((ligne) => (
            <div key={ligne.cle} className="rounded-md border border-border p-2">
              <div className="grid grid-cols-[1fr_2fr_4.5rem_5.5rem_5.5rem_1.75rem] gap-2">
                <input
                  type="text"
                  placeholder="Référence"
                  value={ligne.reference}
                  onChange={(e) => majLigne(ligne.cle, { reference: e.target.value })}
                  disabled={enCours}
                  className="min-w-0 rounded-xl border border-[var(--border)] bg-white px-2 py-1 text-sm"
                />
                <input
                  type="text"
                  placeholder="Désignation"
                  value={ligne.designation}
                  onChange={(e) => majLigne(ligne.cle, { designation: e.target.value })}
                  disabled={enCours}
                  className="min-w-0 rounded-xl border border-[var(--border)] bg-white px-2 py-1 text-sm"
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Qté"
                  value={ligne.quantity}
                  onChange={(e) => majLigne(ligne.cle, { quantity: e.target.value })}
                  disabled={enCours}
                  className="min-w-0 rounded-xl border border-[var(--border)] bg-white px-2 py-1 text-sm"
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="PU HT"
                  value={ligne.unitPriceHt}
                  onChange={(e) => majLigne(ligne.cle, { unitPriceHt: e.target.value })}
                  disabled={enCours}
                  className="min-w-0 rounded-xl border border-[var(--border)] bg-white px-2 py-1 text-sm"
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Total HT"
                  value={ligne.totalHt}
                  onChange={(e) => majLigne(ligne.cle, { totalHt: e.target.value })}
                  disabled={enCours}
                  className="min-w-0 rounded-xl border border-[var(--border)] bg-white px-2 py-1 text-sm"
                />
                <button
                  type="button"
                  onClick={() => supprimerLigne(ligne.cle)}
                  disabled={enCours || lignes.length === 1}
                  className="rounded border border-border text-sm text-muted hover:border-red-500 hover:text-red-400 disabled:opacity-30"
                  title="Supprimer la ligne"
                >
                  ×
                </button>
              </div>
              <input
                type="text"
                placeholder="Référence fabricant (optionnel — pour comparer les prix entre distributeurs)"
                value={ligne.manufacturerRef}
                onChange={(e) => majLigne(ligne.cle, { manufacturerRef: e.target.value })}
                disabled={enCours}
                className="mt-2 w-full min-w-0 rounded-xl border border-[var(--border)] bg-white px-2 py-1 text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {confirmationZeroRequise && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-400">
          Le total HT est vide ou à 0€. Ce document ne comptera pour rien dans vos dépenses. Confirmez que c&apos;est
          bien voulu, ou corrigez le montant ci-dessus.
        </p>
      )}

      {erreur && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-400">
          {erreur}
        </p>
      )}

      <button
        type="button"
        onClick={enregistrer}
        disabled={enCours}
        className={`w-full rounded-md px-4 py-2 font-medium hover:opacity-90 disabled:opacity-50 ${
          confirmationZeroRequise
            ? "bg-amber-500 text-background"
            : "bg-accent text-accent-foreground"
        }`}
      >
        {enCours
          ? "Enregistrement..."
          : confirmationZeroRequise
            ? "Confirmer 0€ et valider"
            : "Enregistrer et valider"}
      </button>
    </div>
  );
}
