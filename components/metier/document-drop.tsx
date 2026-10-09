"use client";

import { Camera, FileText, Loader2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { filmAnalyseDraft } from "@/lib/metier/film-analyse-draft";
import {
  confirmDocument,
  createChantierAction,
  ingestDocument,
  lookupPriorBuyPrices,
  transformQuoteAction,
} from "@/app/(app)/metier/actions";
import { getCompanyMailIdentityAction } from "@/app/(app)/parametres/actions";
import { ExtractTotalsGrid } from "@/components/metier/extract-totals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DocumentReadRecap } from "@/components/metier/document-read-recap";
import type { DocumentAgentMeta, DocumentRecap } from "@/lib/metier/document-agent/types";
import type { PriorPriceHit } from "@/lib/metier/prior-prices";
import type { ChantierCard, ClientOutKind, ExtractResult, Party } from "@/lib/metier/types";
import { CLIENT_OUT_KINDS, CLIENT_OUT_LABEL, emptyTotals } from "@/lib/metier/types";
import { DIRECTION_LABEL, KIND_LABEL, PARTY_LABEL, type DocDirection, type DocKind, type PartyKind } from "@/lib/metier/types";
import { suggestChantierFromHint } from "@/lib/metier/chantier-match";
import { hrefAfterDocumentSave, R } from "@/lib/routes";
import { cn } from "@/lib/utils";

function numField(raw: FormDataEntryValue | null, fallback: number | null | undefined) {
  const s = String(raw ?? "").trim().replace(",", ".");
  if (!s) return fallback ?? null;
  const n = Number(s);
  return Number.isFinite(n) ? n : fallback ?? null;
}

export type DocumentSavedInfo = {
  id: string;
  chantierSlug?: string | null;
  direction?: DocDirection;
  kind?: DocKind;
};

export function DocumentDrop({
  chantiers,
  clients = [],
  compact,
  defaultChantierId,
  lockKind,
  lockDirection,
  hint,
  showAgentMeta,
  onAgentMetaChange,
  filmLecture,
  onDocumentSaved,
  onDraftActive,
  stayAfterSave,
}: {
  chantiers: ChantierCard[];
  clients?: Party[];
  compact?: boolean;
  defaultChantierId?: string | null;
  lockKind?: DocKind;
  lockDirection?: DocDirection;
  hint?: string;
  showAgentMeta?: boolean;
  onAgentMetaChange?: (meta: DocumentAgentMeta | null) => void;
  /** Préremplit la lecture Cedeo (captures film, `?film=lecture`). */
  filmLecture?: boolean;
  onDocumentSaved?: (info?: DocumentSavedInfo) => void;
  /** true dès qu’une lecture est prête (vue revue) ; false après annulation / enregistrement. */
  onDraftActive?: (active: boolean) => void;
  /** Reste sur la page après enregistrement (CTAs post-validation). */
  stayAfterSave?: boolean;
}) {
  const reduce = useReducedMotion();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [over, setOver] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<
    (ExtractResult & { filePath?: string; fileSha256?: string; agent?: DocumentAgentMeta }) | null
  >(null);
  const [rawExtract, setRawExtract] = useState<ExtractResult | null>(null);
  const [recap, setRecap] = useState<DocumentRecap | null>(null);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [priorPriceHits, setPriorPriceHits] = useState<PriorPriceHit[]>([]);
  const [mailClosing, setMailClosing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const suggestedChantier = draft
    ? suggestChantierFromHint([draft.chantier_hint, draft.title].filter(Boolean).join(" "), chantiers)
    : null;
  const [outKind, setOutKind] = useState<ClientOutKind>(
    lockKind && CLIENT_OUT_KINDS.includes(lockKind as ClientOutKind) ? (lockKind as ClientOutKind) : "devis",
  );

  useEffect(() => {
    if (!filmLecture || draft) return;
    const { extracted, agent, recap } = filmAnalyseDraft();
    setRawExtract(extracted);
    setRecap(recap);
    setDeliveryDate(extracted.delivery_date ?? "");
    setPriorPriceHits([]);
    setDraft({ ...extracted, agent });
    onAgentMetaChange?.(agent);
    void lookupPriorBuyPrices(
      extracted.lines.map((l) => ({ label: l.label, buy_price: l.buy_price })),
    ).then((res) => {
      if (res.ok) setPriorPriceHits(res.hits);
    });
  }, [filmLecture, draft, onAgentMetaChange]);

  useEffect(() => {
    onDraftActive?.(Boolean(draft));
  }, [draft, onDraftActive]);

  useEffect(() => {
    if (!draft || !showAgentMeta) return;
    void getCompanyMailIdentityAction().then((id) => setMailClosing(id.closingBlock));
  }, [draft, showAgentMeta]);

  function clearDraft() {
    setDraft(null);
    setRawExtract(null);
    setRecap(null);
    setDeliveryDate("");
    setPriorPriceHits([]);
    setError(null);
    onAgentMetaChange?.(null);
  }

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
      setRawExtract(res.extracted);
      const agent = res.agent;
      setRecap(res.recap ?? null);
      setDeliveryDate(res.extracted.delivery_date ?? "");
      setPriorPriceHits([]);
      setDraft({ ...res.extracted, filePath: res.filePath, fileSha256: res.fileSha256, agent });
      onAgentMetaChange?.(agent ?? null);
      void lookupPriorBuyPrices(
        res.extracted.lines.map((l) => ({ label: l.label, buy_price: l.buy_price })),
      ).then((prior) => {
        if (prior.ok) setPriorPriceHits(prior.hits);
      });
    });
  }

  function payloadFromForm(form: FormData, asSource: boolean) {
    if (!draft) return null;
    const direction = (asSource ? "in" : lockDirection ?? String(form.get("direction"))) as DocDirection;
    return {
      title: String(form.get("title") || draft.title),
      direction,
      kind: (lockKind ?? String(form.get("kind"))) as DocKind,
      partyName: String(form.get("partyName") || draft.party_name),
      partyKind: String(form.get("partyKind")) as PartyKind,
      chantierId: String(form.get("chantierId") || "") || null,
      filePath: draft.filePath,
      fileSha256: draft.fileSha256,
      documentNumber: draft.document_number ?? null,
      issueDate: draft.issue_date ?? null,
      partyAddress: draft.party_address ?? null,
      contactName: String(form.get("contactName") || draft.contact_name || "") || null,
      contactEmail: String(form.get("contactEmail") || draft.contact_email || "") || null,
      contactPhone: String(form.get("contactPhone") || draft.contact_phone || "") || null,
      deliveryDate: deliveryDate || draft.delivery_date || null,
      totals: {
        ht: numField(form.get("ht"), draft.totals?.ht),
        eco_contribution: numField(form.get("eco"), draft.totals?.eco_contribution),
        pmcb: numField(form.get("pmcb"), draft.totals?.pmcb),
        weight_kg: numField(form.get("weight"), draft.totals?.weight_kg),
      },
      lines: draft.lines.map((l, i) => {
        const price = numField(form.get(`line-price-${i}`), l.buy_price ?? l.sell_price) ?? l.buy_price ?? 0;
        return {
          ...l,
          label: String(form.get(`line-label-${i}`) || l.label),
          qty: numField(form.get(`line-qty-${i}`), l.qty) ?? l.qty,
          unit: String(form.get(`line-unit-${i}`) || l.unit),
          buy_price: direction === "in" ? price : 0,
          sell_price: direction === "out" ? price : (l.sell_price ?? 0),
        };
      }),
    };
  }

  async function resolveChantierId(form: FormData): Promise<string | null> {
    const selected = String(form.get("chantierId") || "");
    if (!selected) return null;
    if (selected !== "__create_hint__") return selected;
    const hint = draft?.chantier_hint?.trim();
    if (!hint) return null;
    const fd = new FormData();
    fd.set("name", hint.slice(0, 120));
    fd.set("address", hint.slice(0, 200));
    if (draft?.party_kind === "client" && draft.party_name) {
      fd.set("client", draft.party_name);
    }
    const created = await createChantierAction(fd);
    if (!created.ok || !("id" in created)) return null;
    return created.id;
  }

  async function confirm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!draft) return;
    const form = new FormData(e.currentTarget);
    const payload = payloadFromForm(form, false);
    if (!payload) return;
    setSaving(true);
    setError(null);
    try {
      const chantierId = await resolveChantierId(form);
      const res = await confirmDocument({
        ...payload,
        chantierId,
        rawExtract,
        agentMeta: draft.agent ?? null,
        readRecap: recap,
      });
      if (!res.ok) {
        setError("error" in res ? res.error : "Enregistrement impossible.");
        return;
      }
      const info: DocumentSavedInfo = {
        id: res.id,
        chantierSlug: res.chantierSlug,
        direction: res.direction,
        kind: res.kind,
      };
      if (stayAfterSave) {
        clearDraft();
        onDocumentSaved?.(info);
        router.refresh();
        return;
      }
      // Toujours la fiche pièce (modifiable). Fermer le modal avant, sans clearDraft
      // qui réafficherait l’import sur /accueil.
      const href = hrefAfterDocumentSave({
        id: res.id,
        chantierSlug: res.chantierSlug,
      });
      onDocumentSaved?.(info);
      router.replace(href);
      // Si le Dialog Accueil bloque la soft-nav, forcer l’ouverture de la pièce.
      if (typeof window !== "undefined") {
        window.setTimeout(() => {
          if (!window.location.pathname.startsWith("/pieces/")) {
            window.location.assign(href);
          }
        }, 80);
      }
    } finally {
      setSaving(false);
    }
  }

  async function transformFromDraft() {
    if (!draft || !formRef.current) return;
    const form = new FormData(formRef.current);
    const payload = payloadFromForm(form, true);
    if (!payload) return;
    setSaving(true);
    setError(null);
    try {
      const chantierId = await resolveChantierId(form);
      const saved = await confirmDocument({
        ...payload,
        chantierId,
        rawExtract,
        agentMeta: draft.agent ?? null,
        readRecap: recap,
      });
      if (!saved.ok) {
        setError("Enregistrement impossible.");
        return;
      }
      const tf = new FormData();
      tf.set("sourceId", saved.id);
      tf.set("kind", outKind);
      tf.set("clientId", String(form.get("clientId") ?? ""));
      tf.set("margin", String(form.get("margin") || (outKind === "bon_enlevement" ? "0" : "35")));
      const res = await transformQuoteAction(tf);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const info: DocumentSavedInfo = { id: res.id, kind: outKind, direction: "out" };
      if (stayAfterSave) {
        clearDraft();
        onDocumentSaved?.(info);
        router.refresh();
        return;
      }
      onDocumentSaved?.(info);
      router.replace(R.piece(res.id));
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const showDropZone = !draft;

  return (
    <div id="import" className="flex flex-col gap-4 scroll-mt-24">
      {showDropZone ? (
        <div className="flex flex-col gap-2">
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
              "relative flex w-full flex-col items-center justify-center gap-2 rounded-[16px] border border-dashed px-4 text-center transition-[border-color,background-color,transform] duration-200 md:rounded-[28px]",
              compact ? "min-h-[140px] py-6" : "min-h-[180px] py-8 md:min-h-[220px] md:py-10",
              over ? "border-brand-orange bg-wash-orange" : "border-line bg-surface-2",
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/heic,image/webp"
              className="sr-only"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <input
              ref={cameraRef}
              type="file"
              accept="image/jpeg,image/png,image/heic,image/webp"
              capture="environment"
              className="sr-only"
              onChange={(e) => handleFiles(e.target.files)}
            />
            {pending ? (
              <Loader2 className="size-9 animate-spin text-brand-orange" aria-hidden />
            ) : (
              <span className="grid size-14 place-items-center rounded-full bg-tarineo-orange-soft text-tarineo-orange">
                <FileText className="size-7 stroke-[1.5]" aria-hidden />
              </span>
            )}
            <p className="font-display text-[19px] font-semibold tracking-tight md:text-[20px]">
              {pending
                ? "Lecture du document…"
                : over
                  ? "Déposez ici"
                  : hint || "Glissez vos documents ici"}
            </p>
            <p className="max-w-[42ch] text-[13px] text-muted-foreground md:text-[14px]">
              PDF, JPEG, PNG ou HEIC — cliquez pour parcourir vos dossiers
            </p>
            {!pending ? (
              <span className="mt-1 inline-flex h-11 items-center rounded-[12px] bg-tarineo-orange px-4 text-[14px] font-medium text-white md:hidden">
                Choisir un fichier
              </span>
            ) : null}
            <ul className="hidden flex-wrap justify-center gap-1.5 md:flex">
              {["PDF", "JPEG", "PNG", "HEIC"].map((fmt) => (
                <li
                  key={fmt}
                  className="rounded-full border border-line bg-surface px-2 py-0.5 font-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase"
                >
                  {fmt}
                </li>
              ))}
            </ul>
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
          {!pending ? (
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              className={cn(
                "inline-flex h-11 w-full items-center justify-center gap-2 rounded-[12px] border border-line bg-surface text-[14px] font-medium text-ink",
                "transition-[background-color,border-color] hover:border-tarineo-orange/35 hover:bg-wash-orange",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tarineo-orange-ring md:hidden",
              )}
            >
              <Camera className="size-4 text-tarineo-orange" aria-hidden />
              Prendre en photo
            </button>
          ) : null}
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="text-[14px] text-destructive">
          {error}
        </p>
      ) : null}

      {showAgentMeta && recap && draft ? (
        <DocumentReadRecap
          recap={recap}
          extract={draft}
          vendorName={draft.agent?.vendor_display_name}
          profileVersion={draft.agent?.profile_version}
          deliveryDate={deliveryDate}
          onDeliveryDateChange={setDeliveryDate}
          priorPriceHits={priorPriceHits}
          mailClosing={mailClosing}
        />
      ) : null}

      {draft ? (
        <form ref={formRef} onSubmit={confirm} className="card-soft flex flex-col gap-4 p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="mono-label">/ Lecture ///</p>
              <p className="mt-1 text-[15px] text-muted-foreground">
                Corrigez si besoin, puis enregistrez ou transformez.
              </p>
            </div>
            <Button type="button" variant="ghost" size="sm" className="rounded-full" onClick={clearDraft}>
              Autre fichier
            </Button>
          </div>
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
            {lockKind ? (
              <input type="hidden" name="kind" value={lockKind} />
            ) : (
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
            )}
            {lockDirection ? (
              <input type="hidden" name="direction" value={lockDirection} />
            ) : (
            <label className="flex flex-col gap-1.5 text-[13px]">
              Sens
              <select name="direction" defaultValue={draft.direction} className="h-11 rounded-xl border border-line bg-surface px-3">
                <option value="in">{DIRECTION_LABEL.in}</option>
                <option value="out">{DIRECTION_LABEL.out}</option>
              </select>
            </label>
            )}
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
              <select
                key={suggestedChantier?.id ?? draft.chantier_hint ?? "none"}
                name="chantierId"
                defaultValue={
                  suggestedChantier?.id ??
                  (draft.chantier_hint?.trim() ? "__create_hint__" : defaultChantierId ?? "")
                }
                className="h-11 rounded-xl border border-line bg-surface px-3"
              >
                <option value="">Sans chantier</option>
                {draft.chantier_hint?.trim() && !suggestedChantier ? (
                  <option value="__create_hint__">
                    Créer « {draft.chantier_hint.trim().slice(0, 48)}
                    {draft.chantier_hint.trim().length > 48 ? "…" : ""} »
                  </option>
                ) : null}
                {chantiers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {suggestedChantier ? (
                <span className="text-[12.5px] text-muted-foreground">
                  Chantier détecté : {suggestedChantier.name}. Après enregistrement, vous ouvrirez ce chantier.
                </span>
              ) : draft.chantier_hint?.trim() ? (
                <span className="text-[12.5px] text-muted-foreground">
                  Lieu détecté sur le document — un nouveau chantier sera créé si vous gardez cette option.
                </span>
              ) : null}
            </label>
            {draft.direction === "in" || draft.contact_name || draft.contact_email || draft.contact_phone ? (
              <>
                <label className="flex flex-col gap-1.5 text-[13px]">
                  Contact commercial
                  <Input name="contactName" defaultValue={draft.contact_name ?? ""} className="h-11 rounded-xl" />
                </label>
                <label className="flex flex-col gap-1.5 text-[13px]">
                  E-mail commercial
                  <Input
                    name="contactEmail"
                    type="email"
                    defaultValue={draft.contact_email ?? ""}
                    className="h-11 rounded-xl"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-[13px] sm:col-span-2">
                  Téléphone commercial
                  <Input name="contactPhone" defaultValue={draft.contact_phone ?? ""} className="h-11 rounded-xl" />
                </label>
              </>
            ) : null}
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
          {lockDirection === "out" ? null : (
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
          )}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={saving} className="rounded-full bg-brand-orange text-white hover:brightness-[0.96]">
              {saving
                ? "Enregistrement…"
                : stayAfterSave
                  ? "Enregistrer"
                  : "Enregistrer et ouvrir"}
            </Button>
            <Button type="button" variant="ghost" className="rounded-full" onClick={clearDraft} disabled={saving}>
              Annuler
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
