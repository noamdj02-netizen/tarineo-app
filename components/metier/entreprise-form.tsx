"use client";

import { useState } from "react";
import { enregistrerEntreprise } from "@/app/(app)/entreprise/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LABELS_REGIME_TVA, type CompanyProfile } from "@/lib/metier/company";

const field = "h-11 rounded-xl";

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

  return (
    <form
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
      <input type="hidden" name="logoPath" value={profil.logo_path} />
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
            className="h-11 max-w-xs rounded-xl"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setPreview(URL.createObjectURL(f));
            }}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-[13px]">
            Raison sociale
            <Input name="raisonSociale" required defaultValue={profil.raison_sociale} className={`mt-1 ${field}`} />
          </label>
          <label className="text-[13px]">
            Forme juridique
            <Input name="formeJuridique" defaultValue={profil.forme_juridique} placeholder="EI, EURL…" className={`mt-1 ${field}`} />
          </label>
          <label className="text-[13px]">
            SIRET
            <Input name="siret" required inputMode="numeric" defaultValue={profil.siret} className={`mt-1 ${field}`} />
          </label>
          <label className="text-[13px]">
            RCS / RM
            <Input name="registreImmatriculation" defaultValue={profil.registre_immatriculation} className={`mt-1 ${field}`} />
          </label>
          <label className="text-[13px] sm:col-span-2">
            Adresse
            <Input name="adresseRue" required defaultValue={profil.adresse_rue} className={`mt-1 ${field}`} />
          </label>
          <label className="text-[13px]">
            Code postal
            <Input name="adresseCodePostal" required defaultValue={profil.adresse_code_postal} className={`mt-1 ${field}`} />
          </label>
          <label className="text-[13px]">
            Ville
            <Input name="adresseVille" required defaultValue={profil.adresse_ville} className={`mt-1 ${field}`} />
          </label>
          <label className="text-[13px]">
            Téléphone
            <Input name="telephone" defaultValue={profil.telephone} className={`mt-1 ${field}`} />
          </label>
          <label className="text-[13px]">
            Email
            <Input name="emailContact" type="email" defaultValue={profil.email_contact} className={`mt-1 ${field}`} />
          </label>
        </div>
      </section>

      <section className="card-soft flex flex-col gap-3 p-5">
        <p className="text-[12px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">TVA & marge</p>
        {(["FRANCHISE_293B", "NORMAL"] as const).map((v) => (
          <label key={v} className="flex items-start gap-2 text-[14px]">
            <input type="radio" name="regimeTva" value={v} defaultChecked={profil.regime_tva === v} className="mt-1" />
            {LABELS_REGIME_TVA[v]}
          </label>
        ))}
        <label className="mt-2 max-w-[10rem] text-[13px]">
          Marge par défaut (%)
          <Input name="margeParDefautPct" type="number" min="0" step="1" defaultValue={profil.marge_par_defaut_pct} className={`mt-1 ${field}`} />
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
      <Button type="submit" disabled={pending} className="w-fit rounded-full">
        {pending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
