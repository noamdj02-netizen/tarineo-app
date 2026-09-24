"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { Check, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { brandLogoUrl } from "@/lib/resources/logo";
import type { StackToolRef } from "@/lib/site/content";
import { cn } from "@/lib/utils";

function BrandLogo({ domain, label, size = 28 }: { domain: string; label: string; size?: number }) {
  const src = brandLogoUrl(domain, 64);
  return (
    <span
      className="grid size-9 shrink-0 place-items-center rounded-xl border border-line bg-surface-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
      title={label}
    >
      {src ? (
        <Image src={src} alt="" width={size} height={size} className="size-7 object-contain" unoptimized />
      ) : (
        <span className="font-mono text-[11px] font-bold text-muted-foreground">{label.charAt(0)}</span>
      )}
    </span>
  );
}

function PreviewShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex h-full min-h-[280px] flex-col p-3 sm:p-4", className)}>
      <div className="flex flex-1 flex-col overflow-hidden rounded-[18px] border border-line/80 bg-surface shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_12px_40px_-16px_rgba(17,17,17,0.12)] ring-1 ring-line/50">
        <div className="flex items-center gap-1.5 border-b border-line px-3 py-2.5">
          <span className="size-2 rounded-full bg-[#ff5f57]" aria-hidden />
          <span className="size-2 rounded-full bg-[#febc2e]" aria-hidden />
          <span className="size-2 rounded-full bg-[#28c840]" aria-hidden />
          <span className="ml-2 font-mono text-[10px] tracking-wide text-muted-foreground">Navpit · aperçu</span>
        </div>
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}

const INTEGRATIONS: StackToolRef[] = [
  { label: "Notion", domain: "notion.so" },
  { label: "Figma", domain: "figma.com" },
  { label: "GitHub", domain: "github.com" },
  { label: "Agenda", domain: "google.com" },
];

const ACTIVITY = [
  {
    project: "Studio Devis",
    domain: "stripe.com",
    what: "Prochaine action mise à jour",
    when: "8 min",
    tone: "bg-st-focus-soft text-st-focus-ink",
    label: "Focus",
  },
  {
    project: "Copilote",
    domain: "linear.app",
    what: "Mail de relance généré",
    when: "1 h",
    tone: "bg-accent-soft text-ink",
    label: "IA",
  },
  {
    project: "Menu QR",
    domain: "vercel.com",
    what: "Passé en pause",
    when: "Hier",
    tone: "bg-st-pause-soft text-st-pause-ink",
    label: "Pause",
  },
] as const;

const DRAFT_CONTEXT: StackToolRef[] = [
  { label: "Notion", domain: "notion.so" },
  { label: "Figma", domain: "figma.com" },
  { label: "GitHub", domain: "github.com" },
];

export function SolutionPreviewActivity() {
  return (
    <PreviewShell>
      <div className="border-b border-line px-4 py-3">
        <p className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">Aujourd’hui</p>
        <p className="mt-0.5 text-[13px] font-medium">Fil d’activité</p>
      </div>
      <ul className="flex flex-1 flex-col gap-2 p-3">
        {ACTIVITY.map((e) => (
          <li
            key={e.what}
            className="flex items-start gap-3 rounded-2xl border border-line bg-surface-2/80 px-3 py-2.5 transition-colors hover:bg-surface-2"
          >
            <BrandLogo domain={e.domain} label={e.project} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[13px] font-medium leading-snug">{e.what}</p>
                <Badge variant="secondary" className={cn("rounded-pill font-mono text-[9px] uppercase", e.tone)}>
                  {e.label}
                </Badge>
              </div>
              <p className="mt-1 text-[12px] text-muted-foreground">{e.project} · {e.when}</p>
            </div>
          </li>
        ))}
      </ul>
    </PreviewShell>
  );
}

export function SolutionPreviewIntegrations() {
  return (
    <PreviewShell>
      <div className="border-b border-line px-4 py-3">
        <p className="text-[13px] font-medium">Liens du projet</p>
        <p className="mt-0.5 text-[12px] text-muted-foreground">Tout est à côté du Focus, pas dans un drive perdu.</p>
      </div>
      <ul className="grid flex-1 gap-2 p-3 sm:grid-cols-2">
        {INTEGRATIONS.map((tool) => (
          <li
            key={tool.domain}
            className="flex items-center gap-3 rounded-2xl border border-line bg-surface-2/60 px-3 py-3"
          >
            <BrandLogo domain={tool.domain} label={tool.label} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium">{tool.label}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
                Connecté
              </p>
            </div>
            <Check className="size-4 shrink-0 text-emerald-600" aria-hidden />
          </li>
        ))}
      </ul>
    </PreviewShell>
  );
}

export function SolutionPreviewAiDraft() {
  return (
    <PreviewShell>
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
        <span className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface-2 px-2.5 py-1 text-[11px] font-medium">
          <Sparkles className="size-3.5 text-ink" aria-hidden />
          Copilote
        </span>
        {DRAFT_CONTEXT.map((t) => (
          <span
            key={t.domain}
            className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-2 py-1 text-[11px] text-muted-foreground"
          >
            {brandLogoUrl(t.domain, 48) ? (
              <Image
                src={brandLogoUrl(t.domain, 48)!}
                alt=""
                width={14}
                height={14}
                className="size-3.5 object-contain"
                unoptimized
              />
            ) : null}
            {t.label}
          </span>
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="rounded-2xl border border-dashed border-line bg-surface-2/70 px-3 py-2.5 text-[12px] text-muted-foreground">
          Rédige un mail de relance pour Studio Devis…
        </p>
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
          <p className="font-mono text-[10px] tracking-wide text-muted-foreground uppercase">Brouillon</p>
          <p className="mt-2 text-[13px] font-semibold">Objet : Suite à notre échange</p>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            Bonjour Marcus, merci pour le temps hier. Voici la prochaine étape pour la bêta — dis-moi si tu veux qu’on
            cale 20 min cette semaine.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-pill bg-ink px-3 py-1.5 font-mono text-[10px] text-accent-ink uppercase tracking-wide">
            Envoyer
          </span>
          <span className="rounded-pill border border-line bg-surface px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
            Retoucher
          </span>
        </div>
      </div>
    </PreviewShell>
  );
}

export const SOLUTION_PREVIEW_PANELS = [
  SolutionPreviewActivity,
  SolutionPreviewIntegrations,
  SolutionPreviewAiDraft,
] as const;
