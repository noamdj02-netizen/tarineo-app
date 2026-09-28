"use client";

import {
  AlertTriangle,
  FileText,
  Loader2,
  Mic,
  MicOff,
  PenLine,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  structureDevisFromSpeech,
  type DevisProposal,
} from "@/app/(app)/devis/actions";
import { DocumentDrop } from "@/components/metier/document-drop";
import { TarineoHdMascot } from "@/components/tarineo-hd-mascot";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { openAssistant } from "@/lib/assistant/open";
import type { ChantierCard, Party } from "@/lib/metier/types";
import { R } from "@/lib/routes";
import { cn } from "@/lib/utils";

type Mode = "hub" | "document" | "manual" | "voice";

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
    id: "document" as const,
    icon: FileText,
    title: "Analyser un document",
    text: "Importez un devis, une facture ou un document fournisseur.",
    cta: "Importer un document",
    formats: "PDF · image · document compatible",
  },
  {
    id: "manual" as const,
    icon: PenLine,
    title: "Créer manuellement",
    text: "Ajoutez vos prestations, matériaux et main-d’œuvre.",
    cta: "Créer mon devis",
    formats: null,
  },
  {
    id: "voice" as const,
    icon: Mic,
    title: "Décrire mon chantier",
    text: "Parlez naturellement. TARINEO transforme votre description en lignes de devis.",
    cta: "Commencer à parler",
    formats: null,
  },
] as const;

