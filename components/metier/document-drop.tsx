"use client";

import { Loader2, Upload } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { confirmDocument, ingestDocument, transformQuoteAction } from "@/app/(app)/metier/actions";
import { ExtractTotalsGrid } from "@/components/metier/extract-totals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ChantierCard, ClientOutKind, ExtractResult, Party } from "@/lib/metier/types";
import { CLIENT_OUT_KINDS, CLIENT_OUT_LABEL, emptyTotals } from "@/lib/metier/types";
import { DIRECTION_LABEL, KIND_LABEL, PARTY_LABEL, type DocDirection, type DocKind, type PartyKind } from "@/lib/metier/types";
import { cn } from "@/lib/utils";

function numField(raw: FormDataEntryValue | null, fallback: number | null | undefined) {
  const s = String(raw ?? "").trim().replace(",", ".");
  if (!s) return fallback ?? null;
  const n = Number(s);
  return Number.isFinite(n) ? n : fallback ?? null;
}

export function DocumentDrop({
  chantiers,
  clients = [],
  compact,
  defaultChantierId,
}: {
  chantiers: ChantierCard[];
  clients?: Party[];
  compact?: boolean;
  defaultChantierId?: string | null;
}) {
  const reduce = useReducedMotion();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [over, setOver] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<(ExtractResult & { filePath?: string }) | null>(null);
  const [saving, setSaving] = useState(false);
  const [outKind, setOutKind] = useState<ClientOutKind>("devis");

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.set("file", file);
    setError(null);
    start(async () => {
      const res = await ingestDocument(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setDraft({ ...res.extracted, filePath: res.filePath });
    });
  }

  function payloadFromForm(form: FormData, asSource: boolean) {
    if (!draft) return null;
    return {
      title: String(form.get("title") || draft.title),
      direction: (asSource ? "in" : String(form.get("direction"))) as DocDirection,
      kind: String(form.get("kind")) as DocKind,
      partyName: String(form.get("partyName") || draft.party_name),
      partyKind: String(form.get("partyKind")) as PartyKind,
      chantierId: String(form.get("chantierId") || "") || null,
      filePath: draft.filePath,
      totals: {
        ht: numField(form.get("ht"), draft.totals?.ht),
        eco_contribution: numField(form.get("eco"), draft.totals?.eco_contribution),
        pmcb: numField(form.get("pmcb"), draft.totals?.pmcb),
        weight_kg: numField(form.get("weight"), draft.totals?.weight_kg),
      },
      lines: draft.lines.map((l, i) => ({
        ...l,
        label: String(form.get(`line-label-${i}`) || l.label),
        qty: numField(form.get(`line-qty-${i}`), l.qty) ?? l.qty,
        unit: String(form.get(`line-unit-${i}`) || l.unit),
        buy_price: numField(form.get(`line-price-${i}`), l.buy_price) ?? l.buy_price,
      })),
    };
  }

  async function confirm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!draft) return;
    const form = new FormData(e.currentTarget);
    const payload = payloadFromForm(form, false);
    if (!payload) return;
    setSaving(true);
    const res = await confirmDocument(payload);
    setSaving(false);
    if (res.ok) {
      setDraft(null);
      router.refresh();
    }
  }

  async function transformFromDraft() {
    if (!draft || !formRef.current) return;
    const form = new FormData(formRef.current);
    const payload = payloadFromForm(form, true);
    if (!payload) return;
    setSaving(true);
    const saved = await confirmDocument(payload);
    if (!saved.ok) {
      setSaving(false);
      setError("Enregistrement impossible.");
      return;
    }
    const tf = new FormData();
    tf.set("sourceId", saved.id);
    tf.set("kind", outKind);
    tf.set("clientId", String(form.get("clientId") ?? ""));
    tf.set("margin", String(form.get("margin") || (outKind === "bon_enlevement" ? "0" : "35")));
    const res = await transformQuoteAction(tf);
    setSaving(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setDraft(null);
    router.push("/composants");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <motion.button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        animate={
          reduce
            ? undefined
            : over
              ? { scale: 1.01 }
              : pending
                ? { opacity: 0.85 }
                : { scale: 1 }
        }
        className={cn(
          "relative flex w-full flex-col items-center justify-center gap-2 rounded-[28px] border border-dashed px-4 text-center transition-colors",
          compact ? "min-h-[140px] py-6" : "min-h-[220px] py-10",
          over ? "border-brand-orange bg-[#fff0e9]" : "border-line bg-surface-2",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/heic,image/webp"
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {pending ? (
          <Loader2 className="size-8 animate-spin text-brand-orange" aria-hidden />
        ) : (
          <Upload className="size-8 text-brand-orange" aria-hidden />
        )}
        <p className="font-display text-[18px] font-semibold tracking-tight">
          {pending ? "Lecture du document…" : over ? "Déposez ici" : "Glissez un devis, une facture ou un bon"}
        </p>
        <p className="max-w-[42ch] text-[13.5px] text-muted-foreground">
          PDF, JPEG, PNG ou HEIC. Tarinéo lit le type, le total HT, l’éco-contribution, la PMCB et le poids s’ils sont écrits.
        </p>
        {pending && !reduce ? (
          <motion.span
            className="absolute inset-x-10 bottom-5 h-1 overflow-hidden rounded-full bg-line"
            aria-hidden
          >
            <motion.span
              className="block h-full bg-brand-orange"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
            />
          </motion.span>
        ) : null}
      </motion.button>
      {error ? (
        <p role="alert" className="text-[14px] text-destructive">
          {error}
        </p>
      ) : null}

      {draft ? (
        <form ref={formRef} onSubmit={confirm} className="card-soft flex flex-col gap-4 p-5">
          <p className="mono-label">/ Lecture ///</p>
          <p className="text-[15px] text-muted-foreground">
            {KIND_LABEL[draft.kind]} · {DIRECTION_LABEL[draft.direction]} · {PARTY_LABEL[draft.party_kind]}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-[13px]">
              Titre
              <Input name="title" defaultValue={draft.title} className="h-11 rounded-xl" />
            </label>
            <label className="flex flex-col gap-1.5 text-[13px]">
              Partie
              <Input name="partyName" defaultValue={draft.party_name} className="h-11 rounded-xl" />
            </label>
            <label className="flex flex-col gap-1.5 text-[13px]">
              Type
              <select name="kind" defaultValue={draft.kind} className="h-11 rounded-xl border border-line bg-surface px-3">
                {(Object.keys(KIND_LABEL) as DocKind[]).map((k) => (
                  <option key={k} value={k}>
                    {KIND_LABEL[k]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-[13px]">
              Sens
              <select name="direction" defaultValue={draft.direction} className="h-11 rounded-xl border border-line bg-surface px-3">
                <option value="in">{DIRECTION_LABEL.in}</option>
                <option value="out">{DIRECTION_LABEL.out}</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-[13px]">
              Rôle
              <select name="partyKind" defaultValue={draft.party_kind} className="h-11 rounded-xl border border-line bg-surface px-3">
                {(Object.keys(PARTY_LABEL) as PartyKind[]).map((k) => (
                  <option key={k} value={k}>
                    {PARTY_LABEL[k]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-[13px]">
              Chantier
              <select name="chantierId" defaultValue={chantiers.find((c) => c.name.includes(draft.chantier_hint))?.id ?? defaultChantierId ?? ""} className="h-11 rounded-xl border border-line bg-surface px-3">
                <option value="">À classer</option>
                {chantiers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="mono-label">/ Totaux lus ///</p>
          <ExtractTotalsGrid totals={draft.totals ?? emptyTotals()} />
          <div className="grid gap-3 sm:grid-cols-4">
            <label className="flex flex-col gap-1.5 text-[13px]">
              Total HT
              <Input name="ht" defaultValue={draft.totals?.ht ?? ""} inputMode="decimal" className="h-11 rounded-xl" />
            </label>
            <label className="flex flex-col gap-1.5 text-[13px]">
              Éco-contribution
              <Input name="eco" defaultValue={draft.totals?.eco_contribution ?? ""} inputMode="decimal" className="h-11 rounded-xl" />
            </label>
            <label className="flex flex-col gap-1.5 text-[13px]">
              PMCB
              <Input name="pmcb" defaultValue={draft.totals?.pmcb ?? ""} inputMode="decimal" className="h-11 rounded-xl" />
            </label>
            <label className="flex flex-col gap-1.5 text-[13px]">
              Poids (kg)
              <Input name="weight" defaultValue={draft.totals?.weight_kg ?? ""} inputMode="decimal" className="h-11 rounded-xl" />
            </label>
          </div>
          <ul className="divide-y divide-line rounded-2xl border border-line">
            {draft.lines.map((l, i) => (
              <li key={`${l.label}-${i}`} className="grid gap-2 px-3 py-2.5 sm:grid-cols-[1fr_4.5rem_3.5rem_6.5rem]">
                <label className="flex min-w-0 flex-col gap-1 text-[12px] text-muted-foreground">
                  Ligne
                  <Input name={`line-label-${i}`} defaultValue={l.label} className="h-10 rounded-xl text-[14px]" />
                </label>
                <label className="flex flex-col gap-1 text-[12px] text-muted-foreground">
                  Qté
                  <Input name={`line-qty-${i}`} defaultValue={l.qty} inputMode="decimal" className="h-10 rounded-xl text-[14px]" />
                </label>
                <label className="flex flex-col gap-1 text-[12px] text-muted-foreground">
                  Unité
                  <Input name={`line-unit-${i}`} defaultValue={l.unit} className="h-10 rounded-xl text-[14px]" />
                </label>
                <label className="flex flex-col gap-1 text-[12px] text-muted-foreground">
                  Prix
                  <Input name={`line-price-${i}`} defaultValue={l.buy_price} inputMode="decimal" className="h-10 rounded-xl text-[14px]" />
                </label>
              </li>
            ))}
          </ul>
          <div className="rounded-[22px] border border-line bg-surface-2 p-4">
            <p className="text-[14px] font-medium">Transformer le fichier</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Enregistre la lecture, puis crée un document client avec les mêmes lignes.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {CLIENT_OUT_KINDS.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setOutKind(k)}
                  className={
                    outKind === k
                      ? "rounded-full bg-ink px-3 py-1.5 text-[13px] text-accent-ink"
                      : "rounded-full border border-line bg-surface px-3 py-1.5 text-[13px]"
                  }
                >
                  {CLIENT_OUT_LABEL[k]}
                </button>
              ))}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-[13px]">
                Client
                <select name="clientId" defaultValue={clients[0]?.id ?? ""} className="h-11 rounded-xl border border-line bg-surface px-3">
                  <option value="">Choisir</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              {outKind === "bon_enlevement" ? (
                <input type="hidden" name="margin" value="0" />
              ) : (
                <label className="flex flex-col gap-1.5 text-[13px]">
                  Marge (%)
                  <Input name="margin" type="number" step="1" min="0" defaultValue="35" className="h-11 rounded-xl" />
                </label>
              )}
            </div>
            <Button
              type="button"
              disabled={saving}
              className="mt-3 rounded-full"
              onClick={() => void transformFromDraft()}
            >
              {saving ? "Transformation…" : `Créer ${CLIENT_OUT_LABEL[outKind].toLowerCase()}`}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={saving} variant="outline" className="rounded-full">
              {saving ? "Enregistrement…" : "Enregistrer sans transformer"}
            </Button>
            <Button type="button" variant="ghost" className="rounded-full" onClick={() => setDraft(null)}>
              Annuler
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
