"use client";

import { AlertTriangle, Building2, Check, Loader2, Pencil, Search } from "lucide-react";
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
  activity: string;
  fromLookup: boolean;
};

/** États explicites du parcours de recherche (jamais « terminé » pendant le fetch). */
type SearchPhase = "idle" | "searching" | "results" | "ambiguous" | "not_found" | "error";
type Mode = "search" | "candidates" | "confirm" | "edit";

type Props = {
  emailContact?: string;
  initial?: Partial<EntrepriseDraft>;
  variant?: "onboarding" | "settings";
  formId?: string;
  className?: string;
  onResolved?: (draft: EntrepriseDraft) => void;
  onSkipLater?: () => void;
};

export function EntrepriseLookupFlow({
  emailContact = "",
  initial,
  variant = "onboarding",
  formId = "onboard-entreprise",
  className,
  onResolved,
  onSkipLater,
}: Props) {
  const [mode, setMode] = useState<Mode>(initial?.raisonSociale ? "edit" : "search");
  const [phase, setPhase] = useState<SearchPhase>(initial?.raisonSociale ? "results" : "idle");
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<CompanyLookupResult[]>([]);
  const [draft, setDraft] = useState<EntrepriseDraft>(() => emptyDraft(initial, emailContact));

  const applyCompany = useCallback(
    (company: CompanyLookupResult, opts?: { forceEmpty?: boolean }) => {
      const force = opts?.forceEmpty ?? !draft.fromLookup;
      const next: EntrepriseDraft = {
        // Données publiques complètent / remplacent uniquement si force ou champ vide
        raisonSociale: pickField(draft.raisonSociale, company.legalName ?? company.name ?? "", force),
        formeJuridique: pickField(draft.formeJuridique, company.legalForm ?? "", force),
        siret: pickField(draft.siret, company.siret ?? "", force || !draft.siret),
        adresseRue: pickField(draft.adresseRue, company.address ?? "", force),
        adresseCodePostal: pickField(draft.adresseCodePostal, company.postalCode ?? "", force),
        adresseVille: pickField(draft.adresseVille, company.city ?? "", force),
        // Ne jamais écraser email / TVA / logo déjà posés
        emailContact: draft.emailContact || emailContact,
        regimeTva: draft.regimeTva,
        logoUrl: draft.logoUrl ?? company.logoUrl,
        logoPath: draft.logoPath,
        margeParDefautPct: draft.margeParDefautPct,
        activity: company.activityLabel
          ? `${company.activityLabel}${company.activity ? ` (${company.activity})` : ""}`
          : company.activity ?? draft.activity,
        fromLookup: true,
      };

      const missing =
        !next.siret ||
        !siretValide(next.siret) ||
        !next.adresseRue ||
        !next.adresseCodePostal ||
        !next.adresseVille ||
        !next.raisonSociale;

      setDraft(next);
      setPhase("results");
      setMode(variant === "settings" ? "confirm" : missing ? "edit" : "confirm");
      setError(
        !next.siret || !siretValide(next.siret)
          ? "SIRET invalide. Vérifiez les informations de l’entreprise."
          : missing
            ? "Certaines informations manquent — complétez-les avant de continuer."
            : null,
      );
      setHint(
        company.active === false
          ? "Attention : cet établissement apparaît comme inactif dans les données publiques."
          : company.logoUrl
            ? null
            : "Aucun logo trouvé — vous pourrez l’ajouter plus tard.",
      );
      onResolved?.(next);
    },
    [draft, emailContact, onResolved, variant],
  );

  async function search() {
    setError(null);
    setHint(null);
    setPending(true);
    setPhase("searching");
    setCandidates([]);
    try {
      const data = await lookupCompanyAction(query);
      if (data.status === "found") {
        applyCompany(data.company, { forceEmpty: true });
        return;
      }
      if (data.status === "candidates") {
        setCandidates(data.candidates);
        setMode("candidates");
        setPhase("ambiguous");
        setHint("Plusieurs entreprises correspondent. Vérifiez laquelle est la vôtre.");
        return;
      }
      if (data.status === "not_found") {
        setError("Aucune entreprise trouvée pour cette recherche.");
        setHint(
          variant === "settings"
            ? "Essayez le SIRET, le site (ex. monentreprise.fr) ou un nom + ville. Sinon complétez le formulaire ci-dessous."
            : "Saisir les informations manuellement",
        );
        setMode(variant === "settings" ? "search" : "edit");
        setPhase("not_found");
        return;
      }
      setError("Impossible de rechercher l’entreprise pour le moment.");
      setHint(
        variant === "settings"
          ? "Réessayez dans un instant, ou complétez le formulaire ci-dessous."
          : "Saisir les informations manuellement",
      );
      setMode(variant === "settings" ? "search" : "edit");
      setPhase("error");
    } catch (err) {
      console.error("[entreprise-lookup]", err);
      setError("Impossible de rechercher l’entreprise pour le moment.");
      setHint(
        variant === "settings"
          ? "Réessayez dans un instant, ou complétez le formulaire ci-dessous."
          : "Saisir les informations manuellement",
      );
      setMode(variant === "settings" ? "search" : "edit");
      setPhase("error");
    } finally {
      setPending(false);
    }
  }

  async function pickCandidate(c: CompanyLookupResult) {
    setPending(true);
    setPhase("searching");
    setError(null);
    try {
      if (c.siret && c.siretValid) {
        const data = await lookupCompanyAction(c.siret);
        if (data.status === "found") {
          applyCompany(
            {
              ...data.company,
              website: c.website,
              logoUrl: data.company.logoUrl ?? c.logoUrl,
              matchScore: c.matchScore,
            },
            { forceEmpty: true },
          );
          return;
        }
      }
      applyCompany(c, { forceEmpty: true });
    } catch (err) {
      console.error("[entreprise-lookup]", err);
      applyCompany(c, { forceEmpty: true });
    } finally {
      setPending(false);
    }
  }

  const siretOk = !draft.siret || siretValide(draft.siret);
  const onboard = variant === "onboarding";
  const searching = pending || phase === "searching";

  return (
    <div className={cn("flex flex-col gap-4", className)} data-search-phase={phase}>
      {mode === "search" ? (
        <div className="flex flex-col gap-4">
          {onboard ? (
            <>
              <TarineoHdMascot name="05-bras-croises" className="h-24 w-28 self-center" label="" />
              <div className="flex flex-col gap-1 text-center sm:text-left">
                <h2 className="font-display text-[24px] font-semibold tracking-tight text-ink">
                  Trouver mon entreprise
                </h2>
                <p className="text-[14px] text-muted-foreground">
                  Entrez le nom de votre entreprise pour remplir automatiquement vos informations.
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-1">
              <p className="text-[12px] font-semibold tracking-[0.06em] text-brand-orange uppercase">
                Trouver mon entreprise
              </p>
              <p className="text-[14px] text-muted-foreground">
                Nom, site web ou SIRET — TARINEO préremplit raison sociale, adresse, SIRET et logo.
              </p>
            </div>
          )}

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="company-lookup-q">Nom, site ou SIRET</FieldLabel>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="company-lookup-q"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (query.trim().length >= 2 && !searching) void search();
                    }
                  }}
                  placeholder="Ex. Dupont Plomberie Lyon · monentreprise.fr · SIRET"
                  className="h-12 min-h-12 rounded-xl pl-10"
                  autoComplete="organization"
                  disabled={searching}
                  aria-busy={searching || undefined}
                />
              </div>
              <FieldDescription>
                Ex. Dupont Plomberie · dupont-plomberie.fr · 533 712 527 00019
              </FieldDescription>
            </Field>
          </FieldGroup>

          {error && (phase === "not_found" || phase === "error") ? (
            <p role="alert" className="text-[13.5px] text-destructive">
              {error}
              {hint ? <span className="mt-1 block text-muted-foreground">{hint}</span> : null}
            </p>
          ) : null}

          {searching ? (
            <p
              className="flex items-center gap-2 text-[14px] text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              <Loader2 className="size-4 shrink-0 animate-spin text-brand-orange" aria-hidden />
              Recherche dans les données publiques…
            </p>
          ) : null}

          <Button
            type="button"
            className="min-h-12 w-full rounded-full bg-brand-orange text-white hover:brightness-[0.96] sm:w-auto"
            disabled={searching || query.trim().length < 2}
            onClick={() => void search()}
          >
            {searching ? (
              <Loader2 className="animate-spin" data-icon="inline-start" />
            ) : (
              <Search data-icon="inline-start" />
            )}
            {searching ? "Recherche dans les données publiques…" : "Rechercher mon entreprise"}
          </Button>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="text-left text-[13px] text-muted-foreground underline-offset-2 hover:underline"
              disabled={searching}
              onClick={() => {
                setMode("edit");
                setPhase("idle");
                setError(null);
                setHint(null);
              }}
            >
              Saisir les informations manuellement
            </button>
            {onboard && onSkipLater ? (
              <Button
                type="button"
                variant="ghost"
                className="min-h-12 w-full justify-center rounded-full text-[14px] text-muted-foreground sm:w-auto sm:justify-start"
                disabled={searching}
                onClick={onSkipLater}
              >
                Ajouter plus tard mes infos pro
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {mode === "candidates" ? (
        <div className="flex flex-col gap-3">
          {onboard ? (
            <h2 className="font-display text-[22px] font-semibold tracking-tight text-ink">
              Entreprises trouvées
            </h2>
          ) : (
            <p className="text-[14px] font-medium text-ink">Entreprises trouvées</p>
          )}
          <p className="text-[13px] text-muted-foreground">
            {hint ?? "Plusieurs entreprises correspondent à votre recherche. Vérifiez laquelle est la vôtre."}
          </p>
          {searching ? (
            <p className="flex items-center gap-2 text-[14px] text-muted-foreground" role="status">
              <Loader2 className="size-4 animate-spin text-brand-orange" aria-hidden />
              Recherche dans les données publiques…
            </p>
          ) : null}
          <ul className="flex flex-col gap-2">
            {candidates.map((c) => (
              <li key={c.siret ?? `${c.siren}-${c.city}-${c.address}`}>
                <button
                  type="button"
                  disabled={searching}
                  onClick={() => void pickCandidate(c)}
                  className="flex w-full min-h-[72px] flex-col gap-1 rounded-[16px] border border-line bg-surface px-4 py-3.5 text-left shadow-soft transition hover:border-brand-orange/35 hover:ring-1 hover:ring-brand-orange/25 disabled:opacity-60"
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-[14px] font-semibold text-ink">
                      {c.legalName ?? c.name ?? "Entreprise"}
                    </span>
                    {c.active === false ? (
                      <span className="shrink-0 rounded-full bg-wash-amber px-2 py-0.5 text-[11px] font-medium text-wash-amber-ink">
                        Inactive
                      </span>
                    ) : c.active === true ? (
                      <span className="shrink-0 rounded-full bg-st-focus-soft px-2 py-0.5 text-[11px] font-medium text-st-focus-ink">
                        Active
                      </span>
                    ) : null}
                  </span>
                  {c.siret ? (
                    <span className="text-[12px] tabular-nums text-muted-foreground">
                      SIRET : {formatSiret(c.siret)}
                      {!c.siretValid ? " · invalide" : ""}
                    </span>
                  ) : null}
                  <span className="text-[12px] text-muted-foreground">
                    {[c.address, [c.postalCode, c.city].filter(Boolean).join(" ")].filter(Boolean).join(" · ")}
                  </span>
                  {(c.activityLabel || c.activity || c.legalForm) && (
                    <span className="text-[12px] text-muted-foreground">
                      {[c.legalForm, c.activityLabel ?? c.activity].filter(Boolean).join(" — ")}
                    </span>
                  )}
                  <span className="mt-1 text-[13px] font-medium text-brand-orange">
                    Utiliser cette entreprise →
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <Button
            type="button"
            variant="ghost"
            className="min-h-11 self-start"
            disabled={searching}
            onClick={() => {
              setMode("search");
              setPhase("idle");
              setCandidates([]);
            }}
          >
            Rechercher à nouveau
          </Button>
          <button
            type="button"
            className="text-left text-[13px] text-muted-foreground underline-offset-2 hover:underline"
            disabled={searching}
            onClick={() => {
              setMode("edit");
              setPhase("idle");
              setError(null);
            }}
          >
            Saisir les informations manuellement
          </button>
        </div>
      ) : null}

      {mode === "confirm" ? (
        <div className="flex flex-col gap-4">
          {onboard ? (
            <>
              <TarineoHdMascot name="01-pouce-leve" className="h-20 w-24 self-center" label="" />
              <h2 className="font-display text-[24px] font-semibold tracking-tight text-ink">
                Entreprise trouvée
              </h2>
            </>
          ) : (
            <p className="text-[14px] font-medium text-brand-orange">Entreprise trouvée</p>
          )}
          <div className="flex flex-col gap-3 rounded-[16px] border border-line bg-surface p-5 shadow-soft">
            <div className="flex items-start gap-3">
              {draft.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={draft.logoUrl}
                  alt=""
                  className="size-14 rounded-xl border border-line bg-white object-contain p-1"
                />
              ) : (
                <div className="grid size-14 place-items-center rounded-xl border border-dashed border-line text-muted-foreground">
                  <Building2 className="size-5" aria-hidden />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[16px] font-semibold text-ink">{draft.raisonSociale || "—"}</p>
                {draft.formeJuridique ? (
                  <p className="text-[12px] text-muted-foreground">{draft.formeJuridique}</p>
                ) : null}
                {draft.activity ? <p className="mt-0.5 text-[12px] text-muted-foreground">{draft.activity}</p> : null}
              </div>
            </div>
            <ul className="flex flex-col gap-1 text-[13px]">
              <StatusLine
                ok={Boolean(draft.siret && siretOk)}
                label={draft.siret && siretOk ? "SIRET vérifié" : "SIRET à vérifier"}
              />
              <StatusLine
                ok={Boolean(draft.adresseRue && draft.adresseVille)}
                label={draft.adresseRue ? "Adresse trouvée" : "Adresse manquante"}
              />
              {hint?.includes("inactif") ? (
                <li className="flex items-center gap-1.5 text-wash-amber-ink">
                  <AlertTriangle className="size-3.5" aria-hidden />
                  Établissement inactif
                </li>
              ) : (
                <StatusLine ok label="Informations récupérées automatiquement" />
              )}
            </ul>
            <div className="text-[13px] text-muted-foreground">
              {draft.siret ? <p className="tabular-nums">SIRET {formatSiret(draft.siret)}</p> : null}
              <p>{draft.adresseRue || "Adresse à compléter"}</p>
              {(draft.adresseCodePostal || draft.adresseVille) && (
                <p>{[draft.adresseCodePostal, draft.adresseVille].filter(Boolean).join(" ")}</p>
              )}
            </div>
            {!draft.logoUrl ? (
              <p className="text-[12px] text-muted-foreground">
                Aucun logo trouvé — vous pourrez l’ajouter plus tard.
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="min-h-12 rounded-full" onClick={() => setMode("edit")}>
              <Pencil data-icon="inline-start" />
              Modifier
            </Button>
            {variant === "onboarding" ? (
              <p className="self-center text-[12px] text-muted-foreground">Puis « Continuer » ci-dessous.</p>
            ) : (
              <p className="self-center text-[12px] text-muted-foreground">
                Vérifiez le formulaire puis Enregistrer.
              </p>
            )}
          </div>
        </div>
      ) : null}

      {(mode === "edit" || mode === "confirm") && (
        <form
          id={formId}
          className={cn("flex flex-col gap-3", mode === "confirm" && "sr-only")}
          onSubmit={(e) => {
            if (variant === "onboarding") e.preventDefault();
          }}
        >
          {mode === "edit" ? (
            <>
              {onboard ? (
                <>
                  <TarineoHdMascot name="05-bras-croises" className="h-20 w-24 self-center" label="" />
                  <h2 className="font-display text-[24px] font-semibold tracking-tight text-ink">
                    Votre entreprise
                  </h2>
                  <p className="text-[14px] text-muted-foreground">
                    {draft.fromLookup
                      ? "Informations récupérées automatiquement — vérifiez avant de continuer."
                      : "Ces mentions iront sur chaque devis et facture PDF. Vous pouvez aussi rechercher par SIRET."}
                  </p>
                </>
              ) : (
                <p className="text-[12px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                  {draft.fromLookup ? "Informations récupérées — à valider" : "Identité"}
                </p>
              )}
              {error ? <p className="text-[13px] text-destructive">{error}</p> : null}
              {hint ? (
                <p className={cn("text-[13px]", error ? "text-ink" : "text-muted-foreground")}>{hint}</p>
              ) : null}
              {(phase === "not_found" || phase === "error") && (
                <button
                  type="button"
                  className="text-left text-[13px] font-medium text-brand-orange underline-offset-2 hover:underline"
                  onClick={() => {
                    setMode("search");
                    setPhase("idle");
                    setError(null);
                    setHint(null);
                  }}
                >
                  ← Nouvelle recherche
                </button>
              )}
              {!siretOk ? (
                <p className="text-[13px] text-destructive">
                  SIRET invalide. Vérifiez les informations de l’entreprise.
                </p>
              ) : null}
            </>
          ) : null}

          <HiddenOrVisible
            mode={mode}
            label="Raison sociale"
            name="raisonSociale"
            required
            value={draft.raisonSociale}
            onChange={(v) => setDraft((d) => ({ ...d, raisonSociale: v }))}
          />
          <input type="hidden" name="formeJuridique" value={draft.formeJuridique} />
          <HiddenOrVisible
            mode={mode}
            label="SIRET (14 chiffres)"
            name="siret"
            required
            inputMode="numeric"
            value={draft.siret}
            onChange={(v) => setDraft((d) => ({ ...d, siret: v.replace(/[^\d\s]/g, "") }))}
            invalid={!siretOk}
          />
          <HiddenOrVisible
            mode={mode}
            label="Adresse"
            name="adresseRue"
            required
            value={draft.adresseRue}
            onChange={(v) => setDraft((d) => ({ ...d, adresseRue: v }))}
          />
          <div className={cn(mode === "edit" ? "grid gap-3 sm:grid-cols-2" : "contents")}>
            <HiddenOrVisible
              mode={mode}
              label="Code postal"
              name="adresseCodePostal"
              required
              value={draft.adresseCodePostal}
              onChange={(v) => setDraft((d) => ({ ...d, adresseCodePostal: v }))}
            />
            <HiddenOrVisible
              mode={mode}
              label="Ville"
              name="adresseVille"
              required
              value={draft.adresseVille}
              onChange={(v) => setDraft((d) => ({ ...d, adresseVille: v }))}
            />
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
            <fieldset className="text-[13px] text-ink">
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
              <Button
                type="button"
                variant="ghost"
                className="min-h-11"
                onClick={() => {
                  setMode("search");
                  setPhase("idle");
                }}
              >
                ← Recherche
              </Button>
              {onboard && onSkipLater ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="min-h-11 text-muted-foreground"
                  disabled={searching}
                  onClick={onSkipLater}
                >
                  Ajouter plus tard mes infos pro
                </Button>
              ) : null}
            </div>
          ) : null}
        </form>
      )}

      {mode === "search" || mode === "candidates" ? (
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

function StatusLine({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className={cn("flex items-center gap-1.5", ok ? "text-ink" : "text-destructive")}>
      {ok ? (
        <Check className="size-3.5 text-brand-orange" aria-hidden />
      ) : (
        <AlertTriangle className="size-3.5" aria-hidden />
      )}
      {label}
    </li>
  );
}

function pickField(current: string, incoming: string, force: boolean) {
  if (force || !current.trim()) return incoming;
  return current;
}

function emptyDraft(initial: Partial<EntrepriseDraft> | undefined, emailContact: string): EntrepriseDraft {
  return {
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
    activity: initial?.activity ?? "",
    fromLookup: false,
  };
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
    <label className="text-[13px] text-ink" data-invalid={invalid ? true : undefined}>
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

export function draftFromProfile(
  profil: {
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
  },
  logoUrl: string | null,
): Partial<EntrepriseDraft> {
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
