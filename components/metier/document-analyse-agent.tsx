"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ClipboardList,
  FileText,
  Package,
  Receipt,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { FilterPills, filterPillClass } from "@/components/app-ui/filter-pills";
import { DocumentImportPanels } from "@/components/metier/document-import-dialog";
import type { DocumentSavedInfo } from "@/components/metier/document-drop";
import { TransformForm } from "@/components/metier/transform-form";
import { GoutteFillButton } from "@/components/motion/goutte-fill";
import { SuccessPop } from "@/components/motion/success-pop";
import { TarineoHdMascot } from "@/components/tarineo-hd-mascot";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  totalsFromExtract,
  KIND_LABEL,
  type ChantierCard,
  type DocKind,
  type DocumentCard,
  type Party,
} from "@/lib/metier/types";
import { R } from "@/lib/routes";
import { euro } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

type KindFilter = "all" | DocKind;

const KIND_OPTS: { id: KindFilter; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "devis", label: "Devis" },
  { id: "facture", label: "Factures" },
  { id: "bon_commande", label: "BC" },
  { id: "bl", label: "BL" },
  { id: "bon_enlevement", label: "Enlèvements" },
];

const KIND_CARDS: {
  id: DocKind;
  label: string;
  hint: string;
  Icon: LucideIcon;
}[] = [
  { id: "devis", label: "Devis", hint: "Fournisseur → devis / facture client", Icon: FileText },
  { id: "facture", label: "Facture", hint: "Achat à ranger ou transformer", Icon: Receipt },
  { id: "bon_commande", label: "Bon de commande", hint: "Commande distributeur", Icon: ClipboardList },
  { id: "bl", label: "Bon de livraison", hint: "Livraison chantier", Icon: Truck },
  { id: "bon_enlevement", label: "Bon d’enlèvement", hint: "Retrait magasin", Icon: Package },
];

function docHt(d: DocumentCard) {
  const totals = totalsFromExtract(d.extract);
  return (
    totals.ht ??
    d.lines.reduce((s, l) => s + Number(l.buy_price || l.sell_price) * Number(l.qty), 0)
  );
}

