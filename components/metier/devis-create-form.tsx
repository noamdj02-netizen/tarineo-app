"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createManualDevisAction } from "@/app/(app)/devis/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSystemTemplates, type SystemDevisTemplate } from "@/lib/metier/devis-templates";
import { calculateQuoteTotals, formatEuro } from "@/lib/metier/devis/totals";
import type { DevisLine } from "@/lib/metier/devis/types";
import type { ChantierCard, Party } from "@/lib/metier/types";
import { cn } from "@/lib/utils";

type LineDraft = {
  key: string;
  description: string;
  quantity: string;
  unit: string;
  unitPriceHT: string;
  vatRate: string;
};

function emptyLine(): LineDraft {
  return {
    key: crypto.randomUUID(),
    description: "",
    quantity: "1",
    unit: "u",
    unitPriceHT: "",
    vatRate: "20",
  };
}

function linesFromTemplate(t: SystemDevisTemplate): LineDraft[] {
  if (!t.lines.length) return [emptyLine()];
  return t.lines.map((l) => ({
    key: crypto.randomUUID(),
    description: l.description,
    quantity: String(l.quantity),
    unit: l.unit || "u",
    unitPriceHT: l.unitPriceHT > 0 ? String(l.unitPriceHT) : "",
    vatRate: String(l.vatRate ?? 20),
  }));
}

function toDevisLines(rows: LineDraft[]): DevisLine[] {
  return rows
    .map((r) => {
      const quantity = Number(String(r.quantity).replace(",", "."));
      const unitPriceHT = Number(String(r.unitPriceHT).replace(",", "."));
      const vatRate = Number(String(r.vatRate).replace(",", "."));
      return {
        description: r.description.trim(),
        quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 0,
        unit: r.unit.trim() || "u",
        unitPriceHT: Number.isFinite(unitPriceHT) && unitPriceHT >= 0 ? unitPriceHT : 0,
        vatRate: Number.isFinite(vatRate) && vatRate >= 0 ? vatRate : 20,
        missing: !(unitPriceHT > 0) ? ["prix"] : undefined,
      };
    })
    .filter((l) => l.description.length > 0);
}

