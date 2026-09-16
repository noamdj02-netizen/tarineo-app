"use client";

import { useRef, useState, useTransition } from "react";
import { SparklesIcon, CheckIcon, CircleIcon, LoaderCircleIcon, UploadIcon } from "lucide-react";
import {
  analyserSiteEntreprise,
  appliquerProfilExtrait,
  type DonneesApplicationProfil,
} from "./analyserSiteActions";
import type { ExtractedCompanyProfile, ChampExtrait } from "@/lib/companyProfileExtraction";
import {
  formaterSiretAffichage,
  formaterTelephoneAffichage,
  masquerIban,
} from "@/lib/entreprise";

export type ProfilFormulairePartiel = {
  raisonSociale?: string;
  nomCommercial?: string;
  siret?: string;
  formeJuridique?: string;
  adresseRue?: string;
  adresseCodePostal?: string;
  adresseVille?: string;
  telephone?: string;
  emailContact?: string;
  website?: string;
  numeroTva?: string;
  iban?: string;
  capitalSocial?: string;
  registreImmatriculation?: string;
  activite?: string;
  activiteDescription?: string;
  couleurPrimaire?: string;
  couleurSecondaire?: string;
  conditionsPaiementDefaut?: string;
  mentionsLegales?: string;
  logoUrlExterne?: string | null;
};

type EtapeProgression = 0 | 1 | 2 | 3 | 4;

const ETAPES = [
  "Connexion au site",
  "Recherche des informations",
  "Vérification",
  "Préparation de votre profil",
] as const;

function libelleChamp(trouve: boolean, label: string): { ok: boolean; texte: string } {
  return {
    ok: trouve,
    texte: trouve ? `${label} trouvé` : `${label} non trouvé`,
  };
}

function profilVersFormulaire(profil: ExtractedCompanyProfile): ProfilFormulairePartiel {
  const val = (c: ChampExtrait<string>) => c.value ?? undefined;
  return {
    raisonSociale: val(profil.legalName) ?? val(profil.commercialName),
    nomCommercial: val(profil.commercialName),
    siret: val(profil.siret),
    formeJuridique: val(profil.legalForm),
    adresseRue: val(profil.address),
    adresseCodePostal: val(profil.postalCode),
    adresseVille: val(profil.city),
    telephone: val(profil.phone),
    emailContact: val(profil.email),
    website: val(profil.website),
    numeroTva: val(profil.vatNumber),
    iban: val(profil.iban),
    capitalSocial: val(profil.capitalSocial),
    registreImmatriculation: val(profil.registreImmatriculation),
    activite: val(profil.activity),
    activiteDescription: val(profil.activityDescription),
    couleurPrimaire: val(profil.primaryColor),
    couleurSecondaire: val(profil.secondaryColor),
    conditionsPaiementDefaut: val(profil.conditionsPaiement),
    mentionsLegales: val(profil.mentionsLegales),
    logoUrlExterne: profil.logoUrl.value,
  };
}