export function DevisAnalyserHub({
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
    initialMode === "voice" || initialMode === "document" || initialMode === "manual"
      ? initialMode
      : "hub",
  );
  const chantierSlug = search.get("chantier");
  const chantier = chantierSlug
    ? chantiers.find((c) => c.slug === chantierSlug) ?? null
    : chantiers.find((c) => c.status === "focus") ?? chantiers[0] ?? null;

  useEffect(() => {
    const m = search.get("mode");
    if (m === "voice" || m === "document" || m === "manual") setMode(m);
  }, [search]);

  function openMode(next: Mode) {
    setMode(next);
    const sp = new URLSearchParams(search.toString());
    if (next === "hub") sp.delete("mode");
    else sp.set("mode", next);
    router.replace(`${R.devisAnalyser}${sp.size ? `?${sp}` : ""}`, { scroll: false });
  }

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6">
      <header className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <TarineoHdMascot name="05-bras-croises" className="h-16 w-18 shrink-0" label="" />
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold tracking-[0.06em] text-[#FF6B1A] uppercase">
              Assistant BTP TARINEO
            </p>
            <h1 className="mt-1 font-display text-[28px] font-semibold tracking-tight text-ink">
              Créer un devis
            </h1>
            <p className="mt-1.5 max-w-[42ch] text-[15px] text-muted-foreground">
              Décrivez votre chantier. TARINEO vous aide à préparer un devis adapté à votre métier.
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
                onClick={() => {
                  if (m.id === "manual") {
                    router.push(R.clientDevis);
                    return;
                  }
                  openMode(m.id);
                }}
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
          <button
            type="button"
            onClick={() => openAssistant("Aide-moi à préparer un devis client BTP.")}
            className="flex min-h-11 items-center justify-center gap-2 text-[13px] text-muted-foreground underline-offset-2 hover:text-ink hover:underline"
          >
            <Sparkles className="size-3.5" aria-hidden />
            Ouvrir le Copilote général
          </button>
        </div>
      ) : null}

      {mode === "document" ? (
        <section className="flex flex-col gap-4">
          <Back onClick={() => openMode("hub")} />
          <h2 className="font-display text-[22px] font-semibold tracking-tight">Analyser un document</h2>
          <p className="text-[14px] text-muted-foreground">
            L’IA analyse uniquement le contenu réellement présent. Aucune donnée inventée.
          </p>
          <DocumentDrop
            chantiers={chantiers}
            clients={clients}
            defaultChantierId={chantier?.id ?? null}
            lockKind="devis"
            lockDirection="in"
            hint="PDF ou photo de devis / facture fournisseur"
          />
        </section>
      ) : null}

      {mode === "voice" ? (
        <VoiceDevisPanel
          chantier={chantier}
          onBack={() => openMode("hub")}
          onVerify={(proposal) => {
            const prompt = buildVerifyPrompt(proposal, chantier);
            openAssistant(prompt);
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
  onBack,
  onVerify,
}: {
  chantier: ChantierCard | null;
  onBack: () => void;
  onVerify: (proposal: DevisProposal) => void;
}) {
  const router = useRouter();
  const [supported, setSupported] = useState<boolean | null>(null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [micError, setMicError] = useState<string | null>(null);
  const [proposal, setProposal] = useState<DevisProposal | null>(null);
  const [pending, start] = useTransition();
  const [structError, setStructError] = useState<string | null>(null);
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

  const stop = useCallback(() => {
    holding.current = false;
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
    setListening(false);
  }, []);

  const startListen = useCallback(() => {
    setMicError(null);
    setStructError(null);
    setProposal(null);
    const rec = getRecognition();
    if (!rec) {
      setMicError("La dictée n’est pas disponible sur ce navigateur.");
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
      setListening(false);
      const code = e?.error;
      if (code === "not-allowed") setMicError("Microphone refusé. Autorisez l’accès dans le navigateur.");
      else if (code === "no-speech") setMicError("Aucune parole détectée. Réessayez.");
      else setMicError("Erreur microphone. Réessayez.");
    };
    rec.onend = () => {
      setListening(false);
      setInterim("");
      if (holding.current) {
        try {
          rec.start();
          setListening(true);
        } catch {
          holding.current = false;
        }
      }
    };
    try {
      holding.current = true;
      rec.start();
      setListening(true);
    } catch {
      setMicError("Impossible de démarrer le microphone.");
      holding.current = false;
    }
  }, []);

  function structure() {
    const text = `${transcript} ${interim}`.trim();
    if (text.length < 8) {
      setStructError("Parlez d’abord, puis lancez l’analyse.");
      return;
    }
    setStructError(null);
    start(async () => {
      const res = await structureDevisFromSpeech({
        transcript: text,
        chantierName: chantier?.name,
        chantierAddress: chantier?.address,
      });
      if (!res.ok) {
        setStructError(res.error);
        return;
      }
      setProposal(res.proposal);
    });
  }

  return (
    <section className="flex flex-col gap-4">
      <Back onClick={onBack} />
      <h2 className="font-display text-[22px] font-semibold tracking-tight">Décrire mon chantier</h2>
      <p className="text-[14px] text-muted-foreground">
        Exemple : « Je dois refaire une salle de bain de 8 m². Dépose, pose carrelage, joints, douche. »
      </p>

      {supported === false ? (
        <Alert>
          <AlertDescription>
            La dictée n’est pas disponible ici. Utilisez{" "}
            <button type="button" className="underline" onClick={onBack}>
              l’import document
            </button>{" "}
            ou{" "}
            <Link href={R.clientDevis} className="underline">
              la création manuelle
            </Link>
            .
          </AlertDescription>
        </Alert>
      ) : (
        <div className="card-soft flex flex-col items-center gap-4 px-5 py-8 text-center">
          <span
            className={cn(
              "grid size-16 place-items-center rounded-full",
              listening ? "bg-[#FF6B1A]/15 text-[#FF6B1A]" : "bg-muted text-muted-foreground",
            )}
          >
            {listening ? <Mic className="size-7" /> : <MicOff className="size-7" />}
          </span>
          <p className="text-[15px] font-medium text-ink">
            {listening ? "● Écoute en cours" : "Décrivez votre chantier naturellement."}
          </p>
          <Button
            type="button"
            className="min-h-12 rounded-full px-6"
            variant={listening ? "destructive" : "default"}
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
            {listening ? "Relâcher pour arrêter" : "Maintenir pour parler"}
          </Button>
          {(transcript || interim) && (
            <p className="max-w-[40ch] text-[14px] text-muted-foreground">
              {transcript}{" "}
              {interim ? <span className="text-ink/50">{interim}</span> : null}
            </p>
          )}
        </div>
      )}

      {micError ? <p className="text-[13px] text-destructive">{micError}</p> : null}
      {structError ? <p className="text-[13px] text-destructive">{structError}</p> : null}

      {transcript && !listening ? (
        <Button type="button" className="min-h-12 rounded-full" disabled={pending} onClick={structure}>
          {pending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Sparkles data-icon="inline-start" />}
          {pending ? "Structuration…" : "Structurer en proposition"}
        </Button>
      ) : null}

      {proposal ? (
        <div className="card-soft flex flex-col gap-4 p-5">
          <div>
            <p className="text-[12px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
              Proposition IA
            </p>
            <p className="mt-1 text-[15px] font-medium text-ink">{proposal.summary}</p>
          </div>
          <ul className="flex flex-col gap-3">
            {proposal.lines.map((line, i) => (
              <li key={`${line.label}-${i}`} className="flex items-start justify-between gap-3 border-b border-line pb-3 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-ink">{line.label}</p>
                  <p className="text-[12px] text-muted-foreground">
                    {[line.qty != null ? String(line.qty) : "?", line.unit ?? "unité"].join(" ")}
                    {line.missing.length ? ` · ⚠ ${line.missing.join(", ")}` : ""}
                  </p>
                </div>
                <span className="shrink-0 text-[14px] text-muted-foreground">—</span>
              </li>
            ))}
          </ul>
          {proposal.questions.length ? (
            <div className="flex flex-col gap-1.5">
              <p className="flex items-center gap-1.5 text-[13px] font-medium text-ink">
                <AlertTriangle className="size-3.5 text-[#FF6B1A]" aria-hidden />
                {proposal.questions.length} information
                {proposal.questions.length > 1 ? "s" : ""} à confirmer
              </p>
              <ul className="list-disc pl-5 text-[13px] text-muted-foreground">
                {proposal.questions.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="text-[12px] text-muted-foreground">
            Ceci n’est pas un devis final. Vérifiez chaque ligne avant d’enregistrer.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" className="min-h-12 rounded-full" onClick={() => onVerify(proposal)}>
              Vérifier le devis
            </Button>
            <Button type="button" variant="outline" className="min-h-12 rounded-full" onClick={() => router.push(R.clientDevis)}>
              Créer manuellement
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function buildVerifyPrompt(proposal: DevisProposal, chantier: ChantierCard | null) {
  const lines = proposal.lines
    .map((l, i) => `${i + 1}. ${l.label} — qty=${l.qty ?? "?"} unit=${l.unit ?? "?"} prix=à confirmer missing=${l.missing.join(",") || "—"}`)
    .join("\n");
  return [
    "Tu es l’Assistant BTP TARINEO. Aide-moi à vérifier cette proposition de devis.",
    "N’invente aucun prix. Demande confirmation pour chaque élément manquant.",
    chantier ? `Chantier : ${chantier.name}${chantier.address ? ` (${chantier.address})` : ""}.` : null,
    `Résumé : ${proposal.summary}`,
    "Lignes :",
    lines,
    proposal.questions.length ? `Questions :\n- ${proposal.questions.join("\n- ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}
