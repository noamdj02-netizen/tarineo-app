"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { WizardSteps } from "@/components/tarineo/WizardSteps";
import type { SuggestionPrix } from "@/lib/suggestionPrix";
import { RechercheClient } from "./RechercheClient";
import { PRESETS_CONDITIONS_PAIEMENT, PRESETS_VALIDITE_JOURS } from "@/lib/devisClientsConstants";

// Étapes du wizard de création/modification. L'étape 1 (IA) reste facultative : on peut
// la traverser sans rien écrire et saisir les lignes à la main à l'étape 3.
const ETAPES = ["Description", "Client", "Prestations", "Récap"] as const;

interface LigneFormulaire {
  cle: string;
  designation: string;
  quantite: string;
  prixUnitaireHt: string;
  tauxTva: string;
  // Purement local, jamais envoyé avec le devis (voir DonneesSoumissionDevis) : sert
  // uniquement de terme de recherche pour la suggestion de prix ci-dessous.
  reference: string;
}

type ResultatSuggestionPrix = { succes: true; suggestion: SuggestionPrix | null } | { succes: false; erreur: string };

// État de la recherche de suggestion pour une ligne donnée, tenu par clé de ligne — voir
// surChangementReference. `null` = pas encore de recherche (référence vide ou trop
// courte).
interface EtatSuggestionLigne {
  enCours: boolean;
  suggestion: SuggestionPrix | null;
  erreur: string | null;
}

const DELAI_DEBOUNCE_MS = 500;
const LONGUEUR_MIN_RECHERCHE = 3;

interface LigneEnvoi {
  designation: string;
  quantite: number;
  prixUnitaireHt: number;
  tauxTva: number;
}

type ResultatGenerationIA =
  | { succes: true; clientNom: string | null; lignes: LigneEnvoi[] }
  | { succes: false; erreur: string };

type ResultatSoumissionDevis = { succes: true; id: string } | { succes: false; erreur: string };

interface DonneesSoumissionDevis {
  clientNom: string;
  clientAdresse?: string;
  clientSiret?: string;
  clientEmail?: string;
  dureeValiditeJours: number;
  conditionsPaiement: string;
  promptOriginal?: string;
  lignes: LigneEnvoi[];
}

export interface DevisExistantPourFormulaire {
  id: string;
  clientNom: string;
  clientAdresse: string | null;
  clientSiret: string | null;
  clientEmail: string | null;
  dureeValiditeJours: number;
  conditionsPaiement: string;
  lignes: LigneEnvoi[];
}

function ligneVide(): LigneFormulaire {
  return { cle: crypto.randomUUID(), designation: "", quantite: "1", prixUnitaireHt: "", tauxTva: "20", reference: "" };
}

function lignesFormulaireDepuis(lignes: LigneEnvoi[]): LigneFormulaire[] {
  return lignes.map((l) => ({
    cle: crypto.randomUUID(),
    designation: l.designation,
    quantite: String(l.quantite),
    prixUnitaireHt: String(l.prixUnitaireHt),
    tauxTva: String(l.tauxTva),
    reference: "",
  }));
}

const champClasse = "w-full app-input";
const labelClasse = "mb-1 block text-xs text-muted-foreground";