export function DevisCreateForm({
  chantiers,
  clients,
  defaultChantierId,
  defaultClientId,
}: {
  chantiers: ChantierCard[];
  clients: Party[];
  defaultChantierId?: string | null;
  defaultClientId?: string | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("Devis");
  const [clientId, setClientId] = useState(defaultClientId ?? "");
  const [chantierId, setChantierId] = useState(defaultChantierId ?? "");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([emptyLine()]);
  const [showTemplates, setShowTemplates] = useState(false);
  const templates = useMemo(() => getSystemTemplates(), []);

  const devisLines = useMemo(() => toDevisLines(lines), [lines]);
  const totals = useMemo(() => calculateQuoteTotals(devisLines), [devisLines]);
  const selectedClient = clients.find((c) => c.id === clientId) ?? null;
  const selectedChantier = chantiers.find((c) => c.id === chantierId) ?? null;

  function patchLine(key: string, patch: Partial<LineDraft>) {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }

  function applyTemplate(t: SystemDevisTemplate) {
    setTitle(t.type === "blank" ? "Devis" : `Devis — ${t.title}`);
    setLines(linesFromTemplate(t));
    setShowTemplates(false);
  }

  function submit() {
    setError(null);
    if (!selectedClient && !clientId) {
      setError("Choisissez un client.");
      return;
    }
    if (!devisLines.length) {
      setError("Ajoutez au moins une ligne avec une désignation.");
      return;
    }
    start(async () => {
      const res = await createManualDevisAction({
        title,
        clientId: clientId || null,
        clientName: selectedClient?.name ?? "Client",
        chantierId: chantierId || null,
        chantierName: selectedChantier?.name ?? null,
        notes: notes.trim() || null,
        lines: devisLines,
        idempotencyKey: `manual:${crypto.randomUUID()}`,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push(`/pieces/${res.id}`);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setShowTemplates((v) => !v)}
          className="text-[13px] font-medium text-[#FF6B1A] underline-offset-2 hover:underline"
        >
          {showTemplates ? "Masquer les modèles" : "Partir d’un modèle"}
        </button>
      </div>

      {showTemplates ? (
        <ul className="grid gap-2 sm:grid-cols-2">
          {templates.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => applyTemplate(t)}
                className="card-soft flex w-full flex-col gap-1 px-3.5 py-3 text-left transition hover:ring-1 hover:ring-[#FF6B1A]/35"
              >
                <span className="text-[14px] font-medium text-ink">{t.title}</span>
                <span className="text-[12.5px] text-muted-foreground">{t.description}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="card-soft flex flex-col gap-4 p-5">
        <label className="text-[13px] text-ink">
          Titre
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 h-11 rounded-xl"
            placeholder="Devis toiture…"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-[13px] text-ink">
            Client
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-line bg-surface px-3"
            >
              <option value="">Choisir un client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[13px] text-ink">
            Chantier
            <select
              value={chantierId}
              onChange={(e) => {
                const nextId = e.target.value;
                setChantierId(nextId);
                const next = chantiers.find((c) => c.id === nextId);
                if (next?.client_name) {
                  const match = clients.find((c) => c.name === next.client_name);
                  if (match) setClientId(match.id);
                }
              }}
              className="mt-1 h-11 w-full rounded-xl border border-line bg-surface px-3"
            >
              <option value="">Sans chantier</option>
              {chantiers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.client_name ? ` · ${c.client_name}` : ""}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[13px] font-semibold text-ink">Lignes</p>
            <button
              type="button"
              onClick={() => setLines((prev) => [...prev, emptyLine()])}
              className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-line bg-surface px-3 text-[13px] font-medium text-ink hover:bg-surface-2"
            >
              <Plus className="size-3.5" aria-hidden />
              Ajouter
            </button>
          </div>

          <ul className="flex flex-col gap-3">
            {lines.map((line, index) => (
              <li
                key={line.key}
                className="grid gap-2 rounded-xl border border-line bg-surface px-3 py-3 sm:grid-cols-[1fr_4.5rem_4rem_6.5rem_4.5rem_auto]"
              >
                <label className="text-[11px] text-muted-foreground sm:col-span-1">
                  Désignation
                  <Input
                    value={line.description}
                    onChange={(e) => patchLine(line.key, { description: e.target.value })}
                    className="mt-1 h-10 rounded-xl text-[14px]"
                    placeholder={`Ligne ${index + 1}`}
                  />
                </label>
                <label className="text-[11px] text-muted-foreground">
                  Qté
                  <Input
                    value={line.quantity}
                    onChange={(e) => patchLine(line.key, { quantity: e.target.value })}
                    inputMode="decimal"
                    className="mt-1 h-10 rounded-xl text-[14px]"
                  />
                </label>
                <label className="text-[11px] text-muted-foreground">
                  Unité
                  <Input
                    value={line.unit}
                    onChange={(e) => patchLine(line.key, { unit: e.target.value })}
                    className="mt-1 h-10 rounded-xl text-[14px]"
                  />
                </label>
                <label className="text-[11px] text-muted-foreground">
                  Prix HT
                  <Input
                    value={line.unitPriceHT}
                    onChange={(e) => patchLine(line.key, { unitPriceHT: e.target.value })}
                    inputMode="decimal"
                    className="mt-1 h-10 rounded-xl text-[14px]"
                    placeholder="0"
                  />
                </label>
                <label className="text-[11px] text-muted-foreground">
                  TVA %
                  <Input
                    value={line.vatRate}
                    onChange={(e) => patchLine(line.key, { vatRate: e.target.value })}
                    inputMode="decimal"
                    className="mt-1 h-10 rounded-xl text-[14px]"
                  />
                </label>
                <div className="flex items-end justify-end">
                  <button
                    type="button"
                    aria-label="Supprimer la ligne"
                    disabled={lines.length <= 1}
                    onClick={() => setLines((prev) => prev.filter((l) => l.key !== line.key))}
                    className={cn(
                      "grid size-10 place-items-center rounded-xl border border-line text-muted-foreground hover:bg-surface-2",
                      lines.length <= 1 && "opacity-40",
                    )}
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <label className="text-[13px] text-ink">
          Notes (optionnel)
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-[14px] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </label>

        <div className="rounded-2xl border border-line bg-muted/40 px-4 py-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[12px] text-muted-foreground">Total HT</p>
              <p className="text-[15px] font-medium text-ink">{formatEuro(totals.totalHT)}</p>
              <p className="text-[12px] text-muted-foreground">TVA {formatEuro(totals.totalTVA)}</p>
            </div>
            <div className="text-right">
              <p className="text-[12px] text-muted-foreground">Total TTC</p>
              <p className="font-display text-[22px] font-semibold text-ink">{formatEuro(totals.totalTTC)}</p>
            </div>
          </div>
        </div>

        {error ? (
          <p className="text-[13px] text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <Button
          type="button"
          className="h-12 w-full rounded-full sm:w-fit sm:px-8"
          disabled={pending}
          onClick={submit}
        >
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {pending ? "Création…" : "Créer le devis"}
        </Button>
      </div>
    </div>
  );
}
