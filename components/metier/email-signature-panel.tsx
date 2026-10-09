"use client";

import { useState } from "react";
import {
  extractEmailSignatureAction,
  saveEmailSignatureAction,
} from "@/app/(app)/parametres/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EmailSettings } from "@/lib/settings/workspace-settings";
import { formatMailClosing } from "@/lib/metier/mail-closing";
import { Sparkles } from "lucide-react";

export function EmailSignaturePanel({
  initial,
  companyName,
}: {
  initial: EmailSettings;
  companyName?: string;
}) {
  const [paste, setPaste] = useState("");
  const [signOff, setSignOff] = useState(initial.signOff);
  const [signatureText, setSignatureText] = useState(initial.signatureText);
  const [fromName, setFromName] = useState(initial.fromName);
  const [logoFromEmailUrl, setLogoFromEmailUrl] = useState(initial.logoFromEmailUrl);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const preview = formatMailClosing({
    signOff,
    signatureText,
    companyName,
  });

  async function analyze() {
    setAnalyzing(true);
    setErr(null);
    setMsg(null);
    const res = await extractEmailSignatureAction(paste);
    setAnalyzing(false);
    if (!res.ok) {
      setErr(res.error);
      return;
    }
    setSignOff(res.extracted.signOff || "Cordialement,");
    setSignatureText(res.extracted.signatureText);
    setFromName(res.extracted.fromName);
    if (res.extracted.logoUrlHint) setLogoFromEmailUrl(res.extracted.logoUrlHint);
    setMsg("Signature détectée — vérifiez puis enregistrez.");
  }

  async function save() {
    setSaving(true);
    setErr(null);
    setMsg(null);
    const res = await saveEmailSignatureAction({
      signOff,
      signatureText,
      fromName,
      logoFromEmailUrl,
    });
    setSaving(false);
    if (!res.ok) {
      setErr(res.error);
      return;
    }
    setMsg("Signature enregistrée. Relances, acceptation et renégociation l’utiliseront.");
  }

  return (
    <section className="card-soft flex flex-col gap-4 p-5">
      <div>
        <p className="text-[12px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
          Signature e-mail
        </p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Collez un mail déjà envoyé : l’IA récupère la formule de politesse et le bas de page pour
          personnaliser vos relances, acceptations et renégociations.
        </p>
      </div>

      <label className="flex flex-col gap-1.5 text-[13px] text-ink">
        Coller un e-mail type
        <textarea
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          rows={7}
          placeholder={"Bonjour…\n\n…\n\nCordialement,\nJean Dupont\nSARL Exemple\n06 …"}
          className="min-h-[140px] w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-[14px] leading-relaxed text-ink outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </label>

      <Button
        type="button"
        variant="outline"
        disabled={analyzing || paste.trim().length < 20}
        onClick={() => void analyze()}
        className="h-11 w-fit rounded-[10px]"
      >
        <Sparkles className="size-3.5" aria-hidden />
        {analyzing ? "Analyse…" : "Analyser avec l’IA"}
      </Button>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-[13px] text-ink">
          Formule de politesse
          <Input
            value={signOff}
            onChange={(e) => setSignOff(e.target.value)}
            placeholder="Cordialement,"
            className="h-11 rounded-xl"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] text-ink">
          Nom affiché
          <Input
            value={fromName}
            onChange={(e) => setFromName(e.target.value)}
            placeholder="Jean Dupont"
            className="h-11 rounded-xl"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] text-ink sm:col-span-2">
          Bloc signature
          <textarea
            value={signatureText}
            onChange={(e) => setSignatureText(e.target.value)}
            rows={5}
            className="min-h-[110px] w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-[14px] leading-relaxed outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] text-ink sm:col-span-2">
          URL logo détectée (optionnel)
          <Input
            value={logoFromEmailUrl}
            onChange={(e) => setLogoFromEmailUrl(e.target.value)}
            placeholder="https://…"
            className="h-11 rounded-xl"
          />
        </label>
      </div>

      {logoFromEmailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoFromEmailUrl}
          alt=""
          className="h-12 w-auto max-w-[160px] rounded-lg border border-line bg-white p-1 object-contain"
        />
      ) : null}

      <div className="rounded-xl border border-line/80 bg-surface-2 px-3.5 py-3">
        <p className="text-[11px] font-medium tracking-[0.04em] text-muted-foreground uppercase">
          Aperçu fin de mail
        </p>
        <pre className="mt-1.5 whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-ink">
          {preview}
        </pre>
      </div>

      {err ? <p className="text-[14px] text-destructive">{err}</p> : null}
      {msg ? <p className="text-[14px] text-muted-foreground">{msg}</p> : null}

      <Button
        type="button"
        disabled={saving || (!signOff.trim() && !signatureText.trim())}
        onClick={() => void save()}
        className="h-11 w-fit rounded-full"
      >
        {saving ? "Enregistrement…" : "Enregistrer la signature"}
      </Button>
    </section>
  );
}
