"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, Mail, Search, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClientRecherche, SourceClient } from "@/lib/rechercheClient";
import { rechercherClientsAction } from "./rechercheClientActions";

export interface DonneesClientFormulaire {
  nom: string;
  siret: string;
  adresse: string;
  email: string;
}

const DELAI_DEBOUNCE_MS = 350;
const LONGUEUR_MIN = 2;

const SOURCES: { id: SourceClient; label: string; icone: typeof Building2 }[] = [
  { id: "insee", label: "INSEE", icone: Building2 },
  { id: "gmail", label: "Gmail", icone: Mail },
  { id: "tarineo", label: "Tarinéo", icone: Users },
];

const champClasse = "w-full app-input";
const labelClasse = "mb-1 block text-xs text-muted-foreground";

export function RechercheClient({
  valeur,
  onChange,
}: {
  valeur: DonneesClientFormulaire;
  onChange: (valeur: DonneesClientFormulaire) => void;
}) {
  const [recherche, setRecherche] = useState("");
  const [sourceActive, setSourceActive] = useState<SourceClient>("insee");
  const [enCours, setEnCours] = useState(false);
  const [resultatsInsee, setResultatsInsee] = useState<ClientRecherche[]>([]);
  const [resultatsTarineo, setResultatsTarineo] = useState<ClientRecherche[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [modeManuel, setModeManuel] = useState(
    Boolean(valeur.nom.trim() || valeur.siret.trim() || valeur.adresse.trim() || valeur.email.trim())
  );
  const [selectionne, setSelectionne] = useState<ClientRecherche | null>(null);
  const requeteRef = useRef(0);
  const minuterieRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rechercheActive =
    !modeManuel && recherche.trim().length >= LONGUEUR_MIN && sourceActive !== "gmail";

  const resultatsAffichés = !rechercheActive
    ? []
    : sourceActive === "insee"
      ? resultatsInsee
      : sourceActive === "tarineo"
        ? resultatsTarineo
        : [];

  const enCoursAffiche = rechercheActive && enCours;
  const erreurAffichee = rechercheActive ? erreur : null;

  const afficherSuggestions = rechercheActive;

  useEffect(() => {
    if (!rechercheActive) return;

    if (minuterieRef.current) clearTimeout(minuterieRef.current);

    const requeteId = ++requeteRef.current;

    minuterieRef.current = setTimeout(async () => {
      setEnCours(true);
      setErreur(null);

      const [inseeRes, tarineoRes] = await Promise.all([
        rechercherClientsAction(recherche, "insee"),
        rechercherClientsAction(recherche, "tarineo"),
      ]);

      if (requeteId !== requeteRef.current) return;

      setEnCours(false);

      if (!inseeRes.succes || !tarineoRes.succes) {
        setErreur("La recherche a échoué. Réessayez.");
        setResultatsInsee([]);
        setResultatsTarineo([]);
        return;
      }

      setResultatsInsee(inseeRes.resultats.insee);
      setResultatsTarineo(tarineoRes.resultats.tarineo);
    }, DELAI_DEBOUNCE_MS);

    return () => {
      if (minuterieRef.current) clearTimeout(minuterieRef.current);
    };
  }, [recherche, rechercheActive]);

  function selectionnerClient(client: ClientRecherche) {
    setSelectionne(client);
    setModeManuel(true);
    onChange({
      nom: client.nom,
      siret: client.siret ?? "",
      adresse: client.adresse ?? "",
      email: client.email ?? "",
    });
    setRecherche("");
    setResultatsInsee([]);
    setResultatsTarineo([]);
  }

  function passerEnManuel() {
    setModeManuel(true);
    setRecherche("");
    setResultatsInsee([]);
    setResultatsTarineo([]);
  }

  function effacerSelection() {
    setSelectionne(null);
    setModeManuel(false);
    onChange({ nom: "", siret: "", adresse: "", email: "" });
    setRecherche("");
  }

  function majChamp(champ: keyof DonneesClientFormulaire, contenu: string) {
    onChange({ ...valeur, [champ]: contenu });
    if (selectionne) {
      setSelectionne({ ...selectionne, [champ === "nom" ? "nom" : champ]: contenu || null });
    }
  }

  const initiales = valeur.nom.trim().slice(0, 1).toUpperCase() || "?";

  return (
    <div className="space-y-5">
      {!modeManuel && (
        <>
          <div>
            <label htmlFor="recherche-client" className={labelClasse}>
              Rechercher un client
            </label>
            <div className="relative mt-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="recherche-client"
                type="search"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Nom d'entreprise, SIRET, ville…"
                className={cn(champClasse, "pl-9")}
                autoComplete="off"
                autoFocus
              />

              {afficherSuggestions && (
                <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border border-border bg-white shadow-lg">
                  {enCoursAffiche ? (
                    <p className="px-4 py-3 text-sm text-muted-foreground">Recherche en cours…</p>
                  ) : erreurAffichee ? (
                    <p className="px-4 py-3 text-sm text-red-600">{erreurAffichee}</p>
                  ) : resultatsAffichés.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-muted-foreground">
                      <p>Aucun résultat {sourceActive === "insee" ? "INSEE" : "Tarinéo"} pour « {recherche} ».</p>
                      <button
                        type="button"
                        onClick={passerEnManuel}
                        className="mt-2 font-medium text-primary hover:underline"
                      >
                        Saisir le client manuellement
                      </button>
                    </div>
                  ) : (
                    <ul className="max-h-64 overflow-y-auto divide-y divide-border/60">
                      {resultatsAffichés.map((client) => (
                        <li key={client.id}>
                          <button
                            type="button"
                            onClick={() => selectionnerClient(client)}
                            className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/50"
                          >
                            <div className="min-w-0">
                              <p className="font-medium text-foreground">{client.nom}</p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {client.adresse ?? client.detail ?? "—"}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                              {client.source === "insee" ? "INSEE" : "Tarinéo"}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {SOURCES.map((source) => {
              const Icone = source.icone;
              const actif = sourceActive === source.id;
              const nb =
                source.id === "insee"
                  ? resultatsInsee.length
                  : source.id === "tarineo"
                    ? resultatsTarineo.length
                    : 0;
              return (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => setSourceActive(source.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    actif
                      ? "border-accent bg-accent/10 text-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-accent/40 hover:text-foreground"
                  )}
                >
                  <Icone className="size-4" />
                  {source.label}
                  {nb > 0 && actif && (
                    <span className="rounded-full bg-accent/20 px-1.5 text-[10px] font-semibold text-accent">
                      {nb}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {sourceActive === "gmail" && (
            <div className="rounded-2xl border border-dashed border-border bg-secondary/20 px-4 py-5 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Import Gmail — bientôt disponible</p>
              <p className="mt-1">Connectez votre compte Google dans Paramètres pour importer vos contacts clients.</p>
            </div>
          )}

          <button
            type="button"
            onClick={passerEnManuel}
            className="text-sm font-medium text-primary hover:underline"
          >
            Saisir le client sans recherche
          </button>
        </>
      )}

      {modeManuel && (
        <div className="rounded-2xl border border-border bg-background p-4 sm:p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {valeur.nom.trim() && (
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
                  {initiales}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {selectionne ? "Client sélectionné" : "Informations client"}
                </p>
                {selectionne && (
                  <p className="text-xs text-muted-foreground">
                    Source : {selectionne.source === "insee" ? "INSEE entreprises" : "Tarinéo"}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={effacerSelection}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Changer de client
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="clientNom" className={labelClasse}>Nom</label>
              <input
                id="clientNom"
                value={valeur.nom}
                onChange={(e) => majChamp("nom", e.target.value)}
                className={champClasse}
                required
              />
            </div>
            <div>
              <label htmlFor="clientSiret" className={labelClasse}>SIRET</label>
              <input
                id="clientSiret"
                value={valeur.siret}
                onChange={(e) => majChamp("siret", e.target.value)}
                placeholder="123 456 789 00012"
                className={champClasse}
              />
            </div>
            <div>
              <label htmlFor="clientEmail" className={labelClasse}>Email</label>
              <input
                id="clientEmail"
                type="email"
                value={valeur.email}
                onChange={(e) => majChamp("email", e.target.value)}
                placeholder="client@exemple.fr"
                className={champClasse}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="clientAdresse" className={labelClasse}>Adresse</label>
              <input
                id="clientAdresse"
                value={valeur.adresse}
                onChange={(e) => majChamp("adresse", e.target.value)}
                className={champClasse}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
