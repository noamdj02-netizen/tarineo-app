"use client";

import {
  AlertTriangle,
  Loader2,
  Mic,
  MicOff,
  PenLine,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  structureDevisFromSpeech,
  createDevisFromProposalAction,
  type DevisMatchResult,
} from "@/app/(app)/devis/actions";
import type { DevisProposal } from "@/lib/metier/devis/from-proposal";
import { DevisCreateForm } from "@/components/metier/devis-create-form";
import { TarineoHdMascot } from "@/components/tarineo-hd-mascot";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { openAssistant } from "@/lib/assistant/open";
import { draftFromProposal } from "@/lib/metier/devis/from-proposal";
import { calculateQuoteTotals, formatEuro } from "@/lib/metier/devis/totals";
import type { ChantierCard, Party } from "@/lib/metier/types";
import { R } from "@/lib/routes";
import { cn } from "@/lib/utils";

type Mode = "hub" | "manual" | "voice";
type VoicePhase = "idle" | "listening" | "processing" | "review" | "creating" | "success" | "error";

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal?: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e?: { error?: string }) => void) | null;
  start: () => void;
  stop: () => void;
};

function getRecognition(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

const METHODS = [
  {
    id: "voice" as const,
    icon: Sparkles,
    title: "Avec l’assistant",
    text: "Décrivez votre chantier et TARINEO prépare le brouillon — sans inventer de prix.",
    cta: "Créer avec l’IA",
    formats: null,
  },
  {
    id: "manual" as const,
    icon: PenLine,
    title: "Manuellement",
    text: "Créez votre devis ligne par ligne, ou partez d’un modèle.",
    cta: "Créer manuellement",
    formats: null,
  },
] as const;

export function DevisNouveauHub({
  chantiers,
  clients,
}: {
  chantiers: ChantierCard[];
  clients: Party[];
}) {
  const router = useRouter();
  const search = useSearchParams();
  const initialMode = search.get("mode");
  const [mode, setMode] = useState<Mode>(
    initialMode === "voice" || initialMode === "manual" ? initialMode : "hub",
  );
  const chantierSlug = search.get("chantier");
  const chantier = chantierSlug
    ? chantiers.find((c) => c.slug === chantierSlug) ?? null
    : chantiers.find((c) => c.status === "focus") ?? chantiers[0] ?? null;

  useEffect(() => {
    const m = search.get("mode");
    if (m === "voice" || m === "manual") setMode(m);
  }, [search]);

  function openMode(next: Mode) {
    setMode(next);
    const sp = new URLSearchParams(search.toString());
    if (next === "hub") sp.delete("mode");
    else sp.set("mode", next);
    router.replace(`${R.devisNouveau}${sp.size ? `?${sp}` : ""}`, { scroll: false });
  }

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6">
      <header className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <TarineoHdMascot name="05-bras-croises" className="h-16 w-18 shrink-0" label="" />
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold tracking-[0.06em] text-[#FF6B1A] uppercase">
              Nouveau devis
            </p>
            <h1 className="mt-1 font-display text-[28px] font-semibold tracking-tight text-ink">
              Créer un devis
            </h1>
            <p className="mt-1.5 max-w-[42ch] text-[15px] text-muted-foreground">
              Manuellement ou avec l’assistant vocal — sans inventer de prix.
            </p>
          </div>
        </div>
        {chantier ? (
          <p className="rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[13px] text-muted-foreground">
            Je travaille sur le chantier{" "}
            <span className="font-medium text-ink">{chantier.name}</span>
            {chantier.address ? ` — ${chantier.address}` : ""}.
          </p>
        ) : null}
      </header>

      {mode === "hub" ? (
        <div className="flex flex-col gap-3">
          {METHODS.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => openMode(m.id)}
                className="card-soft flex min-h-[88px] w-full items-start gap-4 px-4 py-4 text-left transition hover:ring-1 hover:ring-[#FF6B1A]/35 active:scale-[0.995]"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#FF6B1A]/12 text-[#FF6B1A]">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-semibold text-ink">{m.title}</span>
                  <span className="mt-1 block text-[13.5px] text-muted-foreground">{m.text}</span>
                  {m.formats ? (
                    <span className="mt-2 block text-[12px] text-muted-foreground">{m.formats}</span>
                  ) : null}
                  <span className="mt-3 inline-flex min-h-11 items-center text-[13.5px] font-medium text-[#FF6B1A]">
                    {m.cta} →
                  </span>
                </span>
              </button>
            );
          })}
          <Link
            href={R.devisAnalyser}
            className="card-soft flex min-h-[72px] w-full items-center justify-between gap-3 px-4 py-3 text-[13.5px] text-muted-foreground transition hover:ring-1 hover:ring-[#FF6B1A]/35"
          >
            <span>
              Vous avez un PDF ou une photo ?{" "}
              <span className="font-medium text-[#FF6B1A]">Analyser un document</span>
            </span>
            <span aria-hidden>→</span>
          </Link>
          <button
            type="button"
            onClick={() => openAssistant("Aide-moi à préparer un devis client BTP.")}
            className="flex min-h-11 items-center justify-center gap-2 text-[13px] text-muted-foreground underline-offset-2 hover:text-ink hover:underline"
          >
            <Sparkles className="size-3.5" aria-hidden />
            Besoin d’aide ? Ouvrir l’assistant
          </button>
        </div>
      ) : null}

      {mode === "manual" ? (
        <section className="flex flex-col gap-4">
          <Back onClick={() => openMode("hub")} />
          <h2 className="font-display text-[22px] font-semibold tracking-tight text-ink">Créer manuellement</h2>
          <p className="text-[14px] text-muted-foreground">
            Renseignez le client, le chantier et les lignes. Les totaux se calculent tout de suite — aucun prix n’est inventé.
          </p>
          <DevisCreateForm
            chantiers={chantiers}
            clients={clients}
            defaultChantierId={chantier?.id ?? null}
            defaultClientId={
              chantier?.client_name
                ? clients.find((c) => c.name === chantier.client_name)?.id ?? null
                : null
            }
          />
        </section>
      ) : null}

      {mode === "voice" ? (
        <VoiceDevisPanel
          chantier={chantier}
          chantiers={chantiers}
          clients={clients}
          onBack={() => openMode("hub")}
          onVerify={(proposal) => {
            openAssistant(buildVerifyPrompt(proposal, chantier));
          }}
        />
      ) : null}
    </div>
  );
}

