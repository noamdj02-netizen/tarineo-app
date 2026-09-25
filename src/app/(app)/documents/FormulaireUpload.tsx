"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileImportQueue } from "./FileImportQueue";
import { IconeImportAnimee, OverlayImportAnime } from "./IconeImportAnimee";
import { envoyerUnDocument } from "./actions";
import type { ErreurEnregistrementDocument, DoublonPotentiel } from "@/lib/documents";
import { annoncerImportSucces } from "@/lib/feedbackImport";
import { MAX_FICHIERS_PAR_LOT } from "@/lib/quota";
import { hrefApresImportDocuments, urlAnalysesEnCours } from "@/lib/importNavigation";

const TAILLE_MAX_OCTETS = 20 * 1024 * 1024; // 20 Mo — doit rester synchronisé avec src/lib/documents.ts
const ENVOIS_PARALLELES_MAX = 3;

const MESSAGES_ERREUR: Record<ErreurEnregistrementDocument, string> = {
  type_invalide: "Type de fichier invalide (PDF, JPEG, PNG ou HEIC attendu).",
  trop_volumineux: "Fichier vide ou supérieur à 20 Mo.",
  quota_depasse: "Quota mensuel atteint. Réessayez le mois prochain.",
  essai_termine: "Votre essai gratuit est terminé — ajoutez un moyen de paiement pour continuer.",
  stockage_indisponible:
    "Stockage indisponible sur le serveur. Réessayez dans quelques minutes ou contactez le support.",
  base_indisponible: "Le fichier est reçu mais l'enregistrement a échoué. Réessayez.",
  erreur: "Échec de l'envoi. Réessayez.",
};

const MESSAGES_ERREUR_ENVOI: Record<string, string> = {
  ...MESSAGES_ERREUR,
  fichier_invalide: "Fichier illisible par le serveur. Réessayez ou choisissez un autre format.",
  session_invalide: "Session expirée. Rechargez la page puis reconnectez-vous.",
  doublon_detecte: "Ce document semble déjà envoyé.",
};

const OPTIONS_TYPE = [
  { valeur: "DEVIS", label: "Devis" },
  { valeur: "FACTURE", label: "Facture" },
  { valeur: "BON_COMMANDE", label: "Bon de commande" },
  { valeur: "BON_ENLEVEMENT", label: "Bon d'enlèvement" },
] as const;

type StatutFichier = "en_attente" | "envoi" | "succes" | "erreur" | "doublon";

interface FichierEnvoi {
  id: string;
  file: File;
  statut: StatutFichier;
  message?: string;
  doublon?: DoublonPotentiel;
  documentId?: string;
}

function decrireDoublon(doublon: DoublonPotentiel): string {
  const morceaux: string[] = [];
  if (doublon.distributor) morceaux.push(doublon.distributor);
  if (doublon.documentDate) morceaux.push(new Date(doublon.documentDate).toLocaleDateString("fr-FR"));
  if (doublon.totalTtc !== null) {
    morceaux.push(new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(doublon.totalTtc));
  }
  return morceaux.length > 0 ? morceaux.join(" · ") : "un document déjà envoyé";
}