// Grille éditable des lignes — alimentée soit à la main, soit par le pipeline IA (voir la
// section prompt plus bas) : dans les deux cas, l'artisan corrige avant de valider (aperçu
// éditable requis par le plan, pour ne jamais envoyer une ligne générée sans relecture).
//
// Composant partagé entre la création (devis-clients/nouveau/page.tsx, actions
// genererDepuisPrompt/creerDevis) et la modification d'un devis existant
// (devis-clients/[id]/modifier/page.tsx, actions modifierLignesAvecIA/mettreAJourDevis,
// activée via `devisExistant`) — seuls les libellés et le point d'entrée IA/soumission
// diffèrent, la logique de saisie des lignes est identique dans les deux cas.
function BoutonPreset({ actif, onClick, children }: { actif?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        actif
          ? "border-primary bg-[#FFF0E8] text-primary"
          : "border-border bg-white text-muted-foreground hover:border-primary/40 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function FormulaireDevis({
  conditionsPaiementParDefaut,
  dureeValiditeParDefaut = 30,
  quotaIA,
  devisExistant,
  actionGenererIA,
  actionSoumettre,
  actionSuggererPrix,
  entrepriseComplete = true,
}: {
  conditionsPaiementParDefaut: string;
  dureeValiditeParDefaut?: number;
  quotaIA: { restantes: number; total: number };
  devisExistant?: DevisExistantPourFormulaire;
  actionGenererIA: (texte: string, lignesActuelles: LigneEnvoi[]) => Promise<ResultatGenerationIA>;
  actionSoumettre: (donnees: DonneesSoumissionDevis) => Promise<ResultatSoumissionDevis>;
  actionSuggererPrix: (referenceTexte: string) => Promise<ResultatSuggestionPrix>;
  /** Si false, le bouton final reste désactivé (profil entreprise manquant). */
  entrepriseComplete?: boolean;
}) {
  const router = useRouter();
  const modeModification = Boolean(devisExistant);
  const [prompt, setPrompt] = useState("");
  const [promptUtilise, setPromptUtilise] = useState<string | null>(null);
  const [generationEnCours, setGenerationEnCours] = useState(false);
  const [erreurGeneration, setErreurGeneration] = useState<string | null>(null);

  // Dictée vocale : Web Speech API du navigateur, aucun service de transcription tiers
  // pour cette V1. Non standardisée (absente de Firefox notamment), d'où la détection de
  // support avant d'afficher le bouton plutôt que de le faire planter silencieusement.
  // Alimente le même champ `prompt` que la saisie manuelle, donc aucun changement au
  // pipeline IA qui le consomme ensuite.
  const [supporteVocal, setSupporteVocal] = useState(false);
  const [enEcoute, setEnEcoute] = useState(false);
  const [erreurVocale, setErreurVocale] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Détection de support navigateur, impossible à faire au premier rendu (pas de
    // `window` côté serveur) — exception légitime à la règle set-state-in-effect, c'est
    // une lecture d'un système externe (l'API du navigateur), pas un dérivé d'un autre
    // state React.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupporteVocal(Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  function basculerDictee() {
    if (enEcoute) {
      recognitionRef.current?.stop();
      return;
    }

    const Constructeur = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Constructeur) return;

    setErreurVocale(null);
    const recognition = new Constructeur();
    recognition.lang = "fr-FR";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (e) => {
      let texteFinal = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) texteFinal += e.results[i][0].transcript;
      }
      if (texteFinal.trim()) {
        setPrompt((actuel) => (actuel.trim() ? `${actuel.trim()} ${texteFinal.trim()}` : texteFinal.trim()));
      }
    };
    recognition.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setErreurVocale("Accès au microphone refusé — autorisez-le dans les réglages du navigateur.");
      } else if (e.error !== "no-speech" && e.error !== "aborted") {
        setErreurVocale("La dictée a été interrompue, réessayez.");
      }
      setEnEcoute(false);
    };
    recognition.onend = () => setEnEcoute(false);

    recognitionRef.current = recognition;
    recognition.start();
    setEnEcoute(true);
  }

  const [clientNom, setClientNom] = useState(devisExistant?.clientNom ?? "");
  const [clientAdresse, setClientAdresse] = useState(devisExistant?.clientAdresse ?? "");
  const [clientSiret, setClientSiret] = useState(devisExistant?.clientSiret ?? "");
  const [clientEmail, setClientEmail] = useState(devisExistant?.clientEmail ?? "");
  const [dureeValiditeJours, setDureeValiditeJours] = useState(
    String(devisExistant?.dureeValiditeJours ?? dureeValiditeParDefaut)
  );
  const [conditionsPaiement, setConditionsPaiement] = useState(
    devisExistant?.conditionsPaiement ?? conditionsPaiementParDefaut
  );
  const [lignes, setLignes] = useState<LigneFormulaire[]>(
    devisExistant ? lignesFormulaireDepuis(devisExistant.lignes) : [ligneVide()]
  );
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  // Wizard : `sens` pilote la direction de l'animation d'entrée (voir .devis-etape dans
  // globals.css), `etapeMax` autorise le retour en arrière par clic sur le fil d'étapes.
  const [etape, setEtape] = useState(1);
  const [sens, setSens] = useState<"avant" | "arriere">("avant");
  // En modification, le devis est déjà complet : toutes les étapes sont atteignables
  // d'emblée, pour aller corriger une ligne sans retraverser le wizard.
  const [etapeMax, setEtapeMax] = useState(devisExistant ? ETAPES.length : 1);
  // Passe à true juste après une génération IA réussie, pour jouer l'apparition en
  // cascade des lignes une seule fois (remis à false dès que l'artisan édite).
  const [lignesAnimees, setLignesAnimees] = useState(false);

  // Suggestion de prix par ligne (voir suggererPrix côté serveur) : tenue à part de
  // `lignes` car purement transitoire, indexée par clé de ligne. Lookup débouncé sur la
  // saisie du champ "Référence" pour ne pas déclencher une requête à chaque frappe.
  const [suggestions, setSuggestions] = useState<Record<string, EtatSuggestionLigne>>({});
  const minuteriesRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    const minuteries = minuteriesRef.current;
    return () => {
      Object.values(minuteries).forEach(clearTimeout);
    };
  }, []);

  function majLigne(cle: string, champ: keyof LigneFormulaire, valeur: string) {
    setLignesAnimees(false);
    setLignes((actuelles) => actuelles.map((l) => (l.cle === cle ? { ...l, [champ]: valeur } : l)));
  }

  function allerA(cible: number) {
    setErreur(null);
    setSens(cible > etape ? "avant" : "arriere");
    setEtape(cible);
    setEtapeMax((max) => Math.max(max, cible));
  }

  // Validation par étape plutôt que par attribut `required` : les champs des étapes
  // masquées ne sont pas montés, le navigateur ne peut donc pas les valider lui-même.
  function erreurEtape(n: number): string | null {
    if (n === 2 && !clientNom.trim()) {
      return "Indiquez le nom du client pour continuer.";
    }
    if (n === 3) {
      const vide = lignes.find((l) => !l.designation.trim());
      if (vide) return "Chaque ligne doit avoir une désignation.";
      const sansPrix = lignes.find((l) => !(Number(l.quantite) > 0) || !(Number(l.prixUnitaireHt) >= 0));
      if (sansPrix) return "Vérifiez les quantités et les prix unitaires.";
    }
    return null;
  }

  function continuer() {
    const probleme = erreurEtape(etape);
    if (probleme) {
      setErreur(probleme);
      return;
    }
    allerA(Math.min(etape + 1, ETAPES.length));
  }

  function ajouterLigne() {
    setLignes((actuelles) => [...actuelles, ligneVide()]);
  }

  function retirerSuggestion(suggestionsActuelles: Record<string, EtatSuggestionLigne>, cle: string) {
    const reste = { ...suggestionsActuelles };
    delete reste[cle];
    return reste;
  }

  function supprimerLigne(cle: string) {
    setLignes((actuelles) => (actuelles.length > 1 ? actuelles.filter((l) => l.cle !== cle) : actuelles));
    clearTimeout(minuteriesRef.current[cle]);
    delete minuteriesRef.current[cle];
    setSuggestions((actuelles) => retirerSuggestion(actuelles, cle));
  }

  function surChangementReference(cle: string, valeur: string) {
    majLigne(cle, "reference", valeur);
    clearTimeout(minuteriesRef.current[cle]);

    if (valeur.trim().length < LONGUEUR_MIN_RECHERCHE) {
      setSuggestions((actuelles) => retirerSuggestion(actuelles, cle));
      return;
    }

    minuteriesRef.current[cle] = setTimeout(async () => {
      setSuggestions((actuelles) => ({ ...actuelles, [cle]: { enCours: true, suggestion: null, erreur: null } }));
      const resultat = await actionSuggererPrix(valeur);
      setSuggestions((actuelles) => ({
        ...actuelles,
        [cle]: resultat.succes
          ? { enCours: false, suggestion: resultat.suggestion, erreur: null }
          : { enCours: false, suggestion: null, erreur: resultat.erreur },
      }));
    }, DELAI_DEBOUNCE_MS);
  }

  function utiliserSuggestion(cle: string, prixSuggereHt: number) {
    majLigne(cle, "prixUnitaireHt", String(prixSuggereHt));
  }

  async function genererAvecIA() {
    setErreurGeneration(null);
    setGenerationEnCours(true);

    const lignesActuelles: LigneEnvoi[] = lignes.map((l) => ({
      designation: l.designation,
      quantite: Number(l.quantite) || 0,
      prixUnitaireHt: Number(l.prixUnitaireHt) || 0,
      tauxTva: Number(l.tauxTva) || 0,
    }));
    const resultat = await actionGenererIA(prompt, lignesActuelles);
    setGenerationEnCours(false);

    if (!resultat.succes) {
      setErreurGeneration(resultat.erreur);
      return;
    }
    if (resultat.clientNom) {
      setClientNom(resultat.clientNom);
      setClientSiret("");
      setClientEmail("");
    }
    setLignes(lignesFormulaireDepuis(resultat.lignes));
    setPromptUtilise(prompt);
    setLignesAnimees(true);
    // L'IA vient de remplir le client et les lignes : on amène directement l'artisan à
    // la relecture des prestations, qui est le vrai travail restant.
    allerA(3);
  }

  const totalHt = lignes.reduce((s, l) => s + (Number(l.quantite) || 0) * (Number(l.prixUnitaireHt) || 0), 0);
  const totalTva = lignes.reduce(
    (s, l) =>
      s + (Number(l.quantite) || 0) * (Number(l.prixUnitaireHt) || 0) * ((Number(l.tauxTva) || 0) / 100),
    0
  );
  const totalTtc = totalHt + totalTva;
  const quotaEpuise = quotaIA.restantes <= 0;
  const formaterEuros = (v: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(v);

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);

    // Entrée au clavier sur une étape intermédiaire : on avance plutôt que d'envoyer
    // un devis incomplet.
    if (etape < ETAPES.length) {
      continuer();
      return;
    }

    // Le fil d'étapes permet de sauter en avant (mode modification) : on revalide tout
    // avant d'envoyer, et on ramène l'artisan sur l'étape fautive.
    for (let n = 1; n < ETAPES.length; n++) {
      const probleme = erreurEtape(n);
      if (probleme) {
        allerA(n);
        setErreur(probleme); // après allerA, qui remet l'erreur à null
        return;
      }
    }

    setEnCours(true);

    const resultat = await actionSoumettre({
      clientNom,
      clientAdresse,
      clientSiret,
      clientEmail,
      dureeValiditeJours: Number(dureeValiditeJours),
      conditionsPaiement,
      // Rattaché au devis final même si l'artisan a corrigé les lignes générées ensuite
      // — c'est la génération IA elle-même qui compte dans le quota, pas la fidélité du
      // résultat final au texte d'origine (voir genererDepuisPrompt). Non applicable en
      // modification (le prompt d'origine du devis n'est jamais réécrit par une
      // instruction de correction ultérieure).
      promptOriginal: modeModification ? undefined : (promptUtilise ?? undefined),
      lignes: lignes.map((l) => ({
        designation: l.designation,
        quantite: Number(l.quantite),
        prixUnitaireHt: Number(l.prixUnitaireHt),
        tauxTva: Number(l.tauxTva),
      })),
    });

    setEnCours(false);
    if (!resultat.succes) {
      setErreur(resultat.erreur);
      return;
    }
    router.push(`/devis-clients/${resultat.id}`);
  }

  return (
    <div className="mt-6">
      <WizardSteps steps={[...ETAPES]} actif={etape} onSelect={allerA} etapeMaxAtteinte={etapeMax} />

      <form onSubmit={soumettre} className="space-y-6">
        <div key={etape} className="devis-etape space-y-6" data-sens={sens}>
          {etape === 1 && (
            <section className="app-card p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{modeModification ? "Décrire la modification" : "Décrire la prestation"}</h2>
                <span className="text-xs text-muted-foreground">
                  {quotaIA.restantes}/{quotaIA.total} générations IA restantes ce mois
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {modeModification
                  ? "Décrivez la modification à apporter, en texte libre — l'IA reconstruit les lignes concernées et conserve les autres à l'identique. Ex. : « ajoute 2 heures de main d'œuvre en plus », « remplace le radiateur par un modèle à 200€ »."
                  : "Décrivez ce qu'il faut facturer, en texte libre — l'IA pré-remplit les lignes ci-dessous, à corriger avant de valider. Ex. : « devis pour installation chaudière chez M. Dupont, 3 radiateurs à 150€, main d'œuvre 2h à 45€/h »."}
              </p>
              <div className="relative mt-3">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={quotaEpuise}
                  rows={3}
                  placeholder={modeModification ? "Ex. : ajoute 2 heures de main d'œuvre en plus..." : "Devis pour..."}
                  className={`${champClasse} pr-12 disabled:opacity-50`}
                />
                {supporteVocal && (
                  <button
                    type="button"
                    onClick={basculerDictee}
                    disabled={quotaEpuise}
                    aria-pressed={enEcoute}
                    aria-label={enEcoute ? "Arrêter la dictée" : "Dicter à la voix"}
                    title={enEcoute ? "Arrêter la dictée" : "Dicter à la voix"}
                    className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border transition-colors disabled:opacity-40 ${
                      enEcoute
                        ? "border-red-500 bg-red-500/10 text-red-400"
                        : "border-border text-muted-foreground hover:border-accent hover:text-accent"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.75}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      width={16}
                      height={16}
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <rect x="9" y="3" width="6" height="11" rx="3" />
                      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
                    </svg>
                  </button>
                )}
              </div>
              {enEcoute && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  Écoute en cours — parlez, puis appuyez à nouveau sur le micro pour arrêter.
                </p>
              )}
              {erreurVocale && <p className="mt-2 text-sm text-red-400">{erreurVocale}</p>}
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={genererAvecIA}
                  disabled={generationEnCours || quotaEpuise || prompt.trim().length < 5}
                  className="rounded-md border border-accent px-4 py-2 text-sm font-medium text-accent hover:bg-accent/10 disabled:opacity-40"
                >
                  {generationEnCours
                    ? "Génération..."
                    : modeModification
                      ? "Appliquer la modification avec l'IA"
                      : "Générer les lignes avec l'IA"}
                </button>
                {quotaEpuise && (
                  <span className="text-xs text-muted-foreground">
                    Quota IA épuisé pour ce mois — vous pouvez toujours{" "}
                    {modeModification ? "modifier les lignes manuellement ci-dessous." : "saisir les lignes manuellement ci-dessous."}
                  </span>
                )}
              </div>
              {erreurGeneration && <p className="mt-2 text-sm text-red-400">{erreurGeneration}</p>}

              {generationEnCours && (
                <div className="mt-4 flex items-center gap-4 overflow-hidden rounded-[16px] bg-[var(--app-surface-muted)] p-4">
                  <Image
                    src="/landing/logo-icon.png"
                    alt=""
                    width={40}
                    height={40}
                    className="devis-ia-respire size-10 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {modeModification ? "Application de votre modification…" : "Rédaction de votre devis…"}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      L&apos;IA découpe votre description en lignes chiffrées. Vous pourrez tout corriger ensuite.
                    </p>
                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[var(--app-chart-track)]">
                      <div className="devis-ia-balayage h-full w-1/4 rounded-full bg-accent" />
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {etape === 2 && (
            <section className="app-card p-5 sm:p-6">
              <h2 className="text-lg font-semibold">Client</h2>
              <div className="mt-4">
                <RechercheClient
                  valeur={{ nom: clientNom, siret: clientSiret, adresse: clientAdresse, email: clientEmail }}
                  onChange={({ nom, siret, adresse, email }) => {
                    setClientNom(nom);
                    setClientSiret(siret);
                    setClientAdresse(adresse);
                    setClientEmail(email);
                  }}
                />
              </div>
            </section>
          )}

          {etape === 3 && (
            <section className="app-card p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Prestations</h2>
                <button
                  type="button"
                  onClick={ajouterLigne}
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:border-accent"
                >
                  + Ajouter une ligne
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {lignes.map((ligne, index) => {
                  const suggestionLigne = suggestions[ligne.cle];
                  return (
                  <div
                    key={ligne.cle}
                    className={`rounded-md border border-border p-3 ${lignesAnimees ? "devis-ligne-in" : ""}`}
                    style={lignesAnimees ? ({ "--index": index } as React.CSSProperties) : undefined}
                  >
                  <div
                    className="grid gap-2 sm:grid-cols-[3fr_1fr_1fr_1fr_auto]"
                  >
                    <div>
                      <label className={labelClasse}>Désignation</label>
                      <input
                        required
                        value={ligne.designation}
                        onChange={(e) => majLigne(ligne.cle, "designation", e.target.value)}
                        className={champClasse}
                      />
                    </div>
                    <div>
                      <label className={labelClasse}>Quantité</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={ligne.quantite}
                        onChange={(e) => majLigne(ligne.cle, "quantite", e.target.value)}
                        className={champClasse}
                      />
                    </div>
                    <div>
                      <label className={labelClasse}>PU HT</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={ligne.prixUnitaireHt}
                        onChange={(e) => majLigne(ligne.cle, "prixUnitaireHt", e.target.value)}
                        className={champClasse}
                      />
                    </div>
                    <div>
                      <label className={labelClasse}>TVA %</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        required
                        value={ligne.tauxTva}
                        onChange={(e) => majLigne(ligne.cle, "tauxTva", e.target.value)}
                        className={champClasse}
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => supprimerLigne(ligne.cle)}
                        disabled={lignes.length === 1}
                        className="w-full rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:border-red-500 hover:text-red-400 disabled:opacity-40"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>

                  <div className="mt-2">
                    <label className={labelClasse}>Référence fournisseur (optionnel) — pour suggérer un prix</label>
                    <input
                      value={ligne.reference}
                      onChange={(e) => surChangementReference(ligne.cle, e.target.value)}
                      placeholder="Ex. : DURALIS200L"
                      className={`${champClasse} max-w-xs`}
                    />
                    {suggestionLigne?.enCours && (
                      <p className="mt-1 text-xs text-muted-foreground">Recherche dans l&apos;historique d&apos;achat...</p>
                    )}
                    {suggestionLigne?.erreur && <p className="mt-1 text-xs text-red-400">{suggestionLigne.erreur}</p>}
                    {!suggestionLigne?.enCours && !suggestionLigne?.erreur && suggestionLigne?.suggestion && (
                      <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        Prix suggéré :{" "}
                        <span className="font-semibold text-foreground">
                          {suggestionLigne.suggestion.prixSuggereHt.toFixed(2)} € HT
                        </span>
                        (moyenne des {suggestionLigne.suggestion.nombreAchats} derniers achats :{" "}
                        {suggestionLigne.suggestion.moyenneAchatsHt.toFixed(2)} € HT, marge{" "}
                        {suggestionLigne.suggestion.margeAppliqueePct}%)
                        <button
                          type="button"
                          onClick={() => utiliserSuggestion(ligne.cle, suggestionLigne.suggestion!.prixSuggereHt)}
                          className="rounded border border-accent px-2 py-0.5 font-medium text-accent hover:bg-accent/10"
                        >
                          Utiliser
                        </button>
                      </p>
                    )}
                    {!suggestionLigne?.enCours && !suggestionLigne?.erreur && suggestionLigne && !suggestionLigne.suggestion && (
                      <p className="mt-1 text-xs text-muted-foreground">Aucun achat correspondant trouvé dans l&apos;historique.</p>
                    )}
                  </div>
                  </div>
                  );
                })}
              </div>

              <p className="mt-3 text-right text-sm text-muted-foreground">
                Total HT : <span className="font-semibold text-foreground">{totalHt.toFixed(2)} €</span>
              </p>
            </section>
          )}

          {etape === 4 && (
            <>
            <section className="app-card p-4 sm:p-5">
              <h2 className="text-base font-semibold">Validité &amp; paiement</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_2fr]">
                <div>
                  <label htmlFor="dureeValiditeJours" className={labelClasse}>
                    Validité
                  </label>
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {PRESETS_VALIDITE_JOURS.map((jours) => (
                      <BoutonPreset
                        key={jours}
                        actif={dureeValiditeJours === String(jours)}
                        onClick={() => setDureeValiditeJours(String(jours))}
                      >
                        {jours} j
                      </BoutonPreset>
                    ))}
                  </div>
                  <input
                    id="dureeValiditeJours"
                    type="number"
                    min="1"
                    required
                    value={dureeValiditeJours}
                    onChange={(e) => setDureeValiditeJours(e.target.value)}
                    className={champClasse}
                  />
                </div>
                <div>
                  <label htmlFor="conditionsPaiement" className={labelClasse}>
                    Paiement
                  </label>
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {PRESETS_CONDITIONS_PAIEMENT.map((preset) => (
                      <BoutonPreset
                        key={preset.label}
                        actif={conditionsPaiement === preset.valeur}
                        onClick={() => setConditionsPaiement(preset.valeur)}
                      >
                        {preset.label}
                      </BoutonPreset>
                    ))}
                  </div>
                  <input
                    id="conditionsPaiement"
                    required
                    value={conditionsPaiement}
                    onChange={(e) => setConditionsPaiement(e.target.value)}
                    className={champClasse}
                  />
                </div>
              </div>
            </section>

            <section className="app-card p-5 sm:p-6">
              <h2 className="text-lg font-semibold">Récapitulatif</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Vérifiez avant {modeModification ? "l'enregistrement" : "de générer le PDF"}.
              </p>

              <p className="mt-4 text-sm">
                <span className="text-muted-foreground">Client :</span>{" "}
                <span className="font-medium text-foreground">{clientNom || "—"}</span>
                {clientSiret && <span className="text-muted-foreground"> · SIRET {clientSiret}</span>}
                {clientAdresse && <span className="text-muted-foreground"> · {clientAdresse}</span>}
                {clientEmail && <span className="text-muted-foreground"> · {clientEmail}</span>}
              </p>

              <ul className="mt-4 divide-y divide-border border-y border-border">
                {lignes.map((ligne) => (
                  <li key={ligne.cle} className="flex items-baseline justify-between gap-3 py-2 text-sm">
                    <span className="min-w-0">
                      <span className="text-foreground">{ligne.designation || "Ligne sans désignation"}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        · {ligne.quantite} × {Number(ligne.prixUnitaireHt || 0).toFixed(2)} €
                      </span>
                    </span>
                    <span className="shrink-0 font-medium text-foreground">
                      {formaterEuros((Number(ligne.quantite) || 0) * (Number(ligne.prixUnitaireHt) || 0))}
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="ml-auto mt-4 flex w-full max-w-xs flex-col gap-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Total HT</dt>
                  <dd className="text-foreground">{formaterEuros(totalHt)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">TVA</dt>
                  <dd className="text-foreground">{formaterEuros(totalTva)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-1.5 text-base font-semibold">
                  <dt>Total TTC</dt>
                  <dd className="text-foreground">{formaterEuros(totalTtc)}</dd>
                </div>
              </dl>
            </section>
            </>
          )}
        </div>

        {erreur && <p className="text-sm text-red-400">{erreur}</p>}

        <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-20 -mx-1 flex items-center justify-between gap-3 border-t border-border/60 bg-background/95 px-1 py-3 backdrop-blur-sm lg:static lg:bottom-auto lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
          <button
            type="button"
            onClick={() => allerA(Math.max(1, etape - 1))}
            disabled={etape === 1 || enCours}
            className="min-h-[44px] rounded-full border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-accent hover:text-accent disabled:opacity-40"
          >
            ← Retour
          </button>

          {etape < ETAPES.length ? (
            <button
              type="button"
              onClick={continuer}
              className="min-h-[44px] rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Continuer →
            </button>
          ) : (
            <button
              type="submit"
              disabled={enCours || !entrepriseComplete}
              className="relative min-h-[44px] overflow-hidden rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:bg-[#E1E3E5] disabled:text-[#8A969E] disabled:opacity-100"
            >
              {enCours && (
                <span className="devis-ia-balayage absolute inset-y-0 left-0 w-1/3 bg-white/30" aria-hidden="true" />
              )}
              <span className="relative z-10">
                {enCours
                  ? "Enregistrement…"
                  : modeModification
                    ? "Enregistrer"
                    : "Générer le devis"}
              </span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