function Back({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="self-start text-[13px] text-muted-foreground underline-offset-2 hover:text-ink hover:underline"
    >
      ← Retour
    </button>
  );
}

function VoiceDevisPanel({
  chantier,
  chantiers,
  clients,
  onBack,
  onVerify,
}: {
  chantier: ChantierCard | null;
  chantiers: ChantierCard[];
  clients: Party[];
  onBack: () => void;
  onVerify: (proposal: DevisProposal) => void;
}) {
  const router = useRouter();
  const [supported, setSupported] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<VoicePhase>("idle");
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [micError, setMicError] = useState<string | null>(null);
  const [proposal, setProposal] = useState<DevisProposal | null>(null);
  const [match, setMatch] = useState<DevisMatchResult | null>(null);
  const [clientId, setClientId] = useState<string>("");
  const [chantierId, setChantierId] = useState<string>(chantier?.id ?? "");
  const [pending, start] = useTransition();
  const [structError, setStructError] = useState<string | null>(null);
  const [idempotencyKey] = useState(() => `voice:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const holding = useRef(false);

  useEffect(() => {
    setSupported(getRecognition() !== null);
    return () => {
      try {
        recRef.current?.stop();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const listening = phase === "listening";

  const stop = useCallback(() => {
    holding.current = false;
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
    setPhase((p) => (p === "listening" ? "idle" : p));
  }, []);

  const startListen = useCallback(() => {
    setMicError(null);
    setStructError(null);
    setProposal(null);
    setMatch(null);
    const rec = getRecognition();
    if (!rec) {
      setMicError("La dictée n’est pas disponible sur ce navigateur.");
      setPhase("error");
      return;
    }
    recRef.current = rec;
    rec.lang = "fr-FR";
    rec.interimResults = true;
    rec.continuous = true;
    rec.onresult = (e) => {
      let finalText = "";
      let interimText = "";
      for (let i = 0; i < e.results.length; i++) {
        const part = e.results[i];
        const t = part[0]?.transcript ?? "";
        if ((part as { isFinal?: boolean }).isFinal) finalText += t;
        else interimText += t;
      }
      if (finalText) setTranscript((prev) => `${prev} ${finalText}`.trim());
      setInterim(interimText);
    };
    rec.onerror = (e) => {
      setPhase("idle");
      const code = e?.error;
      if (code === "not-allowed") setMicError("Microphone refusé. Autorisez l’accès dans le navigateur.");
      else if (code === "no-speech") setMicError("Aucune parole détectée. Réessayez.");
      else setMicError("Erreur microphone. Réessayez.");
    };
    rec.onend = () => {
      setInterim("");
      if (holding.current) {
        try {
          rec.start();
          setPhase("listening");
        } catch {
          holding.current = false;
          setPhase("idle");
        }
      } else {
        setPhase((p) => (p === "listening" ? "idle" : p));
      }
    };
    try {
      holding.current = true;
      rec.start();
      setPhase("listening");
    } catch {
      setMicError("Impossible de démarrer le microphone.");
      holding.current = false;
      setPhase("error");
    }
  }, []);

  const liveTotals = useMemo(() => {
    if (!proposal) return null;
    const draft = draftFromProposal(proposal, { source: "voice" });
    return calculateQuoteTotals(draft.lines);
  }, [proposal]);

  const missingPrices = proposal?.lines.filter((l) => !l.unitPrice || l.unitPrice <= 0 || l.missing.includes("prix")) ?? [];
  const clientUnresolved = Boolean(match?.client.ambiguous && !clientId);
  const chantierUnresolved = Boolean(match?.chantier.ambiguous && !chantierId);
  const canCreate = Boolean(proposal && missingPrices.length === 0 && !clientUnresolved && !chantierUnresolved);

  function structure() {
    const text = `${transcript} ${interim}`.trim();
    if (text.length < 8) {
      setStructError("Parlez d’abord, puis lancez l’analyse.");
      setPhase("error");
      return;
    }
    setStructError(null);
    setPhase("processing");
    start(async () => {
      const res = await structureDevisFromSpeech({
        transcript: text,
        chantierName: chantier?.name,
        chantierAddress: chantier?.address,
      });
      if (!res.ok) {
        setStructError(res.error);
        setPhase("error");
        return;
      }
      setProposal(res.proposal);
      setMatch(res.match);
      if (res.match.client.exact) setClientId(res.match.client.exact.id);
      else if (clients[0]) setClientId(clients[0].id);
      if (res.match.chantier.exact) setChantierId(res.match.chantier.exact.id);
      else if (chantier) setChantierId(chantier.id);
      setPhase("review");
    });
  }

  function updateLine(index: number, patch: Partial<DevisProposal["lines"][number]>) {
    setProposal((prev) => {
      if (!prev) return prev;
      const lines = prev.lines.map((l, i) => {
        if (i !== index) return l;
        const next = { ...l, ...patch };
        const missing = next.missing.filter((m) => m !== "prix");
        if (!(next.unitPrice && next.unitPrice > 0)) missing.push("prix");
        return { ...next, missing };
      });
      return { ...prev, lines };
    });
  }

  const selectedClient = clients.find((c) => c.id === clientId) ?? null;
  const selectedChantier = chantiers.find((c) => c.id === chantierId) ?? null;

  return (
    <section className="flex flex-col gap-4">
      <Back onClick={onBack} />
      <h2 className="font-display text-[22px] font-semibold tracking-tight text-ink">Décrire mon devis</h2>
      <p className="text-[14px] text-muted-foreground">
        Exemple : « Devis pour Dupont, 18 mètres de tube PVC à 33 euros 20, et 450 euros de pose, TVA 10 %. »
      </p>

      {supported === false ? (
        <Alert>
          <AlertDescription>
            La dictée n’est pas disponible ici. Utilisez{" "}
            <Link href={R.devisAnalyser} className="underline">
              l’analyse document
            </Link>{" "}
            ou{" "}
            <Link href={R.clientDevis} className="underline">
              la création manuelle
            </Link>
            .
          </AlertDescription>
        </Alert>
      ) : (
        <div className="card-soft flex flex-col items-center gap-4 px-5 py-8 text-center">
          <TarineoHdMascot
            name={
              phase === "success"
                ? "09-devis-valide"
                : phase === "processing" || phase === "creating"
                  ? "06-loupe"
                  : listening
                    ? "14-bulle"
                    : "05-bras-croises"
            }
            className="h-20 w-22"
            label=""
          />
          <span
            className={cn(
              "grid size-14 place-items-center rounded-full",
              listening ? "bg-[#FF6B1A]/15 text-[#FF6B1A]" : "bg-muted text-muted-foreground",
            )}
          >
            {listening ? <Mic className="size-6" /> : <MicOff className="size-6" />}
          </span>
          <p className="text-[15px] font-medium text-ink">
            {phase === "processing"
              ? "Analyse du devis…"
              : phase === "creating"
                ? "Création du devis…"
                : phase === "success"
                  ? "Devis créé."
                  : listening
                    ? "● Écoute en cours"
                    : "Décrivez votre devis naturellement."}
          </p>
          <Button
            type="button"
            className="min-h-12 rounded-full px-6"
            variant={listening ? "destructive" : "default"}
            disabled={phase === "processing" || phase === "creating"}
            onPointerDown={(e) => {
              e.preventDefault();
              startListen();
            }}
            onPointerUp={stop}
            onPointerLeave={() => {
              if (listening) stop();
            }}
            onPointerCancel={stop}
          >
            {listening ? "Relâcher pour arrêter" : "Parler pour créer"}
          </Button>
          {(transcript || interim) && (
            <p className="max-w-[40ch] text-[14px] text-muted-foreground">
              {transcript} {interim ? <span className="text-ink/50">{interim}</span> : null}
            </p>
          )}
        </div>
      )}

      {micError ? <p className="text-[13px] text-destructive">{micError}</p> : null}
      {structError ? <p className="text-[13px] text-destructive">{structError}</p> : null}

      {transcript && !listening && phase !== "processing" && phase !== "creating" ? (
        <Button type="button" className="min-h-12 rounded-full" disabled={pending} onClick={structure}>
          {pending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Sparkles data-icon="inline-start" />}
          Structurer en proposition
        </Button>
      ) : null}

      {phase === "processing" ? (
        <p className="text-center text-[14px] text-muted-foreground">Analyse du devis…</p>
      ) : null}

      {proposal && (phase === "review" || phase === "creating" || phase === "success") ? (
        <div className="card-soft flex flex-col gap-5 p-5">
          <div>
            <p className="text-[12px] font-semibold tracking-[0.06em] text-[#FF6B1A] uppercase">
              J’ai préparé votre devis
            </p>
            <p className="mt-1 text-[15px] font-medium text-ink">{proposal.summary}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-[13px] text-muted-foreground">
              Client
              <select
                className="mt-1 h-11 w-full rounded-xl border border-line bg-surface px-3"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              >
                <option value="">Choisir…</option>
                {(match?.client.candidates.length
                  ? match.client.candidates.map((c) => ({ id: c.id, name: c.name }))
                  : clients
                ).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {match?.client.ambiguous ? (
                <span className="mt-1 block text-[12px] text-[#FF6B1A]">
                  Plusieurs clients correspondent — choisissez le bon.
                </span>
              ) : null}
            </label>
            <label className="text-[13px] text-muted-foreground">
              Chantier
              <select
                className="mt-1 h-11 w-full rounded-xl border border-line bg-surface px-3"
                value={chantierId}
                onChange={(e) => setChantierId(e.target.value)}
              >
                <option value="">Sans chantier</option>
                {(match?.chantier.candidates.length
                  ? match.chantier.candidates.map((c) => ({ id: c.id, name: c.label }))
                  : chantiers.map((c) => ({ id: c.id, name: c.name }))
                ).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {match?.chantier.ambiguous ? (
                <span className="mt-1 block text-[12px] text-[#FF6B1A]">
                  Plusieurs chantiers correspondent — choisissez le bon.
                </span>
              ) : null}
            </label>
          </div>

          <div>
            <p className="mb-2 text-[13px] font-semibold text-ink">Prestations</p>
            <ul className="flex flex-col gap-4">
              {proposal.lines.map((line, i) => (
                <li key={`${line.label}-${i}`} className="flex flex-col gap-2 border-b border-line pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium text-ink">{line.label}</p>
                      <p className="text-[12px] text-muted-foreground">
                        {[line.qty != null ? String(line.qty) : "?", line.unit ?? "u"].join(" ")}
                        {line.vatRate != null ? ` · TVA ${line.vatRate} %` : ` · TVA ${proposal.defaultVatRate} %`}
                      </p>
                    </div>
                    {liveTotals?.lines[i] ? (
                      <span className="shrink-0 text-[14px] font-medium text-ink">
                        {formatEuro(liveTotals.lines[i].totalHT)} HT
                      </span>
                    ) : null}
                  </div>
                  <label className="text-[12px] text-muted-foreground">
                    Prix unitaire HT (€)
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      className="mt-1 h-10 w-full max-w-[160px] rounded-xl border border-line bg-surface px-3 text-[14px] text-ink"
                      value={line.unitPrice ?? ""}
                      placeholder="Obligatoire"
                      onChange={(e) => {
                        const v = e.target.value === "" ? null : Number(e.target.value);
                        updateLine(i, {
                          unitPrice: v != null && Number.isFinite(v) ? v : null,
                        });
                      }}
                    />
                  </label>
                  {line.missing.includes("prix") ? (
                    <p className="text-[12px] text-[#FF6B1A]">Il me manque le prix de {line.label}.</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          {liveTotals ? (
            <div className="rounded-2xl bg-muted/50 px-4 py-3">
              <p className="text-[13px] text-muted-foreground">Total</p>
              <p className="text-[15px] text-ink">{formatEuro(liveTotals.totalHT)} HT</p>
              <p className="text-[13px] text-muted-foreground">
                TVA · {formatEuro(liveTotals.totalTVA)}
              </p>
              <p className="mt-1 text-[18px] font-semibold text-ink">{formatEuro(liveTotals.totalTTC)} TTC</p>
            </div>
          ) : null}

          {proposal.questions.length ? (
            <div className="flex flex-col gap-1.5">
              <p className="flex items-center gap-1.5 text-[13px] font-medium text-ink">
                <AlertTriangle className="size-3.5 text-[#FF6B1A]" aria-hidden />
                À confirmer
              </p>
              <ul className="list-disc pl-5 text-[13px] text-muted-foreground">
                {proposal.questions.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="text-[12px] text-muted-foreground">
            Aucun devis n’est créé tant que vous n’avez pas confirmé.
            {selectedClient ? ` Client : ${selectedClient.name}.` : ""}
            {selectedChantier ? ` Chantier : ${selectedChantier.name}.` : ""}
          </p>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              className="min-h-12 rounded-full"
              disabled={!canCreate || phase === "creating"}
              onClick={() => {
                if (!proposal || !canCreate) return;
                setPhase("creating");
                setStructError(null);
                start(async () => {
                  const res = await createDevisFromProposalAction({
                    proposal,
                    chantierId: chantierId || null,
                    clientId: clientId || null,
                    clientName: selectedClient?.name ?? proposal.clientQuery,
                    idempotencyKey,
                  });
                  if (!res.ok) {
                    setStructError(res.error);
                    setPhase("review");
                    return;
                  }
                  setPhase("success");
                  router.push(`/pieces/${res.id}`);
                });
              }}
            >
              {phase === "creating" ? <Loader2 className="animate-spin" data-icon="inline-start" /> : null}
              {phase === "creating" ? "Création…" : "Créer le devis"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-12 rounded-full"
              onClick={() => {
                setProposal(null);
                setMatch(null);
                setPhase("idle");
              }}
            >
              Modifier
            </Button>
            <Button type="button" variant="ghost" className="min-h-12 rounded-full" onClick={() => onVerify(proposal)}>
              Vérifier avec le Copilote
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function buildVerifyPrompt(proposal: DevisProposal, chantier: ChantierCard | null) {
  const lines = proposal.lines
    .map(
      (l, i) =>
        `${i + 1}. ${l.label} — qty=${l.qty ?? "?"} unit=${l.unit ?? "?"} prix=${l.unitPrice ?? "à confirmer"} tva=${l.vatRate ?? proposal.defaultVatRate} missing=${l.missing.join(",") || "—"}`,
    )
    .join("\n");
  return [
    "Tu es l’Assistant BTP TARINEO. Aide-moi à vérifier cette proposition de devis.",
    "N’invente aucun prix. Demande confirmation pour chaque élément manquant.",
    chantier ? `Chantier : ${chantier.name}${chantier.address ? ` (${chantier.address})` : ""}.` : null,
    proposal.clientQuery ? `Client : ${proposal.clientQuery}` : null,
    `Résumé : ${proposal.summary}`,
    "Lignes :",
    lines,
    proposal.questions.length ? `Questions :\n- ${proposal.questions.join("\n- ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}