export function DocumentAnalyseAgent({
  chantiers,
  clients,
  pendingTransform = [],
  recentDocs = [],
  errorDocs = [],
  filmLecture,
}: {
  chantiers: ChantierCard[];
  clients: Party[];
  pendingTransform?: DocumentCard[];
  recentDocs?: DocumentCard[];
  errorDocs?: DocumentCard[];
  filmLecture?: boolean;
}) {
  const focusChantier = chantiers.find((c) => c.status === "focus") ?? chantiers[0] ?? null;
  const [chantierId, setChantierId] = useState<string>(focusChantier?.id ?? "");
  const [kind, setKind] = useState<KindFilter>("all");
  const [phase, setPhase] = useState<"pick" | "review">("pick");
  const [transformDoc, setTransformDoc] = useState<DocumentCard | null>(null);
  const [lastSaved, setLastSaved] = useState<DocumentSavedInfo | null>(null);
  const [importKey, setImportKey] = useState(0);

  const lockKind = kind === "all" ? undefined : kind;
  const defaultChantierId = chantierId || null;

  const pending = useMemo(() => {
    if (kind === "all") return pendingTransform;
    return pendingTransform.filter((d) => d.kind === kind);
  }, [kind, pendingTransform]);

  const recents = useMemo(() => {
    const list = kind === "all" ? recentDocs : recentDocs.filter((d) => d.kind === kind);
    return list.slice(0, 6);
  }, [kind, recentDocs]);

  const errors = useMemo(() => {
    if (kind === "all") return errorDocs;
    return errorDocs.filter((d) => d.kind === kind);
  }, [kind, errorDocs]);

  function onSaved(info?: DocumentSavedInfo) {
    if (!info) return;
    setLastSaved(info);
    setPhase("pick");
  }

  function onBulkComplete(info: { savedCount: number; lastId: string | null }) {
    if (!info.lastId) return;
    setLastSaved({ id: info.lastId, direction: "in" });
    setPhase("pick");
  }

  function importAnother() {
    setLastSaved(null);
    setImportKey((k) => k + 1);
    setPhase("pick");
    if (typeof document !== "undefined") {
      document.getElementById("import-heading")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function openTransform(doc: DocumentCard) {
    setTransformDoc(doc);
  }

  return (
    <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-7 px-1">
      <header className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <TarineoHdMascot name="06-loupe" className="h-16 w-18 shrink-0" label="" />
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold tracking-[0.06em] text-tarineo-orange uppercase">
              Analyse IA
            </p>
            <h1 className="mt-1 font-display text-[28px] font-semibold tracking-tight text-ink">
              Importer &amp; transformer
            </h1>
            <p className="mt-1.5 max-w-[52ch] text-[15px] text-muted-foreground">
              Déposez une pièce BTP : l’agent lit, score la fiabilité, puis vous validez. Ensuite,
              transformez en devis ou facture client si besoin.
            </p>
          </div>
        </div>

        {phase === "pick" ? (
          <>
            {/* Mobile: pills — Desktop: cards */}
            <div className="lg:hidden">
              <FilterPills value={kind} onChange={setKind} options={KIND_OPTS} />
            </div>
            <div className="hidden gap-2 lg:grid lg:grid-cols-5">
              {KIND_CARDS.map(({ id, label, hint, Icon }) => {
                const active = kind === id;
                return (
                  <GoutteFillButton
                    key={id}
                    active={active}
                    onClick={() => setKind(active ? "all" : id)}
                    aria-pressed={active}
                    className="min-h-[108px]"
                    contentClassName="flex h-full flex-col items-start gap-1.5 px-3.5 py-3"
                  >
                    <span
                      className={cn(
                        "grid size-8 place-items-center rounded-lg transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                        active
                          ? "bg-tarineo-orange-soft text-tarineo-orange"
                          : "bg-surface-2 text-muted-foreground group-hover:bg-white/70 group-hover:text-tarineo-orange",
                      )}
                    >
                      <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                    </span>
                    <span className="text-[13.5px] font-semibold text-ink">{label}</span>
                    <span className="text-[11.5px] leading-snug text-muted-foreground">{hint}</span>
                  </GoutteFillButton>
                );
              })}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-[13px]">
                <span className="font-medium text-ink">Chantier d’import</span>
                <select
                  value={chantierId}
                  onChange={(e) => setChantierId(e.target.value)}
                  className="h-11 max-w-md rounded-xl border border-line bg-surface px-3 text-[14px] text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tarineo-orange-ring"
                >
                  <option value="">Sans chantier</option>
                  {chantiers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.status === "focus" ? " · En cours" : ""}
                    </option>
                  ))}
                </select>
              </label>
              {kind !== "all" ? (
                <button
                  type="button"
                  onClick={() => setKind("all")}
                  className={cn(filterPillClass(false), "self-start sm:self-end")}
                >
                  Tous les types
                </button>
              ) : null}
            </div>
          </>
        ) : null}
      </header>

      {lastSaved && phase === "pick" ? (
        <div className="overflow-hidden rounded-[20px] border border-tarineo-orange/25 bg-surface shadow-soft">
          <SuccessPop
            size="sm"
            title="Document enregistré"
            hint="Que voulez-vous faire ensuite ?"
            className="py-8"
            action={
              <>
                {lastSaved.direction !== "out" ? (
                  <Button
                    type="button"
                    className="min-h-11 rounded-full bg-tarineo-orange text-white hover:brightness-[0.96]"
                    onClick={() => {
                      const doc =
                        pendingTransform.find((d) => d.id === lastSaved.id) ??
                        recentDocs.find((d) => d.id === lastSaved.id);
                      if (doc) openTransform(doc);
                      else window.location.assign(R.piece(lastSaved.id));
                    }}
                  >
                    Transformer pour le client
                  </Button>
                ) : null}
                <Link
                  href={R.piece(lastSaved.id)}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-surface px-4 text-[14px] font-medium text-ink transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tarineo-orange-ring"
                >
                  Voir la pièce
                </Link>
                <Button type="button" variant="ghost" className="min-h-11 rounded-full" onClick={importAnother}>
                  Importer un autre
                </Button>
              </>
            }
          />
        </div>
      ) : null}

      <section className="flex flex-col gap-3" aria-labelledby="import-heading">
        {phase === "pick" ? (
          <div>
            <h2 id="import-heading" className="font-display text-[17px] font-semibold tracking-tight text-ink">
              Importer
            </h2>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              {lockKind
                ? `Lecture pour un ${KIND_LABEL[lockKind].toLowerCase()} — un fichier ou un lot.`
                : "Un fichier avec récap agent, ou un lot jusqu’à 150 fichiers."}
            </p>
          </div>
        ) : (
          <h2 id="import-heading" className="font-display text-[17px] font-semibold tracking-tight text-ink">
            Vérifier la lecture
          </h2>
        )}
        <div className="rounded-[20px] border border-line bg-surface p-4 md:p-5">
          <DocumentImportPanels
            key={`${kind}-${importKey}`}
            chantiers={chantiers}
            clients={clients}
            defaultChantierId={defaultChantierId}
            lockKind={lockKind}
            showAgentMeta
            stayAfterSave
            dropHint={
              lockKind
                ? `PDF ou photo : ${KIND_LABEL[lockKind].toLowerCase()}…`
                : "PDF ou photo : devis, facture, bon de commande, BL…"
            }
            filmLecture={filmLecture}
            onPhaseChange={setPhase}
            onDocumentSaved={onSaved}
            onBulkComplete={onBulkComplete}
          />
        </div>
        {phase === "pick" ? (
          <p className="text-[12px] text-muted-foreground">
            Seule la structure anonyme (mise en page enseigne) part au catalogue communautaire — pas vos prix ni
            libellés.
          </p>
        ) : null}
      </section>

      {phase === "pick" && errors.length > 0 ? (
        <section className="flex flex-col gap-2" aria-labelledby="errors-heading">
          <h2 id="errors-heading" className="font-display text-[17px] font-semibold tracking-tight text-ink">
            Lectures à reprendre
          </h2>
          <ul className="flex flex-col gap-2">
            {errors.slice(0, 5).map((d) => (
              <li key={d.id}>
                <Link
                  href={R.piece(d.id)}
                  className="flex min-h-11 items-center gap-3 rounded-[14px] border border-destructive/25 bg-surface px-3.5 py-3 transition-colors hover:bg-surface-2"
                >
                  <AlertCircle className="size-4 shrink-0 text-destructive" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium text-ink">{d.title}</span>
                    <span className="block truncate text-[12.5px] text-muted-foreground">
                      {d.error?.trim() || "Lecture incomplète — rouvrir pour corriger"}
                    </span>
                  </span>
                  <span className="shrink-0 text-[12px] font-medium text-destructive">Reprendre →</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {phase === "pick" && pending.length > 0 ? (
        <section className="flex flex-col gap-3" aria-labelledby="transform-heading">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <h2 id="transform-heading" className="font-display text-[17px] font-semibold tracking-tight text-ink">
                À transformer
              </h2>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                Sans quitter la page — marge et client, puis création.
              </p>
            </div>
            <span className="rounded-full bg-tarineo-orange-soft px-2.5 py-0.5 text-[12px] font-medium tabular-nums text-tarineo-orange">
              {pending.length}
            </span>
          </div>
          <ul className="flex flex-col gap-2">
            {pending.slice(0, 8).map((d) => {
              const ht = docHt(d);
              return (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => openTransform(d)}
                    className={cn(
                      "flex w-full min-h-11 items-center gap-3 rounded-[14px] border border-line bg-surface px-3.5 py-3 text-left",
                      "transition-[background-color,border-color] hover:border-tarineo-orange/30 hover:bg-wash-orange/50",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tarineo-orange-ring",
                    )}
                  >
                    <span className="shrink-0 rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                      {KIND_LABEL[d.kind]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium text-ink">{d.title}</span>
                      <span className="block truncate text-[12.5px] text-muted-foreground">
                        {[d.party_name, d.chantier_name].filter(Boolean).join(" · ") || "Sans chantier"}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-[13.5px] font-medium tabular-nums text-ink">
                        {ht ? `${euro(ht)} HT` : "—"}
                      </span>
                      <span className="block text-[12px] font-medium text-tarineo-orange">Transformer</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {pending.length > 8 ? (
            <Link
              href={R.distributeurDevis}
              className="text-[13px] font-medium text-tarineo-orange underline-offset-2 hover:underline"
            >
              Voir les {pending.length - 8} autres pièces
            </Link>
          ) : null}
        </section>
      ) : null}

      {phase === "pick" && pending.length === 0 && !lastSaved ? (
        <p className="rounded-[14px] border border-dashed border-line bg-surface-2 px-3.5 py-3 text-[13px] text-muted-foreground">
          {pendingTransform.length === 0
            ? "Aucune pièce en attente de transformation. Importez un devis ou une facture fournisseur pour démarrer."
            : `Aucune ${KIND_LABEL[kind as DocKind].toLowerCase()} en attente — essayez « Tous les types ».`}
        </p>
      ) : null}

      {phase === "pick" && recents.length > 0 ? (
        <section className="flex flex-col gap-3" aria-labelledby="recents-heading">
          <div>
            <h2 id="recents-heading" className="font-display text-[17px] font-semibold tracking-tight text-ink">
              Derniers imports
            </h2>
            <p className="mt-0.5 text-[13px] text-muted-foreground">Pièces récemment enregistrées.</p>
          </div>
          <ul className="flex flex-col gap-2">
            {recents.map((d) => {
              const ht = docHt(d);
              const transformed = Boolean(
                d.direction === "in" && !pendingTransform.some((p) => p.id === d.id),
              );
              return (
                <li key={d.id}>
                  <Link
                    href={R.piece(d.id)}
                    className="flex min-h-11 items-center gap-3 rounded-[14px] border border-line bg-surface px-3.5 py-3 transition-colors hover:bg-surface-2"
                  >
                    <span className="shrink-0 rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                      {KIND_LABEL[d.kind]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium text-ink">{d.title}</span>
                      <span className="block truncate text-[12.5px] text-muted-foreground">
                        {[d.party_name, d.chantier_name].filter(Boolean).join(" · ") || "Sans chantier"}
                        {d.direction === "in"
                          ? transformed
                            ? " · transformé"
                            : " · à transformer"
                          : ""}
                      </span>
                    </span>
                    <span className="shrink-0 text-[13px] font-medium tabular-nums text-ink">
                      {ht ? `${euro(ht)} HT` : "—"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <Sheet open={Boolean(transformDoc)} onOpenChange={(open) => !open && setTransformDoc(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          {transformDoc ? (
            <>
              <SheetHeader>
                <SheetTitle>Transformer</SheetTitle>
                <SheetDescription>
                  {transformDoc.title}
                  {transformDoc.party_name ? ` · ${transformDoc.party_name}` : ""}
                </SheetDescription>
              </SheetHeader>
              <div className="px-4 pb-6">
                <TransformForm
                  source={transformDoc}
                  clients={clients}
                  defaultClientId={clients[0]?.id ?? null}
                  className="mt-0 flex flex-col gap-2 rounded-[16px] border border-line bg-surface-2 p-4"
                  onSuccess={(createdId) => {
                    setTransformDoc(null);
                    setLastSaved({ id: createdId, direction: "out" });
                  }}
                />
                <Link
                  href={R.piece(transformDoc.id)}
                  className="mt-3 inline-flex min-h-11 items-center text-[13px] text-muted-foreground underline-offset-2 hover:text-ink hover:underline"
                >
                  Ouvrir la pièce source
                </Link>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
