"use client";

import { useState } from "react";
import { enregistrerEntreprise } from "@/app/(app)/entreprise/actions";
import {
  draftFromProfile,
  EntrepriseLookupFlow,
  type EntrepriseDraft,
} from "@/components/metier/entreprise-lookup-flow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LABELS_REGIME_TVA, type CompanyProfile } from "@/lib/metier/company";

const field = "h-12 min-h-12 rounded-xl";

export function EntrepriseForm({
  profil,
  logoUrl,
}: {
  profil: CompanyProfile;
  logoUrl: string | null;
}) {
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(logoUrl);
  const [assurance, setAssurance] = useState(Boolean(profil.assurance_nom));
  const [formKey, setFormKey] = useState(0);
  const [seed, setSeed] = useState(() => draftFromProfile(profil, logoUrl));

  function applyLookup(draft: EntrepriseDraft) {
    setSeed({
      ...seed,
      ...draft,
      logoPath: seed.logoPath ?? profil.logo_path,
    });
    if (draft.logoUrl) setPreview(draft.logoUrl);
    setFormKey((k) => k + 1);
    setMsg("Informations récupérées — vérifiez puis enregistrez.");
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="card-soft p-5">
        <EntrepriseLookupFlow
          variant="settings"
          emailContact={profil.email_contact}
          formId="entreprise-lookup-bridge"
          onResolved={applyLookup}
        />
      </section>

      <form
        key={formKey}
        className="flex flex-col gap-6"
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true);
          setErr(null);
          setMsg(null);
          const res = await enregistrerEntreprise(new FormData(e.currentTarget));
          setPending(false);
          if (!res.ok) {
            setErr(res.error);
            return;
          }
          setMsg("Enregistré. Les prochains PDF reprendront ces mentions.");
        }}
      >
        <input type="hidden" name="logoPath" value={seed.logoPath ?? profil.logo_path} />
        <input type="hidden" name="logoUrl" value={seed.logoUrl ?? ""} />
        <section className="card-soft flex flex-col gap-4 p-5">
          <p className="text-[12px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">Identité visuelle</p>
          <p className="text-[13px] text-muted-foreground">Repris sur chaque devis, facture et bon client.</p>
          <div className="flex items-center gap-4">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="h-16 w-auto rounded-xl border border-line bg-white p-1" />
            ) : (
              <div className="grid size-16 place-items-center rounded-xl border border-dashed border-line text-[11px] text-muted-foreground">
                Logo
              </div>
            )}
            <Input
              type="file"
              name="logo"
              accept="image/png,image/jpeg,image/webp"
              className="h-12 max-w-xs rounded-xl"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setPreview(URL.createObjectURL(f));
              }}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-[13px]">
              Raison sociale
              <Input name="raisonSociale" required defaultValue={seed.raisonSociale ?? ""} className={`mt-1 ${field}`} />
            </label>
            <label className="text-[13px]">
              Forme juridique
              <Input name="formeJuridique" defaultValue={seed.formeJuridique ?? ""} placeholder="EI, EURL…" className={`mt-1 ${field}`} />
            </label>
            <label className="text-[13px]">
              SIRET
              <Input name="siret" required inputMode="numeric" defaultValue={seed.siret ?? ""} className={`mt-1 ${field}`} />
            </label>
            <label className="text-[13px]">
              RCS / RM
              <Input name="registreImmatriculation" defaultValue={profil.registre_immatriculation} className={`mt-1 ${field}`} />
            </label>
            <label className="text-[13px] sm:col-span-2">
              Adresse
              <Input name="adresseRue" required defaultValue={seed.adresseRue ?? ""} className={`mt-1 ${field}`} />
            </label>
            <label className="text-[13px]">
              Code postal
              <Input name="adresseCodePostal" required defaultValue={seed.adresseCodePostal ?? ""} className={`mt-1 ${field}`} />
            </label>
            <label className="text-[13px]">
              Ville
              <Input name="adresseVille" required defaultValue={seed.adresseVille ?? ""} className={`mt-1 ${field}`} />
            </label>
            <label className="text-[13px]">
              Téléphone
              <Input name="telephone" defaultValue={profil.telephone} className={`mt-1 ${field}`} />
            </label>
            <label className="text-[13px]">
              Email
              <Input name="emailContact" type="email" defaultValue={seed.emailContact ?? ""} className={`mt-1 ${field}`} />
            </label>
          </div>
        </section>

        <section className="card-soft flex flex-col gap-3 p-5">
          <p className="text-[12px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">TVA & marge</p>
          {(["FRANCHISE_293B", "NORMAL"] as const).map((v) => (
            <label key={v} className="flex min-h-12 items-start gap-2 text-[14px]">
              <input
                type="radio"
                name="regimeTva"
                value={v}
                defaultChecked={(seed.regimeTva ?? profil.regime_tva) === v}
                className="mt-1"
              />
              {LABELS_REGIME_TVA[v]}
            </label>
          ))}
          <label className="mt-2 max-w-[10rem] text-[13px]">
            Marge par défaut (%)
            <Input
              name="margeParDefautPct"
              type="number"
              min="0"
              step="1"
              defaultValue={seed.margeParDefautPct ?? 35}
              className={`mt-1 ${field}`}
            />
          </label>
        </section>

        <section className="card-soft p-5">
          <button type="button" className="text-left text-[14px] font-medium" onClick={() => setAssurance((v) => !v)}>
            Assurance décennale {assurance ? "— masquer" : "— renseigner (optionnel)"}
          </button>
          {assurance ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-[13px] sm:col-span-2">
                Assureur
                <Input name="assuranceNom" defaultValue={profil.assurance_nom} className={`mt-1 ${field}`} />
              </label>
              <label className="text-[13px] sm:col-span-2">
                Adresse assureur
                <Input name="assuranceAdresse" defaultValue={profil.assurance_adresse} className={`mt-1 ${field}`} />
              </label>
              <label className="text-[13px]">
                N° contrat
                <Input name="assuranceNumeroContrat" defaultValue={profil.assurance_numero_contrat} className={`mt-1 ${field}`} />
              </label>
              <label className="text-[13px]">
                Zone
                <Input name="assuranceZoneGeographique" defaultValue={profil.assurance_zone_geographique} className={`mt-1 ${field}`} />
              </label>
              <label className="text-[13px] sm:col-span-2">
                Activités garanties
                <Input name="assuranceActivitesGaranties" defaultValue={profil.assurance_activites_garanties} className={`mt-1 ${field}`} />
              </label>
            </div>
          ) : null}
        </section>

        {err ? <p className="text-[14px] text-destructive">{err}</p> : null}
        {msg ? <p className="text-[14px] text-muted-foreground">{msg}</p> : null}
        <Button type="submit" disabled={pending} className="min-h-12 w-fit rounded-full">
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </form>
    </div>
  );
}
