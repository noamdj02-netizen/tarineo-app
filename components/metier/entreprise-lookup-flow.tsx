"use client";

import { Check, Loader2, Pencil, Search } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { TarineoHdMascot } from "@/components/tarineo-hd-mascot";
import { lookupCompanyAction } from "@/lib/company/actions";
import type { CompanyLookupResult } from "@/lib/company/types";
import { siretValide } from "@/lib/metier/company";
import { cn } from "@/lib/utils";

export type EntrepriseDraft = {
  raisonSociale: string;
  formeJuridique: string;
  siret: string;
  adresseRue: string;
  adresseCodePostal: string;
  adresseVille: string;
  emailContact: string;
  regimeTva: "FRANCHISE_293B" | "NORMAL";
  logoUrl: string | null;
  logoPath: string;
  margeParDefautPct: number;
  fromLookup: boolean;
};

type Mode = "search" | "candidates" | "confirm" | "edit";

type Props = {
  /** Préremplit l’email (compte connecté). */
  emailContact?: string;
  /** Valeurs initiales (dashboard). */
  initial?: Partial<EntrepriseDraft>;
  /** true = onboarding (mascotte + titres). false = encart dashboard. */
  variant?: "onboarding" | "settings";
  /** id du <form> parent pour le wizard onboarding. */
  formId?: string;
  className?: string;
  /** Appelé quand une entreprise est sélectionnée / confirmée. */
  onResolved?: (draft: EntrepriseDraft) => void;
};

