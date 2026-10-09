"use client";

import { AlertTriangle, CalendarDays, CheckCircle2, HelpCircle, Mail, Scale } from "lucide-react";
import type { DocumentRecap, ReliabilityLevel } from "@/lib/metier/document-agent/types";
import type { PriorPriceHit } from "@/lib/metier/prior-prices";
import {
  buildAcceptQuoteMailto,
  buildRenegotiateMailto,
  canOfferAcceptQuoteCta,
  canOfferRenegotiateCta,
} from "@/lib/metier/supplier-contact";
import type { ExtractResult } from "@/lib/metier/types";
import { DIRECTION_LABEL, KIND_LABEL } from "@/lib/metier/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const RELIABILITY_COPY: Record<
  ReliabilityLevel,
  { label: string; hint: string; tone: "ok" | "warn" | "bad" }
> = {
  fiable: {
    label: "Lecture fiable",
    hint: "Relisez avant d’enregistrer.",
    tone: "ok",
  },
  a_verifier: {
    label: "À vérifier",
    hint: "Contrôlez les lignes signalées.",
    tone: "warn",
  },
  peu_fiable: {
    label: "Lecture incertaine",
    hint: "Corrigez ou réimportez.",
    tone: "bad",
  },
};

function euro(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

function Fact({ label, value }: { label: string; value: string }) {
  if (!value.trim()) return null;
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium tracking-[0.04em] text-muted-foreground uppercase">{label}</p>
      <p className="truncate text-[13px] font-medium leading-tight text-ink" title={value}>
        {value}
      </p>
    </div>
  );
}

