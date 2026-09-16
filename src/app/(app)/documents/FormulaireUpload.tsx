"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { envoyerUnDocument } from "./actions";
import type { ErreurEnregistrementDocument, DoublonPotentiel } from "@/lib/documents";
import { LIBELLE_UPLOAD_PHOTO, SOUS_LIBELLE_UPLOAD_PHOTO } from "@/lib/documentLabels";

const TAILLE_MAX_OCTETS = 20 * 1024 * 1024; // 20 Mo — doit rester synchronisé avec src/lib/documents.ts
const ENVOIS_PARALLELES_MAX = 3;

const MESSAGES_ERREUR: Record<ErreurEnregistrementDocument, string> = {
  type_invalide: "Type de fichier invalide (PDF, JPEG, PNG ou HEIC attendu).",
  trop_volumineux: "Fichier vide ou supérieur à 20 Mo.",
  quota_depasse: "Quota mensuel atteint. Réessayez le mois prochain.",
  essai_termine: "Votre essai gratuit est terminé — ajoutez un moyen de paiement pour continuer.",
  erreur: "Échec de l'envoi. Réessayez.",
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
  modeUnifie = false,
}: {
  quotaAtteint?: boolean;
  // Préselectionne le type — utilisé par documents/page.tsx quand l'artisan arrive via
  // le bouton "Importer" de l'état vide d'un type filtré (ex. ?type=BON_ENLEVEMENT).
  typeInitial?: "DEVIS" | "FACTURE" | "BON_COMMANDE" | "BON_ENLEVEMENT";
  /** Page « Mes documents » sans filtre : l'IA détecte le type, pas de sélecteur manuel. */
  modeUnifie?: boolean;
}) {
  const router = useRouter();
  const inputPhotoRef = useRef<HTMLInputElement>(null);
  const inputFichierRef = useRef<HTMLInputElement>(null);
  const [type, setType] = useState<"DEVIS" | "FACTURE" | "BON_COMMANDE" | "BON_ENLEVEMENT">(typeInitial ?? "DEVIS");
  const [fichiers, setFichiers] = useState<FichierEnvoi[]>([]);
  const [enCours, setEnCours] = useState(false);
  const [progression, setProgression] = useState<{ traites: number; total: number } | null>(null);
  const [glisserActif, setGlisserActif] = useState(false);
  // Compteur plutôt qu'un simple booléen : le survol d'un enfant du dropzone
  // déclenche dragleave puis dragenter juste après, ce qui ferait clignoter
  // l'état actif avec un booléen naïf.
  const compteurGlisserRef = useRef(0);
  // Le formulaire est désactivé aussi bien pendant un envoi que lorsque le quota
  // du jour est déjà épuisé au chargement de la page (évite de laisser l'artisan
  // sélectionner des fichiers pour se les voir refuser un par un à l'envoi).
  const enCoursOuBloque = enCours || quotaAtteint;
  const [apercuErreurId, setApercuErreurId] = useState<string | null>(null);

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

    const nouveaux: FichierEnvoi[] = Array.from(liste).map((f) => {
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

  async function envoyerFichier(item: FichierEnvoi, options: { ignorerDoublon?: boolean } = {}) {
    majStatut(item.id, { statut: "envoi" });

    const formData = new FormData();
    formData.append("type", type);
    formData.append("fichier", item.file);
    if (options.ignorerDoublon) formData.append("ignorerDoublon", "true");

    const resultat = await envoyerUnDocument(formData);

    if (resultat.succes) {
      majStatut(item.id, { statut: "succes" });
    } else if (resultat.erreur === "doublon_detecte") {
      majStatut(item.id, {
        statut: "doublon",
        doublon: resultat.doublon,
        message: `Déjà envoyé : ${decrireDoublon(resultat.doublon)}`,
      });
    } else {
      majStatut(item.id, { statut: "erreur", message: MESSAGES_ERREUR[resultat.erreur] });
    }
  }

  // Retenté individuellement (pas via le bouton "Envoyer" principal, qui ne traite
  // que la file "en_attente") une fois que l'artisan a confirmé vouloir passer outre
  // l'avertissement de doublon.
  async function envoyerQuandMeme(id: string) {
    const item = fichiers.find((f) => f.id === id);
    if (!item) return;
    await envoyerFichier(item, { ignorerDoublon: true });
    router.refresh();
  }

  async function lancerEnvoi() {
    setEnCours(true);

    const aEnvoyer = fichiers.filter((f) => f.statut === "en_attente");
    setProgression({ traites: 0, total: aEnvoyer.length });
    let curseur = 0;

    async function worker() {
      while (curseur < aEnvoyer.length) {
        const item = aEnvoyer[curseur];
        curseur += 1;
        await envoyerFichier(item);
        setProgression((prev) => (prev ? { ...prev, traites: prev.traites + 1 } : prev));
      }
    }

    await Promise.all(Array.from({ length: ENVOIS_PARALLELES_MAX }, worker));

    setEnCours(false);
    setProgression(null);
    // On retire les envois réussis de la liste ; les échecs et doublons restent visibles.
    setFichiers((prev) => prev.filter((f) => f.statut !== "succes"));
    if (inputPhotoRef.current) inputPhotoRef.current.value = "";
    if (inputFichierRef.current) inputFichierRef.current.value = "";
    router.refresh();
  }

  const enAttenteCount = fichiers.filter((f) => f.statut === "en_attente").length;
  const cleLibelleUpload = typeInitial ?? "tous";
  const libellePhoto = LIBELLE_UPLOAD_PHOTO[cleLibelleUpload];
  const pourcentageEnvoi =
    progression && progression.total > 0
      ? (progression.traites / progression.total) * 100
      : enCours
        ? 8
        : 0;

  return (
    <div className="space-y-4 rounded-[24px] bg-white p-4 sm:p-5">
      {modeUnifie ? (
        <p className="text-sm text-muted-foreground">
          Photographiez ou importez n&apos;importe quel document fournisseur — l&apos;IA reconnaît devis, facture,
          bon de commande ou bon d&apos;enlèvement.
        </p>
      ) : (
        <fieldset className="rounded-[16px] border border-[var(--app-divider)] px-4 pb-4 pt-1">
          <legend className="px-1.5 text-xs text-muted-foreground">
            Type de document (l&apos;IA corrige automatiquement si besoin)
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {OPTIONS_TYPE.map((option) => (
              <label
                key={option.valeur}
                className={`rounded-full px-5 py-2.5 text-sm font-normal transition-colors outline outline-1 ${
                  enCoursOuBloque ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                } ${
                  type === option.valeur
                    ? "bg-primary text-white outline-primary"
                    : "bg-white text-foreground outline-[var(--app-divider)] hover:outline-accent hover:text-accent"
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

        <div
          role="button"
          tabIndex={enCoursOuBloque ? -1 : 0}
          aria-disabled={enCoursOuBloque}
          aria-label={dernierFichier ? "Ajouter une autre photo" : libellePhoto}
          onClick={() => !enCoursOuBloque && inputPhotoRef.current?.click()}
          onKeyDown={(e) => {
            if (enCoursOuBloque) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputPhotoRef.current?.click();
            }
          }}
          onDragEnter={onDragEnter}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`relative flex min-h-[120px] w-full max-w-2xl flex-col items-center justify-center gap-2 overflow-hidden rounded-[16px] border-2 border-dashed px-4 py-5 text-center transition-colors sm:min-h-[132px] sm:flex-row sm:gap-4 sm:px-6 sm:text-left ${
            glisserActif ? "border-[var(--accent)] bg-white" : "border-[var(--app-divider)] bg-[var(--app-surface-muted)]"
          } ${
            enCoursOuBloque ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-[var(--accent)] hover:bg-white"
          }`}
        >
          {apercuUrl && !apercuEnErreur ? (
            // eslint-disable-next-line @next/next/no-img-element -- aperçu local via blob:, next/image ne gère pas ce cas
            <img
              src={apercuUrl}
              alt="Aperçu du document"
              onError={() => dernierFichier && setApercuErreurId(dernierFichier.id)}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[var(--accent)] sm:h-12 sm:w-12">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  width={24}
                  height={24}
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <path d="M4 8a2 2 0 0 1 2-2h1.5l.8-1.2A2 2 0 0 1 10 4h4a2 2 0 0 1 1.7.9L16.5 6H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
                  <circle cx="12" cy="13" r="3.25" />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {quotaAtteint
                    ? "Quota mensuel atteint"
                    : glisserActif
                      ? "Déposez vos fichiers ici"
                      : libellePhoto}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {quotaAtteint
                    ? "Revenez le mois prochain pour continuer l'envoi"
                    : glisserActif
                      ? "Plusieurs fichiers à la fois, c'est possible"
                      : cleLibelleUpload === "tous"
                        ? SOUS_LIBELLE_UPLOAD_PHOTO
                        : "Appuyez pour ouvrir l'appareil photo, ou glissez-déposez plusieurs fichiers"}
                </p>
              </div>
            </>
          )}

          {dernierFichier && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                retirerFichier(dernierFichier.id);
              }}
              disabled={enCoursOuBloque}
              title="Retirer"
              aria-label="Retirer l'aperçu"
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-white backdrop-blur hover:bg-red-500/80 disabled:opacity-50"
            >
              ✕
            </button>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={() => inputFichierRef.current?.click()}
            disabled={enCoursOuBloque}
            className="text-muted underline decoration-dotted underline-offset-2 hover:text-accent disabled:opacity-50"
          >
            ou choisir un fichier existant
          </button>
          {dernierFichier && (
            <button
              type="button"
              onClick={() => inputPhotoRef.current?.click()}
              disabled={enCoursOuBloque}
              className="font-medium text-accent hover:opacity-80 disabled:opacity-50"
            >
              + Ajouter une page
            </button>
          )}
        </div>
      </div>

      {fichiers.length > 0 && (
        <ul className="space-y-1.5 text-sm">
          {fichiers.map((f) => (
            <li
              key={f.id}
              className={`rounded-md border px-3 py-2 ${
                f.statut === "doublon" ? "border-amber-200 bg-amber-50" : "border-[var(--border)]"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="truncate">{f.file.name}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <span
                    className={
                      f.statut === "erreur"
                        ? "text-xs text-red-400"
                        : f.statut === "doublon"
                          ? "text-xs text-amber-400"
                          : f.statut === "succes"
                            ? "text-xs text-green-400"
                            : "text-xs text-muted"
                    }
                  >
                    {f.statut === "en_attente" && "En attente"}
                    {f.statut === "envoi" && "Envoi..."}
                    {f.statut === "succes" && "Envoyé"}
                    {f.statut === "erreur" && (f.message ?? "Erreur")}
                    {f.statut === "doublon" && "⚠ Doublon ?"}
                  </span>
                  {!enCours && (
                    <button
                      type="button"
                      onClick={() => retirerFichier(f.id)}
                      className="text-muted hover:text-red-400"
                      title="Retirer"
                      aria-label={`Retirer ${f.file.name}`}
                    >
                      ✕
                    </button>
                  )}
                </span>
              </div>
              {f.statut === "doublon" && (
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-amber-900/40 pt-2">
                  <p className="text-xs text-amber-300">{f.message}</p>
                  <button
                    type="button"
                    onClick={() => envoyerQuandMeme(f.id)}
                    className="shrink-0 rounded border border-amber-500/50 px-2.5 py-1 text-xs font-medium text-amber-300 hover:bg-amber-500/10"
                  >
                    Envoyer quand même
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {progression && (
        <div>
          <div className="flex items-center justify-between text-xs text-muted">
            <span>
              {progression.traites}/{progression.total} document{progression.total > 1 ? "s" : ""} traité
              {progression.traites > 1 ? "s" : ""}
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-background">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{ width: `${progression.total > 0 ? (progression.traites / progression.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={lancerEnvoi}
        disabled={enCoursOuBloque || enAttenteCount === 0}
        className="relative w-full overflow-hidden rounded-md bg-accent px-4 py-2.5 font-medium text-accent-foreground hover:opacity-95 disabled:opacity-50"
      >
        {(enCours || progression) && (
          <span
            className="absolute inset-y-0 left-0 bg-white/35 transition-[width] duration-500 ease-out"
            style={{ width: `${pourcentageEnvoi}%` }}
            aria-hidden="true"
          />
        )}
        <span className="relative z-10">
          {enCours
            ? progression
              ? `Envoi ${progression.traites}/${progression.total}…`
              : "Envoi en cours..."
            : `Envoyer${enAttenteCount > 1 ? ` (${enAttenteCount} fichiers)` : ""}`}
        </span>
      </button>
    </div>
  );
}