export function EntrepriseLookupFlow({
  emailContact = "",
  initial,
  variant = "onboarding",
  formId = "onboard-entreprise",
  className,
  onResolved,
}: Props) {
  const [mode, setMode] = useState<Mode>(initial?.raisonSociale ? "edit" : "search");
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<CompanyLookupResult[]>([]);
  const [draft, setDraft] = useState<EntrepriseDraft>(() => ({
    raisonSociale: initial?.raisonSociale ?? "",
    formeJuridique: initial?.formeJuridique ?? "",
    siret: initial?.siret ?? "",
    adresseRue: initial?.adresseRue ?? "",
    adresseCodePostal: initial?.adresseCodePostal ?? "",
    adresseVille: initial?.adresseVille ?? "",
    emailContact: initial?.emailContact || emailContact,
    regimeTva: initial?.regimeTva ?? "FRANCHISE_293B",
    logoUrl: initial?.logoUrl ?? null,
    logoPath: initial?.logoPath ?? "",
    margeParDefautPct: initial?.margeParDefautPct ?? 35,
    fromLookup: false,
  }));

  const applyCompany = useCallback(
    (company: CompanyLookupResult) => {
      const missing =
        !company.siret ||
        !company.siretValid ||
        !company.address ||
        !company.postalCode ||
        !company.city ||
        !company.legalName;
      const next: EntrepriseDraft = {
        raisonSociale: company.legalName ?? company.name ?? "",
        formeJuridique: company.tradeName ?? "",
        siret: company.siretValid && company.siret ? company.siret : company.siret ?? "",
        adresseRue: company.address ?? "",
        adresseCodePostal: company.postalCode ?? "",
        adresseVille: company.city ?? "",
        emailContact: emailContact,
        regimeTva: "FRANCHISE_293B",
        logoUrl: company.logoUrl,
        logoPath: "",
        margeParDefautPct: 35,
        fromLookup: true,
      };
      setDraft((d) => ({
        ...next,
        emailContact: d.emailContact || emailContact || next.emailContact,
        margeParDefautPct: d.margeParDefautPct,
        logoPath: d.logoPath,
        regimeTva: d.regimeTva,
      }));
      const resolved: EntrepriseDraft = {
        ...next,
        emailContact: emailContact || next.emailContact,
      };
      setMode(variant === "settings" ? "confirm" : missing ? "edit" : "confirm");
      setError(
        variant === "settings"
          ? null
          : missing
            ? "Certaines informations doivent être complétées."
            : company.siret && !company.siretValid
              ? "SIRET à vérifier."
              : null,
      );
      onResolved?.(resolved);
    },
    [emailContact, onResolved, variant],
  );

  async function search() {
    setError(null);
    setPending(true);
    try {
      const data = await lookupCompanyAction(query);
      if (data.status === "found") {
        applyCompany(data.company);
        return;
      }
      if (data.status === "candidates") {
        setCandidates(data.candidates);
        setMode("candidates");
        return;
      }
      if (data.status === "not_found") {
        setError("Aucune entreprise trouvée. Complétez les informations manuellement.");
        setMode("edit");
        return;
      }
      setError(data.message || "Recherche impossible.");
      setMode("edit");
    } catch (err) {
      console.error("[entreprise-lookup]", err);
      setError("Recherche impossible. Complétez les informations manuellement.");
      setMode("edit");
    } finally {
      setPending(false);
    }
  }

  async function pickCandidate(c: CompanyLookupResult) {
    setPending(true);
    setError(null);
    try {
      if (c.siret) {
        const data = await lookupCompanyAction(c.siret);
        if (data.status === "found") {
          applyCompany({
            ...data.company,
            website: c.website,
            logoUrl: data.company.logoUrl ?? c.logoUrl,
          });
          return;
        }
      }
      applyCompany(c);
    } catch (err) {
      console.error("[entreprise-lookup]", err);
      applyCompany(c);
    } finally {
      setPending(false);
    }
  }

  const siretOk = !draft.siret || siretValide(draft.siret);
  const onboard = variant === "onboarding";

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {mode === "search" ? (
        <div className="flex flex-col gap-4">
          {onboard ? (
            <>
              <TarineoHdMascot name="05-bras-croises" className="h-24 w-28 self-center" label="" />
              <div className="flex flex-col gap-1 text-center sm:text-left">
                <h2 className="font-display text-[24px] font-semibold tracking-tight">Votre entreprise</h2>
                <p className="text-[14px] text-muted-foreground">
                  Quelques informations suffisent pour configurer vos devis et factures.
                </p>
                <p className="mt-2 text-[14px] font-medium">Parlons de votre entreprise</p>
                <p className="text-[14px] text-muted-foreground">
                  Entrez son nom ou indiquez son site web. TARINEO récupérera automatiquement les informations
                  disponibles.
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-1">
              <p className="text-[12px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                Recherche automatique
              </p>
              <p className="text-[14px] text-muted-foreground">
                Nom ou site web — TARINEO préremplit les mentions publiques pour vos devis.
              </p>
            </div>
          )}

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="company-lookup-q">Nom ou site web</FieldLabel>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="company-lookup-q"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (query.trim() && !pending) void search();
                    }
                  }}
                  placeholder="Nom de l'entreprise ou site web"
                  className="h-12 min-h-12 rounded-xl pl-10"
                  autoComplete="organization"
                />
              </div>
              <FieldDescription>Ex. Dupont Plomberie · dupont-plomberie.fr · https://dupont-plomberie.fr</FieldDescription>
            </Field>
          </FieldGroup>

          <Button
            type="button"
            className="min-h-12 w-full rounded-full sm:w-auto"
            disabled={pending || query.trim().length < 2}
            onClick={() => void search()}
          >
            {pending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Search data-icon="inline-start" />}
            {pending ? "Recherche de votre entreprise…" : "Rechercher mon entreprise"}
          </Button>

          <button
            type="button"
            className="text-left text-[13px] text-muted-foreground underline-offset-2 hover:underline"
            onClick={() => setMode("edit")}
          >
            Saisir manuellement
          </button>
        </div>
      ) : null}

      {mode === "candidates" ? (
        <div className="flex flex-col gap-3">
          {onboard ? (
            <h2 className="font-display text-[22px] font-semibold tracking-tight">Plusieurs entreprises trouvées</h2>
          ) : (
            <p className="text-[14px] font-medium">Plusieurs entreprises trouvées</p>
          )}
          <p className="text-[13px] text-muted-foreground">
            Choisissez la bonne fiche — TARINEO ne déduit jamais un SIRET approximatif.
          </p>
          <ul className="flex flex-col gap-2">
            {candidates.map((c) => (
              <li key={c.siret ?? c.siren ?? c.legalName}>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => void pickCandidate(c)}
                  className="card-soft flex w-full min-h-12 flex-col gap-0.5 px-4 py-3 text-left transition hover:ring-1 hover:ring-tarineo-orange/40"
                >
                  <span className="text-[14px] font-medium">{c.legalName ?? c.name ?? "Entreprise"}</span>
                  <span className="text-[12px] text-muted-foreground">
                    {[c.siret ? formatSiret(c.siret) : null, c.postalCode, c.city].filter(Boolean).join(" · ")}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <Button type="button" variant="ghost" className="min-h-11 self-start" onClick={() => setMode("search")}>
            Nouvelle recherche
          </Button>
        </div>
      ) : null}

      {mode === "confirm" ? (
        <div className="flex flex-col gap-4">
          {onboard ? (
            <>
              <TarineoHdMascot name="01-pouce-leve" className="h-20 w-24 self-center" label="" />
              <h2 className="font-display text-[24px] font-semibold tracking-tight">Entreprise trouvée ✓</h2>
            </>
          ) : (
            <p className="text-[14px] font-medium text-tarineo-orange">Entreprise trouvée ✓</p>
          )}
          <div className="card-soft flex flex-col gap-3 p-5">
            <div className="flex items-start gap-3">
              {draft.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={draft.logoUrl}
                  alt=""
                  className="size-14 rounded-xl border border-line bg-white object-contain p-1"
                />
              ) : (
                <div className="grid size-14 place-items-center rounded-xl border border-dashed border-line text-[10px] text-muted-foreground">
                  Logo
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[16px] font-semibold">{draft.raisonSociale || "—"}</p>
                {draft.formeJuridique ? (
                  <p className="text-[12px] text-muted-foreground">{draft.formeJuridique}</p>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col gap-1 text-[13px]">
              <p>
                <span className="text-muted-foreground">SIRET</span>
                <br />
                {draft.siret ? formatSiret(draft.siret) : <span className="text-destructive">à compléter</span>}
              </p>
              <p>
                {draft.adresseRue || <span className="text-destructive">Adresse à compléter</span>}
                {(draft.adresseCodePostal || draft.adresseVille) && (
                  <>
                    <br />
                    {[draft.adresseCodePostal, draft.adresseVille].filter(Boolean).join(" ")}
                  </>
                )}
              </p>
            </div>
            <p className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <Check className="size-3.5 text-tarineo-orange" aria-hidden />
              Informations récupérées automatiquement
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {variant === "settings" ? (
              <p className="self-center text-[12px] text-muted-foreground">
                Vérifiez le formulaire ci-dessous puis Enregistrer.
              </p>
            ) : (
              <>
                <Button type="button" variant="outline" className="min-h-12 rounded-full" onClick={() => setMode("edit")}>
                  <Pencil data-icon="inline-start" />
                  Modifier
                </Button>
                <p className="self-center text-[12px] text-muted-foreground">Puis « Continuer » ci-dessous.</p>
              </>
            )}
          </div>
        </div>
      ) : null}

      {(mode === "edit" || mode === "confirm") && (
        <form
          id={formId}
          className={cn("flex flex-col gap-3", mode === "confirm" && "sr-only")}
          onSubmit={(e) => {
            // Empêche un submit Enter accidentel hors du flux parent.
            if (variant === "onboarding") e.preventDefault();
          }}
        >
          {mode === "edit" ? (
            <>
              {onboard ? (
                <>
                  <TarineoHdMascot name="05-bras-croises" className="h-20 w-24 self-center" label="" />
                  <h2 className="font-display text-[24px] font-semibold tracking-tight">Votre entreprise</h2>
                  <p className="text-[14px] text-muted-foreground">
                    {draft.fromLookup
                      ? "Informations récupérées automatiquement — vérifiez avant de continuer."
                      : "Ces mentions iront sur chaque devis et facture PDF."}
                  </p>
                </>
              ) : (
                <p className="text-[12px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                  {draft.fromLookup ? "Informations récupérées — à valider" : "Identité"}
                </p>
              )}
              {error ? <p className="text-[13px] text-destructive">{error}</p> : null}
              {!siretOk ? <p className="text-[13px] text-destructive">SIRET à vérifier (14 chiffres, clé de Luhn).</p> : null}
            </>
          ) : null}

          <HiddenOrVisible mode={mode} label="Raison sociale" name="raisonSociale" required value={draft.raisonSociale} onChange={(v) => setDraft((d) => ({ ...d, raisonSociale: v }))} />
          <input type="hidden" name="formeJuridique" value={draft.formeJuridique} />
          <HiddenOrVisible
            mode={mode}
            label="SIRET (14 chiffres)"
            name="siret"
            required
            inputMode="numeric"
            value={draft.siret}
            onChange={(v) => setDraft((d) => ({ ...d, siret: v }))}
            invalid={!siretOk}
          />
          <HiddenOrVisible mode={mode} label="Adresse" name="adresseRue" required value={draft.adresseRue} onChange={(v) => setDraft((d) => ({ ...d, adresseRue: v }))} />
          <div className={cn(mode === "edit" ? "grid gap-3 sm:grid-cols-2" : "contents")}>
            <HiddenOrVisible mode={mode} label="Code postal" name="adresseCodePostal" required value={draft.adresseCodePostal} onChange={(v) => setDraft((d) => ({ ...d, adresseCodePostal: v }))} />
            <HiddenOrVisible mode={mode} label="Ville" name="adresseVille" required value={draft.adresseVille} onChange={(v) => setDraft((d) => ({ ...d, adresseVille: v }))} />
          </div>
          <HiddenOrVisible
            mode={mode}
            label="Email de contact"
            name="emailContact"
            type="email"
            value={draft.emailContact}
            onChange={(v) => setDraft((d) => ({ ...d, emailContact: v }))}
          />

          {mode === "edit" ? (
            <fieldset className="text-[13px]">
              <legend className="mb-1">TVA</legend>
              <label className="flex min-h-11 items-center gap-2">
                <input
                  type="radio"
                  name="regimeTva"
                  value="FRANCHISE_293B"
                  checked={draft.regimeTva === "FRANCHISE_293B"}
                  onChange={() => setDraft((d) => ({ ...d, regimeTva: "FRANCHISE_293B" }))}
                />
                Franchise en base
              </label>
              <label className="flex min-h-11 items-center gap-2">
                <input
                  type="radio"
                  name="regimeTva"
                  value="NORMAL"
                  checked={draft.regimeTva === "NORMAL"}
                  onChange={() => setDraft((d) => ({ ...d, regimeTva: "NORMAL" }))}
                />
                TVA 20 %
              </label>
            </fieldset>
          ) : (
            <input type="hidden" name="regimeTva" value={draft.regimeTva} />
          )}

          <input type="hidden" name="margeParDefautPct" value={String(draft.margeParDefautPct)} />
          <input type="hidden" name="logoPath" value={draft.logoPath} />
          <input type="hidden" name="logoUrl" value={draft.logoUrl ?? ""} />

          {mode === "edit" ? (
            <div className="flex flex-wrap gap-2 pt-1">
              <Button type="button" variant="ghost" className="min-h-11" onClick={() => setMode("search")}>
                ← Recherche
              </Button>
            </div>
          ) : null}
        </form>
      )}

      {mode === "search" || mode === "candidates" ? (
        // Formulaire minimal pour que Continuer échoue clairement si pas encore prêt.
        <form id={formId} className="hidden" aria-hidden>
          <input name="raisonSociale" value="" readOnly />
          <input name="siret" value="" readOnly />
          <input name="adresseRue" value="" readOnly />
          <input name="adresseCodePostal" value="" readOnly />
          <input name="adresseVille" value="" readOnly />
          <input name="regimeTva" value="FRANCHISE_293B" readOnly />
          <input name="margeParDefautPct" value="35" readOnly />
        </form>
      ) : null}
    </div>
  );
}

function HiddenOrVisible({
  mode,
  label,
  name,
  value,
  onChange,
  required,
  type = "text",
  inputMode,
  invalid,
}: {
  mode: Mode;
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  invalid?: boolean;
}) {
  if (mode === "confirm") {
    return <input type="hidden" name={name} value={value} />;
  }
  return (
    <label className="text-[13px]" data-invalid={invalid ? true : undefined}>
      {label}
      <Input
        name={name}
        type={type}
        required={required}
        inputMode={inputMode}
        value={value}
        aria-invalid={invalid || undefined}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-12 min-h-12 rounded-xl"
      />
    </label>
  );
}

function formatSiret(siret: string) {
  const d = siret.replace(/\D/g, "");
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{5})/, "$1 $2 $3 $4");
}

/** Expose le draft courant pour le formulaire settings (composition). */
export function draftFromProfile(profil: {
  raison_sociale: string;
  siret: string;
  forme_juridique: string;
  adresse_rue: string;
  adresse_code_postal: string;
  adresse_ville: string;
  email_contact: string;
  regime_tva: "FRANCHISE_293B" | "NORMAL";
  logo_path: string;
  marge_par_defaut_pct: number;
}, logoUrl: string | null): Partial<EntrepriseDraft> {
  return {
    raisonSociale: profil.raison_sociale,
    formeJuridique: profil.forme_juridique,
    siret: profil.siret,
    adresseRue: profil.adresse_rue,
    adresseCodePostal: profil.adresse_code_postal,
    adresseVille: profil.adresse_ville,
    emailContact: profil.email_contact,
    regimeTva: profil.regime_tva,
    logoPath: profil.logo_path,
    logoUrl,
    margeParDefautPct: profil.marge_par_defaut_pct,
  };
}