export function DocumentReadRecap({
  recap,
  extract,
  vendorName,
  profileVersion,
  deliveryDate,
  onDeliveryDateChange,
  priorPriceHits,
  mailClosing,
}: {
  recap: DocumentRecap;
  extract?: Pick<
    ExtractResult,
    | "kind"
    | "direction"
    | "title"
    | "document_number"
    | "party_name"
    | "party_kind"
    | "chantier_hint"
    | "totals"
    | "lines"
    | "contact_name"
    | "contact_email"
    | "contact_phone"
    | "contact_role"
    | "delivery_date"
  > | null;
  vendorName?: string;
  profileVersion?: number;
  /** Date de livraison prévue (AAAA-MM-JJ), pilotée par le parent. */
  deliveryDate?: string;
  onDeliveryDateChange?: (value: string) => void;
  /** Écarts vs anciens achats (renégociation). */
  priorPriceHits?: PriorPriceHit[] | null;
  /** Signature entreprise (Paramètres → Entreprise). */
  mailClosing?: string | null;
}) {
  const rel = RELIABILITY_COPY[recap.reliability];
  const toneBorder =
    rel.tone === "ok"
      ? "border-brand-orange/30 bg-wash-orange/40"
      : rel.tone === "warn"
        ? "border-amber-600/35 bg-amber-500/8"
        : "border-destructive/40 bg-destructive/5";

  const ht = extract?.totals?.ht ?? recap.stats.totalHt;
  const lineCount = extract?.lines?.length ?? recap.stats.lineCount;
  const docLabel = extract
    ? [KIND_LABEL[extract.kind], extract.document_number ? `n° ${extract.document_number}` : null]
        .filter(Boolean)
        .join(" · ")
    : null;
  const contactLine = extract
    ? [
        extract.contact_name,
        extract.contact_role ? `(${extract.contact_role})` : null,
        extract.contact_email,
        extract.contact_phone,
      ]
        .filter(Boolean)
        .join(" · ")
    : "";
  const showAcceptCta =
    extract != null &&
    canOfferAcceptQuoteCta({
      score: recap.score,
      direction: extract.direction,
      kind: extract.kind,
      contactEmail: extract.contact_email,
    });
  const acceptMailto =
    showAcceptCta && extract?.contact_email
      ? buildAcceptQuoteMailto({
          toEmail: extract.contact_email,
          contactName: extract.contact_name,
          partyName: extract.party_name,
          documentTitle: extract.title,
          documentNumber: extract.document_number,
          deliveryDate: deliveryDate || extract.delivery_date,
          chantierHint: extract.chantier_hint,
          closingBlock: mailClosing,
        })
      : null;

  const showRenegotiateCta =
    extract != null &&
    canOfferRenegotiateCta({
      score: recap.score,
      direction: extract.direction,
      kind: extract.kind,
    });
  const renegotiateMailto =
    showRenegotiateCta && extract
      ? buildRenegotiateMailto({
          toEmail: extract.contact_email,
          contactName: extract.contact_name,
          partyName: extract.party_name,
          kind: extract.kind,
          documentTitle: extract.title,
          documentNumber: extract.document_number,
          chantierHint: extract.chantier_hint,
          totals: extract.totals,
          lines: extract.lines,
          priorHits: priorPriceHits ?? null,
          score: recap.score,
          deliveryDate: deliveryDate || extract.delivery_date,
          closingBlock: mailClosing,
        })
      : null;
  const riseCount = (priorPriceHits ?? []).filter((h) => h.pct > 0).length;

  // Si tout va bien : n’afficher que les checks en échec (sinon la liste gonfle inutilement).
  const checksToShow =
    rel.tone === "ok" ? recap.checks.filter((c) => !c.ok) : recap.checks;

  return (
    <section className={cn("flex flex-col gap-2.5 rounded-2xl border px-3.5 py-3", toneBorder)} aria-live="polite">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.08em] text-[#FF6B1A] uppercase">Agent</p>
          <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <h2 className="font-display text-[16px] font-semibold tracking-tight text-ink">{rel.label}</h2>
            <span className="text-[12px] text-muted-foreground">{rel.hint}</span>
          </div>
        </div>
        <div
          className={cn(
            "flex shrink-0 items-baseline gap-0.5 rounded-xl border px-2.5 py-1.5",
            rel.tone === "ok"
              ? "border-brand-orange/25 bg-surface"
              : rel.tone === "warn"
                ? "border-amber-600/25 bg-surface"
                : "border-destructive/25 bg-surface",
          )}
        >
          <span className="font-display text-[20px] font-semibold tabular-nums leading-none text-ink">{recap.score}</span>
          <span className="text-[10px] text-muted-foreground">/100</span>
        </div>
      </div>

      {extract ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 rounded-xl border border-line/70 bg-surface px-3 py-2 sm:grid-cols-3">
          <Fact label="Document" value={docLabel || extract.title} />
          <Fact label="Sens" value={DIRECTION_LABEL[extract.direction]} />
          <Fact
            label={extract.party_kind === "client" ? "Client" : "Fournisseur"}
            value={extract.party_name}
          />
          <Fact label="Chantier" value={extract.chantier_hint || "—"} />
          <Fact label="Lignes" value={String(lineCount)} />
          <Fact label="Total HT" value={euro(ht)} />
          {contactLine ? <Fact label="Contact" value={contactLine} /> : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
        {recap.summary ? (
          <p className="min-w-0 flex-1 truncate leading-snug" title={recap.summary}>
            {recap.summary}
          </p>
        ) : null}
        <p className="shrink-0">
          {vendorName ? (
            <>
              <span className="font-medium text-ink">{vendorName}</span>
              {profileVersion ? ` · v${profileVersion}` : null}
            </>
          ) : (
            <span className="font-medium text-ink">Enseigne ?</span>
          )}
        </p>
      </div>

      {acceptMailto || renegotiateMailto ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap gap-2">
            {renegotiateMailto ? (
              <a
                href={renegotiateMailto}
                className={cn(
                  "inline-flex h-9 w-fit items-center justify-center gap-1.5 rounded-[10px] px-3 text-[13px] font-medium transition",
                  recap.score < 90
                    ? "bg-[#FF6B1A] text-white hover:brightness-105"
                    : "border border-[#FF6B1A]/45 bg-wash-orange/50 text-ink hover:bg-wash-orange",
                )}
              >
                <Scale className="size-3.5 shrink-0" aria-hidden />
                {riseCount > 0
                  ? `Renégocier les prix (${riseCount} hausse${riseCount > 1 ? "s" : ""})`
                  : "Renégocier les prix"}
              </a>
            ) : null}
            {acceptMailto ? (
              <a
                href={acceptMailto}
                className={cn(
                  "inline-flex h-9 w-fit items-center justify-center gap-1.5 rounded-[10px] px-3 text-[13px] font-medium transition",
                  recap.score >= 90
                    ? "bg-[#FF6B1A] text-white hover:brightness-105"
                    : "border border-line bg-surface text-ink hover:bg-surface-2",
                )}
              >
                <Mail className="size-3.5 shrink-0" aria-hidden />
                Accepter par e-mail
              </a>
            ) : null}
          </div>
          {renegotiateMailto ? (
            <p className="text-[11px] text-muted-foreground">
              Ouvre un mail prérempli (lignes, totaux
              {riseCount > 0 ? ", écarts vs anciens devis" : ""}
              {deliveryDate ? ", date de livraison" : ""}) vers le fournisseur.
            </p>
          ) : null}
        </div>
      ) : null}

      {checksToShow.length ? (
        <ul className="flex flex-col gap-1">
          {checksToShow.map((c) => (
            <li key={c.id} className="flex items-start gap-1.5 text-[12px]">
              {c.ok ? (
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-brand-orange" aria-hidden />
              ) : (
                <HelpCircle className="mt-0.5 size-3.5 shrink-0 text-amber-700 dark:text-amber-500" aria-hidden />
              )}
              <span className="min-w-0 leading-snug">
                <span className="font-medium text-ink">{c.label}</span>
                {c.detail ? <span className="text-muted-foreground"> — {c.detail}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {recap.caveats.length ? (
        <div className="rounded-lg border border-line/70 bg-surface px-2.5 py-1.5">
          <p className="flex items-center gap-1 text-[11px] font-semibold text-ink">
            <AlertTriangle className="size-3 text-amber-600" aria-hidden />
            Attention
          </p>
          <ul className="mt-0.5 list-disc pl-4 text-[12px] leading-snug text-muted-foreground">
            {recap.caveats.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {onDeliveryDateChange ? (
        <label className="flex flex-wrap items-center gap-2 rounded-lg border border-line/70 bg-surface px-2.5 py-2">
          <CalendarDays className="size-3.5 shrink-0 text-[#FF6B1A]" aria-hidden />
          <span className="text-[12px] font-medium text-ink">Livraison prévue</span>
          <Input
            type="date"
            value={deliveryDate ?? ""}
            onChange={(e) => onDeliveryDateChange(e.target.value)}
            className="h-9 max-w-[11.5rem] rounded-lg text-[13px] max-md:h-10"
          />
          <span className="text-[11px] text-muted-foreground">
            {deliveryDate
              ? "Calendrier + mails + fiche chantier à l’enregistrement"
              : "Optionnel — utile pour préparer le chantier"}
          </span>
        </label>
      ) : null}
    </section>
  );
}
