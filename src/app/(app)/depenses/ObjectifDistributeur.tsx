"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { definirObjectif, supprimerObjectif } from "./actions";

interface Props {
  distributor: string;
  distributorNorm: string;
  depenses: number;
  objectif: number | null;
  periodStartMonth: number;
  periodStartDay: number;
  pourcentageAtteinte: number | null;
  encoursRestant: number | null;
  periodeLabel: string;
}

const formaterEuros = (v: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(v);

export function ObjectifDistributeur(props: Props) {
  const router = useRouter();
  const [enEdition, setEnEdition] = useState(false);
  const [montant, setMontant] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  // Recalculé à chaque ouverture du formulaire (pas seulement au montage du composant) :
  // sinon, après un enregistrement + router.refresh(), le formulaire rouvert affichait
  // encore l'ancien état local au lieu des valeurs réellement stockées.
  function ouvrirEdition() {
    setErreur(null);
    setMontant(props.objectif !== null ? props.objectif.toFixed(2) : "");
    setDateDebut(
      props.objectif !== null
        ? `${new Date().getUTCFullYear()}-${String(props.periodStartMonth).padStart(2, "0")}-${String(
            props.periodStartDay
          ).padStart(2, "0")}`
        : ""
    );
    setEnEdition(true);
  }

  async function enregistrer() {
    setErreur(null);
    const montantNombre = Number(montant);
    if (!montantNombre || montantNombre <= 0) {
      setErreur("Montant invalide.");
      return;
    }
    setEnCours(true);

    const resultat = await definirObjectif({
      distributor: props.distributor,
      targetHt: montantNombre,
      periodStartDate: dateDebut || null,
    });

    setEnCours(false);

    if (!resultat.succes) {
      setErreur(resultat.erreur);
      return;
    }

    setEnEdition(false);
    router.refresh();
  }

  async function supprimer() {
    setEnCours(true);
    await supprimerObjectif(props.distributorNorm);
    setEnCours(false);
    router.refresh();
  }

  const pourcentage = props.pourcentageAtteinte;
  const barreCouleur =
    pourcentage === null
      ? "bg-accent"
      : pourcentage > 100
        ? "bg-red-500"
        : pourcentage >= 80
          ? "bg-amber-500"
          : "bg-accent";

  return (
    <div className="app-card-sm p-4">
      <div className="flex items-center justify-between gap-2">
        <Link
          href={`/documents?distributeur=${encodeURIComponent(props.distributorNorm)}`}
          className="font-medium hover:text-accent hover:underline"
          title={`Voir les documents ${props.distributor}`}
        >
          {props.distributor}
        </Link>
        {props.objectif === null ? (
          <button
            type="button"
            onClick={() => (enEdition ? setEnEdition(false) : ouvrirEdition())}
            className="shrink-0 text-xs text-muted-foreground hover:text-accent"
          >
            {enEdition ? "Annuler" : "Définir un objectif"}
          </button>
        ) : (
          <div className="flex shrink-0 gap-3 text-xs">
            <button
              type="button"
              onClick={() => (enEdition ? setEnEdition(false) : ouvrirEdition())}
              className="text-muted-foreground hover:text-accent"
            >
              {enEdition ? "Annuler" : "Modifier"}
            </button>
            <button
              type="button"
              onClick={supprimer}
              disabled={enCours}
              className="text-muted-foreground hover:text-red-400 disabled:opacity-50"
            >
              Supprimer
            </button>
          </div>
        )}
      </div>

      {props.objectif !== null ? (
        <Link href={`/documents?distributeur=${encodeURIComponent(props.distributorNorm)}`} className="mt-3 block">
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#f0f0f2]">
            <div
              className={`h-full rounded-full ${barreCouleur}`}
              style={{ width: `${Math.min(pourcentage ?? 0, 100)}%` }}
            />
          </div>
          <div className="mt-2 flex items-baseline justify-between text-sm">
            <span>
              {formaterEuros(props.depenses)}{" "}
              <span className="text-muted-foreground">/ {formaterEuros(props.objectif)}</span>
            </span>
            <span className="text-muted-foreground">{pourcentage?.toFixed(0)} %</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {props.encoursRestant !== null && props.encoursRestant >= 0
              ? `Encours restant : ${formaterEuros(props.encoursRestant)}`
              : `Objectif dépassé de ${formaterEuros(Math.abs(props.encoursRestant ?? 0))}`}
            {" · "}
            {props.periodeLabel}
          </p>
        </Link>
      ) : (
        <Link
          href={`/documents?distributeur=${encodeURIComponent(props.distributorNorm)}`}
          className="mt-2 block text-sm text-muted-foreground hover:text-foreground"
        >
          {formaterEuros(props.depenses)} dépensés cette année
        </Link>
      )}

      {enEdition && (
        <div className="mt-4 space-y-2 border-t border-border pt-3">
          <div>
            <label htmlFor={`montant-${props.distributorNorm}`} className="block text-xs text-muted-foreground mb-1">
              Objectif annuel HT (€)
            </label>
            <input
              id={`montant-${props.distributorNorm}`}
              type="number"
              step="0.01"
              min="0"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              disabled={enCours}
              className="w-full app-input"
            />
          </div>
          <div>
            <label htmlFor={`date-${props.distributorNorm}`} className="block text-xs text-muted-foreground mb-1">
              Début de la période (facultatif — 1er janvier par défaut)
            </label>
            <input
              id={`date-${props.distributorNorm}`}
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              disabled={enCours}
              className="w-full app-input"
            />
          </div>
          {erreur && <p className="text-xs text-red-400">{erreur}</p>}
          <button
            type="button"
            onClick={enregistrer}
            disabled={enCours}
            className="w-full app-btn-primary disabled:opacity-50"
          >
            {enCours ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      )}
    </div>
  );
}
