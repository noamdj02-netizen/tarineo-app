"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { enregistrerEntreprise } from "./actions";
import { LABELS_REGIME_TVA, masquerIban } from "@/lib/entreprise";
import { AnalyserSiteEntreprise, type ProfilFormulairePartiel } from "./AnalyserSiteEntreprise";

export interface ProfilExistant {
  raisonSociale: string;
  siret: string;
  formeJuridique: string | null;
  adresseRue: string;
  adresseCodePostal: string;
  adresseVille: string;
  telephone: string;
  emailContact: string;
  regimeTva: "NORMAL" | "FRANCHISE_293B";
  registreImmatriculation: string | null;
  assuranceNom: string | null;
  assuranceAdresse: string | null;
  assuranceNumeroContrat: string | null;
  assuranceActivitesGaranties: string | null;
  assuranceZoneGeographique: string | null;
  margeParDefautPct: number;
  website?: string | null;
  nomCommercial?: string | null;
  numeroTva?: string | null;
  iban?: string | null;
  capitalSocial?: string | null;
  activite?: string | null;
  activiteDescription?: string | null;
  couleurPrimaire?: string | null;
  couleurSecondaire?: string | null;
  conditionsPaiementDefaut?: string | null;
  mentionsLegales?: string | null;
}

const champClasse = "w-full app-input";
const labelClasse = "mb-1 block text-xs text-muted";

