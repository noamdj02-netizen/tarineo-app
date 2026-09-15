"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { enregistrerEntreprise } from "./actions";
import { LABELS_REGIME_TVA } from "@/lib/entreprise";

interface ProfilExistant {
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
}

const champClasse = "w-full app-input";
const labelClasse = "mb-1 block text-xs text-muted";

export function FormulaireEntreprise({
  profil,
  logoUrl,
  variant = "page",
}: {
  profil: ProfilExistant | null;
  logoUrl: string | null;
  variant?: "page" | "settings";
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<{ type: "succes" | "erreur"; texte: string } | null>(null);
  // Le bloc assurance décennale reste replié par défaut si aucune donnée n'est déjà
  // renseignée — entièrement optionnel (voir prisma/schema.prisma), un artisan qui n'en
  // a pas besoin ne doit pas être face à 5 champs vides intimidants.
  const [assuranceOuverte, setAssuranceOuverte] = useState(Boolean(profil?.assuranceNom));
  const [apercuLogo, setApercuLogo] = useState<string | null>(logoUrl);

  function surChangementLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    setApercuLogo(URL.createObjectURL(fichier));
  }

  async function soumettre(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setEnCours(true);

    const formData = new FormData(e.currentTarget);
    const resultat = await enregistrerEntreprise(formData);
    setEnCours(false);

    if (!resultat.succes) {
      setMessage({ type: "erreur", texte: resultat.erreur });
      return;
    }
    setMessage({ type: "succes", texte: "Informations enregistrées." });
    router.refresh();
  }

  const sectionClasse = variant === "settings" ? "" : "app-card p-5 sm:p-6";
  const champSettings = variant === "settings" ? "h-11 w-full rounded-xl border border-[#E6E9EB] bg-white px-3 text-sm outline-none" : champClasse;
  const labelSettings = variant === "settings" ? "mb-1 block text-xs text-muted-foreground" : labelClasse;

  return (
    <form ref={formRef} onSubmit={soumettre} className={variant === "settings" ? "space-y-8" : "mt-6 space-y-6"}>
      <section className={sectionClasse}>
        <h2 className="text-lg font-semibold">{variant === "settings" ? "Informations de l'entreprise" : "Identité de l'entreprise"}</h2>
        <p className="mt-1 text-sm text-muted">
          Reprises sur chaque devis généré — logo, coordonnées et mentions légales.
        </p>

        <div className="mt-4">
          <label className={labelSettings}>Logo</label>
          <div className="flex items-center gap-4">
            {apercuLogo ? (
              // eslint-disable-next-line @next/next/no-img-element -- aperçu local (blob:/URL signée), pas une image à optimiser par Next
              <img src={apercuLogo} alt="Logo de l'entreprise" className="h-16 w-auto rounded border border-border bg-white p-1" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded border border-dashed border-border text-xs text-muted">
                Aucun
              </div>
            )}
            <input
              type="file"
              name="logo"
              accept="image/png,image/jpeg,image/webp"
              onChange={surChangementLogo}
              className="text-sm text-muted file:mr-3 file:rounded-md file:border file:border-border file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium"
            />
          </div>
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
              defaultValue={profil?.raisonSociale}
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
              defaultValue={profil?.formeJuridique ?? ""}
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
              defaultValue={profil?.siret}
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
              defaultValue={profil?.registreImmatriculation ?? ""}
              className={champSettings}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-[2fr_1fr_1fr]">
          <div>
            <label htmlFor="adresseRue" className={labelSettings}>
              Adresse
            </label>
            <input id="adresseRue" name="adresseRue" required defaultValue={profil?.adresseRue} className={champSettings} />
          </div>
          <div>
            <label htmlFor="adresseCodePostal" className={labelSettings}>
              Code postal
            </label>
            <input
              id="adresseCodePostal"
              name="adresseCodePostal"
              required
              defaultValue={profil?.adresseCodePostal}
              className={champSettings}
            />
          </div>
          <div>
            <label htmlFor="adresseVille" className={labelSettings}>
              Ville
            </label>
            <input id="adresseVille" name="adresseVille" required defaultValue={profil?.adresseVille} className={champSettings} />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="telephone" className={labelSettings}>
              Téléphone
            </label>
            <input id="telephone" name="telephone" required defaultValue={profil?.telephone} className={champSettings} />
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
              defaultValue={profil?.emailContact}
              className={champSettings}
            />
          </div>
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
                defaultChecked={(profil?.regimeTva ?? "NORMAL") === valeur}
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
            defaultValue={profil?.margeParDefautPct ?? 25}
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
              <input id="assuranceNom" name="assuranceNom" defaultValue={profil?.assuranceNom ?? ""} className={champSettings} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="assuranceAdresse" className={labelSettings}>
                Adresse de l&apos;assureur
              </label>
              <input
                id="assuranceAdresse"
                name="assuranceAdresse"
                defaultValue={profil?.assuranceAdresse ?? ""}
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
                defaultValue={profil?.assuranceNumeroContrat ?? ""}
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
                defaultValue={profil?.assuranceZoneGeographique ?? ""}
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
                defaultValue={profil?.assuranceActivitesGaranties ?? ""}
                className={champSettings}
              />
            </div>
          </div>
        )}
      </section>

      {message && (
        <p className={`text-sm ${message.type === "succes" ? "text-green-400" : "text-red-400"}`}>{message.texte}</p>
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
  );
}