export function FormulaireUpload({
  quotaAtteint = false,
  typeInitial,
  modeOnboarding = false,
  redirigerVersResume = false,
  autoOuvrirCamera = false,
  autoEnvoiApresCapture = false,
  variantPc = false,
  variantCompact = false,
  choixSourcesMobile = false,
  preferCameraHint = false,
  maxFichiers,
  onImportReussi,
  onVoirDocumentExistant,
}: {
  quotaAtteint?: boolean;
  /** Plafond de la file d'attente (défaut 150). Réduit si le quota utilisateur est plus bas. */
  maxFichiers?: number;
  // Préselectionne le type — utilisé par documents/page.tsx quand l'artisan arrive via
  // le bouton "Importer" de l'état vide d'un type filtré (ex. ?type=BON_ENLEVEMENT).
  typeInitial?: "DEVIS" | "FACTURE" | "BON_COMMANDE" | "BON_ENLEVEMENT";
  /** Après un batch réussi, enchaîne vers l'animation d'analyse (onboarding V2). */
  modeOnboarding?: boolean;
  /** Même redirection pour le tout premier import hors parcours formel. */
  redirigerVersResume?: boolean;
  /** Ouvre directement le sélecteur photo (bouton Scanner mobile). */
  autoOuvrirCamera?: boolean;
  /** Enchaîne l'envoi dès qu'une photo est capturée (parcours mobile rapide). */
  autoEnvoiApresCapture?: boolean;
  /** PC : explorateur de fichiers en premier, zone large pour glisser-déposer. */
  variantPc?: boolean;
  /** Panneau latéral : pas de choix de type (l'IA reclasse après analyse). */
  variantCompact?: boolean;
  /** Mobile : affiche Photo / Photothèque / Fichier au lieu de forcer la caméra. */
  choixSourcesMobile?: boolean;
  /** Surligne « Prendre une photo » dans le choix mobile. */
  preferCameraHint?: boolean;
  /** Wizard onboarding : callback au lieu d'une navigation vers /onboarding/analyse. */
  /** Fourni par la modale Importer : fermeture + navigation côté parent (évite blocage Radix Dialog). */
  onImportReussi?: (nbSucces: number, documentIds: string[]) => void;
  /** Doublon : ouvrir le document déjà enregistré (ferme la modale côté parent). */
  onVoirDocumentExistant?: (documentId: string) => void;
}) {
  const router = useRouter();
  const inputPhotoRef = useRef<HTMLInputElement>(null);
  const inputGalerieRef = useRef<HTMLInputElement>(null);
  const inputFichierRef = useRef<HTMLInputElement>(null);
  const autoEnvoiDeclencheRef = useRef(false);
  const idsEnvoyesRef = useRef<string[]>([]);
  const [type, setType] = useState<"DEVIS" | "FACTURE" | "BON_COMMANDE" | "BON_ENLEVEMENT">(typeInitial ?? "DEVIS");
  const typeEnvoi = variantCompact ? "DEVIS" : type;
  const [fichiers, setFichiers] = useState<FichierEnvoi[]>([]);
  const [enCours, setEnCours] = useState(false);
  const [progression, setProgression] = useState<{ traites: number; total: number } | null>(null);
  const [glisserActif, setGlisserActif] = useState(false);
  // Compteur plutôt qu'un simple booléen : le survol d'un enfant du dropzone
  // déclenche dragleave puis dragenter juste après, ce qui ferait clignoter
  // l'état actif avec un booléen naïf.
  const compteurGlisserRef = useRef(0);
  const [apercuErreurId, setApercuErreurId] = useState<string | null>(null);
  const [avertissementLimite, setAvertissementLimite] = useState<string | null>(null);
  const [redirectionEnCours, setRedirectionEnCours] = useState(false);
  // Le formulaire est désactivé aussi bien pendant un envoi que lorsque le quota
  // du jour est déjà épuisé au chargement de la page (évite de laisser l'artisan
  // sélectionner des fichiers pour se les voir refuser un par un à l'envoi).
  const enCoursOuBloque = enCours || quotaAtteint || redirectionEnCours;
  const plafondFichiers = Math.max(
    1,
    Math.min(maxFichiers ?? MAX_FICHIERS_PAR_LOT, MAX_FICHIERS_PAR_LOT)
  );

  useEffect(() => {
    if (!autoOuvrirCamera || quotaAtteint) return;
    const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!mobile) return;
    // Laisse le layout peindre avant d'ouvrir le sélecteur natif (mobile uniquement).
    const t = setTimeout(() => inputPhotoRef.current?.click(), 250);
    return () => clearTimeout(t);
  }, [autoOuvrirCamera, quotaAtteint]);

  // Aperçu = dernier fichier ajouté (image uniquement, un PDF n'a pas de rendu utile ici).
  const dernierFichier = fichiers.length > 0 ? fichiers[fichiers.length - 1] : null;

  const apercuUrl = useMemo(() => {
    if (!dernierFichier || !dernierFichier.file.type.startsWith("image/")) return null;
    return URL.createObjectURL(dernierFichier.file);
  }, [dernierFichier]);

  useEffect(() => {
    return () => {
      if (apercuUrl) URL.revokeObjectURL(apercuUrl);
    };
  }, [apercuUrl]);

  const apercuEnErreur = dernierFichier !== null && apercuErreurId === dernierFichier.id;

  function onSelectionFichiers(liste: FileList | null) {
    if (!liste || liste.length === 0) return;

    const placesRestantes = plafondFichiers - fichiers.length;
    if (placesRestantes <= 0) {
      setAvertissementLimite(`Limite atteinte : ${plafondFichiers} documents maximum par envoi.`);
      return;
    }

    const selection = Array.from(liste).slice(0, placesRestantes);
    if (liste.length > placesRestantes) {
      setAvertissementLimite(
        `Seuls ${placesRestantes} fichier${placesRestantes > 1 ? "s" : ""} ajouté${placesRestantes > 1 ? "s" : ""} — maximum ${plafondFichiers} par envoi.`
      );
    } else {
      setAvertissementLimite(null);
    }

    const nouveaux: FichierEnvoi[] = selection.map((f) => {
      const tropVolumineux = f.size === 0 || f.size > TAILLE_MAX_OCTETS;
      return {
        id: crypto.randomUUID(),
        file: f,
        statut: tropVolumineux ? "erreur" : "en_attente",
        message: tropVolumineux ? MESSAGES_ERREUR.trop_volumineux : undefined,
      };
    });

    // On ajoute à la liste (plutôt que de la remplacer) pour permettre d'enchaîner
    // plusieurs photos (ex: les pages d'un même devis) sans perdre les précédentes.
    setFichiers((prev) => [...prev, ...nouveaux]);
  }

  function retirerFichier(id: string) {
    setFichiers((prev) => prev.filter((f) => f.id !== id));
  }

  function onDragEnter(e: React.DragEvent) {
    e.preventDefault();
    if (enCoursOuBloque) return;
    compteurGlisserRef.current += 1;
    setGlisserActif(true);
  }

  function onDragOver(e: React.DragEvent) {
    // Requis pour autoriser le drop — sans preventDefault ici, le navigateur
    // refuse systématiquement l'événement "drop".
    e.preventDefault();
  }

  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    compteurGlisserRef.current = Math.max(0, compteurGlisserRef.current - 1);
    if (compteurGlisserRef.current === 0) setGlisserActif(false);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    compteurGlisserRef.current = 0;
    setGlisserActif(false);
    if (enCoursOuBloque) return;
    onSelectionFichiers(e.dataTransfer.files);
  }

  function majStatut(id: string, patch: Partial<FichierEnvoi>) {
    setFichiers((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  async function envoyerFichier(item: FichierEnvoi, options: { ignorerDoublon?: boolean } = {}): Promise<string | null> {
    majStatut(item.id, { statut: "envoi" });

    const formData = new FormData();
    formData.append("type", typeEnvoi);
    formData.append("fichier", item.file);
    if (options.ignorerDoublon) formData.append("ignorerDoublon", "true");

    let resultat: Awaited<ReturnType<typeof envoyerUnDocument>>;
    try {
      resultat = await envoyerUnDocument(formData);
    } catch {
      majStatut(item.id, {
        statut: "erreur",
        message: "Connexion interrompue. Vérifiez votre réseau et réessayez.",
      });
      return null;
    }

    if (resultat.succes) {
      majStatut(item.id, { statut: "succes", documentId: resultat.documentId });
      idsEnvoyesRef.current.push(resultat.documentId);
      return resultat.documentId;
    }
    if (resultat.erreur === "doublon_detecte") {
      majStatut(item.id, {
        statut: "doublon",
        doublon: resultat.doublon,
        message: `Déjà envoyé : ${decrireDoublon(resultat.doublon)}`,
      });
      return null;
    }
    majStatut(item.id, {
      statut: "erreur",
      message: MESSAGES_ERREUR_ENVOI[resultat.erreur] ?? MESSAGES_ERREUR.erreur,
    });
    return null;
  }

  function finaliserApresEnvoisReussis(ids: string[]) {
    const idsUniques = [...new Set(ids.filter(Boolean))];
    if (idsUniques.length === 0) return;

    setFichiers((prev) => prev.filter((f) => f.statut !== "succes"));
    setRedirectionEnCours(true);

    if (onImportReussi) {
      onImportReussi(idsUniques.length, idsUniques);
      return;
    }

    const destination =
      modeOnboarding || redirigerVersResume
        ? urlAnalysesEnCours(idsUniques, "/onboarding/resume")
        : hrefApresImportDocuments(idsUniques);
    router.push(destination);
  }

  // Retenté individuellement (pas via le bouton "Envoyer" principal, qui ne traite
  // que la file "en_attente") une fois que l'artisan a confirmé vouloir passer outre
  // l'avertissement de doublon.
  async function envoyerQuandMeme(id: string) {
    const item = fichiers.find((f) => f.id === id);
    if (!item || enCours) return;
    setEnCours(true);
    const documentId = await envoyerFichier(item, { ignorerDoublon: true });
    setEnCours(false);
    if (documentId) {
      finaliserApresEnvoisReussis([documentId]);
    }
  }

  async function lancerEnvoi() {
    setEnCours(true);
    idsEnvoyesRef.current = [];

    const aEnvoyer = fichiers.filter((f) => f.statut === "en_attente");
    setProgression({ traites: 0, total: aEnvoyer.length });
    let curseur = 0;
    const documentIdsEnvoyes: string[] = [];

    async function worker() {
      while (curseur < aEnvoyer.length) {
        const item = aEnvoyer[curseur];
        curseur += 1;
        const documentId = await envoyerFichier(item);
        if (documentId) documentIdsEnvoyes.push(documentId);
        setProgression((prev) => (prev ? { ...prev, traites: prev.traites + 1 } : prev));
      }
    }

    await Promise.all(Array.from({ length: ENVOIS_PARALLELES_MAX }, worker));

    setEnCours(false);
    setProgression(null);
    if (inputPhotoRef.current) inputPhotoRef.current.value = "";
    if (inputFichierRef.current) inputFichierRef.current.value = "";

    const idsUniques = [...new Set([...documentIdsEnvoyes, ...idsEnvoyesRef.current])];
    idsEnvoyesRef.current = [];

    if (idsUniques.length > 0) {
      finaliserApresEnvoisReussis(idsUniques);
      return;
    }

    setFichiers((prev) => prev.filter((f) => f.statut !== "succes"));
    router.refresh();
  }

  useEffect(() => {
    if (!autoEnvoiApresCapture || autoEnvoiDeclencheRef.current || enCours || quotaAtteint) return;
    const enAttente = fichiers.filter((f) => f.statut === "en_attente");
    if (enAttente.length !== 1 || !enAttente[0].file.type.startsWith("image/")) return;
    autoEnvoiDeclencheRef.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- envoi auto après capture photo
    void lancerEnvoi();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- déclenché une seule fois à l'ajout de la photo
  }, [fichiers, autoEnvoiApresCapture, enCours, quotaAtteint]);

  const enAttenteCount = fichiers.filter((f) => f.statut === "en_attente").length;

  const titreZone =
    quotaAtteint
      ? "Quota mensuel atteint"
      : glisserActif
        ? "Déposez vos fichiers ici"
        : variantPc
          ? "Glissez vos documents ici"
          : "Photographiez votre devis";

  const sousTitreZone =
    quotaAtteint
      ? "Revenez le mois prochain pour continuer l'envoi"
      : glisserActif
        ? `Jusqu'à ${plafondFichiers} fichiers à la fois`
        : variantPc
          ? `PDF, JPEG, PNG ou HEIC — jusqu'à ${plafondFichiers} fichiers par envoi`
          : `Appareil photo ou glisser-déposer — jusqu'à ${plafondFichiers} fichiers`;

  return (
    <div
      className={`font-sans ${variantCompact ? "space-y-6" : "space-y-4"} ${variantCompact ? "" : "rounded-[24px] bg-white p-6"}`}
    >
      {!variantCompact && (
        <fieldset>
          <legend className="mb-3 text-sm font-normal text-muted-foreground">
            Indication seulement — l&apos;IA lit le document, détecte devis / facture / bon chez votre distributeur,
            puis le range dans la section correspondante.
          </legend>
          <div className="flex flex-wrap gap-2">
            {OPTIONS_TYPE.map((option) => (
              <label
                key={option.valeur}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors outline outline-1 ${
                  enCoursOuBloque ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                } ${
                  type === option.valeur
                    ? "bg-[#FFF0E8] text-primary outline-primary"
                    : "bg-white text-foreground outline-border hover:bg-[#FFF0E8]/50 hover:text-primary hover:outline-primary/50"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={option.valeur}
                  checked={type === option.valeur}
                  onChange={() => setType(option.valeur)}
                  disabled={enCoursOuBloque}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div>
        {/* Caméra — capture rear */}
        <input
          ref={inputPhotoRef}
          id="photo"
          type="file"
          accept="image/jpeg,image/png,image/heic,image/heif"
          capture="environment"
          disabled={enCoursOuBloque}
          onChange={(e) => {
            onSelectionFichiers(e.target.files);
            e.target.value = "";
          }}
          className="sr-only"
        />
        {/* Photothèque — images sans capture (galerie iOS/Android) */}
        <input
          ref={inputGalerieRef}
          id="galerie"
          type="file"
          accept="image/jpeg,image/png,image/heic,image/heif"
          disabled={enCoursOuBloque}
          onChange={(e) => {
            onSelectionFichiers(e.target.files);
            e.target.value = "";
          }}
          className="sr-only"
        />
        {/* Fichiers — PDF + images */}
        <input
          ref={inputFichierRef}
          id="fichiers"
          type="file"
          multiple
          disabled={enCoursOuBloque}
          accept=".pdf,.jpg,.jpeg,.png,.heic,application/pdf,image/jpeg,image/png,image/heic"
          onChange={(e) => {
            onSelectionFichiers(e.target.files);
            e.target.value = "";
          }}
          className="sr-only"
        />

        {choixSourcesMobile && fichiers.length === 0 && !enCours ? (
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              disabled={enCoursOuBloque}
              onClick={() => inputPhotoRef.current?.click()}
              className={`flex h-14 w-full items-center gap-3 rounded-2xl border px-4 text-left text-[15px] font-semibold transition-colors disabled:opacity-50 ${
                preferCameraHint
                  ? "border-primary bg-primary text-white shadow-[0_8px_18px_rgba(236,88,33,0.28)]"
                  : "border-border bg-white text-foreground hover:border-primary/40"
              }`}
            >
              <span
                className={`flex size-10 items-center justify-center rounded-full ${
                  preferCameraHint ? "bg-white/20" : "bg-primary/10 text-primary"
                }`}
              >
                📷
              </span>
              Prendre une photo
            </button>
            <button
              type="button"
              disabled={enCoursOuBloque}
              onClick={() => inputGalerieRef.current?.click()}
              className="flex h-14 w-full items-center gap-3 rounded-2xl border border-border bg-white px-4 text-left text-[15px] font-semibold text-foreground transition-colors hover:border-primary/40 disabled:opacity-50"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                🖼️
              </span>
              Photothèque
            </button>
            <button
              type="button"
              disabled={enCoursOuBloque}
              onClick={() => inputFichierRef.current?.click()}
              className="flex h-14 w-full items-center gap-3 rounded-2xl border border-border bg-white px-4 text-left text-[15px] font-semibold text-foreground transition-colors hover:border-primary/40 disabled:opacity-50"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                📄
              </span>
              Choisir un fichier
            </button>
            <p className="px-1 pt-1 text-center text-[12px] text-muted-foreground">
              Devis, factures, bons — PDF ou photo, même anciens.
            </p>
          </div>
        ) : (
        <div
          role="button"
          tabIndex={enCoursOuBloque ? -1 : 0}
          aria-disabled={enCoursOuBloque}
          aria-label={
            variantPc
              ? dernierFichier
                ? "Ajouter d'autres fichiers"
                : "Choisir des fichiers à importer"
              : dernierFichier
                ? "Ajouter une autre photo ou un fichier"
                : "Photographiez votre devis"
          }
          onClick={() => {
            if (enCoursOuBloque) return;
            if (variantPc || choixSourcesMobile) inputFichierRef.current?.click();
            else inputPhotoRef.current?.click();
          }}
          onKeyDown={(e) => {
            if (enCoursOuBloque) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (variantPc || choixSourcesMobile) inputFichierRef.current?.click();
              else inputPhotoRef.current?.click();
            }
          }}
          onDragEnter={onDragEnter}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`relative flex w-full flex-col items-center justify-center overflow-hidden text-center transition-colors ${
            variantCompact
              ? `gap-4 rounded-[16px] border border-dashed px-6 py-9 ${
                  enCours ? "min-h-[300px] border-[#ec5821] bg-[#FFFBF8]" : glisserActif ? "border-[#ec5821] bg-white" : "border-[#d1d5db] bg-white"
                } ${enCoursOuBloque && !enCours ? "cursor-not-allowed opacity-60" : enCours ? "cursor-wait" : "cursor-pointer hover:border-[#ec5821]"}`
              : `aspect-[4/3] gap-3 rounded-[16px] border-2 border-dashed ${
                  glisserActif ? "border-primary bg-[#FFF8F5]" : "border-[#DCDEE1] bg-[#F8F8F8]"
                } ${enCoursOuBloque ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-primary hover:bg-[#FFF8F5]"}`
          }`}
        >
          {apercuUrl && !apercuEnErreur ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- aperçu local via blob:, next/image ne gère pas ce cas */}
              <img
                src={apercuUrl}
                alt="Aperçu du document"
                onError={() => dernierFichier && setApercuErreurId(dernierFichier.id)}
                className={`w-full object-cover ${variantCompact ? "max-h-[220px] rounded-[12px]" : "h-full"}`}
              />
            </>
          ) : variantCompact ? (
            <>
              <IconeImportAnimee variant="figma" actif pulseHalo />
              <div className="flex w-full flex-col items-center gap-1.5 text-center">
                <p className="w-full text-[14px] font-semibold leading-normal tracking-normal text-[#1f2937]">
                  {titreZone}
                </p>
                <p className="w-full text-[12px] font-normal leading-[1.4] tracking-normal text-[#9ca3af]">
                  {sousTitreZone}
                </p>
              </div>
            </>
          ) : (
            <>
              <IconeImportAnimee variant="large" actif pulseHalo />
              <div>
                <p className="text-sm font-semibold text-[#172935]">{titreZone}</p>
                <p className="mt-1 max-w-[280px] text-xs leading-relaxed text-[#53616A]">{sousTitreZone}</p>
              </div>
            </>
          )}

          {dernierFichier && !enCours && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                retirerFichier(dernierFichier.id);
              }}
              disabled={enCoursOuBloque}
              title="Retirer"
              aria-label="Retirer l'aperçu"
              className="absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-[#172935]/70 text-white backdrop-blur hover:bg-red-600 disabled:opacity-50"
            >
              ✕
            </button>
          )}

          {enCours && (
            <OverlayImportAnime
              label="Analyse en cours…"
              sousLabel={
                progression
                  ? `${progression.traites}/${progression.total} document${progression.total > 1 ? "s" : ""} — Tarinéo lit votre fichier`
                  : "Tarinéo lit et classe votre document"
              }
            />
          )}
        </div>
        )}

        {choixSourcesMobile && fichiers.length > 0 && !enCours && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputPhotoRef.current?.click()}
              disabled={enCoursOuBloque}
              className="rounded-full border border-border bg-white px-3 py-2 text-[12px] font-semibold disabled:opacity-50"
            >
              + Photo
            </button>
            <button
              type="button"
              onClick={() => inputGalerieRef.current?.click()}
              disabled={enCoursOuBloque}
              className="rounded-full border border-border bg-white px-3 py-2 text-[12px] font-semibold disabled:opacity-50"
            >
              + Photothèque
            </button>
            <button
              type="button"
              onClick={() => inputFichierRef.current?.click()}
              disabled={enCoursOuBloque}
              className="rounded-full border border-border bg-white px-3 py-2 text-[12px] font-semibold disabled:opacity-50"
            >
              + Fichier
            </button>
          </div>
        )}

        {!variantCompact && (
        <div className="mt-2 flex items-center justify-between gap-3 text-xs">
          {variantPc ? (
            <>
              <button
                type="button"
                onClick={() => inputFichierRef.current?.click()}
                disabled={enCoursOuBloque}
                className="text-[#53616A] underline decoration-dotted underline-offset-2 hover:text-primary disabled:opacity-50"
              >
                Parcourir mes dossiers
              </button>
              {dernierFichier && (
                <button
                  type="button"
                  onClick={() => inputFichierRef.current?.click()}
                  disabled={enCoursOuBloque}
                  className="font-medium text-primary hover:opacity-80 disabled:opacity-50"
                >
                  + Ajouter des fichiers
                </button>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => inputGalerieRef.current?.click()}
                disabled={enCoursOuBloque}
                className="text-[#53616A] underline decoration-dotted underline-offset-2 hover:text-primary disabled:opacity-50"
              >
                ou photothèque / fichier
              </button>
              {dernierFichier && (
                <button
                  type="button"
                  onClick={() => inputPhotoRef.current?.click()}
                  disabled={enCoursOuBloque}
                  className="font-medium text-primary hover:opacity-80 disabled:opacity-50"
                >
                  + Ajouter une page
                </button>
              )}
            </>
          )}
        </div>
        )}
      </div>

      {variantCompact && variantPc && (
        <button
          type="button"
          onClick={() => inputFichierRef.current?.click()}
          disabled={enCoursOuBloque}
          className="text-left text-[14px] font-semibold leading-normal tracking-normal text-[#111827] underline decoration-solid underline-offset-2 hover:text-[#ec5821] disabled:opacity-50"
        >
          Parcourir mes dossiers
        </button>
      )}

      {avertissementLimite && (
        <Alert>
          <AlertDescription>{avertissementLimite}</AlertDescription>
        </Alert>
      )}

      <FileImportQueue
        fichiers={fichiers}
        plafondFichiers={plafondFichiers}
        enCours={enCours}
        progression={progression}
        onRetirer={retirerFichier}
        onEnvoyerQuandMeme={envoyerQuandMeme}
        onVoirDocumentExistant={onVoirDocumentExistant}
      />

      {redirectionEnCours && (
        <p className="text-center text-sm font-medium text-primary">Ouverture de l&apos;analyse…</p>
      )}

      {variantCompact ? (
        <button
          type="button"
          onClick={lancerEnvoi}
          disabled={enCoursOuBloque || enAttenteCount === 0}
          className={`flex h-12 w-full items-center justify-center rounded-[12px] text-[15px] font-semibold leading-normal tracking-normal transition-colors ${
            enCoursOuBloque || enAttenteCount === 0
              ? "cursor-not-allowed bg-[#e5e7eb] text-[#9ca3af]"
              : "bg-[#ec5821] text-white hover:bg-[#d44d1a]"
          }`}
        >
          {redirectionEnCours
            ? "Redirection…"
            : enCours
              ? "Envoi en cours..."
              : `Envoyer${enAttenteCount > 1 ? ` (${enAttenteCount} fichiers)` : ""}`}
        </button>
      ) : (
        <Button
          type="button"
          onClick={lancerEnvoi}
          disabled={enCoursOuBloque || enAttenteCount === 0}
          className="h-12 w-full rounded-full text-base font-semibold disabled:bg-[#E1E3E5] disabled:text-[#8A969E] disabled:opacity-100"
        >
          {enCours ? "Envoi en cours..." : `Envoyer${enAttenteCount > 1 ? ` (${enAttenteCount} fichiers)` : ""}`}
        </Button>
      )}
    </div>
  );
}