export function AnalyserSiteEntreprise({
  onAppliquer,
  onLogoLocal,
  onSucces,
  remplirFormulaireSeulement = false,
  variant = "carte",
  className = "",
}: {
  onAppliquer?: (profil: ProfilFormulairePartiel) => void;
  onLogoLocal?: (fichier: File) => void;
  /** Appelé après une sauvegarde réussie en base. */
  onSucces?: () => void;
  /** Si true, "Utiliser ces informations" remplit le formulaire parent sans upsert. */
  remplirFormulaireSeulement?: boolean;
  variant?: "carte" | "compact";
  className?: string;
}) {
  const [url, setUrl] = useState("");
  const [etape, setEtape] = useState<EtapeProgression>(0);
  const [erreur, setErreur] = useState<string | null>(null);
  const [profil, setProfil] = useState<ExtractedCompanyProfile | null>(null);
  const [edition, setEdition] = useState(false);
  const [brouillon, setBrouillon] = useState<ProfilFormulairePartiel | null>(null);
  const [messageOk, setMessageOk] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const logoInputRef = useRef<HTMLInputElement>(null);

  function lancerAnalyse() {
    setErreur(null);
    setMessageOk(null);
    setProfil(null);
    setEdition(false);
    setBrouillon(null);
    setEtape(1);

    startTransition(async () => {
      const timers = [
        window.setTimeout(() => setEtape(2), 600),
        window.setTimeout(() => setEtape(3), 1600),
        window.setTimeout(() => setEtape(4), 2800),
      ];

      const resultat = await analyserSiteEntreprise(url);
      timers.forEach(clearTimeout);

      if (!resultat.succes) {
        setEtape(0);
        setErreur(resultat.erreur);
        return;
      }

      setEtape(4);
      setProfil(resultat.profil);
      setBrouillon(profilVersFormulaire(resultat.profil));
    });
  }

  function utiliserInformations() {
    if (!brouillon) return;
    setErreur(null);
    setMessageOk(null);

    if (remplirFormulaireSeulement && onAppliquer) {
      onAppliquer(brouillon);
      setMessageOk("Informations prêtes — vérifiez et enregistrez le formulaire ci-dessous.");
      return;
    }

    const payload: DonneesApplicationProfil = {
      raisonSociale: brouillon.raisonSociale?.trim() || "",
      nomCommercial: brouillon.nomCommercial,
      siret: brouillon.siret?.trim() || "",
      formeJuridique: brouillon.formeJuridique,
      adresseRue: brouillon.adresseRue?.trim() || "",
      adresseCodePostal: brouillon.adresseCodePostal?.trim() || "",
      adresseVille: brouillon.adresseVille?.trim() || "",
      telephone: brouillon.telephone?.trim() || "",
      emailContact: brouillon.emailContact?.trim() || "",
      website: brouillon.website,
      numeroTva: brouillon.numeroTva,
      iban: brouillon.iban,
      capitalSocial: brouillon.capitalSocial,
      registreImmatriculation: brouillon.registreImmatriculation,
      activite: brouillon.activite,
      activiteDescription: brouillon.activiteDescription,
      couleurPrimaire: brouillon.couleurPrimaire,
      couleurSecondaire: brouillon.couleurSecondaire,
      conditionsPaiementDefaut: brouillon.conditionsPaiementDefaut,
      mentionsLegales: brouillon.mentionsLegales,
      logoUrl: brouillon.logoUrlExterne ?? undefined,
    };

    if (
      !payload.raisonSociale ||
      !payload.siret ||
      !payload.adresseRue ||
      !payload.adresseCodePostal ||
      !payload.adresseVille ||
      !payload.telephone ||
      !payload.emailContact
    ) {
      setEdition(true);
      setErreur(
        "Complétez les champs manquants (raison sociale, SIRET, adresse, téléphone, email) avant de confirmer."
      );
      return;
    }

    startTransition(async () => {
      const resultat = await appliquerProfilExtrait(payload);
      if (!resultat.succes) {
        setEdition(true);
        setErreur(resultat.erreur);
        return;
      }
      setMessageOk("Votre profil est prêt. Il sera repris sur vos devis et factures.");
      onAppliquer?.(brouillon);
      onSucces?.();
    });
  }

  const encours = pending || (etape > 0 && etape < 4 && !profil && !erreur);

  const resume = profil
    ? [
        libelleChamp(Boolean(profil.logoUrl.value), "Logo"),
        libelleChamp(Boolean(profil.legalName.value || profil.commercialName.value), "Nom de l'entreprise"),
        libelleChamp(Boolean(profil.siret.value), "SIRET"),
        libelleChamp(Boolean(profil.address.value), "Adresse"),
        libelleChamp(Boolean(profil.phone.value), "Téléphone"),
        libelleChamp(Boolean(profil.email.value), "Email"),
        libelleChamp(Boolean(profil.iban.value), "IBAN"),
      ]
    : [];

  return (
    <section
      className={
        variant === "compact"
          ? `rounded-2xl border border-[#E6E9EB] bg-[#FFFBF8] p-4 sm:p-5 ${className}`
          : `app-card border border-[#F0E4DA] bg-gradient-to-br from-[#FFFBF8] to-white p-5 sm:p-6 ${className}`
      }
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-[#FFF0E8] text-primary">
          <SparklesIcon className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-[#172935] sm:text-lg">Votre entreprise, automatiquement</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tarinéo récupère automatiquement les informations publiques de votre entreprise pour préparer vos devis.
            Rien n&apos;est enregistré tant que vous n&apos;avez pas validé.
          </p>
        </div>
      </div>

      {!profil && (
        <div className="mt-5 space-y-3">
          <label htmlFor="url-site-entreprise" className="mb-1 block text-xs text-muted-foreground">
            Entrez votre site
          </label>
          <input
            id="url-site-entreprise"
            type="url"
            inputMode="url"
            autoComplete="url"
            placeholder="https://monsite.fr"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={encours}
            className="h-12 w-full rounded-xl border border-[#E6E9EB] bg-white px-3 text-sm outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={lancerAnalyse}
            disabled={encours || url.trim().length < 3}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-white hover:opacity-95 disabled:opacity-50"
          >
            {encours ? (
              <>
                <LoaderCircleIcon className="size-4 animate-spin" aria-hidden />
                Analyse du site…
              </>
            ) : (
              "Analyser mon site"
            )}
          </button>

          <div className="relative py-2 text-center text-xs text-muted-foreground">
            <span className="relative z-10 bg-transparent px-2">ou</span>
          </div>

          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#E6E9EB] bg-white px-5 text-sm font-medium text-[#172935] hover:bg-[#F8F8F8]"
          >
            <UploadIcon className="size-4" aria-hidden />
            Importer mon logo
          </button>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onLogoLocal?.(f);
            }}
          />
        </div>
      )}

      {encours && !profil && (
        <ol className="mt-5 space-y-2">
          {ETAPES.map((label, i) => {
            const n = (i + 1) as 1 | 2 | 3 | 4;
            const actif = etape === n;
            const fait = etape > n;
            return (
              <li
                key={label}
                className={`flex items-center gap-3 text-sm ${actif ? "font-medium text-[#172935]" : fait ? "text-[#1F9D55]" : "text-muted-foreground"}`}
              >
                <span
                  className={`grid size-6 place-items-center rounded-full text-xs ${
                    fait
                      ? "bg-[#E9F8EE] text-[#1F9D55]"
                      : actif
                        ? "bg-primary text-white"
                        : "bg-[#F0F2F4] text-muted-foreground"
                  }`}
                >
                  {fait ? "✓" : n}
                </span>
                {label}
                {actif && <LoaderCircleIcon className="size-3.5 animate-spin text-primary" aria-hidden />}
              </li>
            );
          })}
        </ol>
      )}

      {erreur && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {erreur}
        </p>
      )}

      {messageOk && (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {messageOk}
        </p>
      )}

      {profil && brouillon && (
        <div className="mt-5 space-y-5">
          <div>
            <p className="text-sm font-medium text-[#172935]">Informations trouvées</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Propositions à valider — une donnée peu fiable n&apos;est pas présentée comme certaine.
            </p>
            <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
              {resume.map((r) => (
                <li key={r.texte} className="flex items-center gap-2 text-sm text-[#172935]">
                  {r.ok ? (
                    <CheckIcon className="size-4 shrink-0 text-[#1F9D55]" aria-hidden />
                  ) : (
                    <CircleIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  )}
                  <span className={r.ok ? "" : "text-muted-foreground"}>{r.texte}</span>
                </li>
              ))}
            </ul>
          </div>

          {!edition ? (
            <div className="rounded-2xl border border-[#E6E9EB] bg-white p-4 sm:p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Votre entreprise</p>
              <div className="mt-3 flex items-center gap-3">
                {brouillon.logoUrlExterne ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={brouillon.logoUrlExterne}
                    alt="Logo détecté"
                    className="h-14 w-auto max-w-[120px] rounded border border-border bg-white object-contain p-1"
                  />
                ) : (
                  <div className="grid h-14 w-14 place-items-center rounded border border-dashed border-border text-xs text-muted-foreground">
                    Logo
                  </div>
                )}
                <div>
                  <p className="font-semibold text-[#172935]">
                    {brouillon.raisonSociale || brouillon.nomCommercial || "Nom à compléter"}
                  </p>
                  {profil.legalName.confidence === "LOW" && brouillon.raisonSociale && (
                    <p className="text-xs text-amber-700">À vérifier — confiance faible</p>
                  )}
                </div>
              </div>

              <dl className="mt-4 space-y-3 text-sm">
                <LigneDetail
                  label="SIRET"
                  valeur={brouillon.siret ? formaterSiretAffichage(brouillon.siret) : null}
                  source={profil.siret.sourceUrl}
                  low={profil.siret.confidence === "LOW"}
                />
                <LigneDetail
                  label="Adresse"
                  valeur={
                    brouillon.adresseRue
                      ? `${brouillon.adresseRue}${
                          brouillon.adresseCodePostal || brouillon.adresseVille
                            ? `\n${brouillon.adresseCodePostal ?? ""} ${brouillon.adresseVille ?? ""}`.trim()
                            : ""
                        }`
                      : null
                  }
                  source={profil.address.sourceUrl}
                  low={profil.address.confidence === "LOW"}
                />
                <LigneDetail
                  label="Téléphone"
                  valeur={brouillon.telephone ? formaterTelephoneAffichage(brouillon.telephone) : null}
                  source={profil.phone.sourceUrl}
                  low={profil.phone.confidence === "LOW"}
                />
                <LigneDetail
                  label="Email"
                  valeur={brouillon.emailContact ?? null}
                  source={profil.email.sourceUrl}
                  low={profil.email.confidence === "LOW"}
                />
                <LigneDetail
                  label="IBAN"
                  valeur={brouillon.iban ? masquerIban(brouillon.iban) : null}
                  source={profil.iban.sourceUrl}
                  low={profil.iban.confidence === "LOW"}
                />
              </dl>
            </div>
          ) : (
            <div className="grid gap-3 rounded-2xl border border-[#E6E9EB] bg-white p-4 sm:grid-cols-2 sm:p-5">
              {(
                [
                  ["raisonSociale", "Raison sociale"],
                  ["siret", "SIRET"],
                  ["adresseRue", "Adresse"],
                  ["adresseCodePostal", "Code postal"],
                  ["adresseVille", "Ville"],
                  ["telephone", "Téléphone"],
                  ["emailContact", "Email"],
                  ["formeJuridique", "Forme juridique"],
                  ["numeroTva", "N° TVA"],
                  ["iban", "IBAN (si public)"],
                  ["website", "Site internet"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className={key === "adresseRue" || key === "raisonSociale" ? "sm:col-span-2" : ""}>
                  <label className="mb-1 block text-xs text-muted-foreground">{label}</label>
                  <input
                    className="h-11 w-full rounded-xl border border-[#E6E9EB] bg-white px-3 text-sm outline-none"
                    value={(brouillon[key] as string | undefined) ?? ""}
                    onChange={(e) => setBrouillon({ ...brouillon, [key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setEdition((e) => !e)}
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#E6E9EB] bg-white px-5 text-sm font-medium text-[#172935] hover:bg-[#F8F8F8]"
            >
              {edition ? "Aperçu" : "Modifier"}
            </button>
            <button
              type="button"
              onClick={utiliserInformations}
              disabled={pending}
              className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-white hover:opacity-95 disabled:opacity-50"
            >
              {pending ? "Enregistrement…" : "Utiliser ces informations"}
            </button>
          </div>

          <button
            type="button"
            className="text-sm text-muted-foreground underline-offset-2 hover:underline"
            onClick={() => {
              setProfil(null);
              setBrouillon(null);
              setEtape(0);
              setErreur(null);
              setMessageOk(null);
            }}
          >
            Analyser un autre site
          </button>
        </div>
      )}
    </section>
  );
}

function LigneDetail({
  label,
  valeur,
  source,
  low,
}: {
  label: string;
  valeur: string | null;
  source: string | null;
  low: boolean;
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-line font-medium text-[#172935]">
        {valeur ?? <span className="font-normal text-muted-foreground">Non trouvé</span>}
      </dd>
      {valeur && source && (
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Trouvé sur votre site
          {low ? " · à vérifier" : ""}
          {" · "}
          <a href={source} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
            voir la source
          </a>
        </p>
      )}
    </div>
  );
}