export function FormulaireEntreprise({
  profil,
  logoUrl,
  variant = "page",
  afficherAnalyseSite = true,
}: {
  profil: ProfilExistant | null;
  logoUrl: string | null;
  variant?: "page" | "settings";
  afficherAnalyseSite?: boolean;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<{ type: "succes" | "erreur"; texte: string } | null>(null);
  const [assuranceOuverte, setAssuranceOuverte] = useState(Boolean(profil?.assuranceNom));
  const [apercuLogo, setApercuLogo] = useState<string | null>(logoUrl);
  const [valeurs, setValeurs] = useState<ProfilExistant | null>(profil);
  const [formKey, setFormKey] = useState(0);
  const [logoUrlExterne, setLogoUrlExterne] = useState<string>("");

  function surChangementLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    setApercuLogo(URL.createObjectURL(fichier));
  }

  function appliquerExtraction(partiel: ProfilFormulairePartiel) {
    setValeurs((prev) => ({
      raisonSociale: partiel.raisonSociale ?? prev?.raisonSociale ?? "",
      siret: partiel.siret ?? prev?.siret ?? "",
      formeJuridique: partiel.formeJuridique ?? prev?.formeJuridique ?? null,
      adresseRue: partiel.adresseRue ?? prev?.adresseRue ?? "",
      adresseCodePostal: partiel.adresseCodePostal ?? prev?.adresseCodePostal ?? "",
      adresseVille: partiel.adresseVille ?? prev?.adresseVille ?? "",
      telephone: partiel.telephone ?? prev?.telephone ?? "",
      emailContact: partiel.emailContact ?? prev?.emailContact ?? "",
      regimeTva: prev?.regimeTva ?? "NORMAL",
      registreImmatriculation: partiel.registreImmatriculation ?? prev?.registreImmatriculation ?? null,
      assuranceNom: prev?.assuranceNom ?? null,
      assuranceAdresse: prev?.assuranceAdresse ?? null,
      assuranceNumeroContrat: prev?.assuranceNumeroContrat ?? null,
      assuranceActivitesGaranties: prev?.assuranceActivitesGaranties ?? null,
      assuranceZoneGeographique: prev?.assuranceZoneGeographique ?? null,
      margeParDefautPct: prev?.margeParDefautPct ?? 25,
      website: partiel.website ?? prev?.website ?? null,
      nomCommercial: partiel.nomCommercial ?? prev?.nomCommercial ?? null,
      numeroTva: partiel.numeroTva ?? prev?.numeroTva ?? null,
      iban: partiel.iban ?? prev?.iban ?? null,
      capitalSocial: partiel.capitalSocial ?? prev?.capitalSocial ?? null,
      activite: partiel.activite ?? prev?.activite ?? null,
      activiteDescription: partiel.activiteDescription ?? prev?.activiteDescription ?? null,
      couleurPrimaire: partiel.couleurPrimaire ?? prev?.couleurPrimaire ?? null,
      couleurSecondaire: partiel.couleurSecondaire ?? prev?.couleurSecondaire ?? null,
      conditionsPaiementDefaut: partiel.conditionsPaiementDefaut ?? prev?.conditionsPaiementDefaut ?? null,
      mentionsLegales: partiel.mentionsLegales ?? prev?.mentionsLegales ?? null,
    }));
    if (partiel.logoUrlExterne) {
      setApercuLogo(partiel.logoUrlExterne);
      setLogoUrlExterne(partiel.logoUrlExterne);
    }
    setFormKey((k) => k + 1);
    setMessage({
      type: "succes",
      texte: "Informations proposées — vérifiez chaque champ puis enregistrez.",
    });
  }

  async function soumettre(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setEnCours(true);

    const formData = new FormData(e.currentTarget);
    if (logoUrlExterne && !(formData.get("logo") instanceof File && (formData.get("logo") as File).size > 0)) {
      formData.set("logoUrlExterne", logoUrlExterne);
    }
    const resultat = await enregistrerEntreprise(formData);
    setEnCours(false);

    if (!resultat.succes) {
      setMessage({ type: "erreur", texte: resultat.erreur });
      return;
    }
    setMessage({ type: "succes", texte: "Informations enregistrées." });
    setLogoUrlExterne("");
    router.refresh();
  }

  const sectionClasse = variant === "settings" ? "" : "app-card p-5 sm:p-6";
  const champSettings =
    variant === "settings"
      ? "h-11 w-full rounded-xl border border-[#E6E9EB] bg-white px-3 text-sm outline-none"
      : champClasse;
  const labelSettings = variant === "settings" ? "mb-1 block text-xs text-muted-foreground" : labelClasse;
  const p = valeurs;

  return (
    <div className={variant === "settings" ? "space-y-8" : "mt-6 space-y-6"}>
      {afficherAnalyseSite && (
        <AnalyserSiteEntreprise
          variant={variant === "settings" ? "compact" : "carte"}
          remplirFormulaireSeulement
          onAppliquer={appliquerExtraction}
          onLogoLocal={(fichier) => {
            const dt = new DataTransfer();
            dt.items.add(fichier);
            if (logoFileRef.current) {
              logoFileRef.current.files = dt.files;
            }
            setApercuLogo(URL.createObjectURL(fichier));
            setLogoUrlExterne("");
          }}
        />
      )}

      <form key={formKey} ref={formRef} onSubmit={soumettre} className="space-y-6">
        <section className={sectionClasse}>
          <h2 className="text-lg font-semibold">
            {variant === "settings" ? "Informations de l'entreprise" : "Identité de l'entreprise"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            Reprises sur chaque devis généré — logo, coordonnées et mentions légales. Modifiables à tout moment.
          </p>

          <div className="mt-4">
            <label className={labelSettings}>Logo</label>
            <div className="flex items-center gap-4">
              {apercuLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={apercuLogo}
                  alt="Logo de l'entreprise"
                  className="h-16 w-auto rounded border border-border bg-white p-1"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded border border-dashed border-border text-xs text-muted">
                  Aucun
                </div>
              )}
              <input
                ref={logoFileRef}
                type="file"
                name="logo"
                accept="image/png,image/jpeg,image/webp"
                onChange={surChangementLogo}
                className="text-sm text-muted file:mr-3 file:rounded-md file:border file:border-border file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium"
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">PNG, JPG ou WebP — remplace le logo actuel.</p>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="raisonSociale" className={labelSettings}>
                Raison sociale
              </label>
              <input
                id="raisonSociale"
                name="raisonSociale"
                required
                defaultValue={p?.raisonSociale ?? ""}
                className={champSettings}
              />
            </div>
            <div>
              <label htmlFor="nomCommercial" className={labelSettings}>
                Nom commercial (optionnel)
              </label>
              <input
                id="nomCommercial"
                name="nomCommercial"
                defaultValue={p?.nomCommercial ?? ""}
                className={champSettings}
              />
            </div>
            <div>
              <label htmlFor="formeJuridique" className={labelSettings}>
                Forme juridique (optionnel)
              </label>
              <input
                id="formeJuridique"
                name="formeJuridique"
                placeholder="EI, EURL, SASU..."
                defaultValue={p?.formeJuridique ?? ""}
                className={champSettings}
              />
            </div>
            <div>
              <label htmlFor="siret" className={labelSettings}>
                SIRET
              </label>
              <input
                id="siret"
                name="siret"
                required
                inputMode="numeric"
                placeholder="14 chiffres"
                defaultValue={p?.siret ?? ""}
                className={champSettings}
              />
            </div>
            <div>
              <label htmlFor="numeroTva" className={labelSettings}>
                N° TVA intracommunautaire (optionnel)
              </label>
              <input
                id="numeroTva"
                name="numeroTva"
                placeholder="FR…"
                defaultValue={p?.numeroTva ?? ""}
                className={champSettings}
              />
            </div>
            <div>
              <label htmlFor="registreImmatriculation" className={labelSettings}>
                RCS / RM (optionnel)
              </label>
              <input
                id="registreImmatriculation"
                name="registreImmatriculation"
                placeholder="Ex : RCS Lyon 123 456 789"
                defaultValue={p?.registreImmatriculation ?? ""}
                className={champSettings}
              />
            </div>
            <div>
              <label htmlFor="capitalSocial" className={labelSettings}>
                Capital social (optionnel)
              </label>
              <input
                id="capitalSocial"
                name="capitalSocial"
                defaultValue={p?.capitalSocial ?? ""}
                className={champSettings}
              />
            </div>
            <div>
              <label htmlFor="website" className={labelSettings}>
                Site internet (optionnel)
              </label>
              <input
                id="website"
                name="website"
                type="url"
                placeholder="https://"
                defaultValue={p?.website ?? ""}
                className={champSettings}
              />
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-[2fr_1fr_1fr]">
            <div>
              <label htmlFor="adresseRue" className={labelSettings}>
                Adresse
              </label>
              <input
                id="adresseRue"
                name="adresseRue"
                required
                defaultValue={p?.adresseRue ?? ""}
                className={champSettings}
              />
            </div>
            <div>
              <label htmlFor="adresseCodePostal" className={labelSettings}>
                Code postal
              </label>
              <input
                id="adresseCodePostal"
                name="adresseCodePostal"
                required
                defaultValue={p?.adresseCodePostal ?? ""}
                className={champSettings}
              />
            </div>
            <div>
              <label htmlFor="adresseVille" className={labelSettings}>
                Ville
              </label>
              <input
                id="adresseVille"
                name="adresseVille"
                required
                defaultValue={p?.adresseVille ?? ""}
                className={champSettings}
              />
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="telephone" className={labelSettings}>
                Téléphone
              </label>
              <input
                id="telephone"
                name="telephone"
                required
                defaultValue={p?.telephone ?? ""}
                className={champSettings}
              />
            </div>
            <div>
              <label htmlFor="emailContact" className={labelSettings}>
                Email de contact
              </label>
              <input
                id="emailContact"
                name="emailContact"
                type="email"
                required
                defaultValue={p?.emailContact ?? ""}
                className={champSettings}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="iban" className={labelSettings}>
                IBAN (optionnel — uniquement s&apos;il est public)
              </label>
              <input
                id="iban"
                name="iban"
                defaultValue={p?.iban ?? ""}
                placeholder={p?.iban ? masquerIban(p.iban) : "FR76…"}
                className={champSettings}
                autoComplete="off"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Ne jamais inventer un IBAN. Laisser vide s&apos;il n&apos;apparaît pas sur votre site.
              </p>
            </div>
            <div>
              <label htmlFor="activite" className={labelSettings}>
                Métier / activité (optionnel)
              </label>
              <input id="activite" name="activite" defaultValue={p?.activite ?? ""} className={champSettings} />
            </div>
            <div>
              <label htmlFor="couleurPrimaire" className={labelSettings}>
                Couleur devis (optionnel)
              </label>
              <input
                id="couleurPrimaire"
                name="couleurPrimaire"
                placeholder="#e85d04"
                defaultValue={p?.couleurPrimaire ?? ""}
                className={champSettings}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Personnalise vos PDF uniquement — pas l&apos;interface Tarinéo.
              </p>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="activiteDescription" className={labelSettings}>
                Description d&apos;activité (optionnel)
              </label>
              <textarea
                id="activiteDescription"
                name="activiteDescription"
                rows={2}
                defaultValue={p?.activiteDescription ?? ""}
                className={champSettings + " h-auto py-2"}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="mentionsLegales" className={labelSettings}>
                Mentions légales complémentaires (optionnel)
              </label>
              <textarea
                id="mentionsLegales"
                name="mentionsLegales"
                rows={2}
                defaultValue={p?.mentionsLegales ?? ""}
                className={champSettings + " h-auto py-2"}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="conditionsPaiementDefaut" className={labelSettings}>
                Conditions de paiement par défaut (optionnel)
              </label>
              <textarea
                id="conditionsPaiementDefaut"
                name="conditionsPaiementDefaut"
                rows={2}
                defaultValue={p?.conditionsPaiementDefaut ?? ""}
                className={champSettings + " h-auto py-2"}
              />
            </div>
            <input type="hidden" name="couleurSecondaire" defaultValue={p?.couleurSecondaire ?? ""} />
            <input type="hidden" name="logoUrlExterne" value={logoUrlExterne} readOnly />
          </div>
        </section>

        <section className={sectionClasse}>
          <h2 className="text-lg font-semibold">TVA</h2>
          <div className="mt-4 space-y-2">
            {(["NORMAL", "FRANCHISE_293B"] as const).map((valeur) => (
              <label key={valeur} className="flex items-start gap-2 text-sm">
                <input
                  type="radio"
                  name="regimeTva"
                  value={valeur}
                  defaultChecked={(p?.regimeTva ?? "NORMAL") === valeur}
                  className="mt-0.5 h-4 w-4 accent-orange-500"
                />
                {LABELS_REGIME_TVA[valeur]}
              </label>
            ))}
          </div>
        </section>

        <section className={sectionClasse}>
          <h2 className="text-lg font-semibold">Devis clients</h2>
          <p className="mt-1 text-sm text-muted">
            Lors de la saisie d&apos;un devis, un prix peut être suggéré à partir de vos derniers achats fournisseur pour
            une référence donnée. Cette marge s&apos;applique par défaut à cette suggestion — toujours modifiable ligne
            par ligne, jamais imposée.
          </p>
          <div className="mt-4 max-w-[10rem]">
            <label htmlFor="margeParDefautPct" className={labelSettings}>
              Marge par défaut (%)
            </label>
            <input
              id="margeParDefautPct"
              name="margeParDefautPct"
              type="number"
              step="0.1"
              min="0"
              max="500"
              required
              defaultValue={p?.margeParDefautPct ?? 25}
              className={champSettings}
            />
          </div>
        </section>

        <section className={sectionClasse}>
          <button
            type="button"
            onClick={() => setAssuranceOuverte((o) => !o)}
            className="flex w-full items-center justify-between text-left"
          >
            <span>
              <h2 className="text-lg font-semibold">Assurance décennale</h2>
              <p className="mt-1 text-sm text-muted">
                Optionnel — à renseigner si votre activité y est soumise. N&apos;apparaît sur le devis que si les 5
                champs sont remplis.
              </p>
            </span>
            <span className="ml-4 shrink-0 text-sm text-accent">{assuranceOuverte ? "Masquer" : "Renseigner"}</span>
          </button>

          {assuranceOuverte && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="assuranceNom" className={labelSettings}>
                  Nom de l&apos;assureur
                </label>
                <input
                  id="assuranceNom"
                  name="assuranceNom"
                  defaultValue={p?.assuranceNom ?? ""}
                  className={champSettings}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="assuranceAdresse" className={labelSettings}>
                  Adresse de l&apos;assureur
                </label>
                <input
                  id="assuranceAdresse"
                  name="assuranceAdresse"
                  defaultValue={p?.assuranceAdresse ?? ""}
                  className={champSettings}
                />
              </div>
              <div>
                <label htmlFor="assuranceNumeroContrat" className={labelSettings}>
                  Numéro de contrat
                </label>
                <input
                  id="assuranceNumeroContrat"
                  name="assuranceNumeroContrat"
                  defaultValue={p?.assuranceNumeroContrat ?? ""}
                  className={champSettings}
                />
              </div>
              <div>
                <label htmlFor="assuranceZoneGeographique" className={labelSettings}>
                  Zone géographique couverte
                </label>
                <input
                  id="assuranceZoneGeographique"
                  name="assuranceZoneGeographique"
                  placeholder="Ex : France métropolitaine"
                  defaultValue={p?.assuranceZoneGeographique ?? ""}
                  className={champSettings}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="assuranceActivitesGaranties" className={labelSettings}>
                  Activités garanties
                </label>
                <input
                  id="assuranceActivitesGaranties"
                  name="assuranceActivitesGaranties"
                  defaultValue={p?.assuranceActivitesGaranties ?? ""}
                  className={champSettings}
                />
              </div>
            </div>
          )}
        </section>

        {message && (
          <p className={`text-sm ${message.type === "succes" ? "text-green-600" : "text-red-500"}`}>{message.texte}</p>
        )}

        <button
          type="submit"
          disabled={enCours}
          className={
            variant === "settings"
              ? "inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-white disabled:opacity-50"
              : "rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
          }
        >
          {enCours ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}
